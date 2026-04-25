# Infinium User Activity Flow

This document maps the user journey and application logic based on the `src/app` components.

## Activity Diagram (Mermaid)

```mermaid
graph TD
    %% Initial State
    Start((Start)) --> CheckAuth{Is Authenticated?}
    
    %% Unauthenticated Flow
    CheckAuth -- No --> Landing[Landing Page]
    Landing -->|Click Get Started| AuthPage[Auth Page]
    
    AuthPage -->|User Action| AuthAction{Login or Sign Up?}
    
    %% Sign Up Flow (Detailed Path)
    AuthAction -- Sign Up --> SetEmail[Set User Email]
    SetEmail --> EmailVer[Email Verification Page]
    EmailVer -->|Verify Code| VerSuccess[Set Email Verified = True]
    VerSuccess --> Onboarding[Onboarding Flow]
    
    subgraph Onboarding Process
        Onboarding --> OrgStep[Step 1: Organization Details]
        OrgStep --> SourceStep[Step 2: Connect Data Sources]
        SourceStep --> PermStep[Step 3: Configure Permissions]
        PermStep --> CompleteOnboarding[Set Onboarded = True]
    end
    
    %% Login Flow (Shortcut Path based on App.tsx)
    AuthAction -- Login --> LoginAction[Set Auth/Verified/Onboarded = True]
    LoginAction --> Dashboard
    
    %% Transition to Main App
    CompleteOnboarding --> Dashboard[Dashboard Home]
    
    %% Main Application Navigation
    Dashboard --> NavChoice{Navigation}
    
    NavChoice -->|Query| QueryUI[Query Interface]
    NavChoice -->|Reasoning| ReasonUI[Reasoning Interface]
    NavChoice -->|History| HistoryUI[Decision History]
    NavChoice -->|Analytics| AnalyticsUI[Analytics Page]
    NavChoice -->|Settings| SettingsUI[Settings Page]
    
    %% Query Interface Logic
    subgraph Query Logic
        QueryUI --> InputQ[/User Input/]
        InputQ --> CheckEmpty{Is Empty?}
        CheckEmpty -- Yes --> QueryUI
        CheckEmpty -- No --> GenResponse[Generate AI Response]
        GenResponse --> ShowSources[Display Sources & Reasoning]
        ShowSources --> QuerySuccess((Complete))
    end
    
    %% Reasoning Logic
    subgraph Reasoning Logic
        ReasonUI --> InputR[/User Input/]
        InputR --> FetchEv[Fetch Evidence Commits/Docs]
        FetchEv --> CalcConf[Calculate Confidence]
        CalcConf --> DisplayR[Display Reasoning Cards]
    end

    %% Loops
    QuerySuccess --> QueryUI
```

## Flow Description

1.  **Authentication Phase**:
    *   Users start at the **Landing Page**.
    *   **Sign Up**: Follows the full path: `Email Verification` -> `Onboarding` -> `Dashboard`.
    *   **Login**: In the current `App.tsx` implementation, logging in acts as a shortcut that sets all states (Verified, Onboarded) to `true` instantly, skipping the setup wizard.

2.  **Onboarding Phase**:
    *   A linear 3-step wizard collecting Organization Info, Data Source integrations (GitHub, Slack, etc.), and Permissions.

3.  **Core Application**:
    *   Once fully authorized, the user lands on the **Dashboard**.
    *   Navigation allows switching between specialized tools like the **Query Interface** (RAG-based chat) and **Reasoning Interface** (Evidence-based analysis).
