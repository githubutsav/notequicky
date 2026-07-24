# Browser Developer Tools for Full-Stack Applications

Browser DevTools let you inspect the page the user actually receives: rendered HTML/CSS, JavaScript errors, network requests, cookies/storage, accessibility, performance, and security. This guide uses Chrome DevTools names; Firefox and Edge provide equivalent tools.

```text
Frontend bug?  Elements, Console, Sources
API bug?       Network
Login bug?     Network + Application/Storage + Security
Slow UI?       Performance + Memory + Lighthouse
Production?    Console + Network + safe logs/trace IDs + server observability
```

## 1. Open and Use DevTools Safely

| Action | macOS | Windows/Linux |
| --- | --- | --- |
| Open/toggle DevTools | `⌥⌘I` | `Ctrl+Shift+I` |
| Open Console | `⌥⌘J` | `Ctrl+Shift+J` |
| Inspect selected element | `⌥⌘C` | `Ctrl+Shift+C` |
| Command menu | `⇧⌘P` | `Ctrl+Shift+P` |

DevTools changes are local to your browser unless you send a request or save a workspace override. Editing HTML/CSS in Elements is excellent for experimenting but does not change source files. Never paste code into the Console unless you understand it; malicious pages can use “self-XSS” prompts to trick you into exposing data or running unsafe code.

Use a test account and a non-production environment for destructive actions. Network exports, screenshots, console output, browser storage, and performance traces can contain tokens, cookies, personal data, response bodies, or source maps—redact them before sharing.

## 2. A Full-Stack Debugging Workflow

When a feature fails, trace one request end to end instead of guessing.

```text
1. Reproduce the user action with DevTools open.
2. Console: identify browser errors, warnings, and the failing source line.
3. Network: find the request; inspect URL, method, status, headers, payload, response, timing, cookies, and initiator.
4. Frontend: inspect the rendered DOM/state and breakpoint the event or API call.
5. Backend: search structured logs by request ID; inspect validation, authentication, authorization, database query, and dependency calls.
6. Fix the smallest responsible layer; add a test; reproduce again with cache/network conditions controlled.
```

Status codes narrow the search quickly:

```text
2xx  Request succeeded; inspect returned data and frontend rendering.
3xx  Redirect; inspect target URL, session flow, and redirect loop.
400  Client input is invalid; compare payload with API contract/Zod schema.
401  Authentication missing, expired, or invalid.
403  Identity is valid but lacks permission; inspect authorization/ownership.
404  Wrong route/resource or intentionally hidden resource.
409  Conflict; inspect optimistic concurrency, uniqueness, or current state.
422  Well-formed request but business validation failed.
429  Rate limited; inspect retry guidance and limit configuration.
5xx  Server/dependency failure; correlate request ID with backend logs/traces.
```

## 3. Elements: HTML, CSS, Layout, and Accessibility

Use **Elements** to inspect the live DOM and applied styles.

```text
Inspect element     Select the visible element and its DOM node.
Styles              See matching CSS rules, overridden declarations, and pseudo-states.
Computed            See final values after cascade/inheritance.
Layout              Inspect Flexbox/Grid overlays and spacing.
Accessibility       Check role, accessible name, state, and keyboard focus.
```

Useful tasks:

- Toggle `:hover`, `:focus`, `:focus-visible`, and `:disabled` to inspect states.
- Edit a CSS property temporarily to prove the cause of a layout issue.
- Check whether a hidden element is `display: none`, off-screen, transparent, covered, or conditionally absent.
- Inspect the computed `box-sizing`, width, margin, padding, `z-index`, and parent layout before changing CSS.
- Verify a form control has a visible label and accessible name.

For frontend bugs, inspect the runtime DOM rather than assuming the source JSX/template produced the expected markup. Browser extensions, hydration, server rendering, feature flags, and JavaScript can all affect what users see.

## 4. Console: Errors and Safe Investigation

The **Console** shows runtime errors, warnings, network errors, and explicit logs.

```js
// Read-only inspection helpers
document.querySelector("#todo-form");
document.querySelectorAll("button[data-todo-id]");
localStorage.getItem("theme");
performance.getEntriesByType("resource");
```

Use breakpoints and structured logs before adding many `console.log` calls. If you add logs, include a meaningful event and safe context:

```js
console.info("todo:create:submitted", { titleLength: title.length });
console.error("todo:create:failed", { requestId, status });
```

Do not log passwords, access tokens, cookie values, complete API bodies, payment data, or database connection strings. Remove temporary debugging logs before merging, or replace them with an approved structured server logger.

## 5. Sources: Breakpoints and JavaScript Debugging

Use **Sources** to pause code at the moment an incorrect state is created.

```text
Line breakpoint        Pause before a line runs.
Conditional breakpoint Pause only when a condition is true, such as todo.id === "42".
Logpoint               Log without editing source or pausing execution.
Event listener breakpoint Pause when click, submit, storage, timer, or other event fires.
Exception breakpoint   Pause when an error is thrown, including caught exceptions if needed.
XHR/fetch breakpoint   Pause when a request URL matches a string.
```

When paused, inspect local variables, call stack, scope, async stack, and network request initiator. Step over to run one line, step into only when the called function is relevant, and step out when you entered too deeply.

Source maps map production bundles back to original TypeScript/source files. Enable and protect them deliberately: they improve production debugging, but traces or source-map files can reveal implementation details. Do not place secrets in any client-side source file—minification and hidden source maps are not security controls.

## 6. Network: Debug APIs, Cookies, CORS, and Caching

The **Network** panel is the most valuable full-stack panel. Open it before reproducing a request. Turn on **Preserve log** for redirects/login flows and **Disable cache** while DevTools is open when testing a first-visit experience.

For a selected request, inspect:

```text
Headers     URL, method, status, request/response headers, CORS, cache directives.
Payload     Query string, JSON body, form data; compare with validation schema/API contract.
Response    Returned data or error document; treat it as sensitive when sharing.
Initiator   Script/source location that started the request.
Timing      Queueing, DNS, connection, TTFB, download; identifies where time is spent.
Cookies     Sent/received cookies, attributes, and reasons a cookie was blocked.
```

### API Checklist

```text
1. Is the URL, HTTP method, and request body correct?
2. Is the correct environment/base URL being used?
3. Is the Authorization header or session cookie present when expected?
4. Is content type correct, usually application/json for JSON APIs?
5. Does the response status match the server logs for the same request ID?
6. Is the frontend handling success, validation error, unauthenticated, forbidden, loading, and network-failure states?
```

### CORS and Cookies

CORS is enforced by browsers and controls which origins may read a response. It is not authentication or authorization. If a request fails with a CORS message, inspect both the request origin and the server's response headers; do not “fix” it with `Access-Control-Allow-Origin: *` when credentials are involved.

For cookie sessions, inspect `Secure`, `HttpOnly`, `SameSite`, `Domain`, `Path`, expiration, and whether the browser reports a blocked cookie. `HttpOnly` cookies intentionally cannot be read with JavaScript. A successful login response does not prove the browser stored or later sent the cookie.

### Copy and Replay Carefully

Network tools can copy a request as `fetch`/cURL and replay XHR requests. This is useful for reproducing a bug, but copied commands may include active cookies, bearer tokens, or personal data. Redact credentials before saving, posting, or sharing. Never replay an irreversible production request merely to test it.

## 7. Application: Storage, Service Workers, and Offline State

The **Application** panel exposes browser-managed state.

```text
Local Storage / Session Storage  Key-value strings; never store secrets casually.
Cookies                          Session/auth data; inspect attributes and expiry.
IndexedDB                        Larger structured client-side data.
Cache Storage                    Cached HTTP-like responses, often used by PWAs.
Service Workers                  Scripts that intercept requests and support offline behavior.
Manifest                         Installable web-app metadata.
```

Use this panel to answer: “Is the wrong data stored?”, “Is an old service worker serving stale assets?”, “Did logout clear the session?”, and “Does offline mode show a safe fallback?” Clear site data only in a controlled test account because it signs you out and may delete local work.

## 8. Device, Network, and Rendering Simulation

Test the conditions users actually have.

```text
Device toolbar       Emulate viewport size, device pixel ratio, touch, and orientation.
Network throttling   Test slow 4G/3G or offline behavior.
CPU throttling       Approximate slower hardware while profiling interactions.
Disable cache        Approximate first visit while DevTools remains open.
Rendering tools      Emulate reduced motion, color vision deficiencies, print CSS, and dark/light preference.
```

Simulation is a diagnostic aid, not a replacement for testing on real phones, real networks, and real assistive technology. Use it to find obvious failures early, then validate important flows on representative devices.

## 9. Performance, Memory, and Lighthouse

Use **Performance** to record a slow interaction or rendering path. Look for long JavaScript tasks, repeated style/layout work, expensive event handlers, large images, and unnecessary network/render blocking.

```text
LCP  Largest Contentful Paint: when main visible content appears.
CLS  Cumulative Layout Shift: unexpected visual movement.
INP  Interaction to Next Paint: responsiveness after user interaction.
```

Workflow:

```text
1. Reproduce the slow flow with a clean profile and realistic CPU/network throttling.
2. Record a short trace; identify the long task or delayed resource.
3. Use the call tree/flame chart and Network initiator to find the responsible code.
4. Make a measured change, then record again under the same conditions.
```

Use **Memory** when a long-lived page becomes slower over time. Take heap snapshots before and after a repeatable action; look for objects/listeners that should have been released but remain reachable. Remove unneeded listeners, timers, subscriptions, caches, and detached DOM references.

Run **Lighthouse** for a broad development audit of performance, accessibility, best practices, and SEO. Treat it as a starting hypothesis, not a production guarantee; confirm findings with real-user monitoring and product-specific tests.

## 10. Security and Privacy Checks

Use DevTools to verify—not replace—server security controls.

```text
Security panel       HTTPS/certificate information and insecure-resource warnings.
Network headers      CSP, HSTS, cache controls, cookies, CORS, content type.
Application          Browser storage and service-worker/cache behavior.
Issues panel         Browser-detected cookie, mixed-content, CORS, and other problems.
```

Check that production pages load only over HTTPS, user/API text is rendered safely, tokens are not in URLs/logs, browser storage contains only intentional data, and cache headers do not expose private responses to shared caches. The browser cannot prove the server performed authorization, input validation, database access controls, or rate limiting—test and monitor those server-side.

## 11. Production Incident Workflow

Production debugging needs evidence without exposing customer data.

```text
1. Capture time, route, anonymized user/session context, browser/version, and request ID.
2. Reproduce safely in staging or with a test account where possible.
3. Use Network to identify the failing request and exact status/timing.
4. Correlate the request ID with Pino/server logs, traces, error reporting, and database/dependency metrics.
5. Mitigate: rollback, disable a feature flag, correct configuration, or deploy the smallest safe fix.
6. Add regression test, alert, dashboard, runbook note, and post-incident follow-up.
```

Do not ask customers to send raw HAR files, full console logs, browser storage exports, or screenshots containing sensitive data. Provide a redacted support procedure and obtain only the minimum information needed.

## 12. Practice Tasks

```text
1. Break a CSS layout, then fix it using Elements → Computed → Layout.
2. Submit an invalid form; inspect payload, 400 response, and frontend error state.
3. Create an intentional 401/403 scenario; distinguish authentication from authorization in Network.
4. Enable slow 4G and offline mode; verify loading, retry, error, and cached/offline UI states.
5. Add a breakpoint to a submit handler and trace it through fetch to a server log request ID.
6. Record a slow list render; identify a long task, improve it, and compare traces.
7. Inspect a test login cookie’s attributes and confirm logout clears the intended browser state.
```

## Resources

- [Chrome DevTools overview](https://developer.chrome.com/docs/devtools): panel reference and current capabilities.
- [Chrome Network panel guide](https://developer.chrome.com/docs/devtools/network/overview): requests, filtering, throttling, cache, and export.
- [Chrome Performance guide](https://developer.chrome.com/docs/devtools/performance): runtime profiling and Core Web Vitals.
- [MDN browser developer tools](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/What_are_browser_developer_tools): browser-independent DevTools introduction.
- [Web Basics Notes](web-basics.md): HTML, CSS, DOM, events, and safe rendering fundamentals.
- [JavaScript Learning Notes](javascript.md): async behavior, fetch, browser storage, memory, and performance.
- [Full-Stack Libraries Notes](libraries.md): Zod, HTTP clients, logging, security boundaries, and production integration.
