import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeDashboardMetrics } from '../src/data/demoData.ts';
import type { Registration } from '../src/types/index.ts';

describe('Campaign Budget & Analytics Calculations', () => {
  const sampleRegistrations: Registration[] = [
    {
      id: 'reg-101',
      name: 'Aditi Varma',
      email: 'aditi@cbit.ac.in',
      college: 'CBIT',
      graduationYear: '2026',
      referralCode: 'aditya-A1B2',
      projectId: 'resume-feedback',
      registeredAt: '2026-10-25T10:00:00Z',
      source: 'referral',
    },
    {
      id: 'reg-102',
      name: 'Karthik Raja',
      email: 'karthik@vce.ac.in',
      college: 'Vasavi',
      graduationYear: '2026',
      projectId: 'expense-analyzer',
      registeredAt: '2026-10-26T11:00:00Z',
      source: 'direct',
    },
  ];

  it('enforces maximum budget ceiling of ₹2,000', () => {
    const metrics = computeDashboardMetrics([]);
    assert.equal(metrics.budgetTotal, 2000, 'Maximum budget must be strictly ₹2,000');
    assert.ok(metrics.budgetSpent <= 2000, 'Budget spent cannot exceed maximum allowance');
    assert.ok(metrics.budgetSpent >= 0, 'Budget spent cannot be negative');

    const remaining = metrics.budgetTotal - metrics.budgetSpent;
    assert.equal(remaining, 2000 - metrics.budgetSpent);
  });

  it('computes 500 registration target pace accurately', () => {
    const metrics = computeDashboardMetrics(sampleRegistrations);
    assert.equal(metrics.target, 500, 'Target registrations must be strictly 500');
    assert.equal(metrics.campaignDays, 7, 'Campaign duration must be 7 days');
    assert.ok(metrics.totalRegistrations >= 15, 'Should include base cohort + added registrations');
  });

  it('accurately tallies acquisition sources without drop', () => {
    const metrics = computeDashboardMetrics(sampleRegistrations);
    const sum =
      metrics.bySource.direct +
      metrics.bySource.whatsapp +
      metrics.bySource.referral +
      metrics.bySource.organic;

    assert.equal(sum, metrics.totalRegistrations, 'Sum of all sources must equal total registrations');
  });

  it('aggregates top referral codes in leaderboard', () => {
    const metrics = computeDashboardMetrics(sampleRegistrations);
    assert.ok(Array.isArray(metrics.referralActivity));
    assert.ok(metrics.referralActivity.length > 0);
    // Leaderboard must be sorted in descending order of count
    for (let i = 0; i < metrics.referralActivity.length - 1; i++) {
      assert.ok(
        metrics.referralActivity[i].count >= metrics.referralActivity[i + 1].count,
        'Referral leaderboard must be descending'
      );
    }
  });
});
