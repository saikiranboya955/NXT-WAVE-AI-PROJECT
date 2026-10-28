import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Nav: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = location.pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/85 backdrop-blur-md border-b border-border/80">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center group py-1" aria-label="NxtWave Home">
          <img
            src="/nxtwave-logo-white.png"
            alt="NxtWave"
            className="h-9 sm:h-10 md:h-11 w-auto object-contain filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] group-hover:opacity-90 transition-opacity"
            width="85"
            height="44"
          />
        </Link>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
          <a
            href={isHome ? '#why' : '/#why'}
            className="text-sm font-medium text-text-secondary hover:text-white px-3 py-1.5 rounded-lg transition-colors hover:bg-white/[0.04]"
          >
            Workshop
          </a>
          <Link
            to="/finder"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              location.pathname === '/finder'
                ? 'text-white font-semibold bg-white/[0.08] border border-cerulean/40 shadow-sm'
                : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Build a Project
          </Link>
          <Link
            to="/leaderboard"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              location.pathname === '/leaderboard'
                ? 'text-white font-semibold bg-white/[0.08] border border-cerulean/40 shadow-sm'
                : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Campus Leaderboard
          </Link>
          <Link
            to="/growth-hub"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              location.pathname === '/growth-hub'
                ? 'text-white font-semibold bg-white/[0.08] border border-cerulean/40 shadow-sm'
                : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Growth Hub
          </Link>
        </nav>

        {/* Right CTA Button (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/register"
            className="btn-rose !py-2 !px-5 !rounded-full !text-xs font-semibold shadow-md hover:shadow-rose/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            id="nav-register-btn"
          >
            Register Now (Free)
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-text-secondary hover:text-white focus:outline-none"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-border px-5 py-6 space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col space-y-3">
            <a
              href={isHome ? '#why' : '/#why'}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-text-secondary hover:text-white py-1.5 transition-colors"
            >
              Workshop
            </a>
            <Link
              to="/finder"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium py-1.5 transition-colors ${
                location.pathname === '/finder' ? 'text-cerulean font-semibold' : 'text-text-secondary hover:text-white'
              }`}
            >
              Build a Project
            </Link>
            <Link
              to="/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium py-1.5 transition-colors ${
                location.pathname === '/leaderboard' ? 'text-cerulean font-semibold' : 'text-text-secondary hover:text-white'
              }`}
            >
              Campus Leaderboard
            </Link>
            <Link
              to="/growth-hub"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium py-1.5 transition-colors ${
                location.pathname === '/growth-hub' ? 'text-cerulean font-semibold' : 'text-text-secondary hover:text-white'
              }`}
            >
              Growth Hub
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Organizer Dashboard"
              className={`flex items-center justify-between text-xs font-medium px-3.5 py-2.5 rounded-lg border transition-all mt-2 ${
                location.pathname === '/dashboard'
                  ? 'border-cerulean text-white bg-cerulean/20 font-semibold'
                  : 'border-border-hover/80 bg-surface-elevated text-text-secondary hover:text-white hover:border-cerulean/60'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cerulean" />
                <span>Organizer Dashboard</span>
              </span>
              <span className="text-2xs font-mono text-cerulean px-2 py-0.5 rounded bg-cerulean/15 border border-cerulean/30">
                Admin
              </span>
            </Link>
          </div>
          <div className="pt-3 border-t border-border">
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-rose w-full text-center !rounded-full !py-2.5 text-xs font-semibold shadow-md"
            >
              Register Now (Free)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Nav;
