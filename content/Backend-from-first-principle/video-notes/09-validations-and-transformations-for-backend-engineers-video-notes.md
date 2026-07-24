# 9. Validations and transformations for backend engineers

Video: [YouTube](https://www.youtube.com/watch?v=qedj_JjjL-U&list=PLui3EUkuMTPgZcV0QhQrOcwMPcBCcd_Q1&index=9)

> Caption basis: English auto-generated captions. This note summarizes only what the captions support.

## What this video teaches

Validation and transformation belong at the request boundary, before controller, service, and repository work. Their purpose is to keep downstream code operating on expected, safe, meaningful data.

## Key lessons from the video

- Validate request bodies, query parameters, path parameters, and headers at the entry point before significant business logic runs.
- Validation protects data integrity and makes unexpected client input less likely to create broken application state.
- The video demonstrates syntactic validation (required structure/format), semantic validation (whether values make sense), and type validation.
- Transformations convert client data into the form the server expects; query/path values commonly arrive as strings and may need type casting.
- Validation may involve dependent fields, while transformations can normalize data into a consistent server-friendly shape.
- Validation errors should give clients actionable feedback, but backend validation must remain authoritative even if a frontend also validates.
- Client-side validation improves user experience; server-side validation enforces integrity and security for every kind of client, including direct API callers.

## Detailed teaching notes from the video

### Validation happens before downstream layers rely on the data

The video places validation and transformation at the boundary between an incoming HTTP request and the controller/service/repository workflow. A server receives data from many kinds of clients—not only its own frontend. Body JSON, query parameters, path parameters, and headers are all external input. Before business logic assumes a value is safe or meaningful, the input needs a controlled pipeline.

~~~text
raw request
  → parse
  → transform predictable representation
  → validate shape/type/rules
  → create trusted input for handler/service
  → execute business logic
~~~

Without this boundary, a wrong type or malformed field can travel into the service/repository layers, where the error becomes harder to explain and may corrupt state or cause an unexpected failure.

### Validation asks more than “is this field present?”

The video demonstrates several categories of checks:

- **Syntactic validation:** Does the input match the required form? Examples include a valid email pattern or a date representation.
- **Semantic validation:** Does the value make sense in the domain? A birth date cannot be in the future; an age must be within a realistic range.
- **Type validation:** Is the value actually a string, number, boolean, array, or object as the endpoint expects?
- **Cross-field/relationship validation:** Do related values agree? For example, password and password confirmation should match.
- **Conditional validation:** Is a field required only when another field has a particular value?

The distinction matters because a value can pass one kind of validation and fail another. A string that parses as a number may still be semantically invalid as an age.

### Transformation makes representations usable, not automatically trusted

The video explains that query and path values normally arrive as strings. If an API expects a numeric ID or page number, the server must transform/cast the received string before using it. Other transformations include normalization, such as consistent casing/whitespace or formatting an expected field shape.

The safe mental model is: representation transformation does not equal business approval. Turning a string such as “42” into a number only makes the value usable for numeric validation; it does not prove that ID 42 exists, belongs to the caller, or is allowed for the requested action.

### Validation should make downstream work simpler

Once a request passes the boundary, the service layer should receive an expected structure instead of repeatedly checking raw strings, missing fields, or arbitrary JSON. This is why the video describes validation/transformation as keeping the rest of the application in a predictable state.

That does not mean every business rule belongs in a generic request-schema library. A rule that requires current database state—such as “this name must be unique in this organization”—often needs a service/repository check too. Boundary validation and business validation complement each other.

### Client validation is helpful but not authoritative

The video stresses that a web form is not the only caller. An API client can call the endpoint directly and bypass client-side checks. Client-side validation improves feedback speed and user experience; the server must still enforce the contract because it owns the system’s integrity and security.

### Error responses are part of the contract

Validation errors should tell a legitimate client what it can fix: which field, what rule, and what format is expected. But security-sensitive messages require care; do not disclose internal database/schema details or turn validation into an oracle for information an attacker should not learn.

## Timestamp map

- **00:00** — Validation/transformation within a layered backend architecture.
- **05:00** — Why the entry boundary is the right validation point.
- **14:00** — Syntactic validation examples.
- **18:00** — Semantic validation.
- **19:00** — Type validation.
- **Around 22:00–36:00** — Transformations, casting, and normalization examples.
- **40:00** — Server-side vs. client-side validation.

## Check yourself

If an API accepts `?page=2`, where do you cast it, where do you constrain it to a valid range, and what do you pass to the service layer?

## Study prompt from this lesson

For one write endpoint, create a table with four columns: raw input, transformation, boundary validation, and business validation. If you cannot explain where a rule belongs, your request contract is not yet clear.
