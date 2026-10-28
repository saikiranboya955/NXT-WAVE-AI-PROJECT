import React from 'react';
import { Link } from 'react-router-dom';
import CampusLeaderboard from '../components/CampusLeaderboard';
import StudentReferralCenter from '../components/StudentReferralCenter';

const LeaderboardPage: React.FC = () => {
  return (
    <main className="pt-24 min-h-screen bg-black px-5 sm:px-8 pb-20" id="main-content">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-xs text-text-secondary hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Back to workshop home</span>
          </Link>

          <Link
            to="/growth-hub"
            className="text-xs font-mono text-cerulean hover:text-cerulean-light transition-colors"
          >
            View Growth Campaign Hub →
          </Link>
        </div>

        {/* 1. Student Referral Center (Section 3A) */}
        <StudentReferralCenter />

        {/* 2. Campus Leaderboard with Podium & Rankings (Section 3B) */}
        <CampusLeaderboard />
      </div>
    </main>
  );
};

export default LeaderboardPage;
