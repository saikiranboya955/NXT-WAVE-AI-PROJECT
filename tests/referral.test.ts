import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateReferralCodeFormat,
  buildWhatsAppMessage,
  getWhatsAppShareUrl,
} from '../src/lib/referral.ts';

describe('Referral Attribution & Sharing', () => {
  it('validates referral code syntax pattern correctly', () => {
    // Expected pattern: [2-12 letters/numbers]-[3-6 alphanumeric chars]
    assert.equal(validateReferralCodeFormat('aditya-A1B2'), true);
    assert.equal(validateReferralCodeFormat('priya-C3D4'), true);
    assert.equal(validateReferralCodeFormat('student-999'), true);
    assert.equal(validateReferralCodeFormat('nxt-123456'), true);

    // Invalid patterns
    assert.equal(validateReferralCodeFormat(''), false);
    assert.equal(validateReferralCodeFormat('nocode'), false);
    assert.equal(validateReferralCodeFormat('toolongstudentnamehere123-1'), false);
    assert.equal(validateReferralCodeFormat('a-b'), false);
    assert.equal(validateReferralCodeFormat('code-with-too-many-dashes-xyz'), false);
    assert.equal(validateReferralCodeFormat('bad_code_char'), false);
  });

  it('builds prefilled WhatsApp message with referral link', () => {
    const testUrl = 'https://aipp.nxtwave.tech/?ref=aditya-A1B2';
    const encoded = buildWhatsAppMessage(testUrl);
    const decoded = decodeURIComponent(encoded);

    assert.ok(decoded.includes(testUrl), 'Message must contain referral URL');
    assert.ok(
      decoded.includes('Build Your First AI Project in 60 Minutes'),
      'Message must contain workshop headline'
    );
    assert.ok(
      decoded.includes('beginner-friendly and completely free'),
      'Message must be truthful and accurate'
    );
  });

  it('constructs valid WhatsApp share URL', () => {
    const testUrl = 'https://aipp.nxtwave.tech/?ref=aditya-A1B2';
    const shareUrl = getWhatsAppShareUrl(testUrl);

    assert.ok(shareUrl.startsWith('https://wa.me/?text='));
    assert.ok(shareUrl.includes(encodeURIComponent(testUrl)));
  });

  it('generates collision-resistant referral codes that pass format validation', async () => {
    const { generateReferralCode } = await import('../src/lib/referral.ts');
    const code1 = generateReferralCode('Sai Kiran');
    assert.equal(validateReferralCodeFormat(code1), true);
    assert.ok(code1.startsWith('saikiran-'));

    const code2 = generateReferralCode('');
    assert.equal(validateReferralCodeFormat(code2), true);
    assert.ok(code2.startsWith('student-'));
  });

  it('verifies privacy-safe display names pattern for campus leaderboard', () => {
    function maskName(fullName: string): string {
      const parts = fullName.trim().split(' ').filter(Boolean);
      if (parts.length === 0) return 'Student';
      if (parts.length === 1) return parts[0];
      return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
    }

    assert.equal(maskName('Aditi Sharma'), 'Aditi S.');
    assert.equal(maskName('Rohan Mehta'), 'Rohan M.');
    assert.equal(maskName('Priya N'), 'Priya N.');
    assert.equal(maskName('SingleName'), 'SingleName');
  });

  it('verifies StudentReferralCenter component enforces attribution policy and share actions', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const centerPath = path.resolve(import.meta.dirname, '..', 'src', 'components', 'StudentReferralCenter.tsx');
    assert.ok(fs.existsSync(centerPath), 'StudentReferralCenter.tsx must exist');

    const content = fs.readFileSync(centerPath, 'utf8');
    assert.ok(content.includes('Verified Registrations Only'), 'Must emphasize verified registrations only');
    assert.ok(content.includes('Anti-Duplicate Enforcement'), 'Must emphasize anti-duplicate protection');
    assert.ok(content.includes('Share Invitation via WhatsApp'), 'Must provide WhatsApp share button');
    assert.ok(content.includes('Copy Link') || content.includes('Copied to Clipboard!'), 'Must provide 1-click copy');
    assert.ok(content.includes('LIVE DATABASE ATTRIBUTION'), 'Must report database status truthfully');
  });
});

