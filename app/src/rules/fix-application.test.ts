/**
 * Phase 1 Testing Infrastructure — Data-Driven
 *
 * Test cases are defined in rule-fixtures.ts (human-editable).
 * This file loops over them automatically.
 *
 * Batch 1A: Fix Application — exact output match per fixture
 * Batch 1B: Comment Injection — exact output match per fixture (when provided)
 * Batch 1C: E2E Tests — full pipeline on test-all-rules.css
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { analyze, applyFixes } from '../engine/index';
import { resetIssueCounter } from './utils';
import type { SessionConfig, Issue } from '../types';
import { ruleFixtures } from './rule-fixtures';
import * as fs from 'node:fs';
import * as path from 'node:path';

const defaultConfig: SessionConfig = {
  rules: {},
  groups: {
    modern: { enabled: true, severity: null },
    consolidation: { enabled: true, severity: null },
    format: { enabled: true, severity: null },
    tokens: { enabled: true, severity: null },
    safety: { enabled: true, severity: null },
    education: { enabled: true, severity: null },
  },
};

/**
 * Helper: analyze CSS, filter to a specific rule, apply all its fixes
 */
function analyzeAndApply(
  input: string,
  ruleId: string,
  includeComments: boolean
): { css: string; issues: Issue[] } {
  const result = analyze(input, defaultConfig);
  const issues = result.issues.filter((i) => i.rule_id === ruleId);
  const fixIds = issues.filter((i) => i.fix).map((i) => i.fix!.id);

  if (fixIds.length === 0) {
    return { css: input, issues };
  }

  const applied = applyFixes(input, issues, fixIds, includeComments);
  return { css: applied.css, issues };
}

// Group fixtures by ruleId for readable test output
const fixturesByRule = new Map<string, typeof ruleFixtures>();
for (const f of ruleFixtures) {
  const group = fixturesByRule.get(f.ruleId) || [];
  group.push(f);
  fixturesByRule.set(f.ruleId, group);
}

// ============================================================================
// Batch 1A: Fix Application Tests (data-driven)
// ============================================================================

describe('Batch 1A: Fix Application Tests', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  for (const [ruleId, fixtures] of fixturesByRule) {
    describe(ruleId, () => {
      for (const fixture of fixtures) {
        it(fixture.description, () => {
          resetIssueCounter();
          const { css } = analyzeAndApply(fixture.input, fixture.ruleId, false);
          expect(css).toBe(fixture.expectedOutput);
        });
      }
    });
  }
});

// ============================================================================
// Batch 1B: Comment Injection Tests (data-driven)
// ============================================================================

describe('Batch 1B: Comment Injection Tests', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  for (const [ruleId, fixtures] of fixturesByRule) {
    // Only include fixtures that have expectedWithComment
    const commentFixtures = fixtures.filter((f) => f.expectedWithComment !== null);
    if (commentFixtures.length === 0) continue;

    describe(ruleId, () => {
      for (const fixture of commentFixtures) {
        it(`${fixture.description} (with comment)`, () => {
          resetIssueCounter();
          const { css } = analyzeAndApply(fixture.input, fixture.ruleId, true);
          expect(css).toBe(fixture.expectedWithComment);
        });
      }
    });
  }
});

// ============================================================================
// Batch 1C: E2E Snapshot Tests
// ============================================================================

describe('Batch 1C: E2E Snapshot Tests', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  it('analyzes test-all-rules.css and detects issues from multiple rules', () => {
    const testFile = path.resolve(__dirname, '../../../tests/test-all-rules.css');
    const input = fs.readFileSync(testFile, 'utf-8');
    const result = analyze(input, defaultConfig);

    expect(result.issues.length).toBeGreaterThan(0);

    const ruleIds = new Set(result.issues.map((i) => i.rule_id));

    // These rules should definitely trigger based on the test file contents
    expect(ruleIds.has('format/no-tabs')).toBe(true);
    expect(ruleIds.has('format/indent-2-spaces')).toBe(true);
    expect(ruleIds.has('format/multiple-declarations-per-line')).toBe(true);
    expect(ruleIds.has('tokens/zero-units')).toBe(true);
    expect(ruleIds.has('tokens/shorten-hex-colors')).toBe(true);
    expect(ruleIds.has('tokens/remove-trailing-zeros')).toBe(true);
    expect(ruleIds.has('format/normalize-spaces')).toBe(true);
  });

  it('applies non-conflicting safe fixes successfully', () => {
    const testFile = path.resolve(__dirname, '../../../tests/test-all-rules.css');
    const input = fs.readFileSync(testFile, 'utf-8');
    const result = analyze(input, defaultConfig);

    // Exclude block-level rules that conflict with in-block fixes:
    // - single-prop-single-line replaces entire blocks, overlapping with individual fixes
    // - sort-properties replaces block contents, conflicting with multiple-declarations
    const blockLevelRules = new Set([
      'format/single-prop-single-line',
      'format/sort-properties',
    ]);
    const safeFixIds = result.issues
      .filter((i) => i.fixability === 'safe' && i.fix && !blockLevelRules.has(i.rule_id))
      .map((i) => i.fix!.id);

    expect(safeFixIds.length).toBeGreaterThan(0);

    const applied = applyFixes(input, result.issues, safeFixIds, false);

    expect(typeof applied.css).toBe('string');
    expect(applied.css.length).toBeGreaterThan(0);
    expect(applied.applied_fixes.length).toBeGreaterThan(0);
  });

  it('detects conflicts when all safe fixes are applied at once', () => {
    const testFile = path.resolve(__dirname, '../../../tests/test-all-rules.css');
    const input = fs.readFileSync(testFile, 'utf-8');
    const result = analyze(input, defaultConfig);

    const safeFixIds = result.issues
      .filter((i) => i.fixability === 'safe' && i.fix)
      .map((i) => i.fix!.id);

    const applied = applyFixes(input, result.issues, safeFixIds, false);
    expect(applied.conflicts.length).toBeGreaterThan(0);
  });

  it('applies non-conflicting safe fixes with comments without crashing', () => {
    const testFile = path.resolve(__dirname, '../../../tests/test-all-rules.css');
    const input = fs.readFileSync(testFile, 'utf-8');
    const result = analyze(input, defaultConfig);

    const blockLevelRules = new Set([
      'format/single-prop-single-line',
      'format/sort-properties',
    ]);
    const safeFixIds = result.issues
      .filter((i) => i.fixability === 'safe' && i.fix && !blockLevelRules.has(i.rule_id))
      .map((i) => i.fix!.id);

    const applied = applyFixes(input, result.issues, safeFixIds, true);

    expect(typeof applied.css).toBe('string');
    expect(applied.css.length).toBeGreaterThan(0);
  });

  it('applying individual rule fixes produces valid CSS structure', () => {
    // Use a subset of fixtures for structural validation
    const structuralCases = ruleFixtures.filter((f) =>
      [
        'format/no-tabs',
        'format/normalize-spaces',
        'format/single-prop-single-line',
        'tokens/zero-units',
        'tokens/shorten-hex-colors',
        'tokens/remove-trailing-zeros',
        'modern/prefer-hex-colors',
      ].includes(f.ruleId)
    );

    for (const fixture of structuralCases) {
      resetIssueCounter();
      const { css } = analyzeAndApply(fixture.input, fixture.ruleId, false);

      const openBraces = (css.match(/\{/g) || []).length;
      const closeBraces = (css.match(/\}/g) || []).length;
      expect(openBraces).toBe(closeBraces);
      expect(css).toMatch(/\./);
    }
  });

  it('deterministic output: same input produces same output', () => {
    const input = '.card {\n  margin: 0px;\n  color: #ffffff;\n}';

    resetIssueCounter();
    const result1 = analyze(input, defaultConfig);
    const fixIds1 = result1.issues.filter((i) => i.fix).map((i) => i.fix!.id);
    const output1 = applyFixes(input, result1.issues, fixIds1, false);

    resetIssueCounter();
    const result2 = analyze(input, defaultConfig);
    const fixIds2 = result2.issues.filter((i) => i.fix).map((i) => i.fix!.id);
    const output2 = applyFixes(input, result2.issues, fixIds2, false);

    expect(output1.css).toBe(output2.css);
  });
});
