import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateRegistration,
  hasErrors,
  makeRegistration,
  GRADUATION_YEARS,
} from '../src/lib/validation.ts';

describe('Registration Form Validation', () => {
  const validData = {
    name: 'Suresh Kumar',
    email: 'suresh@engg.edu',
    college: 'Chaitanya Bharathi Institute of Technology',
    graduationYear: '2026',
    referralCode: '',
  };

  it('passes validation with clean, complete data', () => {
    const errors = validateRegistration(validData);
    assert.equal(hasErrors(errors), false);
    assert.deepEqual(errors, {});
  });

  it('rejects empty or whitespace-only name', () => {
    const resEmpty = validateRegistration({ ...validData, name: '' });
    assert.ok(resEmpty.name);

    const resWhitespace = validateRegistration({ ...validData, name: '   ' });
    assert.ok(resWhitespace.name);

    const resTooShort = validateRegistration({ ...validData, name: 'A' });
    assert.ok(resTooShort.name?.includes('at least 2 characters'));
  });

  it('rejects invalid email formats', () => {
    const invalidEmails = [
      'plainaddress',
      '@missingusername.com',
      'username@.com',
      'username@domain..com',
      'user name@domain.com',
    ];

    for (const email of invalidEmails) {
      const errors = validateRegistration({ ...validData, email });
      assert.ok(errors.email, `Expected email error for: ${email}`);
    }
  });

  it('accepts valid academic and personal emails', () => {
    const validEmails = [
      'student@iitb.ac.in',
      'user.name+filter@gmail.com',
      'test_123@college.edu',
    ];

    for (const email of validEmails) {
      const errors = validateRegistration({ ...validData, email });
      assert.equal(errors.email, undefined);
    }
  });

  it('enforces college name length restrictions', () => {
    const errorsShort = validateRegistration({ ...validData, college: 'AB' });
    assert.ok(errorsShort.college);

    const errorsValid = validateRegistration({ ...validData, college: 'BITS Pilani' });
    assert.equal(errorsValid.college, undefined);
  });

  it('restricts graduation year strictly to 2025, 2026, 2027, 2028', () => {
    for (const year of GRADUATION_YEARS) {
      const errors = validateRegistration({ ...validData, graduationYear: year });
      assert.equal(errors.graduationYear, undefined, `Expected valid year: ${year}`);
    }

    const invalidYears = ['2020', '2024', '2029', '2030', 'final year'];
    for (const year of invalidYears) {
      const errors = validateRegistration({ ...validData, graduationYear: year });
      assert.ok(errors.graduationYear, `Expected rejection for year: ${year}`);
    }
  });

  it('validates referral code format when provided', () => {
    // Valid format: [2-12 letters/numbers]-[3-6 alphanumeric chars]
    const validCodes = ['aditya-A1B2', 'kiran-1234', 'nxt-XYZ', 'rahul12-ABCD'];
    for (const code of validCodes) {
      const errors = validateRegistration({ ...validData, referralCode: code });
      assert.equal(errors.referralCode, undefined, `Expected code to be valid: ${code}`);
    }

    const invalidCodes = ['code', 'toolongstudentnamehere123-1', 'invalid@code', 'a-b'];
    for (const code of invalidCodes) {
      const errors = validateRegistration({ ...validData, referralCode: code });
      assert.ok(errors.referralCode, `Expected code to be rejected: ${code}`);
    }
  });

  it('normalizes email to lowercase and trims whitespace in makeRegistration', () => {
    const reg = makeRegistration(
      {
        ...validData,
        name: '  Suresh Kumar  ',
        email: '  SURESH.KUMAR@ENGG.EDU  ',
        college: '  CBIT Hyderabad  ',
        graduationYear: '2026',
        referralCode: '  aditya-A1B2  ',
      },
      'resume-feedback'
    );

    assert.equal(reg.name, 'Suresh Kumar');
    assert.equal(reg.email, 'suresh.kumar@engg.edu');
    assert.equal(reg.college, 'CBIT Hyderabad');
    assert.equal(reg.referralCode, 'aditya-A1B2');
    assert.equal(reg.source, 'referral');
    assert.equal(reg.projectId, 'resume-feedback');
  });
});
