import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { Toaster } from "./components/ui/sonner";
import Navigation from "./components/Navigation";
import VoiceCommandCenter from "./components/VoiceCommandCenter";
import HomePage from "./pages/HomePage";
import HabitsPage from "./pages/HabitsPage";
import FocusPage from "./pages/FocusPage";
import EducationPage from "./pages/EducationPage";
import CommunityPage from "./pages/CommunityPage";
import AICoachPage from "./pages/AICoachPage";
import AwesomeFeedPage from "./pages/AwesomeFeedPage";

function App() {
  return (
    <AppProvider>
      <div className="App min-h-screen bg-background">
        <BrowserRouter>
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/habits" element={<HabitsPage />} />
              <Route path="/focus" element={<FocusPage />} />
              <Route path="/education" element={<EducationPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/coach" element={<AICoachPage />} />
              <Route path="/feed" element={<AwesomeFeedPage />} />
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
