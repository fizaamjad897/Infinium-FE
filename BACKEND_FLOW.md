# Infinium Backend Technical Specification

This document provides a comprehensive, deep-dive technical specification for the Infinium backend. It is intended to be the **absolute source of truth** for generating the Entity Relationship Diagram (ERD).

## 1. Database Schema Specification

The system utilizes a relational database (PostgreSQL recommended) with `pgvector` extension for embeddings.

### 1.1. Identity & Access Management (IAM) Domain

#### `organizations`
*Top-level tenant entity.*
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK`, `DEFAULT gen_random_uuid()` | Unique identifier. |
| `name` | `VARCHAR(255)` | `NOT NULL` | Display name of the organization. |
| `slug` | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | URL-friendly identifier. |
| `domain_whitelist` | `VARCHAR[]` | | Array of allowed email domains for auto-join (e.g., `['@acme.com']`). |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |

#### `users`
*System users.*
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | Unique identifier. |
| `org_id` | `UUID` | `FK -> organizations.id` | The organization this user belongs to. |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | User email address. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Bcrypt/Argon2 hash. |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | |
| `role` | `ENUM` | `'ADMIN', 'MEMBER', 'VIEWER'` | RBAC role. |
| `avatar_url` | `VARCHAR(512)` | | Profile picture URL. |
| `is_email_verified` | `BOOLEAN` | `DEFAULT FALSE` | |
| `onboarding_status` | `JSONB` | `DEFAULT '{}'` | Tracks wizard progress: `{ "step": 2, "completed": false }`. |

#### `api_keys`
*Programmatic access.*
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | |
| `user_id` | `UUID` | `FK -> users.id` | Owner of the key. |
| `org_id` | `UUID` | `FK -> organizations.id` | Scoped organization. |
| `key_prefix` | `VARCHAR(8)` | `NOT NULL` | First 8 chars for display (e.g., `inf_prod_...`). |
| `key_hash` | `VARCHAR(256)` | `NOT NULL` | SHA-256 hash of the actual key. |
| `name` | `VARCHAR(100)` | | Friendly name (e.g., "CI Pipeline"). |
| `scopes` | `VARCHAR[]` | | Array of permissions: `['repo:read', 'query:write']`. |
| `last_used_at` | `TIMESTAMPTZ` | | |

---

### 1.2. Integration & Data Ingestion Domain

#### `data_sources`
*Configured connections to external tools.*
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | |
| `org_id` | `UUID` | `FK -> organizations.id` | |
| `type` | `ENUM` | `'GITHUB', 'GITLAB', 'JIRA', 'SLACK', 'CUSTOM_DOCS'` | Integration type. |
| `name` | `VARCHAR(100)` | `NOT NULL` | User-defined name (e.g., "Main Monorepo"). |
| `status` | `ENUM` | `'ACTIVE', 'SYNCING', 'ERROR', 'DISCONNECTED'` | Current health. |
| `config` | `JSONB` | `DEFAULT '{}'` | Source-specific config. E.g., `{ "base_url": "...", "rate_limit": 5000 }`. |
| `credentials` | `BYTEA` | `NOT NULL` | **Encrypted** OAuth tokens or API keys. |
| `last_synced_at` | `TIMESTAMPTZ` | | |
| `error_message` | `TEXT` | | Visible if status is ERROR. |

#### `sync_jobs`
*Audit log of ingestion activities.*
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | |
| `data_source_id` | `UUID` | `FK -> data_sources.id` | |
| `trigger` | `ENUM` | `'MANUAL', 'SCHEDULED', 'WEBHOOK'` | What started the sync. |
| `status` | `ENUM` | `'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'` | |
| `items_processed` | `INTEGER` | `DEFAULT 0` | Count of indexed items. |
| `started_at` | `TIMESTAMPTZ` | | |
| `completed_at` | `TIMESTAMPTZ` | | |
| `logs` | `JSONB` | | Array of detailed logs: `[{ "level": "info", "msg": "Fetched 50 commits" }]`. |

---

### 1.3. Knowledge Graph Engine (The "Brain")

#### `repositories`
*Codebase metadata.*
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | |
| `data_source_id` | `UUID` | `FK -> data_sources.id` | |
| `external_id` | `VARCHAR(255)` | `NOT NULL` | ID in the external system (e.g., GitHub Repo ID). |
| `name` | `VARCHAR(255)` | `NOT NULL` | e.g., `owner/repo-name`. |
| `default_branch` | `VARCHAR(100)` | `DEFAULT 'main'` | |
| `language` | `VARCHAR(50)` | | Primary language (TypeScript, Python, etc.). |
| `description` | `TEXT` | | Read from repo description. |

#### `commits`
*Version history.*
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | |
| `repository_id` | `UUID` | `FK -> repositories.id` | |
| `hash` | `VARCHAR(40)` | `NOT NULL` | Git SHA. |
| `author_name` | `VARCHAR(255)` | | |
| `author_email` | `VARCHAR(255)` | | |
| `message` | `TEXT` | | Commit message. |
| `committed_at` | `TIMESTAMPTZ` | `NOT NULL` | |
| `embedding` | `VECTOR(1536)` | | OpenAI/BERT embedding of the commit message + diff summary. |

#### `documents`
*Text-based knowledge artifacts (Issues, PRs, Wiki Pages).*
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | |
| `data_source_id` | `UUID` | `FK -> data_sources.id` | |
| `repository_id` | `UUID` | `FK -> repositories.id`, `NULLABLE` | If the doc belongs to a repo (e.g., README, ISSUE, PR). |
| `type` | `ENUM` | `'ISSUE', 'PR', 'WIKI', 'README', 'Slack_THREAD'` | |
| `external_id` | `VARCHAR(255)` | | ID in external system. |
| `title` | `TEXT` | `NOT NULL` | |
| `content` | `TEXT` | | Full raw text content. |
| `url` | `VARCHAR(512)` | | Link back to source. |
| `metadata` | `JSONB` | | Extra fields: `labels`, `assignees`, `status` (open/closed). |

#### `document_chunks`
*Vector search units derived from Documents.*
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | |
| `document_id` | `UUID` | `FK -> documents.id` | |
| `chunk_index` | `INTEGER` | `NOT NULL` | Ordering index. |
| `content` | `TEXT` | `NOT NULL` | The specific text slice (e.g., 500 tokens). |
| `embedding` | `VECTOR(1536)` | | The vector representation for similarity search. |

#### `knowledge_items`
*Synthesized high-level insights (The "Knowledge Base" UI).*
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | |
| `org_id` | `UUID` | `FK -> organizations.id` | |
| `type` | `ENUM` | `'ARCH_DECISION', 'CODE_PATTERN', 'ERROR_PATTERN'` | |
| `title` | `VARCHAR(255)` | `NOT NULL` | |
| `description` | `TEXT` | | Markdown content. |
| `confidence_score` | `FLOAT` | | 0.0 to 1.0. |
| `tags` | `VARCHAR[]` | | Array of strings for categorization. |
| `created_at` | `TIMESTAMPTZ` | | |

#### `knowledge_evidence`
*Many-to-Many Link table: connects high-level Knowledge Items to raw evidence.*
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | |
| `knowledge_item_id` | `UUID` | `FK -> knowledge_items.id` | |
| `reference_type` | `ENUM` | `'COMMIT', 'DOCUMENT'` | Polymorphic link type. |
| `reference_id` | `UUID` | `NOT NULL` | ID of the Commit or Document. |
| `relevance` | `FLOAT` | | Strength of the link. |

---

### 1.4. Query & Conversation Engine

#### `conversations`
*User chat sessions.*
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | |
| `user_id` | `UUID` | `FK -> users.id` | |
| `org_id` | `UUID` | `FK -> organizations.id` | |
| `title` | `VARCHAR(255)` | | Auto-generated summary of the chat. |
| `created_at` | `TIMESTAMPTZ` | | |

#### `messages`
*Individual chat bubbles.*
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | |
| `conversation_id` | `UUID` | `FK -> conversations.id` | |
| `role` | `ENUM` | `'USER', 'ASSISTANT', 'SYSTEM'` | Who sent the message. |
| `content` | `TEXT` | `NOT NULL` | The Markdown text response. |
| `created_at` | `TIMESTAMPTZ` | | |

#### `reasoning_traces`
*The "Brain" behind an Assistant message.*
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | |
| `message_id` | `UUID` | `FK -> messages.id`, `UNIQUE` | One trace per AI message. |
| `steps` | `JSONB` | | Array of logic steps: `[{ "action": "search", "query": "auth", "result": "found" }, ...]`. |
| `processing_time_ms` | `INTEGER` | | Performance metric. |

#### `message_citations`
*Footnotes/Links generated by the AI.*
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | |
| `message_id` | `UUID` | `FK -> messages.id` | |
| `document_chunk_id` | `UUID` | `FK -> document_chunks.id` | Source chunk. |
| `commit_id` | `UUID` | `FK -> commits.id` | Source commit. |
| `snippet` | `TEXT` | | The specific text quoted. |

---

## 2. Detailed Data Flows

### 2.1. Ingestion Worker Flow (Queue Consumer)
This process runs in the background when a `SyncJob` is triggered.

1.  **Job Initialization**:
    *   Update `sync_jobs` status to `IN_PROGRESS`.
    *   Load `data_source` credentials via secure vault.
2.  **Provider Strategy Selection**: switch based on `data_source.type` (e.g., GitHubStrategy).
3.  **Entity Traversal**:
    *   **Repositories**: Call provider API (`GET /orgs/{org}/repos`). Upsert to `repositories` table.
    *   **Commits**: For each repo, `git clone` or API fetch recent commits.
        *   Compute diff summaries.
        *   Send text (Message + Diff) to Embedding API (OpenAI text-embedding-ada-002).
        *   Upsert to `commits` table (store Vector).
    *   **Issues/Docs**: Fetch issues/PRs.
        *   Split long text into 500-token chunks.
        *   Embed each chunk.
        *   Insert to `documents` -> `document_chunks`.
4.  **Completion**:
    *   Update `data_source.last_synced_at`.
    *   Update `sync_jobs` status to `COMPLETED`.

### 2.2. RAG Query Processing Flow (API Request)
This happens when `POST /api/v1/chat/completion` is called.

1.  **Auth**: Validate Bearer Token -> Resolve `user_id`, `org_id`.
2.  **Context Construction**:
    *   Receive `user_query`.
    *   Generate embedding for `user_query`.
    *   **Vector Search**: Query `commits` and `document_chunks` tables using cosine similarity (`<=>` operator) filtering by `org_id`. Limit to Top 10 results.
3.  **LLM Prompting**:
    *   Construct System Prompt: "You are an expert developer assistant..."
    *   Inject Context: "Here are relevant code snippets and docs: [Chunk 1]... [Chunk 10]".
    *   Inject User Query.
4.  **Response Generation**:
    *   Stream LLM response to client.
    *   Capture full response text.
    *   Parse internal "Trace" log from the Agent execution.
5.  **Persistence**:
    *   Insert `messages` (User).
    *   Insert `messages` (Assistant).
    *   Insert `reasoning_traces`.
    *   Insert `message_citations` for every context chunk actually referenced in the final answer.

### 2.3. Analytics Aggregation (Scheduled Job)
Runs nightly to update `Analytics` dashboard caches.

1.  Query `conversations` join `messages` connected to `org_id`.
2.  Aggregate metrics:
    *   `Daily Queries` = Count of user messages where `created_at` > 24h.
    *   `Avg Latency` = Avg of `reasoning_traces.processing_time_ms`.
    *   `Topics` = Run clustering algorithm on `message` embeddings to group common questions (e.g., "Auth", "Database").
3.  Store results in a specialized `daily_metrics` table (not shown in main schema, used for caching chart data).
