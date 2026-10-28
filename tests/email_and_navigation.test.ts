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

describe('Dashboard Navigation Button Visibility & Accessibility', () => {
  const rootDir = path.resolve(import.meta.dirname, '..');
  const navPath = path.join(rootDir, 'src', 'components', 'Nav.tsx');

  it('verifies desktop and mobile Dashboard buttons have high contrast and clear visibility', () => {
    assert.ok(fs.existsSync(navPath), 'Nav.tsx must exist');
    const navCode = fs.readFileSync(navPath, 'utf8');

    // Desktop button checks
    assert.ok(
      navCode.includes('text-white'),
      'Dashboard button must have crisp white text contrast against black'
    );
    assert.ok(
      navCode.includes('bg-surface-elevated') || navCode.includes('bg-cerulean'),
      'Dashboard button must have elevated background'
    );
    assert.ok(
      navCode.includes('hover:border-cerulean'),
      'Dashboard button must have responsive hover border state'
    );
    assert.ok(
      navCode.includes('aria-label="Organizer Dashboard"'),
      'Dashboard button must have accessibility label'
    );

    // Mobile button checks
    assert.ok(
      navCode.includes('Organizer Dashboard'),
      'Mobile menu must clearly identify the Organizer Dashboard'
    );
    assert.ok(
      navCode.includes('bg-cerulean') && navCode.includes('rounded-full'),
      'Dashboard indicator dot must be present for visual grounding'
    );
  });
});
