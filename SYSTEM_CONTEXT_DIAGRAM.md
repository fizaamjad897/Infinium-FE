# Infinium System Context Diagram

This document illustrates the high-level context of the **Infinium** platform, showing how it fits into the existing software development ecosystem.

## C4 System Context Diagram (Mermaid)

```mermaid
C4Context
    title System Context Diagram for Infinium Platform

    %% Actors
    Person(dev, "Software Engineer", "A developer who uses Infinium to query codebase and understand architecture.")
    Person(lead, "Tech Lead", "A team lead who configures data sources and monitors team knowledge.")

    %% Main System
    System(infinium, "Infinium Platform", "The autonomous reasoning agent that indexes knowledge and answers queries about the codebase.")

    %% External Systems - VCS
    System_Ext(github, "GitHub / GitLab", "Stores source code, commit history, and pull requests.")
    
    %% External Systems - Project Management
    System_Ext(jira, "Jira / Linear", "Tracks tasks, user stories, and bugs.")
    
    %% External Systems - Docs
    System_Ext(confluence, "Confluence / Notion", "Stores long-form documentation and specifications.")
    
    %% External Systems - Observability
    System_Ext(sentry, "Sentry / Datadog", "Provides real-time error tracking and performance metrics.")
    
    %% External Systems - Communication
    System_Ext(slack, "Slack / Teams", "Team communication platform for notifications and chatbot interaction.")
    
    %% External Systems - IDE
    System_Ext(vscode, "VS Code / JetBrains", "Integrated Development Environment where developers write code.")

    %% Relationships - Users
    Rel(dev, infinium, "Asks queries, views reasoning", "Web Interface / IDE")
    Rel(lead, infinium, "Configures sources, manages permissions", "Web Dashboard")
    
    %% Relationships - Integrations
    Rel(infinium, github, "Indexes code & commits", "HTTPS/API")
    Rel(infinium, jira, "Indexes issues & requirements", "HTTPS/API")
    Rel(infinium, confluence, "Indexes documentation", "HTTPS/API")
    Rel(infinium, sentry, "Fetches error logs", "HTTPS/API")
    
    %% Relationships - Output
    Rel(infinium, slack, "Sends alerts & answers queries", "Bot API")
    Rel(infinium, vscode, "Provides inline insights", "Extension API")
    
    %% User Direct Relationships (Context)
    Rel(dev, vscode, "Writes code in")
    Rel(dev, slack, "Communicates via")
```

## System Descriptions

| Element | Type | Description |
| :--- | :--- | :--- |
| **Infinium Platform** | Software System | The core AI-powered application that aggregates data from various sources to provide reasoning and insights about the software project. |
| **Software Engineer** | Person | The primary user who interacts with Infinium to save time on research and debugging. |
| **GitHub / GitLab** | External System | The source of truth for code. Infinium reads repositories, branches, and commit messages to build its context. |
| **Jira / Linear** | External System | Provides the "logical" context (tickets, stories) that links code changes to business requirements. |
| **Sentry / Datadog** | External System | Provides the "operational" context (errors, logs) to help Infinium debug issues. |
| **Slack / Teams** | External System | Acts as both an input source (conversations) and an output channel (bot responses) for Infinium. |
| **VS Code / JetBrains** | External System | The developer's work environment. Infinium integrates here to provide information right where the code is written. |
