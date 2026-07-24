# 15. Full text search using Elasticsearch for blazingly fast search

Video: [YouTube](https://www.youtube.com/watch?v=7_sovzAhRSM&list=PLui3EUkuMTPgZcV0QhQrOcwMPcBCcd_Q1&index=15)

> Caption basis: English auto-generated captions. This note summarizes only what the captions support.

## What this video teaches

The video explains why a plain relational-database text scan is a poor fit for large-scale, relevance-ranked search. It introduces inverted indexes and relevance scoring as the main ideas behind an Elasticsearch-style full-text search experience.

## Key lessons from the video

- Scanning every document for every query becomes expensive as the corpus grows and does not naturally rank the most useful result first.
- An inverted index maps terms to documents/positions so the search system can find candidate documents without scanning all text at query time.
- Relevance scoring can favor properties such as a match in the title and more frequent occurrences.
- Full-text search systems can support type-ahead and tolerate likely spelling mistakes/fuzzy queries.
- The practical demo compares a database search with Elasticsearch-style search and emphasizes search speed at larger result counts.
- Search is a separate capability to design and maintain; indexed data must be populated and kept aligned with source data.

## Timestamp map

- **00:00** — Limits of a database-like text scan.
- **05:00** — Relevance as a separate search problem.
- **10:00** — Inverted-index concept.
- **15:00** — Relevance scoring.
- **20:00** — Type-ahead and typo tolerance.
- **25:00** — Data loading/indexing demonstration.
- **30:00** — Search timing comparison and conclusion.

## Check yourself

What is your source of truth, what fields are indexed for search, and how will an update/delete reach the search index without exposing stale results indefinitely?

## Detailed teaching notes from the video

### Why ordinary database lookup is not enough for text search

The video begins with the gap between retrieving a record and searching language. A database can filter rows, but a product-style search experience needs to find documents containing terms, rank the most useful result higher, and respond quickly as the corpus grows. Scanning a large body of text at query time is a poor fit for that job.

The lesson uses full-text search to distinguish “does this field exactly equal this value?” from “which documents best match what the user typed?” The second question needs an index designed around words and their relationship to documents.

### The inverted-index mental model

Elasticsearch is explained through an inverted index. Instead of storing only a document and then scanning every document for a term, the index records which documents contain particular terms. The video also describes retaining enough information about term placement to support search behavior. When a user searches, the system can move from terms to candidate documents rather than from every document to a term scan.

~~~text
document-oriented storage: document -> its text
inverted index: term -> documents that contain the term
~~~

That reversal is why a search engine can narrow the candidate set before ranking it.

### Relevance is part of the answer

The video emphasizes relevance scoring. A search endpoint should not merely return every matching document in arbitrary order. A term that appears in a title or appears more meaningfully in a document can contribute to a higher score. Search is therefore a ranking problem as well as a lookup problem.

It also covers features people expect in an application search box: type-ahead behavior and tolerance for typos or near matches. Those features make the input more forgiving, but they also make the query and index design more deliberate than a basic database predicate.

### Indexing is a separate data flow

The lesson demonstrates loading/indexing data and comparing search behavior. That brings out a key boundary: the search index is built from application data; it is not automatically the same thing as the authoritative database. A backend needs a process that puts documents into the index and keeps them aligned as records are created, updated, or deleted.

The video also uses timing comparison to illustrate why the index exists. The useful comparison is not “Elasticsearch is always faster” but “a search-oriented index makes a different class of query practical.” The query shape, corpus, mappings, and relevance requirements decide whether it is the right tool.

### A search response is a product decision

The overall teaching is that search must serve the user’s intent: retrieve plausible documents, rank them, tolerate normal typing behavior, and do so through a maintained index. The database record remains important, while the search engine provides a specialized read model for discovery.
