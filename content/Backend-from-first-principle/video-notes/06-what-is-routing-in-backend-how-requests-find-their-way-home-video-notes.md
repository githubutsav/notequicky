# 6. What is Routing in Backend? How Requests Find Their Way Home

Video: [YouTube](https://www.youtube.com/watch?v=SubuU1iOC2s&list=PLui3EUkuMTPgZcV0QhQrOcwMPcBCcd_Q1&index=6)

> Caption basis: English auto-generated captions. This note summarizes only what the captions support.

## What this video teaches

Routing maps the **where** of a request—the URL/path—to server-side handling, while the HTTP method expresses the **what** or intended action. The video demonstrates how the method plus path selects a handler.

## Key lessons from the video

- A route match uses both method and path, so `GET /api/books` and `POST /api/books` can map to different handlers.
- Static routes have no variable path segments; dynamic routes use path/route parameters such as `:id`.
- Path parameters identify a resource in a readable route, while query parameters carry key/value request options such as page, limit, filter, or sort.
- Nested routes can express relationships, for example a particular user's post.
- Versioned routes let a service introduce breaking response changes while giving clients time to migrate and deprecate an old version.
- A catch-all route gives a deliberate, user-friendly response when no known route matches.

## Detailed teaching notes from the video

### Routing joins intent with destination

The video makes a useful separation:

- The **HTTP method** says what the client intends to do.
- The **route/path** says where that intent applies.

The server uses both to select a handler. `GET /api/books` and `POST /api/books` are different operations even though the path is identical. The combination is the key that maps a request to server-side instructions.

### Static and dynamic routes solve different address problems

A static route is fixed: `/api/books` always has the same literal segments. A dynamic route reserves part of the path for a value, such as `/api/users/:id`. When a request arrives as `/api/users/123`, the router matches the literal pieces and captures `123` as the `id` parameter for the handler.

The video emphasizes that everything in a URL path arrives as text. A route parameter that looks numeric still needs validation and conversion before it becomes an application ID. Do not assume `:id` is valid simply because the router matched it.

### Path parameters identify; query parameters modify a retrieval

The lesson separates two kinds of values:

```text
/api/users/123              → path parameter identifies the user
/api/books?page=2&limit=20  → query parameters shape the list retrieval
```

Use path segments when the value is part of the resource's identity/relationship. Use query parameters for optional dimensions: paging, filtering, sorting, search, or a representation preference. The video explains that `GET` normally has no request body in REST-style use, so query parameters are the usual way to carry list options.

### Nested routes express relationships, but depth is a design cost

The video demonstrates `/api/users/123/posts/456`: it says “a particular post belonging to this particular user.” This can be clear when the parent relationship is genuinely important. However, nesting makes the contract stricter. A handler must decide whether the parent is only contextual or whether it must be verified as the owner of the child.

In production, do not use a deeply nested URL merely because it can be written. Keep nesting when it communicates an access/ownership boundary; otherwise a direct `/posts/456` plus authorization may be simpler.

### Versioning gives clients a migration window

The video shows `/api/v1/products` and `/api/v2/products` returning differently shaped data. Versioning lets the server introduce a breaking contract change without instantly breaking existing clients. The important part is not the `v1` string; it is the migration plan: document the new behavior, give consumers time to move, observe traffic to the old version, and remove it deliberately.

### A catch-all route is part of API usability

When no route matches, a catch-all handler returns a controlled not-found response instead of a mysterious empty/undefined result. This is a small feature with a large debugging benefit: it helps API clients distinguish a route mismatch from an application bug or an authorization failure.

## Timestamp map

- **00:00** — Routing as the “where” paired with an HTTP method as the “what.”
- **03:00** — Static routes and dynamic/path parameters.
- **09:00** — Query parameters, pagination, filtering, and sorting.
- **15:00** — Nested routes and resource relationships.
- **18:00** — URL versioning and deprecation.
- **21:00** — Catch-all/not-found handling.

## Check yourself

For `GET /api/users/123/posts?page=2`, can you say which part identifies the resource relationship and which part controls the result set?

## Study prompt from this lesson

Design routes for a task app without writing code. For each route, state its resource, method, path parameters, optional query parameters, authorization rule, success response, and a 404/403 distinction. Then turn the table into OpenAPI before building handlers.
