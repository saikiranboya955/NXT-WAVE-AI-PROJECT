import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-border/80 text-text-secondary pt-16 pb-12 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-border/60">
          {/* Brand Column (Col 1-5) */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 group" aria-label="NxtWave Home">
              <img
                src="/nxtwave-logo-white.png"
                alt="NxtWave"
                className="h-8 w-auto object-contain filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] group-hover:opacity-90 transition-opacity"
                width="72"
                height="37"
              />
              <span className="font-mono text-2xs text-cerulean px-2 py-0.5 rounded bg-cerulean/15 border border-cerulean/30 uppercase tracking-widest font-semibold">
                AI Project Passport
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-sm">
              An experiential growth initiative empowering final-year engineering students to build,
              deploy, and showcase their first working AI application in 60 minutes.
            </p>

            {/* Campaign Metric Pill */}
            <div className="inline-flex flex-wrap items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-md text-2xs font-mono font-semibold bg-surface-elevated border border-border text-white">
                🎯 Target: 500 Engineers
              </span>
              <span className="px-2.5 py-1 rounded-md text-2xs font-mono font-semibold bg-surface-elevated border border-border text-cerulean">
                💰 Budget: ₹2,000 Max
              </span>
              <span className="px-2.5 py-1 rounded-md text-2xs font-mono font-semibold bg-surface-elevated border border-border text-rose">
                ⏱️ 7-Day Sprint
              </span>
            </div>
          </div>

          {/* Navigation Links Column (Col 6-8) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Explore Platform
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="/#why" className="text-text-secondary hover:text-white transition-colors">
                  Workshop Overview
                </a>
              </li>
              <li>
                <Link to="/finder" className="text-text-secondary hover:text-white transition-colors">
                  Build a Project (Finder)
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-text-secondary hover:text-white transition-colors">
                  Campus Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/growth-hub" className="text-text-secondary hover:text-white transition-colors">
                  Growth Hub & Metrics
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-cerulean hover:text-cerulean-light font-medium transition-colors">
                  Register Now (Free) →
                </Link>
              </li>
            </ul>
          </div>

          {/* Organizers & Disclosures Column (Col 9-12) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Organizers & Transparency
            </h4>
            <p className="text-xs text-text-tertiary leading-relaxed">
              Designed for the NxtWave Growth Intern Challenge. Live database synchronization operates
              via Supabase backend. When credentials are not provided or offline, transparent session
              demo mode is maintained without fabricating database persistence.
            </p>

            <div className="pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-2xs font-mono text-text-secondary hover:text-white px-3 py-1.5 rounded-lg bg-surface-elevated border border-border hover:border-cerulean/50 transition-all"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cerulean" />
                <span>Organizer Access / Internal Dashboard →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-tertiary">
          <p>© 2026 NxtWave AI Project Passport. All rights reserved.</p>
          <p className="font-mono text-2xs">
            Student Growth Platform • Built with React, Vite & Supabase
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
