# Study guide — 9. Validations and transformations for backend engineers

> This is added guidance, not a claim about the video's contents.

## A request-boundary pattern

1. Parse the wire format.
2. Transform only predictable representations, such as a numeric query string.
3. Validate shape, type, range, cross-field rules, and authorization-related invariants.
4. Create a trusted input object for the service layer.
5. Return a consistent error schema without leaking implementation details.

Never use transformations to silently “repair” ambiguous or dangerous input. Reject what you cannot interpret safely.

## Production validation architecture

### Keep three forms separate

| Form | Example | Who owns it |
| --- | --- | --- |
| Wire representation | query page supplied as a string | HTTP boundary |
| Validated command | a typed page and limit | controller/input layer |
| Domain decision | caller may view this organization | service/domain layer |

This prevents “validation” from becoming a giant untestable middleware. Schema validation protects parsing/type/range rules; the domain/service protects stateful business rules and authorization.

### Ordering matters

1. Enforce body size and content type.
2. Parse safely.
3. Perform only deterministic, documented transformations.
4. Validate type, shape, range, and format.
5. Authenticate and authorize.
6. Run database-dependent business rules inside the correct consistency boundary.

Do not query the database for a request that is malformed enough to reject at step 4. It wastes capacity and can reveal timing information.

### Design a stable error shape

Return one machine-readable structure for invalid requests. Include a stable error code and field path; include a human message that does not expose internals. Separate validation errors from authentication/authorization and unexpected server failures. This lets clients render errors correctly without string-matching messages.

### Production test cases

- missing field, null, empty string, wrong type, and overly large value;
- invalid JSON and unsupported content type;
- field-combination and conditional rules;
- values that pass format validation but fail a business invariant;
- direct API calls that bypass the frontend;
- unknown-field or mass-assignment attempts;
- international input, Unicode, whitespace, and timezone edge cases where relevant.

### Observability

Measure validation failures by endpoint/rule without logging entire sensitive payloads. A sudden spike often reveals a broken client release, an abusive integration, or a contract mismatch.

## Learn by building: return useful validation errors

Validation should tell a client what it can fix without exposing internal implementation details. Add one global Zod error mapper:

~~~ts
import { ZodError } from "zod";

app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.code(400).send({
      code: "VALIDATION_FAILED",
      message: "The request is invalid.",
      fields: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
      requestId: request.id,
    });
  }

  request.log.error(error);
  return reply.code(500).send({
    code: "INTERNAL_ERROR",
    message: "Unexpected server error.",
    requestId: request.id,
  });
});
~~~

Use the product schema from guide 7 and send an invalid request. You should now receive a stable error code and a list of safe field problems.

Why this matters:

- Controllers stay focused on the successful use case.
- Every invalid payload receives one predictable response shape.
- The client gets actionable information.
- The server logs the unknown failure without returning its stack trace or database details.

### Transformation rule

Transform only when the change has a documented meaning. Trimming a user-visible name is usually reasonable. Quietly converting a missing price to zero is not: it destroys the distinction between absent, invalid, and free.

## Read next

- [JSON Schema](https://json-schema.org/)
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457)

## Public repositories worth studying

- [ajv-validator/ajv](https://github.com/ajv-validator/ajv) — JSON Schema validation.
- [colinhacks/zod](https://github.com/colinhacks/zod) — schema validation for TypeScript.
- [pydantic/pydantic](https://github.com/pydantic/pydantic) — typed data validation for Python.
- [validatorjs/validator.js](https://github.com/validatorjs/validator.js) — string validation and sanitization helpers.
- [typestack/class-validator](https://github.com/typestack/class-validator) — decorator-based validation.

## Build exercise

Create `POST /users` with a schema that checks email format, password length, confirmation equality, and an optional age range. Add tests for malformed JSON, wrong type, impossible values, and a valid payload.
