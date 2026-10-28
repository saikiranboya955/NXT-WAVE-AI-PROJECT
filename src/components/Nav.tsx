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
        <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
          <a
            href={isHome ? '#why' : '/#why'}
            className="text-sm font-medium text-text-secondary hover:text-white transition-colors"
          >
            Why
          </a>
          <Link
            to="/finder"
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/finder'
                ? 'text-white'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            What You'll Build
          </Link>
          <a
            href={isHome ? '#community' : '/#community'}
            className="text-sm font-medium text-text-secondary hover:text-white transition-colors"
          >
            Community
          </a>
          <a
            href={isHome ? '#faq' : '/#faq'}
            className="text-sm font-medium text-text-secondary hover:text-white transition-colors"
          >
            FAQ
          </a>
          <Link
            to="/dashboard"
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cerulean/50 ${
              location.pathname === '/dashboard'
                ? 'border-cerulean text-white bg-cerulean/20 font-semibold ring-1 ring-cerulean/50'
                : 'border-border-hover/80 bg-surface-elevated/90 text-white hover:border-cerulean hover:bg-cerulean/15 hover:text-white shadow-sm'
            }`}
            aria-label="Organizer Dashboard"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cerulean" aria-hidden="true" />
            <span>Dashboard</span>
          </Link>
        </nav>

        {/* Right CTA Button (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/register"
            className="btn-rose !py-2 !px-5 !rounded-full !text-xs font-semibold"
            id="nav-register-btn"
          >
            Register Now
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
              className="text-sm font-medium text-text-secondary hover:text-white py-1"
            >
              Why
            </a>
            <Link
              to="/finder"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-text-secondary hover:text-white py-1"
            >
              What You'll Build
            </Link>
            <a
              href={isHome ? '#community' : '/#community'}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-text-secondary hover:text-white py-1"
            >
              Community
            </a>
            <a
              href={isHome ? '#faq' : '/#faq'}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-text-secondary hover:text-white py-1"
            >
              FAQ
            </a>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between text-sm font-medium px-3.5 py-2.5 rounded-lg border transition-all ${
                location.pathname === '/dashboard'
                  ? 'border-cerulean text-white bg-cerulean/20 font-semibold'
                  : 'border-border-hover/80 bg-surface-elevated text-white hover:border-cerulean hover:bg-cerulean/10'
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
              className="btn-rose w-full text-center !rounded-full !py-2.5 text-xs font-semibold"
            >
              Register Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Nav;
