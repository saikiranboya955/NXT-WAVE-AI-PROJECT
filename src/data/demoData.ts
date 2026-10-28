import type { DashboardMetrics, Registration, AcquisitionSource } from '../types';

// ─── Demo data — clearly labelled, never presented as real activity ───────────

export const DEMO_REGISTRATIONS: Registration[] = [
  { id: 'demo-1', name: 'Aditya Kumar', email: 'aditya@example.com', college: 'NIT Warangal', graduationYear: '2026', referralCode: 'aditya-A1B2', projectId: 'resume-feedback', registeredAt: '2026-10-21T08:15:00Z', source: 'direct' },
  { id: 'demo-2', name: 'Priya Sharma', email: 'priya@example.com', college: 'BITS Pilani', graduationYear: '2026', referralCode: 'priya-C3D4', projectId: 'notes-summarizer', registeredAt: '2026-10-21T09:30:00Z', source: 'whatsapp' },
  { id: 'demo-3', name: 'Rohan Das', email: 'rohan@example.com', college: 'VIT Vellore', graduationYear: '2027', referralCode: undefined, projectId: 'expense-analyzer', registeredAt: '2026-10-21T11:00:00Z', source: 'organic' },
  { id: 'demo-4', name: 'Sneha Reddy', email: 'sneha@example.com', college: 'JNTU Hyderabad', graduationYear: '2026', referralCode: 'aditya-A1B2', projectId: 'faq-assistant', registeredAt: '2026-10-22T07:45:00Z', source: 'referral' },
  { id: 'demo-5', name: 'Vikram Patel', email: 'vikram@example.com', college: 'IIT Bombay', graduationYear: '2026', referralCode: undefined, projectId: 'resume-feedback', registeredAt: '2026-10-22T10:20:00Z', source: 'direct' },
  { id: 'demo-6', name: 'Anjali Singh', email: 'anjali@example.com', college: 'DTU Delhi', graduationYear: '2027', referralCode: 'priya-C3D4', projectId: 'notes-summarizer', registeredAt: '2026-10-22T14:00:00Z', source: 'referral' },
  { id: 'demo-7', name: 'Kiran Mehta', email: 'kiran@example.com', college: 'SRM Chennai', graduationYear: '2026', referralCode: undefined, projectId: 'expense-analyzer', registeredAt: '2026-10-23T09:10:00Z', source: 'whatsapp' },
  { id: 'demo-8', name: 'Nisha Gupta', email: 'nisha@example.com', college: 'Manipal University', graduationYear: '2027', referralCode: 'aditya-A1B2', projectId: 'resume-feedback', registeredAt: '2026-10-23T12:35:00Z', source: 'referral' },
  { id: 'demo-9', name: 'Arjun Nair', email: 'arjun@example.com', college: 'NIT Calicut', graduationYear: '2026', referralCode: undefined, projectId: 'faq-assistant', registeredAt: '2026-10-24T08:50:00Z', source: 'organic' },
  { id: 'demo-10', name: 'Divya Rao', email: 'divya@example.com', college: 'Symbiosis Pune', graduationYear: '2026', referralCode: 'kiran-E5F6', projectId: 'notes-summarizer', registeredAt: '2026-10-24T16:20:00Z', source: 'referral' },
  { id: 'demo-11', name: 'Amit Tiwari', email: 'amit@example.com', college: 'IIIT Allahabad', graduationYear: '2026', referralCode: undefined, projectId: 'resume-feedback', registeredAt: '2026-10-25T09:00:00Z', source: 'direct' },
  { id: 'demo-12', name: 'Meera Iyer', email: 'meera@example.com', college: 'PSG Coimbatore', graduationYear: '2027', referralCode: 'priya-C3D4', projectId: 'expense-analyzer', registeredAt: '2026-10-25T11:45:00Z', source: 'referral' },
  { id: 'demo-13', name: 'Siddharth Joshi', email: 'sid@example.com', college: 'MH Pune', graduationYear: '2026', referralCode: undefined, projectId: 'faq-assistant', registeredAt: '2026-10-26T08:30:00Z', source: 'whatsapp' },
  { id: 'demo-14', name: 'Pooja Verma', email: 'pooja@example.com', college: 'Amity Noida', graduationYear: '2026', referralCode: 'aditya-A1B2', projectId: 'resume-feedback', registeredAt: '2026-10-26T13:15:00Z', source: 'referral' },
  { id: 'demo-15', name: 'Rahul Bhatt', email: 'rahul@example.com', college: 'BIT Mesra', graduationYear: '2026', referralCode: undefined, projectId: 'notes-summarizer', registeredAt: '2026-10-27T07:00:00Z', source: 'organic' },
];

export const DEMO_BUDGET_SPENT = 840; // ₹ of ₹2,000

// ─── Analytics calculations ────────────────────────────────────────────────────

export function computeDashboardMetrics(registrations: Registration[]): DashboardMetrics {
  const allReg = [...DEMO_REGISTRATIONS, ...registrations];

  const bySource = allReg.reduce<Record<AcquisitionSource, number>>(
    (acc, r) => {
      acc[r.source] = (acc[r.source] ?? 0) + 1;
      return acc;
    },
    { direct: 0, whatsapp: 0, referral: 0, organic: 0 }
  );

  // Build daily trend for 7 campaign days (Oct 21–27)
  const days = ['Oct 21', 'Oct 22', 'Oct 23', 'Oct 24', 'Oct 25', 'Oct 26', 'Oct 27'];
  const dayMap: Record<string, number> = {};
  days.forEach((d) => (dayMap[d] = 0));

  allReg.forEach((r) => {
    const date = new Date(r.registeredAt);
    const label = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    if (dayMap[label] !== undefined) dayMap[label]++;
  });

  const dailyTrend = days.map((day) => ({ day, count: dayMap[day] }));

  // Referral leaderboard
  const refCounts: Record<string, number> = {};
  allReg.forEach((r) => {
    if (r.referralCode) refCounts[r.referralCode] = (refCounts[r.referralCode] ?? 0) + 1;
  });
  const referralActivity = Object.entries(refCounts)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalRegistrations: allReg.length,
    target: 500,
    campaignDays: 7,
    budgetTotal: 2000,
    budgetSpent: DEMO_BUDGET_SPENT,
    bySource,
    dailyTrend,
    funnel: {
      landingPageViews: 480, // labelled DEMO in UI
      finderCompletions: 62,
      registrations: allReg.length,
    },
    referralActivity,
  };
}
