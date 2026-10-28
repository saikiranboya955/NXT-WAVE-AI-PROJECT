import React from 'react';
import { Link } from 'react-router-dom';
import CampusLeaderboard from '../components/CampusLeaderboard';

const LeaderboardPage: React.FC = () => {
  return (
    <main className="pt-24 min-h-screen bg-black px-5 sm:px-8 pb-20" id="main-content">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            to="/"
            className="text-xs text-text-secondary hover:text-white transition-colors"
          >
            ← Back to workshop home
          </Link>
        </div>

        <CampusLeaderboard />
      </div>
    </main>
  );
};

export default LeaderboardPage;
