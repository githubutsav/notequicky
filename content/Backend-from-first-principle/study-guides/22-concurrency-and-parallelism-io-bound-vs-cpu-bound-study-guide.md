# Study guide — 22. Concurrency & Parallelism: IO Bound vs CPU Bound

> This is added guidance, not a claim about the video's contents.

## Decision guide

- For I/O-bound work, use the runtime's safe concurrency model and bounded connection/client pools.
- For CPU-bound work, use worker processes/threads or a separate job system sized to available cores.
- Put limits on concurrency; unlimited parallel work can exhaust memory, connections, or downstream capacity.
- Avoid shared mutable state where possible. When it is unavoidable, define ownership and use synchronization primitives correctly.
- Test race-prone code repeatedly and use race detectors/profilers when your ecosystem provides them.

## Learn by building: overlap independent I/O, bound CPU work

When three remote reads are independent, start them together and await them together:

~~~ts
const [product, inventory, reviews] = await Promise.all([
  productClient.get(productId),
  inventoryClient.get(productId),
  reviewClient.list(productId),
]);
~~~

This is concurrent I/O. While one request waits for a network response, the runtime can make progress on the others. It is not automatically three CPU cores doing work at once.

Do not use Promise.all when one failed optional dependency should cancel useful work, or when launching all tasks would overwhelm a downstream service. Add an explicit bound for repeated work:

~~~ts
const maxConcurrent = 10;
const pending = [...productIds];
const results = [];

while (pending.length > 0) {
  const batch = pending.splice(0, maxConcurrent);
  const batchResults = await Promise.all(
    batch.map((id) => inventoryClient.get(id)),
  );
  results.push(...batchResults);
}
~~~

For CPU-heavy image processing, encryption, or large report generation, move work to a bounded worker pool or background job. Running it on the request/event-loop execution path can make every unrelated request slow.

### Race experiment

Create two asynchronous functions that both read, wait, and then write the same counter. Run them concurrently and observe the wrong final value. Then replace the shared counter with a database atomic update, a mutex, or single-owner queue depending on where the true shared state lives.

## Read next

- [Go: concurrency](https://go.dev/doc/effective_go#concurrency)
- [Node.js: event loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [Python `asyncio`](https://docs.python.org/3/library/asyncio.html)
- [Rust async book](https://rust-lang.github.io/async-book/)

## Public repositories worth studying

- [golang/go](https://github.com/golang/go)
- [tokio-rs/tokio](https://github.com/tokio-rs/tokio)
- [libuv/libuv](https://github.com/libuv/libuv)
- [python/cpython](https://github.com/python/cpython)
- [crossbeam-rs/crossbeam](https://github.com/crossbeam-rs/crossbeam)

## Build exercise

Implement a service that fetches three independent remote resources concurrently, then runs one CPU-heavy transformation in a bounded worker pool. Add cancellation/timeout behavior and a race test around a shared counter before replacing it with a safer design.

## Production concurrency engineering

### Bound concurrency by the dependency, not optimism

Starting every task at once turns a burst of user traffic into a burst against the database, CPU, memory allocator, or external provider. Put an explicit bound around each scarce resource: request concurrency, database connections, outbound calls per host, queue worker count, and CPU worker count. A semaphore, worker pool, or bounded queue is valuable because it converts overload into a controlled wait, rejection, or later retry rather than an uncontrolled resource collapse.

Choose the bound from measurement. If a database has twenty useful connections, a hundred concurrent handlers that all need one connection do not create ten times the throughput. They create pool waiting and larger tail latency.

### Use structured cancellation and deadlines

Every request should carry a deadline or cancellation context into its outbound calls and child tasks. If the client disconnects or the request budget is exhausted, stop waiting for work whose result cannot be used. When launching concurrent tasks, decide whether one failure cancels siblings, whether partial results are meaningful, and who waits for cleanup.

~~~text
request deadline
  -> bounded concurrent remote calls
  -> collect required results or cancel remaining calls
  -> submit CPU work to a bounded worker pool when needed
~~~

Set per-call timeouts shorter than the parent deadline. This leaves time for error handling and prevents every downstream call from independently consuming the entire request budget.

### Prefer ownership over shared mutable state

The safest shared variable is the one that does not exist. Pass immutable data to workers, have one component own mutable state, or use message passing when practical. When state truly must be shared, use the smallest correct primitive: an atomic operation for one simple value, a mutex for a short critical section, a channel/queue for ownership transfer, or a database transaction for durable coordination.

Do not hold a lock while calling the network, writing a large response, or performing lengthy CPU work. Lock order should be documented when multiple locks are unavoidable. A deadlock can be rarer than a race but just as severe in production.

### Separate CPU-heavy work from latency-sensitive serving

CPU-intensive transformations can starve an event loop or request executor even if the API has many pending I/O operations. Use a bounded process/worker pool or background job system, and give it its own capacity metrics. For work that can take longer than a normal request deadline, persist a job and expose status rather than holding a client connection open.

Profile under realistic load. Record queue wait time, active workers, CPU saturation, memory, event-loop delay if applicable, and downstream pool waiting. The right concurrency setting often changes with payload size and deployment limits, so make it configurable and test the safe range.

### Test schedules, not only outcomes

Unit tests rarely reproduce timing bugs by accident. Add tests that force two operations to interleave, run a race detector where the language provides one, use short controlled delays around critical sections, and run load tests that exercise cancellation and shutdown. A concurrent system is correct only when its invariants hold across possible schedules, not only when a single happy-path run finishes.
