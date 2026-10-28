import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import type { RegistrationFormData, ValidationErrors } from '../lib/validation';
import {
  validateRegistration,
  hasErrors,
  makeRegistration,
  GRADUATION_YEARS,
} from '../lib/validation';
import { registerForWorkshop } from '../lib/services';
import {
  generateReferralCode,
  buildReferralUrl,
  getActiveReferralCode,
  captureAndStoreReferralCode,
} from '../lib/referral';
import { trackEvent } from '../lib/analytics';
import { isSupabaseConfigured } from '../lib/supabase';
import DemoBanner from '../components/DemoBanner';

const RegistrationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isConfigured = isSupabaseConfigured();

  // Capture referral code from URL or persisted session
  useEffect(() => {
    captureAndStoreReferralCode();
  }, []);

  const urlRef = searchParams.get('ref');
  const prefillRef = urlRef || getActiveReferralCode() || '';
  const prefillProject = searchParams.get('project') ?? 'resume-feedback';

  const [form, setForm] = useState<RegistrationFormData>({
    name: '',
    email: '',
    college: '',
    graduationYear: '',
    referralCode: prefillRef,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);


  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (submitError) setSubmitError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateRegistration(form);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      const firstKey = Object.keys(validationErrors)[0];
      document.getElementById(`field-${firstKey}`)?.focus();
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    await trackEvent('registration_attempt', {
      college: form.college,
      has_ref: Boolean(form.referralCode),
    });

    const registrationData = makeRegistration(form, prefillProject);
    const result = await registerForWorkshop(registrationData);

    if (result.success) {
      const code = result.referralCode || generateReferralCode(form.name);
      const shareUrl = buildReferralUrl(code);
      navigate('/success', {
        state: {
          name: form.name,
          referralCode: code,
          shareUrl,
          registration: {
            ...registrationData,
            id: result.registrationId ?? `reg-${Date.now()}`,
            registeredAt: new Date().toISOString(),
          },
          alreadyRegistered: result.alreadyRegistered,
          isDemo: result.isDemo,
        },
      });
    } else {
      setSubmitError(result.error ?? 'Unable to complete registration. Please check your connection and try again.');
      setSubmitting(false);
    }
  }

  return (
    <main className="pt-20 min-h-screen bg-black px-5 sm:px-8 pb-20" id="main-content">
      {!isConfigured && <DemoBanner />}
      {isConfigured && (
        <div
          className="w-full bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-center"
          role="status"
          aria-label="Live database connected notice"
        >
          <p className="text-xs text-emerald-400 font-mono flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">LIVE DATABASE</span> — Connected to Supabase backend
          </p>
        </div>
      )}

      <div className="max-w-md mx-auto mt-6">
        {/* Header Row: NxtWave & Back link */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center group" aria-label="NxtWave Home">
            <img
              src="/nxtwave-logo-white.png"
              alt="NxtWave"
              className="h-9 sm:h-10 w-auto object-contain filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] group-hover:opacity-90 transition-opacity"
              width="80"
              height="41"
            />
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs text-text-secondary hover:text-white transition-colors flex items-center gap-1"
          >
            ← Back
          </button>
        </div>

        {/* Card Container */}
        <div className="card p-6 sm:p-8 border-border bg-surface shadow-xl">
          {/* Headline & Subtitle */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cerulean/15 border border-cerulean/30 text-cerulean text-xs font-semibold uppercase tracking-wider mb-3">
              <span>✦</span>
              <span>FREE WORKSHOP REGISTRATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              Save Your Seat 🎓
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              Build your first working AI project in 60 minutes.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate aria-label="Workshop registration form">
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="field-name"
                  className="block text-xs font-semibold text-white mb-1.5"
                >
                  Full Name <span className="text-rose">*</span>
                </label>
                <input
                  id="field-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. Sai Kiran"
                  value={form.name}
                  onChange={handleChange}
                  className={`input-field ${errors.name ? 'error' : ''}`}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'error-name' : undefined}
                />
                {errors.name && (
                  <p id="error-name" className="mt-1 text-2xs text-rose" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="field-email"
                  className="block text-xs font-semibold text-white mb-1.5"
                >
                  Email Address <span className="text-rose">*</span>
                </label>
                <input
                  id="field-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="e.g. saikiran@college.edu"
                  value={form.email}
                  onChange={handleChange}
                  className={`input-field ${errors.email ? 'error' : ''}`}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'error-email' : undefined}
                />
                {errors.email && (
                  <p id="error-email" className="mt-1 text-2xs text-rose" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* College Name */}
              <div>
                <label
                  htmlFor="field-college"
                  className="block text-xs font-semibold text-white mb-1.5"
                >
                  College / University <span className="text-rose">*</span>
                </label>
                <input
                  id="field-college"
                  name="college"
                  type="text"
                  required
                  autoComplete="organization"
                  placeholder="e.g. BITS Pilani or NIT Warangal"
                  value={form.college}
                  onChange={handleChange}
                  className={`input-field ${errors.college ? 'error' : ''}`}
                  aria-invalid={Boolean(errors.college)}
                  aria-describedby={errors.college ? 'error-college' : undefined}
                />
                {errors.college && (
                  <p id="error-college" className="mt-1 text-2xs text-rose" role="alert">
                    {errors.college}
                  </p>
                )}
              </div>

              {/* Year of Graduation * */}
              <div>
                <label
                  htmlFor="field-graduationYear"
                  className="block text-xs font-semibold text-white mb-1.5"
                >
                  Year of Graduation <span className="text-rose">*</span>
                </label>
                <select
                  id="field-graduationYear"
                  name="graduationYear"
                  required
                  value={form.graduationYear}
                  onChange={handleChange}
                  className={`input-field bg-surface-elevated text-white ${
                    errors.graduationYear ? 'error' : ''
                  }`}
                  aria-invalid={Boolean(errors.graduationYear)}
                  aria-describedby={errors.graduationYear ? 'error-graduationYear' : undefined}
                >
                  <option value="" disabled>
                    Select your graduation year
                  </option>
                  {GRADUATION_YEARS.map((y) => (
                    <option key={y} value={y} className="bg-surface-elevated text-white">
                      Class of {y}
                    </option>
                  ))}
                </select>
                {errors.graduationYear && (
                  <p id="error-graduationYear" className="mt-1 text-2xs text-rose" role="alert">
                    {errors.graduationYear}
                  </p>
                )}
              </div>

              {/* Referral Code (Optional) */}
              <div>
                <label
                  htmlFor="field-referralCode"
                  className="block text-xs font-semibold text-white mb-1.5"
                >
                  Referral Code <span className="text-text-tertiary font-normal">(Optional)</span>
                </label>
                <input
                  id="field-referralCode"
                  name="referralCode"
                  type="text"
                  placeholder="e.g. aditya-A1B2"
                  value={form.referralCode ?? ''}
                  onChange={handleChange}
                  className={`input-field font-mono uppercase ${errors.referralCode ? 'error' : ''}`}
                  aria-invalid={Boolean(errors.referralCode)}
                  aria-describedby={errors.referralCode ? 'error-referralCode' : undefined}
                />
                {errors.referralCode && (
                  <p id="error-referralCode" className="mt-1 text-2xs text-rose" role="alert">
                    {errors.referralCode}
                  </p>
                )}
              </div>

              {/* Error notice */}
              {submitError && (
                <div
                  className="p-3 rounded-xl bg-rose/10 border border-rose/30 text-rose text-xs leading-relaxed"
                  role="alert"
                  aria-live="polite"
                >
                  {submitError}
                </div>
              )}

              {/* Submit CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-rose w-full text-sm font-bold !py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  id="registration-submit"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Securing Your Seat…
                    </span>
                  ) : (
                    'Confirm My Free Seat →'
                  )}
                </button>
              </div>

              {/* Privacy Notice */}
              <p className="text-[11px] text-center text-text-tertiary leading-normal pt-2">
                🔒 Privacy Guarantee: We only use your information to reserve your workshop seat and send join links. Never shared with third parties.
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default RegistrationPage;
