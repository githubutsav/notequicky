# 21.2. Backend Scaling and Performance Engineering: Part-2

Video: [YouTube](https://www.youtube.com/watch?v=sOhAopEwjH4&list=PLui3EUkuMTPgZcV0QhQrOcwMPcBCcd_Q1&index=22)

> Caption basis: English auto-generated captions. This note summarizes only what the captions support.

## What this video teaches

This continuation explores how horizontally scaled systems distribute traffic and state, then surveys database scaling, CDN/edge delivery, background work, service boundaries, autoscaling, and serverless trade-offs.

## Key lessons from the video

- A load balancer decides which server instance receives a request in a multi-instance system; policies may consider rotation or active connections.
- Horizontal scaling makes session/state placement important because a later request may reach a different server.
- Read replicas can scale database reads, but replication lag can make a just-written value temporarily unavailable on a replica.
- One mitigation discussed is routing a read-after-write to the primary or otherwise accounting for lag; database partitioning/sharding is introduced as another scaling concept.
- CDNs/edge locations can serve static assets and selected cacheable responses closer to users; edge logic can also use location/language context.
- Background queues improve interaction latency by moving non-immediate work such as email or uploads outside the request path.
- Microservices can improve team/module independence but also introduce distributed-system complexity; they are not an automatic default.
- Autoscaling and serverless models help match provisioned capacity/cost to demand, each with their own constraints and trade-offs.
- The conclusion returns to measurement: understand the actual slow component before selecting a solution.

## Timestamp map

- **00:00–25:00** — Horizontal scaling, load balancers, and instance state.
- **30:00–48:00** — Read replicas, replication lag, and sharding.
- **50:00–75:00** — CDN/edge caching and geographically closer delivery.
- **80:00–90:00** — Background queues and request responsiveness.
- **90:00–105:00** — Microservice benefits and trade-offs.
- **110:00–125:00** — Autoscaling and serverless costs/constraints.
- **130:00** — Measurement-first conclusion.

## Check yourself

If users report stale data immediately after an update, can you trace whether the read hit a replica, quantify replication lag, and choose a consistency policy for that interaction?

## Detailed teaching notes from the video

### Load balancing lets capacity be shared

The second part moves from measurement to common scaling mechanisms. A load balancer can distribute traffic across multiple application instances using strategies such as round robin or a choice based on active connections. This creates capacity and resilience, but it also exposes any state that was assumed to live in one process.

The video therefore returns to stateless application design. If an application keeps a user session or important workflow state only in one instance’s memory, the next request can land on another instance and fail to find it. A shared store, a client-carried credential with suitable validation, or a different architecture is needed when instances are interchangeable.

### Database scaling changes read consistency

The lesson covers database replicas and the effect of replication lag. Replicas can take read load away from a primary, but an immediately following read may not reflect a just-completed write. The backend needs a policy for this: some interactions can tolerate stale data; others need to read from the primary until the necessary state is visible.

It also discusses sharding as a way to divide data across database partitions. Sharding can increase capacity, but it introduces routing decisions, cross-shard query complexity, and operational work. It is not a first response to an unmeasured slow query.

### Edge caching and background work scale different paths

The video connects CDNs and caching to static and geographically distributed content. Serving suitable content near the user reduces work at the origin. It also returns to queues and background workers: request-serving capacity and background-processing capacity can be scaled independently when the work is separated.

### Microservices and autoscaling are trade-offs

The lesson treats microservices, autoscaling, and serverless systems as choices with benefits and costs. Splitting a system can allow independent deployment and scaling, but it adds network boundaries, operational visibility needs, and failure paths. Autoscaling can respond to demand but must be informed by meaningful signals and constrained by cost, startup time, and downstream capacity.

The conclusion again is measurement-first. A scalable design matches the layer that is actually saturated, preserves required consistency, and remains understandable when traffic or failures increase.
