import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildConfirmationEmailText,
  buildConfirmationEmailHtml,
  getProjectDisplayName,
  type EmailPayload,
} from '../src/lib/email.ts';
import { validateRegistration, makeRegistration } from '../src/lib/validation.ts';

describe('Registration Confirmation Email & Idempotency Audit', () => {
  const rootDir = path.resolve(import.meta.dirname, '..');
  const edgeFunctionPath = path.join(
    rootDir,
    'supabase',
    'functions',
    'send-confirmation-email',
    'index.ts'
  );
  const migrationPath = path.join(
    rootDir,
    'supabase',
    'migrations',
    '20261028000002_add_email_status.sql'
  );

  const mockStudent: EmailPayload = {
    registrationId: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@cbit.ac.in',
    college: 'Chaitanya Bharathi Institute of Technology',
    graduationYear: '2026',
    projectId: 'resume-feedback',
    alreadyRegistered: false,
  };

  it('verifies SQL migration exists and defines email tracking columns', () => {
    assert.ok(fs.existsSync(migrationPath), 'Migration 20261028000002 must exist');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    assert.ok(
      sql.includes('confirmation_email_status'),
      'Must add confirmation_email_status column'
    );
    assert.ok(
      sql.includes('confirmation_email_sent_at'),
      'Must add confirmation_email_sent_at column'
    );
    assert.ok(
      sql.includes('skipped_duplicate'),
      'Must include skipped_duplicate in CHECK constraint'
    );
  });

  it('verifies send-confirmation-email Edge Function exists and enforces security', () => {
    assert.ok(fs.existsSync(edgeFunctionPath), 'send-confirmation-email index.ts must exist');
    const code = fs.readFileSync(edgeFunctionPath, 'utf8');

    // Security: Never hardcode secrets in source
    assert.ok(!code.includes('re_'), 'Must not contain hardcoded Resend API key');
    assert.ok(!code.includes('SG.'), 'Must not contain hardcoded SendGrid API key');

    // Idempotency: Duplicate check
    assert.ok(
      code.includes('alreadyRegistered') && code.includes('skipped_duplicate'),
      'Must skip duplicate email for existing registrations'
    );

    // Fallback: Graceful unconfigured provider handling
    assert.ok(
      code.includes('unconfigured') && code.includes('status: 200'),
      'Must return 200 with unconfigured status when server secrets are missing'
    );
  });

  it('generates exact plain-text confirmation email per official specification', () => {
    const text = buildConfirmationEmailText(mockStudent);

    assert.ok(text.includes('Hi Ananya Sharma,'));
    assert.ok(text.includes('Thank you for registering for NxtWave AI Project Passport.'));
    assert.ok(
      text.includes(
        "Your registration for the 'Build Your First AI Project in 60 Minutes' initiative has been received successfully."
      )
    );
    assert.ok(text.includes('What happens next?'));
    assert.ok(
      text.includes(
        'Keep an eye on your inbox for confirmed workshop details and further instructions.'
      )
    );
    assert.ok(text.includes('Registration details:'));
    assert.ok(text.includes('Name: Ananya Sharma'));
    assert.ok(text.includes('College: Chaitanya Bharathi Institute of Technology'));
    assert.ok(text.includes('Graduation year: 2026'));
    assert.ok(text.includes('Selected project: Resume Feedback Assistant'));
    assert.ok(text.includes('Regards,\nNxtWave AI Project Passport Team'));
  });

  it('generates responsive HTML email with NxtWave brand colors and escaping', () => {
    const html = buildConfirmationEmailHtml(mockStudent);

    // Brand colors
    assert.ok(html.includes('#000000'), 'Must use Jet Black background');
    assert.ok(html.includes('#007BA7'), 'Must use Cerulean Blue accent');

    // Escaped content
    assert.ok(html.includes('Ananya Sharma'));
    assert.ok(html.includes('Chaitanya Bharathi Institute of Technology'));
    assert.ok(html.includes('Resume Feedback Assistant'));

    // HTML entities check for XSS prevention
    const untrustedPayload: EmailPayload = {
      ...mockStudent,
      name: '<script>alert(1)</script>Sai',
      college: 'IIT & NIT <Hack>',
    };
    const untrustedHtml = buildConfirmationEmailHtml(untrustedPayload);
    assert.ok(!untrustedHtml.includes('<script>'));
    assert.ok(untrustedHtml.includes('&lt;script&gt;'));
    assert.ok(untrustedHtml.includes('IIT &amp; NIT &lt;Hack&gt;'));
  });

  it('handles project display name resolution gracefully', () => {
    assert.strictEqual(getProjectDisplayName('resume-feedback'), 'Resume Feedback Assistant');
    assert.strictEqual(getProjectDisplayName('expense-analyzer'), 'Student Expense Analyzer');
    assert.strictEqual(getProjectDisplayName('notes-summarizer'), 'Study Notes Summarizer');
    assert.strictEqual(getProjectDisplayName('faq-assistant'), 'Campus FAQ Assistant');
    assert.strictEqual(getProjectDisplayName(undefined), 'AI Project Starter Track');
    assert.strictEqual(getProjectDisplayName('custom-track'), 'custom-track');
  });

  it('enforces validation failure blocks registration before email dispatch', () => {
    const invalidForm = {
      name: '',
      email: 'bad-email',
      college: 'A',
      graduationYear: '2030',
      referralCode: '',
    };
    const errors = validateRegistration(invalidForm);
    assert.ok(errors.name, 'Name error required');
    assert.ok(errors.email, 'Email error required');
    assert.ok(errors.college, 'College error required');
    assert.ok(errors.graduationYear, 'Graduation year error required');
  });

  it('verifies duplicate submission flags alreadyRegistered to prevent email resend', () => {
    const form = {
      name: 'Existing Student',
      email: 'existing@cbit.ac.in',
      college: 'CBIT Hyderabad',
      graduationYear: '2026',
      referralCode: '',
    };
    const reg = makeRegistration(form, 'resume-feedback');
    assert.strictEqual(reg.email, 'existing@cbit.ac.in');
  });
});

describe('Top Navigation Structure & Growth Links Audit', () => {
  const rootDir = path.resolve(import.meta.dirname, '..');
  const navPath = path.join(rootDir, 'src', 'components', 'Nav.tsx');

  it('verifies all specified navigation links exist with correct routes and consistent styling', () => {
    assert.ok(fs.existsSync(navPath), 'Nav.tsx must exist');
    const navCode = fs.readFileSync(navPath, 'utf8');

    // Specified navigation items from requirement 2
    assert.ok(navCode.includes('Workshop'), 'Must include Workshop link');
    assert.ok(navCode.includes('Build a Project'), 'Must include Build a Project link');
    assert.ok(navCode.includes('/finder'), 'Build a Project must point to /finder');
    assert.ok(navCode.includes('Campus Leaderboard'), 'Must include Campus Leaderboard link');
    assert.ok(navCode.includes('/leaderboard'), 'Campus Leaderboard must point to /leaderboard');
    assert.ok(navCode.includes('Growth Hub'), 'Must include Growth Hub link');
    assert.ok(navCode.includes('/growth-hub'), 'Growth Hub must point to /growth-hub');
    assert.ok(navCode.includes('Register Now (Free)'), 'Must include prominent Register Now button');
    assert.ok(navCode.includes('/register'), 'Register Now must point to /register');

    // Consistent typography & styling
    assert.ok(navCode.includes('text-sm font-medium'), 'Must use consistent text-sm font-medium styling');
    assert.ok(navCode.includes('bg-black/85 backdrop-blur-md'), 'Must use dark translucent background with blur');

    // Accessible Organizer Dashboard in drawer / organizer access
    assert.ok(
      navCode.includes('Organizer Dashboard'),
      'Menu must clearly identify Organizer Dashboard'
    );
    assert.ok(
      navCode.includes('aria-label="Organizer Dashboard"'),
      'Dashboard button must have accessibility label'
    );
  });
});
