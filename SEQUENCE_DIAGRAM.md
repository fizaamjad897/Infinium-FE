# Infinium Sequence Diagrams

This document details the object interactions for the core workflows of the Infinium platform.

## 1. Query & Reasoning Flow

This sequence models the interaction when a user asks a question about their codebase using the **Query Interface** or **Reasoning Interface**.

### Sequence Diagram (Mermaid)

```mermaid
sequenceDiagram
    actor User
    participant QI as Query/Reasoning Interface
    participant Engine as AI/RAG Engine
    participant DB as Knowledge Base
    participant Sources as External Sources (GitHub/Jira)

    User->>QI: Enters query ("Why was JWT deprecated?")
    activate QI
    
    QI->>QI: formatMessage(userQuery)
    QI->>QI: updateState(isProcessing=true)
    
    QI->>Engine: sendQuery(queryContent)
    activate Engine
    
    note right of Engine: RAG Process Starts
    
    Engine->>DB: searchRelevantContext(query)
    activate DB
    DB-->>Engine: return { documents, commits, decisions }
    deactivate DB
    
    alt Insufficient Context
        Engine->>Sources: fetchRealTimeData(queryContext)
        activate Sources
        Sources-->>Engine: return { latestCommits, recentIssues }
        deactivate Sources
    end
    
    Engine->>Engine: analyzeEvidence(context + sources)
    Engine->>Engine: calculateConfidenceScores()
    
    Engine-->>QI: return Response { text, evidence[], reasoningTrace }
    deactivate Engine
    
    QI->>QI: updateState(messages, isProcessing=false)
    QI->>User: Display Response Card
    
    opt User expands evidence
        User->>QI: Click "View Evidence"
        QI->>User: Show detailed code snippet / commit log
    end
    
    deactivate QI
```

### Workflow Description
1.  **Initiation**: The user types a natural language query into the input field of the `QueryInterface` or `ReasoningInterface`.
2.  **Processing State**: The UI eagerly updates to show the user's message and enters a "Processing" state (visualized by a loading spinner or skeleton loader).
3.  **Context Retrieval**: The conceptual `AI Engine` queries the internal `Knowledge Base` for indexed documents matches the query terms (e.g., "JWT", "Auth").
4.  **Fallback/Enrichment**: If indexed data is stale or insufficient, the engine may request real-time data from external `Sources` (like checking the latest GitHub commits).
5.  **Synthesis**: The engine synthesizes an answer, citing specific "Information Chunks" (Evidence) and calculating a confidence score for each.
6.  **Presentation**: The UI receives the structured response and renders it. It separates the "Answer" from the "Supporting Evidence" (cards), allowing the user to verify the source of truth.

---

## 2. Connecting a Data Source

This sequence models the flow of a user connecting a new integration (e.g., GitHub) via the **Data Sources** page.

### Sequence Diagram (Mermaid)

```mermaid
sequenceDiagram
    actor User
    participant UI as DataSources Page
    participant Modal as Add Source Modal
    participant API as Integration Service
    participant Auth as OAuth Provider (GitHub)

    User->>UI: Click "Add Source"
    activate UI
    UI->>Modal: open()
    deactivate UI
    activate Modal
    
    User->>Modal: Select "GitHub"
    Modal->>API: initiateConnection(provider="github")
    activate API
    API-->>Modal: return { redirectUrl }
    deactivate API
    
    Modal->>Auth: redirect(redirectUrl)
    deactivate Modal
    activate Auth
    
    User->>Auth: Grant Permissions
    Auth->>API: callback(authCode)
    activate API
    
    API->>API: exchangeToken(authCode)
    API->>API: validateScopes()
    API->>API: createConnectionRecord()
    
    par Async Indexing
        API->>API: startInitialSync()
    end
    
    API-->>UI: redirect(success=true)
    deactivate API
    deactivate Auth
    activate UI
    
    UI->>UI: refreshSourceList()
    UI->>User: Show "GitHub Connected" & "Syncing" status
    deactivate UI
```

### Workflow Description
1.  **Selection**: The user opens the "Add Source" modal from the `DataSources` page and selects a provider (e.g., GitHub).
2.  **Handshake**: The application requests a redirection URL from the backend service to initiate the OAuth flow.
3.  **Authentication**: The user is redirected to the external provider (GitHub) to authorize the application.
4.  **Callback & Verification**: Upon success, the provider calls back the application. The backend validates the token and establishes the persistent connection.
5.  **Indexing**: A background process immediately starts indexing relevant data (repositories, issues) to populate the Knowledge Base.
6.  **Feedback**: The user is returned to the dashboard where the new source connection is verified, and its status is set to `Syncing`.
