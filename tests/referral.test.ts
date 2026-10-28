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
});
