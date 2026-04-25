# Infinium Use Case Model

This document outlines the actors, use cases, and system interactions for the Infinium platform.

## Use Case Diagram (Mermaid)

```mermaid
usecaseDiagram
    actor "User" as U
    actor "GitHub / GitLab" as VCS
    actor "Jira" as PM
    actor "Slack" as Chat
    actor "Sentry" as ErrorTracker

    package "Infinium System" {
        
        %% Authentication & Onboarding
        usecase "Sign Up" as UC1
        usecase "Log In" as UC2
        usecase "Verify Email" as UC3
        usecase "Complete Onboarding" as UC4
        
        %% Core Workflows
        usecase "View Dashboard" as UC5
        usecase "Query Codebase" as UC6
        usecase "View Reasoning Trace" as UC7
        usecase "Search Knowledge Base" as UC8
        
        %% Management
        usecase "Manage Data Sources" as UC9
        usecase "Configure Integrations" as UC10
        usecase "Sync Data" as UC11
    }

    %% Relationships
    U --> UC1
    U --> UC2
    U --> UC5
    U --> UC6
    U --> UC8
    U --> UC9
    U --> UC10

    %% Includes / Extends
    UC1 ..> UC3 : <<include>>
    UC1 ..> UC4 : <<include>>
    UC6 <.. UC7 : <<extend>>
    UC9 ..> UC11 : <<include>>

    %% External System Interactions
    UC4 --> VCS : Connects to
    UC4 --> Chat : Connects to
    
    UC9 --> VCS : Fetches Repos
    UC9 --> PM : Imports Issues
    UC9 --> ErrorTracker : Syncs Errors
    
    UC10 --> Chat : Installs Bot
```

## detailed Use Case Descriptions

### 1. Authentication & Onboarding
| Use Case | Description |
| :--- | :--- |
| **Sign Up** | User creates a new account using email. Includes **Verify Email**. |
| **Log In** | User authenticates to access the system. |
| **Complete Onboarding** | User completes the initial setup wizard to configure organization details and connect initial data sources (GitHub, Slack, etc.). |

### 2. Core Workflows
| Use Case | Description |
| :--- | :--- |
| **View Dashboard** | User views high-level metrics, active data sources, and recent activity upon logging in. |
| **Query Codebase** | User asks natural language questions via the `QueryInterface` to retrieve answers based on indexed data. |
| **View Reasoning Trace** | User views the detailed "chain of thought" and evidence (commits, docs) supporting an AI answer in the `ReasoningInterface`. |
| **Search Knowledge Base** | User searches and filters institutional knowledge items (e.g., Architecture Decisions, Error Patterns) in the `KnowledgeBase`. |

### 3. Management & Configuration
| Use Case | Description |
| :--- | :--- |
| **Manage Data Sources** | User adds, removes, or configures connections to external systems like GitHub, GitLab, Sentry, and Jira via `DataSources` page. |
| **Configure Integrations** | User sets up extensions and bots for tools like VSCode and Slack via the `Integrations` page. |
| **Sync Data** | User manually triggers a synchronization of data from connected sources to ensure the RAG engine has the latest context. |
