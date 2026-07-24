# 11. Complete REST API Design

Video: [YouTube](https://www.youtube.com/watch?v=RG6q57DwV8Y&list=PLui3EUkuMTPgZcV0QhQrOcwMPcBCcd_Q1&index=11)

> Caption basis: English auto-generated captions. This note summarizes only what the captions support.

## What this video teaches

This is an API-design lesson centered on REST-style interfaces. It focuses on making resource-oriented HTTP APIs understandable and consistent, then demonstrates patterns with organization and project endpoints.

## Key lessons from the video

- API design concerns resources, route structure, request/response contracts, error responses, and status-code choices—not just writing endpoints.
- The video discusses choices such as plural/singular route segments, method choice for updates, and appropriate status codes.
- A REST-style API uses resource paths plus HTTP semantics to make the interface readable.
- Query parameters are used to pass additional list/query behavior such as filters; the video later demonstrates pagination and sorting.
- List APIs should provide a clear pagination contract, including page-oriented metadata.
- Resource endpoints for create, get, update, and delete have intentionally related paths; `DELETE` is shown with an empty `204` response in a successful case.
- The later walkthrough applies the patterns to organizations and projects, including defaults for server-side fields where appropriate.

## Detailed teaching notes from the video

### API design is interface design

The video emphasizes that a backend API is a long-lived interface for clients and other engineers. It is not just a collection of paths that happen to call database code. Design choices—resource naming, methods, parameter style, response shape, status codes, defaults, pagination, and errors—determine whether the API is intuitive and safe to change.

### Resources form the core vocabulary

REST-style design models the nouns that the system exposes: organizations, projects, users, tasks, and so on. The video discusses choices such as plural/singular naming and patterns for collection versus single-resource operations.

~~~text
GET    /organizations          → list resources
POST   /organizations          → create resource
GET    /organizations/{id}     → fetch one
PATCH  /organizations/{id}     → update one
DELETE /organizations/{id}     → delete one
~~~

These patterns are valuable because a reader can infer intent. They do not remove the need for a written contract; they make the contract easier to learn.

### URL parts have distinct jobs

The lesson revisits path parameters, nested routes, query parameters, and fragments. A path identifies a resource or relationship; query parameters convey optional list behavior such as filters and sort. The video demonstrates hierarchy when a child resource is meaningfully under a parent, and it uses query options for collection retrieval behavior.

### List endpoints are real product features, not an afterthought

The video spends time on pagination and sorting. A list response must deal with more than a broad database query: how many results are returned, how a client obtains the next portion, what default order is used, what fields are allowed for sorting, and how filters interact with the response.

The practical reason is predictable user experience and load control. Without an explicit maximum/default, one client can accidentally ask for an enormous collection; without stable sorting, pages can shift unpredictably.

### Status codes communicate outcome

The walkthrough uses 204 No Content for a successful delete and 404 Not Found when a requested resource no longer exists. This illustrates a broader point: choose responses based on the outcome the client needs to understand, not on what is easiest for one controller to return. A successful create, update, validation failure, conflict, unauthorized action, and unexpected error should have consistently documented behavior.

### Safe defaults reduce client burden without hiding important decisions

The organization/project examples discuss defaults such as an active status when the client does not provide one. A safe default is a business decision that makes the common case easy while still producing a valid state. It should be documented, testable, and never silently grant extra privilege or create unsafe behavior.

### Design the contract before the framework implementation

The video intentionally spends time on interface design without tying it to a programming language. That is the correct order for a public or multi-client API: decide the contract, review it, then implement it consistently in the framework of choice.

## Timestamp map

- **00:00** — Why API design matters and REST as the focus.
- **01:00** — Resource naming, path choices, methods, and status-code questions.
- **Around 20:00** — Route structure, nesting, and query parameters.
- **Around 65:00** — Pagination.
- **Around 76:00** — Sorting/list behavior.
- **Around 90:00** — `DELETE`, `204`, and not-found handling.
- **100:00–120:00** — Organization/project endpoint walkthrough and safe defaults.

## Check yourself

Write the contract for one list endpoint before coding: its default order, maximum page size, filtering rules, error shape, and what a client sees when the resource does not exist.

## Study prompt from this lesson

Write a complete endpoint table for a new resource before writing any code. If two engineers independently implement from the table, they should agree on route, method, request schema, statuses, pagination, authorization, and examples.
