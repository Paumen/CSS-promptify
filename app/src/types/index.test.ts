import { describe, it, expect } from 'vitest';
import { hasSafeFix, hasLLMPrompt, validateIssue } from './index';
import type { Issue } from './index';

describe('Type Guards', () => {
  const baseIssue: Omit<Issue, 'fixability' | 'fix' | 'llm_prompt'> = {
    id: 'test-issue-1',
    rule_id: 'test/rule',
    group: 'format',
    severity: 'warning',
    message: 'Test issue',
    location: {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 10 },
    },
    logic: {
      what: 'Test detection',
      why: 'Test reason',
      when_safe: 'Always',
    },
  };

  it('hasSafeFix returns true for issues with safe fixes', () => {
    const issue: Issue = {
      ...baseIssue,
      fixability: 'safe',
      fix: {
        id: 'fix-1',
        kind: 'patch_set',
        preview: 'test',
        patches: [{
          op: 'replace_range',
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
          text: 'replaced',
        }],
        comment: {
          enabled_by_ui: false,
          style: 'end_of_line',
          text: 'test comment',
        },
      },
    };

    expect(hasSafeFix(issue)).toBe(true);
  });

  it('hasSafeFix returns false for prompt issues', () => {
    const issue: Issue = {
      ...baseIssue,
      fixability: 'prompt',
      llm_prompt: {
        id: 'prompt-1',
        title: 'Test prompt',
        format: 'text',
        copy_text: 'Test prompt text',
      },
    };

    expect(hasSafeFix(issue)).toBe(false);
  });

  it('hasLLMPrompt returns true for prompt issues', () => {
    const issue: Issue = {
      ...baseIssue,
      fixability: 'prompt',
      llm_prompt: {
        id: 'prompt-1',
        title: 'Test prompt',
        format: 'text',
        copy_text: 'Test prompt text',
      },
    };

    expect(hasLLMPrompt(issue)).toBe(true);
  });
});

describe('validateIssue', () => {
  const baseIssue: Omit<Issue, 'fixability' | 'fix' | 'llm_prompt'> = {
    id: 'test-issue-1',
    rule_id: 'test/rule',
    group: 'format',
    severity: 'warning',
    message: 'Test issue',
    location: {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 10 },
    },
    logic: {
      what: 'Test detection',
      why: 'Test reason',
      when_safe: 'Always',
    },
  };

  it('returns no errors for valid safe fix issue', () => {
    const issue: Issue = {
      ...baseIssue,
      fixability: 'safe',
      fix: {
        id: 'fix-1',
        kind: 'patch_set',
        preview: 'test',
        patches: [{
          op: 'replace_range',
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
          text: 'replaced',
        }],
        comment: {
          enabled_by_ui: false,
          style: 'end_of_line',
          text: 'test comment',
        },
      },
    };

    expect(validateIssue(issue)).toEqual([]);
  });

  it('returns error when safe fix is missing fix', () => {
    const issue: Issue = {
      ...baseIssue,
      fixability: 'safe',
    };

    const errors = validateIssue(issue);
    expect(errors).toContain('fixability=safe requires fix to be present');
  });

  it('returns error when none fixability has fix', () => {
    const issue: Issue = {
      ...baseIssue,
      fixability: 'none',
      fix: {
        id: 'fix-1',
        kind: 'patch_set',
        preview: 'test',
        patches: [{
          op: 'replace_range',
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
          text: 'replaced',
        }],
        comment: {
          enabled_by_ui: false,
          style: 'end_of_line',
          text: 'test comment',
        },
      },
    };

    const errors = validateIssue(issue);
    expect(errors).toContain('fixability=none must not have fix');
  });
});
