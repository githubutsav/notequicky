# Study guide — 7. Serialization and Deserialization for backend engineers

> This is added guidance, not a claim about the video's contents.

## The boundary rule

Deserialize into an input model, validate it, then map it into a domain model. Do not let arbitrary wire data directly become trusted application state.

Choose JSON when readability and browser compatibility matter. Consider a schema-based binary format when you control both ends and have measured a reason to optimize payload size, speed, or compatibility rules.

## Production serialization design

### Separate wire models from domain models

A request DTO/schema is an untrusted representation designed for an API contract. A domain model represents a valid business concept. A persistence model represents stored data. They often overlap, but treating them as identical causes mass-assignment and backward-compatibility bugs.

```text
JSON request
  → parse DTO
  → validate + authorize
  → map to domain command
  → persist
  → map to response DTO
```

Do not deserialize directly into a database entity and save it. A client should not be able to set internal fields such as `role`, `owner_id`, `created_at`, accounting status, or password hash simply because the field exists in a stored model.

### Make format decisions explicit

- **Dates/times:** choose a documented standard and timezone behavior; avoid locale-dependent parsing.
- **Money:** use a decimal/minor-unit representation, not an unconstrained floating-point value.
- **IDs:** document whether IDs are strings, UUIDs, or opaque values; do not rely on JavaScript numeric precision for large integer IDs.
- **Unknown fields:** decide whether to reject, ignore, or preserve them; security-sensitive write requests often should reject them.
- **Null vs. omitted:** define whether each means “clear value,” “use default,” or “leave unchanged.”

### Evolve a contract without breaking clients

Additive optional fields are usually safer than changing an existing field's meaning or type. Never reuse a field name for a new meaning. For major changes, publish a new version/migration path and run consumer contract tests.

### Test malformed and hostile data

Test invalid JSON, wrong content type, duplicate keys if your parser has a policy, enormous bodies, unknown fields, nested depth, invalid Unicode/encodings where relevant, and values that parse but violate business rules. Parser success is only the first gate.

## Learn by building: turn JSON into trusted data

An HTTP body arrives as untrusted JSON. Parse and transform it once at the boundary, then let the rest of the application receive a known shape.

~~~ts
const createProductBody = z.object({
  name: z.string().trim().min(1).max(120),
  priceInPaise: z.coerce.number().int().positive(),
  tags: z.array(z.string().trim().min(1)).max(10).default([]),
});

app.post("/products", async (request, reply) => {
  const input = createProductBody.parse(request.body);

  const product = {
    id: crypto.randomUUID(),
    ...input,
  };

  return reply.code(201).send(product);
});
~~~

This code has three separate jobs:

- z.object describes the JSON shape the API accepts.
- trim normalizes a name before business logic sees it.
- coerce converts a compatible external value into a number, then int and positive reject values that are not valid prices.

Try an intentionally confusing input:

~~~bash
curl -i -X POST http://localhost:3000/products \
  -H "content-type: application/json" \
  -d '{"name":"  Book  ","priceInPaise":"49900","tags":[]}'
~~~

Then try a negative price. Do not repair malformed data deep inside a repository; reject it before it becomes application state.

### Serialization rule

When returning data, construct the response shape deliberately. Never serialize a whole database row just because it is convenient. The row may later gain a password hash, internal flag, or private audit field.

## Read next

- [JSON — RFC 8259](https://www.rfc-editor.org/rfc/rfc8259)
- [Protocol Buffers documentation](https://protobuf.dev/)
- [JSON Schema](https://json-schema.org/)
- [OWASP: Deserialization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html)

## Public repositories worth studying

- [protocolbuffers/protobuf](https://github.com/protocolbuffers/protobuf)
- [serde-rs/json](https://github.com/serde-rs/json)
- [nlohmann/json](https://github.com/nlohmann/json)
- [msgpack/msgpack](https://github.com/msgpack/msgpack)
- [ajv-validator/ajv](https://github.com/ajv-validator/ajv) — JSON Schema validation in JavaScript.

## Build exercise

Define a `BookCreate` schema. Accept JSON, reject unknown/invalid fields, return a stable error format, and serialize the stored book back to a response DTO. Then write a second adapter that encodes the same structure as Protocol Buffers.
