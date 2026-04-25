import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { EmailVerification } from "./components/EmailVerification";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { Dashboard } from "./components/Dashboard";
import { QueryInterface } from "./components/QueryInterface";
import { ReasoningInterface } from "./components/ReasoningInterface";
import { DecisionHistory } from "./components/DecisionHistory";
import { ErrorInsights } from "./components/ErrorInsights";
import { Analytics } from "./components/Analytics";
import { KnowledgeBase } from "./components/KnowledgeBase";
import { DataSources } from "./components/DataSources";
import { Settings } from "./components/Settings";
import { Integrations } from "./components/Integrations";

export type Page =
  | "landing"
  | "auth"
  | "email-verification"
  | "onboarding"
  | "dashboard"
  | "query"
  | "reasoning"
  | "decision-history"
  | "error-insights"
  | "analytics"
  | "knowledge"
  | "datasources"
  | "settings"
  | "integrations";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleGetStarted = () => {
    setCurrentPage("auth");
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setIsEmailVerified(true);
    setIsOnboarded(true);
    setCurrentPage("dashboard");
  };

  const handleSignUp = () => {
    setIsAuthenticated(true);
    setUserEmail("user@example.com");
    setCurrentPage("email-verification");
  };

  const handleEmailVerified = () => {
    setIsEmailVerified(true);
    setCurrentPage("onboarding");
  };

  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
    setCurrentPage("dashboard");
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  // Landing page (not authenticated)
  if (!isAuthenticated && currentPage === "landing") {
    return <LandingPage onLogin={handleGetStarted} />;
  }

  // Auth page
  if (currentPage === "auth") {
    return <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  // Email verification (authenticated but not verified)
  if (isAuthenticated && !isEmailVerified && currentPage === "email-verification") {
    return <EmailVerification email={userEmail} onVerified={handleEmailVerified} />;
  }

  // Onboarding (authenticated and verified but not onboarded)
  if (isAuthenticated && isEmailVerified && !isOnboarded && currentPage === "onboarding") {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Main app (authenticated, verified, and onboarded)
  if (isAuthenticated && isEmailVerified && isOnboarded) {
    return (
      <>
        {currentPage === "dashboard" && <Dashboard navigateTo={navigateTo} />}
        {currentPage === "query" && <QueryInterface navigateTo={navigateTo} />}
        {currentPage === "reasoning" && <ReasoningInterface navigateTo={navigateTo} />}
        {currentPage === "decision-history" && <DecisionHistory navigateTo={navigateTo} />}
        {currentPage === "error-insights" && <ErrorInsights navigateTo={navigateTo} />}
        {currentPage === "analytics" && <Analytics navigateTo={navigateTo} />}
        {currentPage === "knowledge" && <KnowledgeBase navigateTo={navigateTo} />}
        {currentPage === "datasources" && <DataSources navigateTo={navigateTo} />}
        {currentPage === "settings" && <Settings navigateTo={navigateTo} />}
        {currentPage === "integrations" && <Integrations navigateTo={navigateTo} />}
      </>
    );
  }

  // Fallback to landing
  return <LandingPage onLogin={handleGetStarted} />;
}
