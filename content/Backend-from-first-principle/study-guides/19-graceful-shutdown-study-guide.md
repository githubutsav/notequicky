# Study guide — 19. Graceful Shutdown

> This is added guidance, not a claim about the video's contents.

## Shutdown sequence to implement

1. Receive a termination signal once and enter draining mode.
2. Mark the instance unready and stop accepting new connections/work.
3. Wait—with a deadline—for in-flight HTTP requests and workers.
4. Cancel remaining work safely if the deadline expires.
5. Close clients/resources in dependency-safe order and exit with a clear status.

Test it under real traffic. The hard part is not registering a signal; it is ensuring your load balancer and workers obey the same lifecycle.

## Learn by building: drain instead of disappearing

Add one shutdown function to the application process:

~~~ts
let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  app.log.info({ signal }, "starting graceful shutdown");

  const forceExit = setTimeout(() => {
    app.log.error("shutdown deadline exceeded");
    process.exit(1);
  }, 25_000);

  try {
    await app.close();
    clearTimeout(forceExit);
    process.exit(0);
  } catch (error) {
    app.log.error(error, "shutdown failed");
    process.exit(1);
  }
}

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));
~~~

For Fastify, app.close stops new requests and waits for active requests to finish before closing its server. Your process still needs a deadline, because a stuck dependency should not block a rollout forever.

### Failure experiment

Create a route that waits five seconds before responding. Start the request, send SIGTERM after one second, and confirm three things: new requests are rejected, the in-flight request completes if it fits the deadline, and the process exits afterward. Later, add database pool and queue-worker cleanup in the same shutdown sequence.

## Read next

- [Kubernetes pod termination](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination-flow)
- [Go `http.Server.Shutdown`](https://pkg.go.dev/net/http#Server.Shutdown)
- [Node.js process signals](https://nodejs.org/api/process.html#signal-events)
- [Kubernetes readiness probes](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/)

## Public repositories worth studying

- [kubernetes/kubernetes](https://github.com/kubernetes/kubernetes)
- [nginx/nginx](https://github.com/nginx/nginx)
- [caddyserver/caddy](https://github.com/caddyserver/caddy)
- [moby/moby](https://github.com/moby/moby)
- [temporalio/temporal](https://github.com/temporalio/temporal)

## Build exercise

Create an endpoint that deliberately takes five seconds. Start it, send a termination signal after one second, and verify that readiness turns off, the in-flight request completes within the deadline, and a later request is not accepted.

## Production shutdown engineering

### Model shutdown as a state transition

Keep an explicit lifecycle state: starting, ready, draining, and stopped. Readiness should be false while starting and as soon as draining begins. Liveness is different: a draining instance can still be alive and working on an in-flight request, so do not use a liveness probe to express traffic readiness.

On a termination signal, make the state change idempotent. A second signal should not start a second cleanup race. Stop the HTTP listener or reject new requests, unregister or fail readiness, stop pulling new queue jobs, and begin a bounded drain timer. New work should see a controlled rejection or be routed elsewhere; already accepted work should own a cancellation/deadline signal.

### Coordinate deadlines across the platform

Choose an application drain deadline shorter than the orchestrator’s termination grace period. Leave time after the application gives up for cleanup and final process exit. Align load-balancer deregistration delay, reverse-proxy timeout, application request deadline, queue visibility timeout, and database/client timeouts. If these values contradict each other, the system will appear graceful in a local test but lose work during a deployment.

Long-running operations need a separate design. A request that could take minutes should usually create a durable job and return a status resource, rather than relying on one instance to remain alive. For streaming responses and WebSockets, notify clients of drain when possible and set a clear close deadline.

### Close in reverse dependency order

First stop new entry points: listener, consumer polling, cron trigger. Then wait for in-flight work. Only then close outbound clients, database pools, telemetry exporters, and the process itself. Record counts for active requests and active jobs so the drain log explains why the instance exited normally or reached its deadline.

For a queue worker, do not acknowledge a job until its durable business effect is complete. If shutdown interrupts work, allow the broker visibility timeout or explicit retry policy to make it available again, and rely on idempotency to make the later attempt safe.

### Prove it in the environment that deploys it

Automate a termination test in a container or staging environment. Start a slow request, trigger a normal termination, observe readiness removal, send a new request, and examine whether the original request, logs, and trace match the intended policy. Repeat with an active job, a slow database call, and a deployment rollout. Shutdown correctness is a distributed property, not just a signal handler.
