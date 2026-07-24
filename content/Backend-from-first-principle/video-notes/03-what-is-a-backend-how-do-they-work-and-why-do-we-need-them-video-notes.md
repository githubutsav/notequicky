# 3. What is a Backend, how do they work and why do we need them?

Video: [YouTube](https://www.youtube.com/watch?v=6Ss4dJD9Kzg&list=PLui3EUkuMTPgZcV0QhQrOcwMPcBCcd_Q1&index=3)

> Caption basis: English auto-generated captions. This note summarizes only what the captions support.

## What this video teaches

A backend is described as a server process that listens for requests and serves or accepts data. The video traces a concrete request from a browser through DNS, cloud networking, a firewall, a reverse proxy, and finally a local application process.

It also explains why browser code is not a substitute for backend code: browser runtimes are sandboxed, cross-origin constrained, unsuitable for direct database connection pooling, and run on devices with varying resources.

## Key lessons from the video

- A server can serve static content, JSON, or other data and can accept incoming data from clients.
- In the demonstration, a domain resolves through DNS to an EC2 public IP; allowed ports pass an AWS firewall; NGINX forwards traffic to a localhost Node process.
- A reverse proxy centralizes routing/configuration in front of application processes.
- The backend's central role is to receive, fetch, and persist data and coordinate actions such as notifications.
- Browser JavaScript is downloaded and executed on the client, while server-side logic runs on the server.
- Browser sandboxing, CORS restrictions, database-driver/connection-pooling needs, and uneven client resources are reasons to keep backend responsibilities server-side.

## Detailed teaching notes from the video

### A backend is a reachable process that serves work and data

The video begins with a deliberately concrete definition: a backend is a computer/process listening on a reachable port for HTTP, WebSocket, gRPC, or another kind of request. It can serve static files, HTML, JSON, or other content; it can also accept data from clients. “Server” describes its role in the interaction: it serves something to another machine.

That definition is intentionally lower-level than a framework. It still applies if the server is Node.js, Go, Rust, a reverse proxy, a serverless function, or a database protocol endpoint.

### Walk the request from the user's browser to application code

The demonstration follows a browser request through a real deployment-style chain:

```text
browser
  → domain name
  → DNS record resolves to public IP
  → cloud firewall/security group permits the relevant port
  → virtual machine / instance receives traffic
  → NGINX reverse proxy matches the hostname
  → NGINX forwards to localhost application port
  → Node process handles the request
```

Each hop has a different responsibility. DNS answers “where is this name?” The firewall answers “may this traffic reach the machine?” The proxy answers “which local application should receive this hostname/path?” The application answers the actual business question. If you confuse these responsibilities, debugging becomes much slower.

### Why the reverse proxy exists in the example

The video uses NGINX in front of a localhost application. The proxy lets deployment configuration live in one place: it can terminate or redirect HTTP/HTTPS traffic and forward the request to the correct local port. The application process does not need to be directly exposed to the public internet to serve the request.

This teaches an important production idea: the public URL and the internal application address are often different. A client may call `https://api.example.com`, while the app itself only listens at `http://127.0.0.1:3001`.

### Backend centralizes data and coordinates actions

The social “like” example is about more than storing one boolean. A like must identify the acting user, persist the action, find the affected owner, and trigger a notification. The client should not need access to every user's data or direct authority over the notification system. A backend provides a controlled, centralized place for that state and coordination.

### Why frontend code cannot simply become the backend

The video contrasts browser code with server code. A browser first fetches HTML, CSS, JavaScript, fonts, and images; the browser then executes JavaScript and attaches interactions locally. That environment is intentionally sandboxed because it executes remote code. It should not get arbitrary file-system access, secrets, unrestricted network access, or direct database credentials.

The video gives several practical consequences:

- Browsers obey cross-origin restrictions, so they cannot freely call any external service.
- Backend database drivers can manage socket connections, binary protocols, and connection pools; browsers are not designed to maintain direct database connections per end user.
- Client devices vary widely in CPU/memory and cannot be trusted to run sensitive or heavy business work.

The result is not “frontend is less important.” It is that frontend and backend have different execution environments and responsibilities.

## Timestamp map

- **00:00** — Backend definition and request/response overview.
- **02:00** — DNS records, public IPs, EC2, firewalls, ports, and NGINX.
- **06:00** — Request path reaches the localhost application process.
- **08:00** — Data and a social-app example of why a central backend is needed.
- **10:00** — How a frontend application is delivered and executed.
- **14:00** — Browser sandboxing and cross-origin constraints.
- **16:00** — Database drivers, connection pools, and client-resource limits.

## Check yourself

Draw the route for a request to `https://api.example.com/users`: DNS → firewall → proxy → application. Which component owns TLS, and which owns business logic in your design?

## Study prompt from this lesson

When an API request fails, classify the failure before changing code: name resolution, network/firewall, TLS/proxy, application process, route, validation, dependency, or database. This is the first habit that turns debugging from guessing into tracing a system.
