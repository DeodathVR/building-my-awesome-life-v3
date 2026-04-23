import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { Toaster } from "./components/ui/sonner";
import Navigation from "./components/Navigation";
import VoiceCommandCenter from "./components/VoiceCommandCenter";
import HubPage from "./pages/HubPage";
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

function App() {
  return (
    <AppProvider>
      <div className="App min-h-screen bg-background">
        <BrowserRouter>
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<HubPage />} />
              <Route path="/habits" element={<HabitsPage />} />
              <Route path="/focus" element={<Exercises />} />
              <Route path="/exercise/:exerciseId" element={<ExercisePlayer />} />
              <Route path="/feed" element={<AwesomeFeedPage />} />
              <Route path="/conspiracy" element={<SuccessConspiracyPage />} />
              <Route path="/education" element={<EducationPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/coach" element={<AICoachPage />} />
              <Route path="/concentration-games" element={<ConcentrationGamesPage />} />
              <Route path="/glow-up" element={<GlowUpPage />} />
              <Route path="/how-to-use" element={<HowToUsePage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
          <VoiceCommandCenter />
        </BrowserRouter>
        <Toaster 
          position="top-center" 
          richColors 
          closeButton
          toastOptions={{
            className: 'rounded-xl',
          }}
        />
      </div>
    </AppProvider>
  );
}

export default App;
