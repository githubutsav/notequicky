# 7. Serialization and Deserialization for backend engineers

Video: [YouTube](https://www.youtube.com/watch?v=vzg90tY3uM0&list=PLui3EUkuMTPgZcV0QhQrOcwMPcBCcd_Q1&index=7)

> Caption basis: English auto-generated captions. This note summarizes only what the captions support.

## What this video teaches

Serialization and deserialization are presented as converting data to and from a shared format, so clients and servers written in different languages or running in different environments can exchange meaningful data.

## Key lessons from the video

- A JavaScript client and a server written in another language need a common, language-agnostic representation at the application boundary.
- Serialization turns an application's native data into that shared representation; deserialization parses the received representation into native structures.
- The video distinguishes text formats (JSON, YAML, XML) from binary formats, and names Protocol Buffers as a popular binary option.
- It focuses on JSON for common HTTP/REST communication because it is human-readable and widely used.
- JSON object keys are strings in double quotes; values may be strings, numbers, booleans, arrays, or nested objects.
- Network layers may transform data on the wire, but the backend engineer's application-level concern is correctly producing and parsing the agreed format.

## Detailed teaching notes from the video

### The problem: two programs do not share native memory or types

The video starts with a JavaScript client and a server that could be written in Rust. A JavaScript object cannot cross the internet and become a Rust struct by itself. The programs have different runtime representations, type rules, memory layouts, and locations. They need a shared representation at the application boundary.

Serialization converts a native value into that agreed representation before transport or storage. Deserialization parses the representation back into a native value after receipt. The important idea is the agreement, not the specific language.

```text
JavaScript object
  → serialize to agreed format
  → network transport
  → deserialize into server-native structure
  → business logic
  → serialize response
  → client deserializes response
```

### Serialization standards create interoperability

The video calls the shared representation a common standard. This is why a browser, a mobile application, a Go service, and a Python worker can cooperate: each agrees on how to encode and decode the fields. The operating system and network layers do further work beneath the application layer, but a backend engineer must ensure that the application-layer contract is understood at both ends.

### Text and binary formats make different trade-offs

The lesson introduces text-based formats such as JSON, YAML, and XML, plus binary formats such as Protocol Buffers. It focuses on JSON because it is common in HTTP/REST work and easy for humans to inspect.

Text formats make debugging and ad-hoc interoperability convenient. Binary formats can carry stronger schema/tooling and more compact encoding, but need compatible tooling and are less inspectable by eye. The video does not argue that one format wins everywhere; it teaches why the choice exists.

### JSON is a precise format, not “JavaScript with braces”

JSON looks similar to a JavaScript object, but the video points out its concrete rules: object keys are strings in double quotes; values can be strings, numbers, booleans, arrays, or nested objects. That precision matters because a payload that looks plausible to a developer may still be invalid JSON or violate an API contract.

In the request/response demonstration, a client sends a JSON book payload, the server parses it, performs work, and returns a JSON result. JSON is the exchange format—not automatically a database row, a trusted domain object, or permission to execute business logic.

### Deserialization is a trust boundary

The video does not turn serialization into a large algorithmic topic, but its position in the playlist is instructive: deserialized data is what later reaches validation, controllers, services, and repositories. Parse success only means the bytes formed a syntactically valid representation. The next step must still verify that the values are allowed and meaningful for the use case.

## Timestamp map

- **00:00** — The cross-language client/server problem.
- **03:00** — Why a common format is needed.
- **06:00** — Serialization/deserialization as conversion to and from a standard.
- **09:00** — Choosing common technologies for the course; JSON, text, and binary formats.
- **12:00** — JSON structure and data types.
- **15:00** — A request/response JSON demonstration.
- **18:00** — Application-layer mental model and summary.

## Check yourself

Can you explain why a JSON string is not automatically the same thing as a domain object, and where validation must happen after deserialization?

## Study prompt from this lesson

Write the same `CreateBook` contract in JSON and in a typed language model. List every difference: nullable fields, unknown fields, numeric range, timestamp format, default values, and the response fields that must never be accepted from the client.
