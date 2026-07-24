# Study guide — 17. Production-grade Configuration Management

> This is added guidance, not a claim about the video's contents.

## A configuration contract

Create one schema that declares every setting's name, type, required/optional status, default, sensitivity, source, and restart behavior. Validate it at process start and log only non-sensitive configuration metadata.

Keep secrets out of source control and ordinary logs. Rotate them, scope access narrowly, and prefer references to a secret manager over long-lived values in deployment files.

## Learn by building: fail before the server accepts traffic

Create src/config.ts and parse configuration once:

~~~ts
import { z } from "zod";

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export const config = configSchema.parse(process.env);
~~~

Use config.PORT at startup rather than reading process.env in every module:

~~~ts
await app.listen({
  host: "0.0.0.0",
  port: config.PORT,
});
~~~

Create .env.example, not .env:

~~~text
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/practice
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
~~~

The example file documents keys but contains no real credential. Run the app once without DATABASE_URL. It should fail immediately with a clear configuration error, before it claims to be ready.

## Read next

- [The Twelve-Factor App: Config](https://12factor.net/config)
- [Kubernetes ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/)
- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [HashiCorp Vault documentation](https://developer.hashicorp.com/vault/docs)
- [AWS Secrets Manager guide](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)

## Public repositories worth studying

- [hashicorp/vault](https://github.com/hashicorp/vault)
- [kubernetes/kubernetes](https://github.com/kubernetes/kubernetes)
- [external-secrets/external-secrets](https://github.com/external-secrets/external-secrets)
- [dotenvx/dotenvx](https://github.com/dotenvx/dotenvx)
- [1Password/connect](https://github.com/1Password/connect)

## Build exercise

Define a typed configuration schema for an API. Include database URL, log level, port, allowed origin, queue URL, and a required secret. Add startup tests for a missing value, invalid port, and production-only safety constraint.

## Production configuration engineering

### Make configuration typed, owned, and fail-fast

Build one configuration module that reads raw environment/provider values once, parses them into a typed immutable object, and validates cross-field rules before the server binds a port. Every other module receives that object rather than reading process environment ad hoc. This prevents one library silently using a default while another fails later with a different interpretation.

Classify each setting:

- public operational setting: port, region, log level, feature mode;
- sensitive setting: password, private key, access token;
- deployment identity: environment, service name, version, commit;
- capacity setting: timeouts, pool sizes, worker concurrency; and
- unsafe escape hatch: debug endpoint, test credentials, permissive CORS.

For every item, document owner, source, allowed format, default policy, rotation procedure, and whether it is safe to include in a diagnostic report. Most production secrets should have no application-code default.

### Validate relationships, not only individual strings

Parsing a port as a number is necessary but insufficient. Production validation should also reject a development database host in a production environment, a zero retry timeout, insecure TLS mode outside an explicitly approved test context, and a missing secret when a feature requiring it is enabled. Give errors the configuration key name and validation rule, never the secret value.

Failing at startup is a feature. It converts a hidden runtime incident into a visible deployment failure that can be corrected before traffic is routed to the instance.

### Separate delivery from application behavior

Your deployment platform should inject values at runtime from a secret manager or controlled configuration store. Do not commit live environment files, embed values in container images, or fetch a secret every time a request is served. On startup, the service should obtain the configuration it needs, validate it, and then expose only a redacted configuration fingerprint such as environment, region, and a schema version.

Decide intentionally whether a setting can change at runtime. Reloadable settings such as a log level need an atomic update and an audit trail. Connection credentials may require a rotation procedure that creates new pools before retiring old ones. Static settings such as a port should normally require a new instance.

### Test and operate configuration like code

Have a test matrix for the schema: valid local values, valid production values, absent required secret, malformed URL, mutually incompatible flags, and a prohibited development-only option. In deployment, record the non-sensitive configuration version or checksum with every release so an incident can be correlated with a change without exposing values.

Review who can read and change secrets, set rotation reminders, and rehearse a revoked-key response. Production configuration is an access-control system as much as it is a convenience mechanism.
