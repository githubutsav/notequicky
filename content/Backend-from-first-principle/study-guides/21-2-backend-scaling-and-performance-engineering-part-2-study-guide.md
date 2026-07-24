# Study guide — 21.2. Backend Scaling and Performance Engineering: Part-2

> This is added guidance, not a claim about the video's contents.

## Choose a scaling layer deliberately

| Symptom | First question |
| --- | --- |
| One app instance is saturated | Is work CPU-, memory-, or I/O-bound? |
| Traffic outgrows one app instance | Is the app stateless enough for a load balancer? |
| Reads overload the database | What consistency delay is acceptable? |
| Global static delivery is slow | Can a CDN cache it safely? |
| A request waits on nonessential work | Can a durable background job own it? |
| Capacity varies sharply | Are autoscaling/serverless cold-start and state trade-offs acceptable? |

## Learn by building: prove that an instance has no private state

Add a readiness endpoint and a process identifier:

~~~ts
let ready = true;

app.get("/ready", async (request, reply) => {
  if (!ready) {
    return reply.code(503).send({
      ok: false,
    });
  }

  return {
    ok: true,
    instance: process.pid,
  };
});
~~~

When shutdown begins, set ready to false before app.close:

~~~ts
ready = false;
await app.close();
~~~

Run two copies of the service on different ports behind a reverse proxy. Send repeated requests and observe different process ids. The response must remain correct whichever instance receives it.

### State experiment

Add a global variable such as lastViewedProductId, then send one request to instance A and the next to instance B. The state will not follow the user. Delete the global variable and move durable state to PostgreSQL/Redis or keep it in the signed session design you deliberately chose. That is the practical meaning of stateless horizontal scaling.

## Read next

- [Kubernetes horizontal pod autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [Kubernetes service/load-balancing concepts](https://kubernetes.io/docs/concepts/services-networking/service/)
- [Cloudflare learning center: CDN](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/)
- [PostgreSQL high availability/replication](https://www.postgresql.org/docs/current/high-availability.html)

## Public repositories worth studying

- [kubernetes/kubernetes](https://github.com/kubernetes/kubernetes)
- [kubernetes/autoscaler](https://github.com/kubernetes/autoscaler)
- [envoyproxy/envoy](https://github.com/envoyproxy/envoy)
- [nginx/nginx](https://github.com/nginx/nginx)
- [postgres/postgres](https://github.com/postgres/postgres)
- [cloudflare/workerd](https://github.com/cloudflare/workerd)

## Build exercise

Put two instances of a small stateless API behind a proxy/load balancer. Add a readiness endpoint and an idempotent background email job. Load test it, then intentionally add in-memory session state to observe why it breaks across instances.

## Production scaling architecture

### Make application instances disposable

An instance behind a load balancer should be able to start cold, serve a request, drain, and disappear without losing business state. Store durable state in the database or another explicitly selected shared system. Keep request-scoped state in the request, not a global variable. Use readiness to decide whether the instance should receive traffic and graceful shutdown to remove it safely.

Load-balancer algorithms are secondary to this invariant. Round robin, least-connections, and weighted routing all work better when requests can land on any healthy instance. Avoid sticky sessions unless there is a clear, temporary reason; they hide state coupling and make capacity uneven.

### Choose a consistency policy for every read

If using primary/replica databases, document which reads may use replicas and which must observe a recent write. Typical write-confirmation flows may route the next read to the primary or wait for a version watermark, while a catalog page may accept limited replica lag. Measure lag and expose it in operations; otherwise stale-data reports become impossible to diagnose.

Shard only when data size or write throughput demands it and the shard key aligns with most access patterns. Define how a request finds the correct shard, how multi-shard operations are avoided or reconciled, and how a hot tenant is handled. A poor shard key turns a scaling plan into a permanent coordination problem.

### Scale at the correct layer with backpressure

Use CDN and HTTP caching for safe cacheable responses, a shared cache for hot derived data, a queue for asynchronous work, and workers with concurrency bounded by the database or provider they depend on. Queue depth and age can drive worker capacity, but do not autoscale workers faster than downstream systems can absorb their requests.

Autoscaling should have minimum/maximum limits, warm-up behavior, cost guardrails, and a rollback plan. Measure CPU or concurrency together with request/queue pressure; CPU alone is a poor signal for an I/O-bound API. Test scale-out and scale-in so the system proves it can drain as well as grow.

### Split services only for a concrete boundary

Separate a service when it needs an independent deployment cadence, security boundary, ownership model, reliability boundary, or scaling profile that a modular monolith cannot provide. A network call adds latency, versioning, tracing, retries, and partial failure. Keep the first architecture simple enough that one team can reason about it, and introduce a service boundary only when it solves a demonstrated constraint.
