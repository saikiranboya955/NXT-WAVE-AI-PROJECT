import React from 'react';
import { isSupabaseConfigured } from '../lib/supabase';

interface DemoBannerProps {
  message?: string;
  forceShow?: boolean;
}

const DemoBanner: React.FC<DemoBannerProps> = ({
  message = 'DEMO MODE — data is stored locally in this browser session only. No information is sent to a central database.',
  forceShow = false,
}) => {
  // If live Supabase credentials are configured, do not show demo warning unless explicitly forced
  if (isSupabaseConfigured() && !forceShow) {
    return null;
  }

  return (
    <div
      className="w-full bg-rose/10 border-b border-rose/20 px-4 py-2 text-center"
      role="status"
      aria-label="Demo mode notice"
    >
      <p className="text-xs text-rose font-mono">
        <span className="font-semibold">⚠ DEMO</span> — {message}
      </p>
    </div>
  );
};

export default DemoBanner;
