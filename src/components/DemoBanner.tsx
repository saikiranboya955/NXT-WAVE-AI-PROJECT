import React from 'react';

interface DemoBannerProps {
  message?: string;
}

const DemoBanner: React.FC<DemoBannerProps> = ({
  message = 'DEMO MODE — data is stored locally in this browser session only. No information is sent to a central database.',
}) => {
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
