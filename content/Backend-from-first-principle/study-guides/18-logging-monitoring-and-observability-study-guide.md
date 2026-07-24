# Study guide — 18. Logging, Monitoring and Observability

> This is added guidance, not a claim about the video's contents.

## Instrument a golden path first

Choose one important endpoint and emit:

- a structured start/end log with request ID;
- a latency and error metric;
- a distributed trace with database/external-call spans; and
- a dashboard/SLO that explains when someone must act.

Never log credentials, tokens, raw authorization headers, or unnecessary sensitive payloads.

## Learn by building: emit a complete request event

Add an onResponse hook that logs outcome and duration in structured fields:

~~~ts
app.addHook("onRequest", async (request) => {
  request.startTime = performance.now();
});

app.addHook("onResponse", async (request, reply) => {
  const durationMs = performance.now() - request.startTime;

  request.log.info({
    method: request.method,
    route: request.routeOptions.url,
    statusCode: reply.statusCode,
    durationMs,
    requestId: request.id,
  }, "request completed");
});
~~~

Add the type declaration once:

~~~ts
declare module "fastify" {
  interface FastifyRequest {
    startTime: number;
  }
}
~~~

Send a successful request and a validation failure. Compare the two log events. You should be able to answer: which route ran, how long it took, what status it returned, and which request id the client saw.

### What not to log

Do not add passwords, authorization headers, raw access tokens, or complete request bodies to this event. Good observability makes debugging easier without turning logs into a second database of secrets.

## Read next

- [OpenTelemetry documentation](https://opentelemetry.io/docs/)
- [Prometheus documentation](https://prometheus.io/docs/)
- [Grafana documentation](https://grafana.com/docs/grafana/latest/)
- [Google SRE workbook](https://sre.google/workbook/table-of-contents/)

## Public repositories worth studying

- [open-telemetry/opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector)
- [prometheus/prometheus](https://github.com/prometheus/prometheus)
- [grafana/grafana](https://github.com/grafana/grafana)
- [grafana/loki](https://github.com/grafana/loki)
- [jaegertracing/jaeger](https://github.com/jaegertracing/jaeger)
- [open-telemetry/opentelemetry-demo](https://github.com/open-telemetry/opentelemetry-demo)

## Build exercise

Instrument `POST /orders` with a correlation ID, a trace containing database and payment spans, counters for successes/failures, and a latency histogram. Trigger a deliberate payment timeout and trace it end to end.

## Production observability engineering

### Instrument a request as one connected story

At the ingress boundary, create or accept a trace context and request id. Put them in structured logs, propagate them in outbound HTTP calls and queue messages, and attach them to database, cache, and external-provider spans. A support engineer should be able to begin with a request id from a user report and reach the relevant logs, trace, and deployment version without manually correlating timestamps.

Use a stable event schema rather than free-form prose:

~~~text
timestamp, level, service, environment, version, route, operation,
trace-id, span-id, request-id, outcome, duration-ms, dependency, error-class
~~~

Add identifiers only when they are useful and permitted. Do not log authorization headers, session tokens, passwords, raw payment data, or broad request bodies. Hash or redact identifiers when the debugging value does not justify the privacy cost.

### Choose metrics that drive a decision

For a request-serving service, start with rate, errors, and duration. For each dependency, also measure calls, failures, latency, and saturation indicators such as pool use or queue age. Use histograms for latency so tail percentiles can be calculated; averages hide the experience of slow users.

Tie dashboards to a user-facing service-level objective. An alert should name a symptom that needs action, an owner, and a runbook link. Alerting on every error log produces noise; alerting on sustained error-budget burn, unusually high request latency, or an aged queue gives a responder a concrete operational question.

### Control cardinality, volume, and cost

Metric label values should be bounded. A metric labelled by user id, raw URL, order id, or exception message can create an unbounded number of time series and destabilize the monitoring system. Put high-cardinality identifiers in logs or traces instead. Sample successful traces when volume is high, retain complete traces for meaningful errors where possible, and define log/trace retention with privacy and cost in mind.

### Verify the telemetry during failure

Telemetry code needs tests just like business code. In integration tests, force a timeout and assert that the expected error counter increments, the trace contains an error-marked dependency span, and the structured log is redacted. During a game day, deliberately degrade a dependency and verify that the dashboard, alert, trace, and runbook tell the same story.
