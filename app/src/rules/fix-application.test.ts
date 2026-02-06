/**
 * Phase 1 Testing Infrastructure
 *
 * Batch 1A: Fix Application Tests - verifies applyFixes() produces correct CSS output
 * Batch 1B: Comment Injection Tests - verifies comments are placed correctly
 * Batch 1C: E2E Snapshot Tests - full pipeline test with test-all-rules.css
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { analyze, applyFixes } from '../engine/index';
import { resetIssueCounter } from './utils';
import type { SessionConfig, Issue } from '../types';
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

// ============================================================================
// Batch 1A: Fix Application Tests
// Verifies that applyFixes() produces correct CSS for each rule
// ============================================================================

describe('Batch 1A: Fix Application Tests', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  describe('format/no-tabs', () => {
    it('replaces tabs with 2 spaces', () => {
      const input = '.card {\n\tpadding: 8px;\n}';
      const expected = '.card {\n  padding: 8px;\n}';
      const { css } = analyzeAndApply(input, 'format/no-tabs', false);
      expect(css).toBe(expected);
    });

    it('replaces multiple tabs with correct spaces', () => {
      const input = '.card {\n\t\tpadding: 8px;\n}';
      const expected = '.card {\n    padding: 8px;\n}';
      const { css } = analyzeAndApply(input, 'format/no-tabs', false);
      expect(css).toBe(expected);
    });
  });

  describe('format/indent-2-spaces', () => {
    it('normalizes 3-space indent to 4 spaces', () => {
      const input = '.card {\n   padding: 8px;\n}';
      const expected = '.card {\n    padding: 8px;\n}';
      const { css } = analyzeAndApply(input, 'format/indent-2-spaces', false);
      expect(css).toBe(expected);
    });

    it('normalizes 1-space indent to 2 spaces', () => {
      const input = '.card {\n padding: 8px;\n}';
      const expected = '.card {\n  padding: 8px;\n}';
      const { css } = analyzeAndApply(input, 'format/indent-2-spaces', false);
      expect(css).toBe(expected);
    });
  });

  describe('format/multiple-declarations-per-line', () => {
    it('splits multiple declarations onto separate lines', () => {
      const input = '.card { padding: 8px; margin: 0; }';
      const { css } = analyzeAndApply(input, 'format/multiple-declarations-per-line', false);
      // Verify declarations are on separate lines
      expect(css).toContain('padding: 8px;');
      expect(css).toContain('margin: 0;');
      // Count that padding and margin are on different lines
      const lines = css.split('\n');
      const paddingLine = lines.findIndex((l) => l.includes('padding'));
      const marginLine = lines.findIndex((l) => l.includes('margin'));
      expect(paddingLine).not.toBe(marginLine);
    });
  });

  describe('format/normalize-spaces', () => {
    it('adds space after colon', () => {
      const input = '.card {\n  color:red;\n}';
      const expected = '.card {\n  color: red;\n}';
      const { css } = analyzeAndApply(input, 'format/normalize-spaces', false);
      expect(css).toBe(expected);
    });

    it('normalizes multiple spaces after colon', () => {
      const input = '.card {\n  color:   red;\n}';
      const { css } = analyzeAndApply(input, 'format/normalize-spaces', false);
      expect(css).toContain('color: red');
    });
  });

  describe('format/single-prop-single-line', () => {
    it('collapses multi-line single-property rule to one line', () => {
      const input = '.a {\n  color: #fff;\n}';
      const expected = '.a { color: #fff; }';
      const { css } = analyzeAndApply(input, 'format/single-prop-single-line', false);
      expect(css).toBe(expected);
    });
  });

  describe('format/sort-properties', () => {
    it('reorders properties to grouped order', () => {
      const input = '.box {\n  color: black;\n  display: flex;\n}';
      const { css, issues } = analyzeAndApply(input, 'format/sort-properties', false);
      expect(issues).toHaveLength(1);
      // display (Group 3) should come before color (Group 13)
      const displayIndex = css.indexOf('display');
      const colorIndex = css.indexOf('color');
      expect(displayIndex).toBeLessThan(colorIndex);
    });
  });

  describe('format/one-selector-per-line', () => {
    it('splits comma-separated selectors onto separate lines', () => {
      const input = '.sel-a, .sel-b { color: pink; }';
      const { css } = analyzeAndApply(input, 'format/one-selector-per-line', false);
      expect(css).toContain('.sel-a,\n.sel-b');
    });

    it('does not trigger on already-split selectors', () => {
      const input = '.sel-a,\n.sel-b { color: pink; }';
      const { issues } = analyzeAndApply(input, 'format/one-selector-per-line', false);
      expect(issues).toHaveLength(0);
    });
  });

  describe('tokens/zero-units', () => {
    it('removes unit from 0px', () => {
      const input = '.card {\n  margin: 0px;\n}';
      const expected = '.card {\n  margin: 0;\n}';
      const { css } = analyzeAndApply(input, 'tokens/zero-units', false);
      expect(css).toBe(expected);
    });

    it('removes units from multiple zero values', () => {
      const input = '.card {\n  margin: 0px 0em;\n}';
      const { css } = analyzeAndApply(input, 'tokens/zero-units', false);
      expect(css).toContain('margin: 0 0');
      expect(css).not.toContain('0px');
      expect(css).not.toContain('0em');
    });
  });

  describe('tokens/shorten-hex-colors', () => {
    it('shortens #ffffff to #fff', () => {
      const input = '.card {\n  color: #ffffff;\n}';
      const expected = '.card {\n  color: #fff;\n}';
      const { css } = analyzeAndApply(input, 'tokens/shorten-hex-colors', false);
      expect(css).toBe(expected);
    });

    it('shortens #aabbcc to #abc', () => {
      const input = '.card {\n  color: #aabbcc;\n}';
      const expected = '.card {\n  color: #abc;\n}';
      const { css } = analyzeAndApply(input, 'tokens/shorten-hex-colors', false);
      expect(css).toBe(expected);
    });
  });

  describe('tokens/remove-trailing-zeros', () => {
    it('removes trailing zeros from 0.50', () => {
      const input = '.card {\n  opacity: 0.50;\n}';
      const expected = '.card {\n  opacity: 0.5;\n}';
      const { css } = analyzeAndApply(input, 'tokens/remove-trailing-zeros', false);
      expect(css).toBe(expected);
    });

    it('removes trailing zeros from 1.0', () => {
      const input = '.card {\n  line-height: 1.0;\n}';
      const expected = '.card {\n  line-height: 1;\n}';
      const { css } = analyzeAndApply(input, 'tokens/remove-trailing-zeros', false);
      expect(css).toBe(expected);
    });
  });

  describe('consolidate/shorthand-margin-padding', () => {
    it('consolidates 4 margin longhands to shorthand', () => {
      const input = `.box {
  margin-top: 4px;
  margin-right: 8px;
  margin-bottom: 4px;
  margin-left: 8px;
}`;
      const { css } = analyzeAndApply(input, 'consolidate/shorthand-margin-padding', false);
      expect(css).toContain('margin: 4px 8px');
      expect(css).not.toContain('margin-top');
      expect(css).not.toContain('margin-right');
      expect(css).not.toContain('margin-bottom');
      expect(css).not.toContain('margin-left');
    });

    it('consolidates all-same values to single value', () => {
      const input = `.box {
  padding-top: 8px;
  padding-right: 8px;
  padding-bottom: 8px;
  padding-left: 8px;
}`;
      const { css } = analyzeAndApply(input, 'consolidate/shorthand-margin-padding', false);
      expect(css).toContain('padding: 8px');
    });
  });

  describe('consolidate/deduplicate-last-wins', () => {
    it('removes earlier duplicate property, keeping last', () => {
      const input = `.title {
  font-weight: 400;
  font-weight: 700;
}`;
      const { css } = analyzeAndApply(input, 'consolidate/deduplicate-last-wins', false);
      expect(css).toContain('font-weight: 700');
      // The earlier duplicate should be removed
      expect(css.match(/font-weight/g)?.length).toBe(1);
    });
  });

  describe('modern/prefer-hex-colors', () => {
    it('converts rgb(255, 0, 0) to #f00', () => {
      const input = '.box {\n  color: rgb(255, 0, 0);\n}';
      const { css } = analyzeAndApply(input, 'modern/prefer-hex-colors', false);
      expect(css).toContain('#f00');
      expect(css).not.toContain('rgb(');
    });

    it('converts rgb(255, 255, 255) to #fff', () => {
      const input = '.white {\n  color: rgb(255, 255, 255);\n}';
      const { css } = analyzeAndApply(input, 'modern/prefer-hex-colors', false);
      expect(css).toContain('#fff');
    });
  });
});

// ============================================================================
// Batch 1B: Comment Injection Tests
// Verifies that comments are placed correctly after the semicolon
// ============================================================================

describe('Batch 1B: Comment Injection Tests', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  describe('format/no-tabs', () => {
    it('places comment after semicolon on affected line', () => {
      const input = '.card {\n\tpadding: 8px;\n}';
      const { css } = analyzeAndApply(input, 'format/no-tabs', true);
      expect(css).toBe(
        '.card {\n  padding: 8px; /* cssreview: format/no-tabs: converted tabs to spaces */\n}'
      );
    });
  });

  describe('format/indent-2-spaces', () => {
    it('places comment after semicolon on affected line', () => {
      const input = '.card {\n   padding: 8px;\n}';
      const { css } = analyzeAndApply(input, 'format/indent-2-spaces', true);
      expect(css).toBe(
        '.card {\n    padding: 8px; /* cssreview: format/indent-2-spaces: normalized from 3 to 4 spaces */\n}'
      );
    });
  });

  describe('format/normalize-spaces', () => {
    it('places comment after semicolon on affected line', () => {
      const input = '.card {\n  color:red;\n}';
      const { css } = analyzeAndApply(input, 'format/normalize-spaces', true);
      expect(css).toBe(
        '.card {\n  color: red; /* cssreview: format/normalize-spaces: added space after colon */\n}'
      );
    });
  });

  describe('format/single-prop-single-line', () => {
    it('places comment after semicolon in collapsed rule', () => {
      const input = '.a {\n  color: #fff;\n}';
      const { css } = analyzeAndApply(input, 'format/single-prop-single-line', true);
      expect(css).toBe(
        '.a { color: #fff; /* cssreview: format/single-prop-single-line: single property kept on one line */ }'
      );
    });
  });

  describe('tokens/zero-units', () => {
    it('places comment after semicolon on affected line', () => {
      const input = '.card {\n  margin: 0px;\n}';
      const { css } = analyzeAndApply(input, 'tokens/zero-units', true);
      expect(css).toBe(
        '.card {\n  margin: 0; /* cssreview: tokens/zero-units: was 0px */\n}'
      );
    });
  });

  describe('tokens/shorten-hex-colors', () => {
    it('places comment after semicolon on affected line', () => {
      const input = '.card {\n  color: #ffffff;\n}';
      const { css } = analyzeAndApply(input, 'tokens/shorten-hex-colors', true);
      expect(css).toBe(
        '.card {\n  color: #fff; /* cssreview: tokens/shorten-hex-colors: was #ffffff */\n}'
      );
    });
  });

  describe('tokens/remove-trailing-zeros', () => {
    it('places comment after semicolon on affected line', () => {
      const input = '.card {\n  opacity: 0.50;\n}';
      const { css } = analyzeAndApply(input, 'tokens/remove-trailing-zeros', true);
      expect(css).toBe(
        '.card {\n  opacity: 0.5; /* cssreview: tokens/remove-trailing-zeros: was 0.50 */\n}'
      );
    });
  });

  describe('consolidate/shorthand-margin-padding', () => {
    it('places comment on shorthand replacement line', () => {
      const input = `.box {
  margin-top: 4px;
  margin-right: 8px;
  margin-bottom: 4px;
  margin-left: 8px;
}`;
      const { css } = analyzeAndApply(input, 'consolidate/shorthand-margin-padding', true);
      expect(css).toContain('margin: 4px 8px');
      expect(css).toContain('/* cssreview: consolidate/shorthand-margin-padding:');
    });
  });

  describe('consolidate/deduplicate-last-wins', () => {
    it('places comment on the kept declaration line', () => {
      const input = `.title {
  font-weight: 400;
  font-weight: 700;
}`;
      const { css } = analyzeAndApply(input, 'consolidate/deduplicate-last-wins', true);
      expect(css).toContain('font-weight: 700');
      expect(css).toContain('/* cssreview: consolidate/deduplicate-last-wins:');
    });
  });

  describe('modern/prefer-hex-colors', () => {
    it('places comment after semicolon on affected line', () => {
      const input = '.rgb-color {\n  color: rgb(255, 0, 0);\n}';
      const { css } = analyzeAndApply(input, 'modern/prefer-hex-colors', true);
      expect(css).toContain('#f00');
      expect(css).toContain('/* cssreview: modern/prefer-hex-colors:');
    });
  });

  describe('format/sort-properties', () => {
    it('places comment after sorted properties', () => {
      const input = '.box {\n  color: black;\n  display: flex;\n}';
      const { css } = analyzeAndApply(input, 'format/sort-properties', true);
      expect(css).toContain('/* cssreview: format/sort-properties:');
    });
  });
});

// ============================================================================
// Batch 1C: E2E Snapshot Tests
// Full pipeline test with test-all-rules.css
// ============================================================================

describe('Batch 1C: E2E Snapshot Tests', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  it('analyzes test-all-rules.css and detects issues from multiple rules', () => {
    const testFile = path.resolve(__dirname, '../../../tests/test-all-rules.css');
    const input = fs.readFileSync(testFile, 'utf-8');
    const result = analyze(input, defaultConfig);

    // Should detect issues - at minimum from the rules that are clearly triggered
    expect(result.issues.length).toBeGreaterThan(0);

    // Verify specific expected rules are triggered
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

    // Apply non-conflicting safe fixes - should not throw
    const applied = applyFixes(input, result.issues, safeFixIds, false);

    // Output should be a non-empty string
    expect(typeof applied.css).toBe('string');
    expect(applied.css.length).toBeGreaterThan(0);

    // Should have applied fixes (no conflicts after excluding single-prop)
    expect(applied.applied_fixes.length).toBeGreaterThan(0);
  });

  it('detects conflicts when all safe fixes are applied at once', () => {
    const testFile = path.resolve(__dirname, '../../../tests/test-all-rules.css');
    const input = fs.readFileSync(testFile, 'utf-8');
    const result = analyze(input, defaultConfig);

    const safeFixIds = result.issues
      .filter((i) => i.fixability === 'safe' && i.fix)
      .map((i) => i.fix!.id);

    // Applying all fixes produces conflicts (single-prop-single-line vs others)
    const applied = applyFixes(input, result.issues, safeFixIds, false);

    // When conflicts exist, engine returns original CSS
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

    // Apply with comments enabled - should not throw
    const applied = applyFixes(input, result.issues, safeFixIds, true);

    expect(typeof applied.css).toBe('string');
    expect(applied.css.length).toBeGreaterThan(0);
  });

  it('applying individual rule fixes produces valid CSS structure', () => {
    const testCases = [
      { rule: 'format/no-tabs', input: '.card {\n\tpadding: 8px;\n}' },
      { rule: 'format/indent-2-spaces', input: '.card {\n   padding: 8px;\n}' },
      { rule: 'format/normalize-spaces', input: '.card {\n  color:red;\n}' },
      { rule: 'format/single-prop-single-line', input: '.a {\n  color: #fff;\n}' },
      { rule: 'tokens/zero-units', input: '.card {\n  margin: 0px;\n}' },
      { rule: 'tokens/shorten-hex-colors', input: '.card {\n  color: #ffffff;\n}' },
      { rule: 'tokens/remove-trailing-zeros', input: '.card {\n  opacity: 0.50;\n}' },
      { rule: 'modern/prefer-hex-colors', input: '.rgb {\n  color: rgb(255, 0, 0);\n}' },
    ];

    for (const { rule, input } of testCases) {
      resetIssueCounter();
      const { css } = analyzeAndApply(input, rule, false);

      // Basic structural checks: output should have matching braces
      const openBraces = (css.match(/\{/g) || []).length;
      const closeBraces = (css.match(/\}/g) || []).length;
      expect(openBraces).toBe(closeBraces);

      // Output should still contain a selector
      expect(css).toMatch(/\./); // class selector
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
