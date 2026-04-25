# Infinium Frontend Architecture

This document provides a comprehensive technical overview of the Infinium frontend application. It details the application structure, component hierarchy, state management, and functional modules, focusing on the core architectural patterns and internal data models.

## 1. Technological Foundation

The application is built on a modern, strictly typed React ecosystem designed for performance and maintainability.

-   **Core Framework**: `React 18` with `TypeScript` (Strict Mode enabled).
-   **Build System**: `Vite` for efficient HMR and optimized production builds.
-   **Styling Engine**: `Tailwind CSS` with a custom "Blueprint" design system overlay (custom utility classes, CSS variables for theming).
-   **UI Primitives**:
    -   `lucide-react` for consistent iconography.
    -   `recharts` for data visualization.
    -   Custom atomic components (`Card.tsx`, `Button.tsx`) wrapping standard HTML elements with consistent design tokens.
-   **Layout Strategy**: Fully responsive generic layouts using CSS Grid and Flexbox, utilizing a persistent sidebar navigation shell for the authenticated application.

## 2. Application Entry & Routing

Unlike traditional React apps using `react-router`, Infinium employs a **centralized state-machine routing pattern** within `App.tsx`.

### State Management
The root functionality is controlled by four primary state atoms:
1.  `currentPage`: Determines the active view component (e.g., 'dashboard', 'query', 'analytics').
2.  `isAuthenticated`: Boolean flag gating access to protected routes.
3.  `isEmailVerified`: Intermediate gate requiring OTP verification.
4.  `isOnboarded`: Final gate requiring the completion of the setup wizard.

### User Flow
The application enforces a linear progression for new users:
1.  **Landing Page**: Public marketing view.
2.  **Auth Page**: Login/Signup forms.
3.  **Email Verification**: 6-digit OTP entry with validation logic.
4.  **Onboarding Wizard**: Multi-step configuration (Org Setup -> Data Connections -> Permissions).
5.  **Dashboard**: The primary authenticated view.

## 3. Core Modules & Functionality

### 3.1. Knowledge Intelligence Extensions
These modules form the core value proposition, allowing users to interact with the system's reasoning engine.

*   **Query Interface (`QueryInterface.tsx`)**:
    *   **Architecture**: Chat-based UI pattern.
    *   **Logic**: Manages a message history array. Simulates asynchronous AI processing with loading states.
    *   **Features**: Suggested queries prompt the user. Responses distinguish between "Reasoning" (logic) and "Evidence" (raw data).
    *   **UX**: Uses a "thinking" state visualization to manage user expectations during complex queries.

*   **Reasoning Interface (`ReasoningInterface.tsx`)**:
    *   **Architecture**: Advanced inspection view.
    *   **Logic**: Parses "evidence chains"—structured data linking a conclusion to specific artifacts (Commit Hashes, Documentation Snippets, Code Blocks).
    *   **Features**:
        *   Collapsible evidence cards for progressive disclosure.
        *   Sidebar history of "Recent Reasonings" for quick context switching.
        *   "Pro Reasoning" toggle (placeholder for advanced logic modes).

### 3.2. Operational Dashboards
These modules visualize the health and status of the software ecosystem.

*   **Main Dashboard (`Dashboard.tsx`)**:
    *   **Purpose**: High-level execution summary.
    *   **Data Visualization**:
        *   Key Performance Indicators (KPIs) cards: Usage volume, Accuracy rates, Latency metrics.
        *   Status Monitors for connected subsystems (Code Repositories, Issue Trackers, Documentation).
    *   **Interactions**: Deep-links to specific modules (e.g., "View All Queries" -> Query Interface).

*   **Analytics Engine (`Analytics.tsx`)**:
    *   **Purpose**: Meta-analysis of team knowledge consumption.
    *   **Visualization Stack**: Heavy usage of `recharts`.
        *   **Line Charts**: Query volume trends over time.
        *   **Pie Charts**: Distribution of query categories (Architecture vs. Patterns vs. Performance).
        *   **Bar Charts**: Response latency analysis.
    *   **Metrics**: Tracks "Team Engagement" to quantify the platform's adoption usage across engineering vs. product teams.

*   **Error Insights (`ErrorInsights.tsx`)**:
    *   **Purpose**: Aggregate and analyze runtime exceptions.
    *   **Data Model**: Structured `ErrorPattern` interface containing:
        *   `endpoint`: The failing resource.
        *   `trend`: Up/Down/Stable indicators.
        *   `category`: Classification (API, Database, Frontend).
        *   `suggestedFix`: AI-generated remediation advice.
    *   **Features**:
        *   Filtering by Time Range (24h, 7d, 30d) and Category.
        *   Expandable detail rows showing full trace analysis and related issue links.

### 3.3. Institutional Memory
These modules store and organize the static and evolving knowledge of the organization.

*   **Decision History (`DecisionHistory.tsx`)**:
    *   **Architecture**: Chronological Timeline view.
    *   **Purpose**: Records "Architecture Decision Records" (ADRs) and major system changes.
    *   **Features**:
        *   Search filtering by title/tag.
        *   Impact analysis ratings (High/Medium/Low).
        *   Linkage to specific authors and dates.

*   **Knowledge Base (`KnowledgeBase.tsx`)**:
    *   **Architecture**: Tabbed Repository view.
    *   **Taxonomy**: Categorizes items into:
        *   Architecture Decisions
        *   Code Patterns
        *   System Errors
    *   **Data Model**: Each item carries a `confidence` score, highlighting the certainty of the system's deductions.

### 3.4. System Configuration
Modules for managing the system's inputs and user preferences.

*   **Data Sources (`DataSources.tsx`)**:
    *   **Purpose**: Connection management hub.
    *   **Functionality**:
        *   Lists active connections to Code Repositories, Issue Tracking Systems, and CI/CD pipelines.
        *   Provides "Sync Now" manual triggers to refresh indices.
        *   Visual indicators for connection health (Synced, Syncing, Error).

*   **Integrations (`Integrations.tsx`)**:
    *   **Purpose**: Client-side tooling setup.
    *   **Scope**: Manages extensions for IDEs (VSCode, JetBrains) and Chat platforms.
    *   **UX**: Card-based catalog showing installation status and setup guides.

*   **Settings (`Settings.tsx`)**:
    *   **Architecture**: Tabbed configuration form.
    *   **Scope**: Profile management, Notification preferences, Security (2FA, Password), and API Key generation/revocation.

## 4. Design System & Styling

The application implements a unique "Blueprint" aesthetic, distinguished by:

-   **Color Palette**:
    -   Primary: Deep Blue (`#1E3A8A`) representing reliability/enterprise.
    -   Accent: Cyan (`#38BDF8`) for active elements and "AI" intelligence indicators.
    -   Warning/Error: Standard Semiotic Red/Yellow for system alerts.
-   **Visual Motifs**:
    -   **Glassmorphism**: Used in headers and modal overlays (`backdrop-blur-sm`, `bg-white/80`).
    -   **Technical Borders**: Thin, sharp borders often styled with dashed lines or accent corners to mimic architectural blueprints.
    -   **Gradients**: Subtle fade-ins (e.g., `from-blue-50 to-cyan-50`) to separate sections without harsh lines.

## 5. Data Flow Summary

1.  **Input**: User actions (queries, configuration changes) are captured via standard React event handlers.
2.  **Processing**: Currently simulated via `setTimeout` to mimic backend latency and async processing queues.
3.  **State Update**: Local component state stores the "response" or "updated configuration", causing a re-render.
4.  **Presentation**: The UI updates to reflect the new state (e.g., a new message appearing in the chat list or a data source changing status to 'Active').
