# Study guide — 13. Caching, the secret behind it all

> This is added guidance, not a claim about the video's contents.

## The cache design checklist

For every cached value, document:

- source of truth;
- key and tenant/user isolation;
- TTL and refresh/invalidation strategy;
- behavior on cache miss, outage, and stale value; and
- metrics: hit rate, miss rate, latency, eviction, and error rate.

Caching is a consistency trade-off. Start with a measurable slow path and a small, low-risk cache.

## Production cache design

### Treat the cache as a disposable derived copy

A production service should be correct when the cache is empty, slow, unavailable, or evicted. The database, service that owns a record, or immutable object store remains the source of truth. The cache contains derived data and is allowed to lose it. This rule prevents a common failure mode: a cache outage turning into a complete application outage because the service no longer knows how to do the original read.

Write the contract before the implementation:

~~~text
key: product:v3:{tenant-id}:{product-id}
value: versioned product projection, not an unbounded ORM object
freshness: at most 60 seconds old
miss behavior: read primary store, populate cache, return result
write behavior: commit primary store, then invalidate or replace this key
failure behavior: bypass cache and record the cache error
~~~

The version in the key gives you a safe escape hatch when the response shape changes. A new deployment can use a new key prefix instead of trying to deserialize old values incorrectly.

### Use cache-aside for an ordinary read path

Cache-aside is usually the clearest first pattern. On a read, the application checks the cache. On a miss, it reads the primary store, serializes only the response projection it needs, stores it with a bounded TTL, and returns it. On a write, it commits the authoritative data first and then invalidates or refreshes the relevant keys.

Do not put a whole user object under a broad key and reuse it everywhere. Cache the representation that a particular endpoint needs. That reduces accidental data disclosure, makes serialization changes safer, and avoids invalidating a huge object because one small field changed.

### Plan for the hard cache failures

Three incidents recur in real systems:

- A popular key expires and thousands of requests rebuild it together. Add request coalescing, a short lock, or stale-while-revalidate behavior so one request refreshes while others reuse a boundedly stale value.
- A cache restart creates a cold-cache burst against the database. Rate-limit warm-up, keep database pools bounded, and decide which keys are worth prewarming from real traffic data.
- An invalidation is missed. Use TTL as a backstop, record mutation events, and monitor the age of values where correctness matters. For sensitive reads, prefer bypassing the cache or use version checks.

Never use a cache response across tenants, users, roles, locales, or authorization scopes unless those dimensions are safely represented in the key and access decision. A fast authorization leak is still a security incident.

### Operate the cache as a dependency

Set short client timeouts, use a bounded connection pool, and make cache errors observable without logging whole values. Monitor hit and miss rate by endpoint, latency for hits and fallbacks, command errors, eviction, memory pressure, and the primary-store load after a cache event. A high hit rate is not automatically good: it can conceal stale data or caching a response that should never have been shared.

Load-test both warm and cold conditions. The cold test tells you whether the primary store survives a mass expiry. The warm test tells you whether cache serialization and network latency really improve the user-facing percentile you care about.

## Learn by building: add cache-aside without hiding the source of truth

Install a Redis client only after the database read path works:

~~~bash
npm install redis
~~~

Create a cache-aware lookup:

~~~ts
import { createClient } from "redis";

const cache = createClient({
  url: process.env.REDIS_URL,
});

await cache.connect();

export async function getProduct(id: string) {
  const key = "product:v1:" + id;
  const cached = await cache.get(key);

  if (cached) {
    return JSON.parse(cached);
  }

  const product = await findProductById(id);

  if (product) {
    await cache.set(key, JSON.stringify(product), {
      EX: 60,
    });
  }

  return product;
}
~~~

Read the flow carefully:

1. Redis is checked first.
2. A cache hit avoids the database query.
3. A miss reads PostgreSQL, which remains authoritative.
4. Only an existing product is retained for 60 seconds.

After updating a product, delete or replace the same key. If you skip that step, users may receive an old name or price until the TTL expires.

~~~ts
await updateProductInDatabase(id, input);
await cache.del("product:v1:" + id);
~~~

### Failure experiment

Stop Redis while the database is still available. The production version must catch cache errors, log/measure them, and fall back to the database rather than making product reads fail solely because an optimization is unavailable.

## Read next

- [Redis documentation](https://redis.io/docs/latest/)
- [MDN: HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)
- [RFC 9111: HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111)
- [Cloudflare learning center: CDN](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/)

## Public repositories worth studying

- [redis/redis](https://github.com/redis/redis)
- [valkey-io/valkey](https://github.com/valkey-io/valkey)
- [memcached/memcached](https://github.com/memcached/memcached)
- [varnishcache/varnish-cache](https://github.com/varnishcache/varnish-cache)
- [squid-cache/squid](https://github.com/squid-cache/squid)

## Build exercise

Implement cache-aside for a read-heavy `GET /products/{id}` endpoint with Redis. Add a short TTL, invalidate after an update, and expose hit/miss counters. Test stale read behavior explicitly.
