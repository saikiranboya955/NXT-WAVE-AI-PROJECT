import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import LandingPage from './pages/LandingPage';
import FinderPage from './pages/FinderPage';
import PassportPage from './pages/PassportPage';
import RegistrationPage from './pages/RegistrationPage';
import SuccessPage from './pages/SuccessPage';
import DashboardPage from './pages/DashboardPage';
import LeaderboardPage from './pages/LeaderboardPage';

// Skip-to-content link for keyboard users
const SkipLink: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] btn-rose text-xs px-4 py-2"
  >
    Skip to main content
  </a>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SkipLink />
      <Nav />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/finder" element={<FinderPage />} />
        <Route path="/passport" element={<PassportPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <main className="pt-14 min-h-screen flex items-center justify-center" id="main-content">
              <div className="text-center px-4">
                <p className="label mb-3">404</p>
                <h1 className="text-2xl font-bold text-white mb-4">Page not found</h1>
                <a href="/" className="btn-primary text-sm">
                  Back to workshop
                </a>
              </div>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
