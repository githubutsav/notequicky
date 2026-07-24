# Backend Practice Lab — TypeScript and Node.js

> This is a shared hands-on path for the study guides. It is added teaching material, not a claim about any one video.

The guides now use a small TypeScript/Node.js service as the common learning project. You will keep one project and improve it as you move through the playlist instead of reading isolated snippets.

## 1. Create the project

~~~bash
mkdir backend-practice-lab
cd backend-practice-lab
npm init -y
npm install fastify zod
npm install --save-dev typescript tsx @types/node
npx tsc --init
~~~

Why these packages:

- Fastify provides the HTTP server and routing used by the examples.
- Zod validates external input at the API boundary.
- TypeScript catches many shape mistakes before the program runs.
- tsx runs TypeScript during learning without a separate compile step.

Add these scripts to package.json:

~~~json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "tsx src/server.ts",
    "typecheck": "tsc --noEmit"
  }
}
~~~

## 2. Use this starting server

Create src/server.ts:

~~~ts
import Fastify from "fastify";

export const app = Fastify({
  logger: true,
});

app.get("/health", async () => {
  return {
    ok: true,
  };
});

async function start() {
  try {
    await app.listen({
      host: "0.0.0.0",
      port: 3000,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
~~~

Run it:

~~~bash
npm run dev
curl http://localhost:3000/health
~~~

You should receive:

~~~json
{
  "ok": true
}
~~~

## 3. Understand every part

- Fastify creates one application object. Routes, hooks, logging, and shutdown all belong to it.
- app.get registers a handler for an HTTP GET request.
- The handler returns a JavaScript object; Fastify serializes it as JSON.
- host 0.0.0.0 allows the server to receive container/dev-environment traffic. For a local-only experiment, localhost is also reasonable.
- The try/catch makes startup failure visible. A service that cannot bind its port should not pretend it is healthy.
- void start makes it explicit that the asynchronous startup function is intentionally launched.

## 4. Suggested project layout

~~~text
backend-practice-lab/
  src/
    server.ts             creates the HTTP application
    routes/               maps HTTP requests to controllers
    controllers/          translates request/response concerns
    services/             business rules and use cases
    repositories/         database/cache access
    plugins/              validation, auth, error handling
  tests/
  package.json
  .env.example            names required variables, never real secrets
~~~

Do not create every folder on day one. Add a folder when the corresponding lesson needs it. The point is to learn responsibility boundaries, not to copy a “clean architecture” template.

## 5. Your repetition loop

For every study guide:

1. Read the video note first.
2. Copy the guide’s code into this lab.
3. Run the smallest happy-path request.
4. Trigger the failure case named in the guide.
5. Write one test before moving on.
6. Only then read the production section and explain the trade-off in your own words.

## 6. Important safety rules

- Never commit .env files or real credentials.
- Use a separate local/test database, not data you care about.
- Keep code examples small enough that you can type them and change them.
- A snippet is not automatically production-ready; the guide tells you what must change before a real deployment.
