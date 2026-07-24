# 22. Concurrency & Parallelism: IO Bound vs CPU Bound

Video: [YouTube](https://www.youtube.com/watch?v=bs9MEYRTA30&list=PLui3EUkuMTPgZcV0QhQrOcwMPcBCcd_Q1&index=23)

> Caption basis: English auto-generated captions. This note summarizes only what the captions support.

## What this video teaches

Backends must make progress on multiple requests. The video separates concurrency from parallelism, relates the choice to I/O-bound versus CPU-bound work, and introduces processes, threads, event loops, async work, goroutines, and race conditions.

## Key lessons from the video

- Concurrency is about making progress on multiple tasks over time; parallelism is simultaneous execution and needs hardware parallelism such as multiple CPU cores.
- A typical backend request spends much of its time waiting on I/O (database/network/disk), so concurrency prevents a CPU from sitting idle while other requests can progress.
- CPU-bound work consumes CPU cycles and may benefit from parallel execution, whereas more concurrency is not a free cure for CPU saturation.
- Processes have separate memory; threads within a process can share memory, which enables efficient collaboration but introduces synchronization risk.
- The video contrasts thread-based execution, event-loop/async architectures, and Go-style lightweight goroutines/virtual threads.
- Event-loop models can be efficient for I/O-bound workloads because waiting work yields control; long CPU work can block the loop.
- Shared mutable state can produce race conditions even in high-level async code; locks/mutexes or other coordination mechanisms protect critical state.

## Timestamp map

- **00:00–10:00** — Why servers need concurrency; concurrency vs. parallelism.
- **18:00–25:00** — I/O-bound versus CPU-bound work.
- **25:00–35:00** — Processes, threads, and shared memory.
- **40:00–60:00** — Event loops, blocking, and async execution.
- **60:00–75:00** — Goroutines/virtual threads.
- **80:00–85:00** — Race conditions and mutexes.

## Check yourself

If an endpoint does image resizing and a database query, which work should be offloaded/parallelized, which can be awaited concurrently, and what shared state needs protection?

## Detailed teaching notes from the video

### Concurrency and parallelism solve related but different problems

The video separates concurrency from parallelism. Concurrency is about making progress on more than one task over an interval of time. Parallelism is about executing work at the same instant, usually on more than one core. A program can be concurrent without doing CPU work in parallel: it may start one network operation, make progress on another task while waiting, and resume when the first operation is ready.

This distinction matters because backend workloads often wait on databases, caches, files, and remote services. The goal is not always to create more CPU threads. It is often to avoid wasting a worker while the worker has nothing to do except wait for I/O.

### Classify the work before choosing a model

The lesson contrasts I/O-bound and CPU-bound work. I/O-bound work spends much of its time waiting for an external system, so asynchronous I/O or concurrent waiting can improve throughput when requests are independent. CPU-bound work spends its time actively computing, so it needs actual compute capacity and can compete with request handling if it runs uncontrolled in the same execution resource.

The video uses this distinction to explain why image/video transformations and expensive computation may need a separate worker or process, while multiple independent network calls can often be initiated and awaited concurrently.

### Processes, threads, and event loops have different properties

The video discusses processes as isolated units and threads as units that share a process’s memory. Shared memory can make coordination efficient, but it also introduces the possibility that two tasks update the same state at the wrong time.

It also covers event loops and asynchronous execution. An event loop can make progress on many I/O operations when callbacks or awaitable operations yield rather than block the loop. If one task performs long blocking work on the event loop, it prevents the other ready work from being serviced. This is why asynchronous code still needs a clear understanding of what blocks.

The lesson mentions execution models such as goroutines and virtual threads as ways runtimes make concurrent tasks easier to express. The common principle remains: the runtime can schedule work, but the engineer must still bound it and protect shared data.

### Race conditions are correctness bugs

The closing material discusses race conditions and mutexes. A race occurs when the result depends on unpredictable interleaving of operations on shared state. A mutex can protect a critical section, but it is not a reason to make all state shared or all work parallel.

The production takeaway is to identify which work is independent, which is I/O wait, which consumes CPU, and which state is shared. Then use an execution model that preserves correctness while improving the specific bottleneck you measured.
