import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { Toaster } from "./components/ui/sonner";
import Navigation from "./components/Navigation";
import VoiceCommandCenter from "./components/VoiceCommandCenter";
import LegalFooter from "./components/LegalFooter";
import CookieConsent from "./components/CookieConsent";
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from "./components/RouteGuards";
import HomePage from "./pages/HomePage";
import HabitsPage from "./pages/HabitsPage";
import { Exercises } from "./pages/Exercises";
import { ExercisePlayer } from "./pages/ExercisePlayer";
import EducationPage from "./pages/EducationPage";
import CommunityPage from "./pages/CommunityPage";
import AICoachPage from "./pages/AICoachPage";
import AwesomeFeedPage from "./pages/AwesomeFeedPage";
import SuccessConspiracyPage from "./pages/SuccessConspiracyPage";
import ConcentrationGamesPage from "./pages/ConcentrationGamesPage";
import GlowUpPage from "./pages/GlowUpPage";
import HowToUsePage from "./pages/HowToUsePage";
import PricingPage from "./pages/PricingPage";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import LandingPage from "./pages/LandingPage";

// Wraps everything that requires auth + per-user data
const AuthedLayout = ({ children }) => (
  <AppProvider>
    <Navigation />
    <main className="pb-24 md:pb-0">{children}</main>
    <LegalFooter />
    <VoiceCommandCenter />
  </AppProvider>
);

// Public pages still get navigation (logged-out state) but no VoiceCommandCenter / AppProvider
const PublicLayout = ({ children }) => (
  <AppProvider>
    <Navigation />
    <main className="pb-24 md:pb-0">{children}</main>
    <LegalFooter />
  </AppProvider>
);

// Root '/' — LandingPage for logged-out users, Dashboard redirect for logged-in
const RootRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <PublicLayout><LandingPage /></PublicLayout>;
};

function App() {
  return (
    <AuthProvider>
      <div className="App min-h-screen bg-background">
        <BrowserRouter>
          <Routes>
            {/* Public — logged-out users can browse */}
            <Route path="/" element={<RootRoute />} />
            <Route path="/auth" element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />
            <Route path="/pricing" element={<PublicLayout><PricingPage /></PublicLayout>} />
            <Route path="/how-to-use" element={<PublicLayout><HowToUsePage /></PublicLayout>} />
            <Route path="/education" element={<PublicLayout><EducationPage /></PublicLayout>} />
            <Route path="/privacy" element={<PublicLayout><PrivacyPolicyPage /></PublicLayout>} />
            <Route path="/terms" element={<PublicLayout><TermsOfServicePage /></PublicLayout>} />
            <Route path="/feed" element={<PublicLayout><AwesomeFeedPage /></PublicLayout>} />
            <Route path="/community" element={<PublicLayout><CommunityPage /></PublicLayout>} />
            <Route path="/conspiracy" element={<PublicLayout><SuccessConspiracyPage /></PublicLayout>} />
            <Route path="/concentration-games" element={<PublicLayout><ConcentrationGamesPage /></PublicLayout>} />
            <Route path="/glow-up" element={<PublicLayout><GlowUpPage /></PublicLayout>} />

            {/* Protected — requires login */}
            <Route path="/dashboard" element={<ProtectedRoute><AuthedLayout><HomePage /></AuthedLayout></ProtectedRoute>} />
            <Route path="/habits" element={<ProtectedRoute><AuthedLayout><HabitsPage /></AuthedLayout></ProtectedRoute>} />
            <Route path="/focus" element={<ProtectedRoute><AuthedLayout><Exercises /></AuthedLayout></ProtectedRoute>} />
            <Route path="/exercise/:exerciseId" element={<ProtectedRoute><AuthedLayout><ExercisePlayer /></AuthedLayout></ProtectedRoute>} />
            <Route path="/coach" element={<ProtectedRoute><AuthedLayout><AICoachPage /></AuthedLayout></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AuthedLayout><AdminPage /></AuthedLayout></AdminRoute>} />
          </Routes>
          <CookieConsent />
        </BrowserRouter>
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{ className: 'rounded-xl' }}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
