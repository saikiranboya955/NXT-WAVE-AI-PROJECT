import React from 'react';

interface StepIndicatorProps {
  current: number; // 1-indexed (1, 2, or 3)
  labels?: string[];
}

const DEFAULT_LABELS = ['Your Interests', 'Your Skill Level', 'Your Goal'];

const StepIndicator: React.FC<StepIndicatorProps> = ({
  current,
  labels = DEFAULT_LABELS,
}) => {
  return (
    <div className="w-full max-w-md mx-auto my-6" aria-label="Progress">
      <div className="relative flex items-center justify-between">
        {/* Connecting background line */}
        <div
          className="absolute left-6 right-6 top-4 h-[2px] bg-border -translate-y-1/2 -z-0"
          aria-hidden="true"
        />

        {/* Progress highlight line */}
        <div
          className="absolute left-6 top-4 h-[2px] bg-rose transition-all duration-300 -translate-y-1/2 -z-0"
          style={{
            width: current === 1 ? '0%' : current === 2 ? '50%' : 'calc(100% - 3rem)',
          }}
          aria-hidden="true"
        />

        {labels.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === current;
          const isCompleted = stepNumber < current;

          return (
            <div key={label} className="relative z-10 flex flex-col items-center">
              {/* Step Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-rose text-white shadow-[0_0_15px_rgba(255,45,149,0.5)] ring-2 ring-rose ring-offset-2 ring-offset-black'
                    : isCompleted
                    ? 'bg-rose text-white'
                    : 'bg-surface-elevated text-text-tertiary border border-border'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                {stepNumber}
              </div>

              {/* Step Label */}
              <span
                className={`mt-2 text-[11px] font-medium tracking-tight whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-white'
                    : isCompleted
                    ? 'text-rose'
                    : 'text-text-tertiary'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
