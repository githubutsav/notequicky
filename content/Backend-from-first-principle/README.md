# Backend from First Principles — learning notes

Source playlist: [Backend from First Principles](https://www.youtube.com/playlist?list=PLui3EUkuMTPgZcV0QhQrOcwMPcBCcd_Q1) by Sriniously.

This folder contains two detailed files for every video, in the playlist's original order:

- **Video notes** teach the concepts and flow of the video in detail, using only its accessible English auto-generated captions. They do not fill gaps by guessing.
- **Study guides** are deliberately separate production-engineering chapters: design choices, implementation patterns, failure modes, operational checks, tests, official documentation, and public repositories. They are additional guidance, not claims about what the video said.

All 23 videos had an accessible English auto-generated caption track when these notes were prepared. Auto-generated captions can contain recognition errors; use the linked video when exact wording matters.

## Hands-on learning path

The study guides use a shared [TypeScript/Node.js practice lab](PRACTICE-LAB.md) and a deeper [full-stack practice lab](FULL-STACK-PRACTICE-LAB.md) for React, Next.js, API, database, infrastructure, testing, and deployment context. Each guide shows what to build, code to add, why it works, a failure case to trigger, and the production concerns to learn next. The code is added teaching material and remains separate from transcript-grounded video claims.

| # | Video | Transcript-grounded notes | Added study guide |
| --- | --- | --- | --- |
| 1 | Roadmap for backend from first principles | [notes](video-notes/01-roadmap-for-backend-from-first-principles-video-notes.md) | [guide](study-guides/01-roadmap-for-backend-from-first-principles-study-guide.md) |
| 2 | Walk the path of a true backend engineer | [notes](video-notes/02-walk-the-path-of-a-true-backend-engineer-video-notes.md) | [guide](study-guides/02-walk-the-path-of-a-true-backend-engineer-study-guide.md) |
| 3 | What is a Backend, how do they work and why do we need them? | [notes](video-notes/03-what-is-a-backend-how-do-they-work-and-why-do-we-need-them-video-notes.md) | [guide](study-guides/03-what-is-a-backend-how-do-they-work-and-why-do-we-need-them-study-guide.md) |
| 4 | Benefits of learning backend engineering from first principles | [notes](video-notes/04-benefits-of-learning-backend-engineering-from-first-principles-video-notes.md) | [guide](study-guides/04-benefits-of-learning-backend-engineering-from-first-principles-study-guide.md) |
| 5 | Understanding HTTP for backend engineers, where it all starts | [notes](video-notes/05-understanding-http-for-backend-engineers-where-it-all-starts-video-notes.md) | [guide](study-guides/05-understanding-http-for-backend-engineers-where-it-all-starts-study-guide.md) |
| 6 | What is Routing in Backend? How Requests Find Their Way Home | [notes](video-notes/06-what-is-routing-in-backend-how-requests-find-their-way-home-video-notes.md) | [guide](study-guides/06-what-is-routing-in-backend-how-requests-find-their-way-home-study-guide.md) |
| 7 | Serialization and Deserialization for backend engineers | [notes](video-notes/07-serialization-and-deserialization-for-backend-engineers-video-notes.md) | [guide](study-guides/07-serialization-and-deserialization-for-backend-engineers-study-guide.md) |
| 8 | Authentication and authorization for backend engineers | [notes](video-notes/08-authentication-and-authorization-for-backend-engineers-video-notes.md) | [guide](study-guides/08-authentication-and-authorization-for-backend-engineers-study-guide.md) |
| 9 | Validations and transformations for backend engineers | [notes](video-notes/09-validations-and-transformations-for-backend-engineers-video-notes.md) | [guide](study-guides/09-validations-and-transformations-for-backend-engineers-study-guide.md) |
| 10 | What are controllers, services, repositories, middlewares and request context? | [notes](video-notes/10-what-are-controllers-services-repositories-middlewares-and-request-context-video-notes.md) | [guide](study-guides/10-what-are-controllers-services-repositories-middlewares-and-request-context-study-guide.md) |
| 11 | Complete REST API Design | [notes](video-notes/11-complete-rest-api-design-video-notes.md) | [guide](study-guides/11-complete-rest-api-design-study-guide.md) |
| 12 | Mastering Databases with Postgres | [notes](video-notes/12-mastering-databases-with-postgres-video-notes.md) | [guide](study-guides/12-mastering-databases-with-postgres-study-guide.md) |
| 13 | Caching, the secret behind it all | [notes](video-notes/13-caching-the-secret-behind-it-all-video-notes.md) | [guide](study-guides/13-caching-the-secret-behind-it-all-study-guide.md) |
| 14 | Task queues and background jobs | [notes](video-notes/14-task-queues-and-background-jobs-video-notes.md) | [guide](study-guides/14-task-queues-and-background-jobs-study-guide.md) |
| 15 | Full text search using Elasticsearch for blazingly fast search | [notes](video-notes/15-full-text-search-using-elasticsearch-for-blazingly-fast-search-video-notes.md) | [guide](study-guides/15-full-text-search-using-elasticsearch-for-blazingly-fast-search-study-guide.md) |
| 16 | Error Handling and Building Fault Tolerant Systems | [notes](video-notes/16-error-handling-and-building-fault-tolerant-systems-video-notes.md) | [guide](study-guides/16-error-handling-and-building-fault-tolerant-systems-study-guide.md) |
| 17 | Production-grade Configuration Management | [notes](video-notes/17-production-grade-configuration-management-video-notes.md) | [guide](study-guides/17-production-grade-configuration-management-study-guide.md) |
| 18 | Logging, Monitoring and Observability | [notes](video-notes/18-logging-monitoring-and-observability-video-notes.md) | [guide](study-guides/18-logging-monitoring-and-observability-study-guide.md) |
| 19 | Graceful Shutdown | [notes](video-notes/19-graceful-shutdown-video-notes.md) | [guide](study-guides/19-graceful-shutdown-study-guide.md) |
| 20 | Backend Security: Everything You Need to Know | [notes](video-notes/20-backend-security-everything-you-need-to-know-video-notes.md) | [guide](study-guides/20-backend-security-everything-you-need-to-know-study-guide.md) |
| 21.1 | Backend Scaling and Performance Engineering: Part-1 | [notes](video-notes/21-1-backend-scaling-and-performance-engineering-part-1-video-notes.md) | [guide](study-guides/21-1-backend-scaling-and-performance-engineering-part-1-study-guide.md) |
| 21.2 | Backend Scaling and Performance Engineering: Part-2 | [notes](video-notes/21-2-backend-scaling-and-performance-engineering-part-2-video-notes.md) | [guide](study-guides/21-2-backend-scaling-and-performance-engineering-part-2-study-guide.md) |
| 22 | Concurrency & Parallelism: IO Bound vs CPU Bound | [notes](video-notes/22-concurrency-and-parallelism-io-bound-vs-cpu-bound-video-notes.md) | [guide](study-guides/22-concurrency-and-parallelism-io-bound-vs-cpu-bound-study-guide.md) |

## Suggested use

Watch a video, read its video notes to learn the video’s teaching step by step, then work through the production guide and its exercise before moving on. The most valuable loop is: **watch → explain it from memory → build a tiny version → test its failure cases**.
