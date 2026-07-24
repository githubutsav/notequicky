# Study guide — 15. Full text search using Elasticsearch for blazingly fast search

> This is added guidance, not a claim about the video's contents.

## Start with the search contract

Define whether users need exact match, prefix/type-ahead, typo tolerance, synonyms, facets, ranking, filters, or pagination. Model the index around those behaviors instead of mirroring every database table blindly.

Plan index synchronization and failure handling before launch: an index is usually a derived view, not the only durable copy of business data.

## Learn by building: create a separate search projection

Install the official client:

~~~bash
npm install @elastic/elasticsearch
~~~

Create an index document from the product fields users should search:

~~~ts
import { Client } from "@elastic/elasticsearch";

const search = new Client({
  node: process.env.ELASTICSEARCH_URL,
});

export async function indexProduct(product: {
  id: string;
  name: string;
  description: string;
  tenantId: string;
}) {
  await search.index({
    index: "products-v1",
    id: product.id,
    document: product,
    refresh: false,
  });
}
~~~

Search with the tenant boundary as a filter, not an optional UI field:

~~~ts
const result = await search.search({
  index: "products-v1",
  query: {
    bool: {
      must: [
        { match: { name: userQuery } },
      ],
      filter: [
        { term: { tenantId: currentUser.tenantId } },
      ],
    },
  },
  size: 20,
});
~~~

The database stays authoritative. On every create, update, or delete, write a durable event and let a worker update the index. Do not make the HTTP write succeed only when Elasticsearch happens to be healthy.

### Failure experiment

Change a product name in PostgreSQL but delay indexing. Observe the old search result. This is index lag: make it visible in metrics and tell the product team what freshness guarantee the search UI can honestly make.

## Read next

- [Elasticsearch documentation](https://www.elastic.co/docs/reference/elasticsearch)
- [Apache Lucene documentation](https://lucene.apache.org/core/)
- [OpenSearch documentation](https://docs.opensearch.org/)
- [Elasticsearch relevance guide](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-filter-context)

## Public repositories worth studying

- [elastic/elasticsearch](https://github.com/elastic/elasticsearch)
- [apache/lucene](https://github.com/apache/lucene)
- [opensearch-project/OpenSearch](https://github.com/opensearch-project/OpenSearch)
- [meilisearch/meilisearch](https://github.com/meilisearch/meilisearch)
- [typesense/typesense](https://github.com/typesense/typesense)

## Build exercise

Index a small product catalog. Support a text query, a category filter, and a relevance-ranked result. Add an update path that changes a product name and verify the index reflects it; document what happens if indexing is delayed.

## Production search engineering

### Define search as a user-facing contract

Before creating an index, write examples of the searches users should succeed with. Include the query text, expected useful results, filters, tenant and authorization boundaries, sort behavior, empty-query behavior, and an acceptable freshness delay. A search service is not successful because it returns a response in milliseconds; it is successful because users can find the right thing without seeing records they must not access.

Separate full-text clauses from structured filters. Full-text matching answers “what words are relevant?” Filters answer “which results are allowed or belong to this category, tenant, locale, or lifecycle state?” Treat authorization filters as mandatory server-side constraints, never as a UI preference.

### Design a versioned document shape

Build a search document from a stable projection, for example product id, public name, normalized description, category ids, tenant id, searchable status, and an updated version. Do not blindly serialize a database row: it may expose private fields, create mappings that change accidentally, or make index documents much larger than queries need.

Choose text analysis deliberately. Normalization, tokenization, synonyms, stemming, and typo tolerance change the meaning of search. Maintain a small relevance test suite made from real but non-sensitive example queries. When an analyzer or field boost changes, run it against that suite before deployment.

### Keep the index synchronized without pretending it is a database

Use the primary database or owning service as the source of truth. Record a durable outbox event in the same transaction as a product change, then asynchronously index or delete the resulting search document. Make the consumer idempotent and include a record version so an old event cannot overwrite a newer index document.

For a mapping change, create a new versioned index, populate it, verify document counts and relevance tests, and switch a read alias to the new index. Keep the old index until rollback is no longer needed. Reindexing in place without a rollback route is a frequent operational surprise.

### Query and operate safely

Bound query length, page size, aggregation size, and timeouts. Avoid exposing arbitrary query-language features to untrusted callers. Use cursor-style pagination such as search-after for deep traversal rather than asking the cluster to retain or skip an ever-growing number of earlier hits. Log the query class and latency, but avoid recording raw sensitive search strings without a privacy policy.

Monitor indexing lag, failed indexing operations, document count drift, query latency by percentile, zero-result rate, and cluster health. A zero-result rate is often a relevance signal, not merely an error metric. Add a fallback or clear user-facing freshness expectation when index lag is possible.
