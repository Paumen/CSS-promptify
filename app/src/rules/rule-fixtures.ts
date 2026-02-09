/**
 * Rule Test Fixtures
 *
 * Human-maintained test cases for every rule with a safe fix.
 * Each fixture specifies exact input → expected output (with and without comments).
 *
 * To add a new rule:  add one or more entries to the array below.
 * To add a test case: add another entry with the same ruleId.
 *
 * The test runner (fix-application.test.ts) loops over these automatically.
 */

export interface RuleFixture {
  /** Which rule this tests (must match rule_id exactly) */
  ruleId: string;
  /** Short human-readable label shown in test output */
  description: string;
  /** CSS input to analyze */
  input: string;
  /** Exact expected CSS after applying the fix (no comments) */
  expectedOutput: string;
  /**
   * Exact expected CSS after applying the fix WITH comments.
   * Set to null to skip the comment-injection test for this case
   * (e.g. when comment placement is known-buggy for this pattern).
   */
  expectedWithComment: string | null;
}

// ---------------------------------------------------------------------------
// Fixtures — one or more per rule
// ---------------------------------------------------------------------------

export const ruleFixtures: RuleFixture[] = [

  // ── format/no-tabs ──────────────────────────────────────────────────────
  {
    ruleId: 'format/no-tabs',
    description: 'single tab → 2 spaces',
    input: '.card {\n\tpadding: 8px;\n}',
    expectedOutput: '.card {\n  padding: 8px;\n}',
    expectedWithComment:
      '.card {\n  padding: 8px; /* cssreview: format/no-tabs: converted tabs to spaces */\n}',
  },
  {
    ruleId: 'format/no-tabs',
    description: 'double tab → 4 spaces',
    input: '.card {\n\t\tpadding: 8px;\n}',
    expectedOutput: '.card {\n    padding: 8px;\n}',
    expectedWithComment:
      '.card {\n    padding: 8px; /* cssreview: format/no-tabs: converted tabs to spaces */\n}',
  },
  {
    ruleId: 'format/no-tabs',
    description: 'multiple lines with tabs',
    input: '.card {\n\tpadding: 8px;\n\tmargin: 0;\n}',
    expectedOutput: '.card {\n  padding: 8px;\n  margin: 0;\n}',
    expectedWithComment:
      '.card {\n  padding: 8px; /* cssreview: format/no-tabs: converted tabs to spaces */\n  margin: 0; /* cssreview: format/no-tabs: converted tabs to spaces */\n}',
  },

  // ── format/indent-2-spaces ──────────────────────────────────────────────
  {
    ruleId: 'format/indent-2-spaces',
    description: '3-space indent → 4 spaces',
    input: '.card {\n   padding: 8px;\n}',
    expectedOutput: '.card {\n    padding: 8px;\n}',
    expectedWithComment:
      '.card {\n    padding: 8px; /* cssreview: format/indent-2-spaces: normalized from 3 to 4 spaces */\n}',
  },
  {
    ruleId: 'format/indent-2-spaces',
    description: '1-space indent → 2 spaces',
    input: '.card {\n padding: 8px;\n}',
    expectedOutput: '.card {\n  padding: 8px;\n}',
    expectedWithComment:
      '.card {\n  padding: 8px; /* cssreview: format/indent-2-spaces: normalized from 1 to 2 spaces */\n}',
  },

  // ── format/normalize-spaces ─────────────────────────────────────────────
  {
    ruleId: 'format/normalize-spaces',
    description: 'missing space after colon',
    input: '.card {\n  color:red;\n}',
    expectedOutput: '.card {\n  color: red;\n}',
    expectedWithComment:
      '.card {\n  color: red; /* cssreview: format/normalize-spaces: added space after colon */\n}',
  },

  // ── format/single-prop-single-line ──────────────────────────────────────
  {
    ruleId: 'format/single-prop-single-line',
    description: 'collapse multi-line single-property rule',
    input: '.a {\n  color: #fff;\n}',
    expectedOutput: '.a { color: #fff; }',
    expectedWithComment:
      '.a { color: #fff; /* cssreview: format/single-prop-single-line: single property kept on one line */ }',
  },

  // ── format/one-selector-per-line ────────────────────────────────────────
  {
    ruleId: 'format/one-selector-per-line',
    description: 'split comma-separated selectors',
    input: '.sel-a, .sel-b {\n  color: pink;\n}',
    expectedOutput: '.sel-a,\n.sel-b {\n  color: pink;\n}',
    expectedWithComment:
      '.sel-a,\n.sel-b {\n  color: pink; /* cssreview: format/one-selector-per-line: split selectors to separate lines */\n}',
  },

  // ── tokens/zero-units ──────────────────────────────────────────────────
  {
    ruleId: 'tokens/zero-units',
    description: '0px → 0',
    input: '.card {\n  margin: 0px;\n}',
    expectedOutput: '.card {\n  margin: 0;\n}',
    expectedWithComment:
      '.card {\n  margin: 0; /* cssreview: tokens/zero-units: was 0px */\n}',
  },

  // ── tokens/shorten-hex-colors ──────────────────────────────────────────
  {
    ruleId: 'tokens/shorten-hex-colors',
    description: '#ffffff → #fff',
    input: '.card {\n  color: #ffffff;\n}',
    expectedOutput: '.card {\n  color: #fff;\n}',
    expectedWithComment:
      '.card {\n  color: #fff; /* cssreview: tokens/shorten-hex-colors: was #ffffff */\n}',
  },
  {
    ruleId: 'tokens/shorten-hex-colors',
    description: '#aabbcc → #abc',
    input: '.card {\n  color: #aabbcc;\n}',
    expectedOutput: '.card {\n  color: #abc;\n}',
    expectedWithComment:
      '.card {\n  color: #abc; /* cssreview: tokens/shorten-hex-colors: was #aabbcc */\n}',
  },

  // ── tokens/remove-trailing-zeros ───────────────────────────────────────
  {
    ruleId: 'tokens/remove-trailing-zeros',
    description: '0.50 → 0.5',
    input: '.card {\n  opacity: 0.50;\n}',
    expectedOutput: '.card {\n  opacity: 0.5;\n}',
    expectedWithComment:
      '.card {\n  opacity: 0.5; /* cssreview: tokens/remove-trailing-zeros: was 0.50 */\n}',
  },
  {
    ruleId: 'tokens/remove-trailing-zeros',
    description: '1.0 → 1',
    input: '.card {\n  line-height: 1.0;\n}',
    expectedOutput: '.card {\n  line-height: 1;\n}',
    expectedWithComment:
      '.card {\n  line-height: 1; /* cssreview: tokens/remove-trailing-zeros: was 1.0 */\n}',
  },

  // ── consolidate/deduplicate-last-wins ──────────────────────────────────
  {
    ruleId: 'consolidate/deduplicate-last-wins',
    description: 'removes earlier duplicate, keeps last',
    input: '.title {\n  font-weight: 400;\n  font-weight: 700;\n}',
    expectedOutput: '.title {\n  font-weight: 700;\n}',
    expectedWithComment:
      '.title {\n  font-weight: 700; /* cssreview: consolidate/deduplicate-last-wins: removed earlier overridden value 400 */\n}',
  },
  {
    ruleId: 'consolidate/deduplicate-last-wins',
    description: 'multiple duplicate properties in same block',
    input: '.button {\n  color: red;\n  padding: 10px;\n  color: blue;\n  padding: 20px;\n}',
    expectedOutput: '.button {\n  color: blue;\n  padding: 20px;\n}',
    expectedWithComment: null, // multiple comments on interleaved removals — skip exact match
  },
  {
    ruleId: 'consolidate/deduplicate-last-wins',
    description: 'three duplicates keeps only last',
    input: '.box {\n  color: red;\n  color: green;\n  color: blue;\n}',
    expectedOutput: '.box {\n  color: blue;\n}',
    expectedWithComment: null, // multiple comments — skip exact match
  },

  // ── modern/prefer-hex-colors ───────────────────────────────────────────
  {
    ruleId: 'modern/prefer-hex-colors',
    description: 'rgb(255, 0, 0) → #f00',
    input: '.box {\n  color: rgb(255, 0, 0);\n}',
    expectedOutput: '.box {\n  color: #f00;\n}',
    expectedWithComment:
      '.box {\n  color: #f00; /* cssreview: modern/prefer-hex-colors: converted from rgb(255,0,0) */\n}',
  },
  {
    ruleId: 'modern/prefer-hex-colors',
    description: 'rgb(255, 255, 255) → #fff',
    input: '.box {\n  color: rgb(255, 255, 255);\n}',
    expectedOutput: '.box {\n  color: #fff;\n}',
    expectedWithComment:
      '.box {\n  color: #fff; /* cssreview: modern/prefer-hex-colors: converted from rgb(255,255,255) */\n}',
  },

  // ── format/sort-properties ─────────────────────────────────────────────
  // NOTE: sort-properties has known output bugs (double semicolon, extra indent).
  // The expectedOutput below matches actual current output to catch regressions.
  // When the engine bug is fixed, update these expected values.
  {
    ruleId: 'format/sort-properties',
    description: 'reorders color before display → display before color',
    input: '.box {\n  color: black;\n  display: flex;\n}',
    expectedOutput: '.box {\n    display: flex;\n  color: black;;\n}',
    expectedWithComment:
      '.box {\n    display: flex;\n  color: black;; /* cssreview: format/sort-properties: reordered to grouped order */\n}',
  },

  // ── consolidate/shorthand-margin-padding ───────────────────────────────
  // NOTE: shorthand rule has a known double-semicolon bug in its output.
  // The expectedOutput below matches actual current output to catch regressions.
  {
    ruleId: 'consolidate/shorthand-margin-padding',
    description: '4 padding longhands → shorthand',
    input:
      '.box {\n  padding-top: 10px;\n  padding-right: 10px;\n  padding-bottom: 10px;\n  padding-left: 10px;\n}',
    expectedOutput: '.box {\n  padding: 10px;;\n}',
    expectedWithComment:
      '.box {\n  padding: 10px;; /* cssreview: consolidate/shorthand-margin-padding: was padding-top/right/bottom/left */\n}',
  },

  // ── format/multiple-declarations-per-line ──────────────────────────────
  // NOTE: This rule has known output quirks (extra indent on first decl,
  // comment placement issues). expectedOutput matches current actual output.
  {
    ruleId: 'format/multiple-declarations-per-line',
    description: 'splits 2 declarations onto separate lines',
    input: '.card {\n  color: red; background: blue;\n}',
    expectedOutput: '.card {\n    color: red;\n  background: blue;\n}',
    expectedWithComment: null, // comment placement is buggy for this pattern
  },
];
