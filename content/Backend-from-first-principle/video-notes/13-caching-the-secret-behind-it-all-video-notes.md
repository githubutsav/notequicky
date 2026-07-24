# 13. Caching, the secret behind it all

Video: [YouTube](https://www.youtube.com/watch?v=estH64OkwxU&list=PLui3EUkuMTPgZcV0QhQrOcwMPcBCcd_Q1&index=13)

> Caption basis: English auto-generated captions. This note summarizes only what the captions support.

## What this video teaches

Caching reduces the time and effort needed to perform repeated work by keeping a useful subset of data in a faster-to-access location. The video spans caches near the user, in DNS/network infrastructure, and in application memory.

## Key lessons from the video

- A cache intentionally keeps a subset rather than necessarily duplicating all primary data.
- CDNs/edge networks cache content close to users to reduce latency and load on an origin server.
- DNS resolution also relies on cached lookups and cache misses that trigger further resolution.
- In-memory stores such as Redis and Memcached use fast memory access; persistence mechanisms can preserve/reload their state.
- Cache eviction/invalidation policies matter. The video discusses TTL as one way a value can expire automatically.
- Caching can support common backend concerns such as serving repeated data and implementing rate-limiting state.
- Cache usage requires deciding what data is safe to reuse and when it must be refreshed or removed.

## Timestamp map

- **00:00** — Caching definition and why reuse is faster.
- **10:00–20:00** — CDNs/edge caching and geographically close content.
- **20:00–35:00** — DNS caching and resolution flow.
- **40:00** — Memory, persistence, Redis/Memcached concepts.
- **45:00–55:00** — TTL and eviction/invalidation ideas.
- **60:00** — Rate limiting as a cache-backed use case.

## Check yourself

Name the source of truth, cache key, expiration rule, invalidation trigger, and stale-data consequence before you add any cache.

## Detailed teaching notes from the video

### Caching means reusing an earlier result

The video starts from a simple observation: the expensive part of a request is often work that was already done recently. A cache keeps a useful subset of data in a location that can answer more quickly than the original path. The subset matters: a cache is not automatically a replacement for the database or origin. It is a deliberately chosen copy whose job is to avoid repeated computation, repeated network travel, or repeated disk access.

That creates two paths for the same request:

~~~text
request -> cache has a suitable value -> return it quickly
request -> cache does not have a suitable value -> do the original work -> retain a useful result
~~~

The important word is suitable. The cached response must belong to the right user or tenant when data is private, must still be valid enough for the use case, and must represent the requested version of the resource.

### Caches appear at more than one layer

The lesson moves from caching close to a user to caching inside backend infrastructure. A CDN or edge cache keeps commonly requested static content near users in different regions. Instead of every browser travelling all the way to one origin server for the same image, JavaScript file, or cacheable response, an edge location can serve it. That reduces both latency for the user and load on the origin.

DNS is another useful example. Resolving a hostname can require following information through the DNS system, so resolved answers are cached for a period. A cache hit avoids asking the upstream resolver again; a miss makes the resolver continue the lookup process. The video uses this to make the point that caching is a general systems technique, not just a Redis feature.

### Why memory-backed caches are fast

The video then discusses in-memory cache systems such as Redis and Memcached. Memory is much quicker to access than durable disk storage, so keeping hot values there can make a repeated lookup fast. The trade-off is that memory is limited and processes can restart. The discussion therefore also touches on persistence/reloading: a system has to decide which cached state can disappear safely and which state needs a recovery mechanism.

This distinction is especially important for rate-limit counters. A counter that is only an optimization can be reconstructed or allowed to reset under a documented policy. A value that represents money, an entitlement, or a business record should not silently become authoritative merely because it happens to be held in a cache.

### Expiration and eviction are part of the design

A cache cannot grow forever and values cannot remain useful forever. The video introduces TTL, or time to live, as an automatic expiry rule. After the TTL, a previously stored value is no longer eligible for reuse and the next request has to obtain a fresh answer. This is a simple way to bound staleness and memory usage.

The lesson also calls attention to eviction and invalidation. Eviction is the cache removing an entry to make room or because it has expired. Invalidation is a deliberate decision that a particular entry should no longer be used because the underlying value changed. These are not implementation footnotes: they determine whether a cache makes the system faster or serves misleading data.

### Rate limiting is a stateful cache use case

The closing application is rate limiting. The system can hold short-lived state such as a count of requests for a client in a time window. The cache then lets many application instances make a consistent-enough decision without each one maintaining isolated local memory. The lesson connects this to the broader theme: a fast shared store can be used for short-lived coordination as well as for read acceleration.

The video therefore teaches a useful discipline: identify the original work, choose where a reusable result should live, decide how long it can be reused, and make the consequence of an old or missing value explicit.
