# Study guide — 21.1. Backend Scaling and Performance Engineering: Part-1

> This is added guidance, not a claim about the video's contents.

## Performance workflow

1. Establish a representative workload and an SLO/latency budget.
2. Capture percentiles, throughput, saturation, errors, and traces.
3. Find the narrowest bottleneck: query, dependency, CPU, lock, queue, payload, or network path.
4. Change one thing, rerun the same workload, and compare.
5. Keep the regression test/dashboard so performance does not silently deteriorate.

## Learn by building: measure before you optimize

Install k6, then create tests/products.js:

~~~js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 20,
  duration: "30s",
};

export default function () {
  const response = http.get("http://localhost:3000/products/book-1");

  check(response, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(0.1);
}
~~~

Run the same workload before and after a change:

~~~bash
k6 run tests/products.js
~~~

Record p95 latency, error rate, database query count, and CPU. Do not call a change an optimization because the code looks cleaner. If you add a cache, query index, or parallel operation, it must improve a measured constraint under the same workload.

### Database experiment

Run EXPLAIN ANALYZE for a slow product/list query before adding an index. Then add the smallest index that matches its filtering and ordering, run the same query again, and record both the read improvement and extra write/storage cost.

## Read next

- [Google SRE: Monitoring distributed systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Grafana k6 documentation](https://grafana.com/docs/k6/latest/)
- [PostgreSQL `EXPLAIN`](https://www.postgresql.org/docs/current/using-explain.html)
- [OpenTelemetry documentation](https://opentelemetry.io/docs/)

## Public repositories worth studying

- [grafana/k6](https://github.com/grafana/k6)
- [tsenart/vegeta](https://github.com/tsenart/vegeta)
- [wg/wrk](https://github.com/wg/wrk)
- [brendangregg/FlameGraph](https://github.com/brendangregg/FlameGraph)
- [grafana/pyroscope](https://github.com/grafana/pyroscope)
- [open-telemetry/opentelemetry-demo](https://github.com/open-telemetry/opentelemetry-demo)

## Build exercise

Create a load test for an endpoint with an intentional N+1 query. Record p50/p95/p99, database query count, and CPU. Fix it with a batched query or join, rerun the same test, and document both the improvement and any trade-off.

## Production performance engineering

### Define a workload and an SLO before tuning

Write down the request mix, concurrency, response size, input distribution, data size, and dependency behavior you need to support. Pair it with an SLO such as a p95 latency and an error-rate target. A test that sends one repeated request against an empty database is a unit benchmark, not a capacity result.

Instrument the golden endpoint with a latency histogram, request/error counters, trace spans, database query count/timing, cache behavior, and resource saturation. Compare a baseline with a controlled change under the same load. Without a comparable baseline, an apparent optimization may only be a quieter test run.

### Diagnose by the constrained resource

Use traces and profiles to decide whether time is spent on CPU, database execution, connection-pool waiting, external I/O, lock contention, serialization, garbage collection, or queueing. Apply a change at the limiting resource:

- for N+1 queries, batch or join intentionally and verify the resulting query plan;
- for a slow indexed lookup, examine selectivity and query shape before adding another index;
- for pool saturation, bound concurrency and fix slow dependencies before raising limits;
- for CPU saturation, reduce work, cache a safe result, or isolate CPU work; and
- for remote I/O, set deadlines and consider concurrent waiting only when the dependencies are independent.

### Treat tail latency as a first-class failure mode

Track p50, p95, p99, and maximum latency alongside throughput and saturation. A system may have a good mean while a small percentage of requests wait behind a saturated pool or a slow query. Budget the request deadline across subcalls; a handler cannot safely give every downstream call the entire client timeout.

Run a stress test past expected capacity to learn the failure shape. A healthy service should shed or queue bounded work rather than consume unlimited memory and make every request slow. Record the knee in the curve where latency accelerates, then keep normal capacity below it with headroom.

### Protect gains with regression tests

Keep the load script, dataset generation, dashboard query, and before/after result with the code change. Performance regressions usually return through a new ORM access pattern, a changed payload, a missing index, or an unbounded fan-out. A repeatable benchmark makes those regressions visible before production.
