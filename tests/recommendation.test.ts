import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getRecommendation, getProjectById } from '../src/lib/recommendation.ts';
import type { Interest, SkillLevel, Goal, ProjectId } from '../src/types/index.ts';

describe('Project Recommendation Engine', () => {
  const interests: Interest[] = ['real-world', 'tools', 'data', 'content'];
  const skills: SkillLevel[] = ['beginner', 'some-python', 'small-project'];
  const goals: Goal[] = ['learn-basics', 'practical-problem', 'portfolio'];
  const validProjectIds: ProjectId[] = [
    'resume-feedback',
    'expense-analyzer',
    'notes-summarizer',
    'faq-assistant',
  ];

  it('returns null if any question is unanswered', () => {
    assert.equal(
      getRecommendation({ interest: null, skill: 'beginner', goal: 'learn-basics' }),
      null
    );
    assert.equal(
      getRecommendation({ interest: 'real-world', skill: null, goal: 'learn-basics' }),
      null
    );
    assert.equal(
      getRecommendation({ interest: 'real-world', skill: 'beginner', goal: null }),
      null
    );
  });

  it('deterministically recommends a valid project for all 36 answer combinations', () => {
    let count = 0;
    for (const interest of interests) {
      for (const skill of skills) {
        for (const goal of goals) {
          count++;
          const rec = getRecommendation({ interest, skill, goal });
          assert.ok(rec, `Expected recommendation for ${interest}-${skill}-${goal}`);
          assert.ok(
            validProjectIds.includes(rec.id),
            `Invalid project id ${rec.id} for ${interest}-${skill}-${goal}`
          );
          assert.ok(rec.name.length > 5, 'Project name must be descriptive');
          assert.ok(rec.tagline.length > 10, 'Tagline must be informative');
          assert.equal(rec.starterTasks.length, 3, 'Must have exactly 3 realistic starter tasks');
          assert.ok(rec.sixtyMinScope.includes('60 minutes'), 'Scope must reference 60 minutes');
          assert.ok(rec.techStack.length >= 2, 'Tech stack must list technologies');
          assert.ok(rec.why.length > 20, 'Personalised why must be populated');
        }
      }
    }
    assert.equal(count, 36, 'Should test exactly 4 * 3 * 3 = 36 combinations');
  });

  it('verifies deterministic mapping for key user profiles', () => {
    // 1. Student wanting to work with data + python + practical problem -> expense-analyzer
    const dataRec = getRecommendation({
      interest: 'data',
      skill: 'some-python',
      goal: 'practical-problem',
    });
    assert.equal(dataRec?.id, 'expense-analyzer');

    // 2. Beginner wanting to learn basics + content -> notes-summarizer
    const notesRec = getRecommendation({
      interest: 'content',
      skill: 'beginner',
      goal: 'learn-basics',
    });
    assert.equal(notesRec?.id, 'notes-summarizer');

    // 3. Student wanting to solve real world practical problem -> resume-feedback
    const resumeRec = getRecommendation({
      interest: 'real-world',
      skill: 'some-python',
      goal: 'practical-problem',
    });
    assert.equal(resumeRec?.id, 'resume-feedback');

    // 4. Student wanting portfolio tool -> faq-assistant
    const faqRec = getRecommendation({
      interest: 'tools',
      skill: 'small-project',
      goal: 'portfolio',
    });
    assert.equal(faqRec?.id, 'faq-assistant');
  });

  it('loads valid project catalogue data by ID', () => {
    for (const id of validProjectIds) {
      const proj = getProjectById(id);
      assert.equal(proj.id, id);
      assert.ok(proj.starterTasks.length === 3);
    }
  });
});
