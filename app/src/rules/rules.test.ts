import { describe, it, expect, beforeEach } from 'vitest';
import { parse } from '../parser';
import { noTabsRule } from './format/no-tabs';
import { indent2SpacesRule } from './format/indent-2-spaces';
import { multipleDeclarationsPerLineRule } from './format/multiple-declarations-per-line';
import { normalizeSpacesRule } from './format/normalize-spaces';
import { singlePropSingleLineRule } from './format/single-prop-single-line';
import { zeroUnitsRule } from './tokens/zero-units';
import { shortenHexColorsRule } from './tokens/shorten-hex-colors';
import { removeTrailingZerosRule } from './tokens/remove-trailing-zeros';
import { shorthandMarginPaddingRule } from './consolidation/shorthand-margin-padding';
import { deduplicateLastWinsRule } from './consolidation/deduplicate-last-wins';
import { resetIssueCounter } from './utils';
import type { SessionConfig } from '../types';

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

describe('format/no-tabs', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  it('detects tabs and suggests replacement with spaces', () => {
    const css = '.card {\n\tpadding: 8px;\n}';
    const { ast } = parse(css);
    const issues = noTabsRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].rule_id).toBe('format/no-tabs');
    expect(issues[0].severity).toBe('warning');
    expect(issues[0].fixability).toBe('safe');
    expect(issues[0].fix?.preview).toBe('  '); // 2 spaces
  });

  it('detects multiple tabs', () => {
    const css = '.card {\n\t\tpadding: 8px;\n}';
    const { ast } = parse(css);
    const issues = noTabsRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.preview).toBe('    '); // 4 spaces (2 tabs)
  });

  it('returns no issues for tab-free CSS', () => {
    const css = '.card {\n  padding: 8px;\n}';
    const { ast } = parse(css);
    const issues = noTabsRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(0);
  });
});

describe('format/indent-2-spaces', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  it('detects odd-number indentation', () => {
    const css = '.card {\n   padding: 8px;\n}'; // 3 spaces
    const { ast } = parse(css);
    const issues = indent2SpacesRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].rule_id).toBe('format/indent-2-spaces');
    expect(issues[0].fix?.preview).toBe('    '); // 3 rounds to 4 (Math.round(3/2)*2 = 4)
  });

  it('accepts 2-space indentation', () => {
    const css = '.card {\n  padding: 8px;\n}';
    const { ast } = parse(css);
    const issues = indent2SpacesRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(0);
  });

  it('accepts 4-space indentation', () => {
    const css = '.card {\n    padding: 8px;\n}';
    const { ast } = parse(css);
    const issues = indent2SpacesRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(0);
  });
});

describe('format/multiple-declarations-per-line', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  it('detects multiple declarations on one line', () => {
    const css = '.card { padding: 8px; margin: 0; }';
    const { ast } = parse(css);
    const issues = multipleDeclarationsPerLineRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].rule_id).toBe('format/multiple-declarations-per-line');
    expect(issues[0].message).toContain('2 declarations');
  });

  it('accepts single declaration per line', () => {
    const css = '.card {\n  padding: 8px;\n  margin: 0;\n}';
    const { ast } = parse(css);
    const issues = multipleDeclarationsPerLineRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(0);
  });
});

describe('tokens/zero-units', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  it('detects 0px and suggests removal', () => {
    const css = '.card { margin: 0px; }';
    const { ast } = parse(css);
    const issues = zeroUnitsRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].rule_id).toBe('tokens/zero-units');
    expect(issues[0].fix?.preview).toBe('0');
  });

  it('detects 0em', () => {
    const css = '.card { padding: 0em; }';
    const { ast } = parse(css);
    const issues = zeroUnitsRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.preview).toBe('0');
  });

  it('detects 0%', () => {
    const css = '.card { width: 0%; }';
    const { ast } = parse(css);
    const issues = zeroUnitsRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
  });

  it('does not flag plain 0', () => {
    const css = '.card { margin: 0; }';
    const { ast } = parse(css);
    const issues = zeroUnitsRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(0);
  });

  it('detects multiple zero units', () => {
    const css = '.card { margin: 0px 0px 0px 0px; }';
    const { ast } = parse(css);
    const issues = zeroUnitsRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(4);
  });
});

describe('tokens/shorten-hex-colors', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  it('shortens #ffffff to #fff', () => {
    const css = '.card { color: #ffffff; }';
    const { ast } = parse(css);
    const issues = shortenHexColorsRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].rule_id).toBe('tokens/shorten-hex-colors');
    expect(issues[0].fix?.preview).toBe('#fff');
  });

  it('shortens #aabbcc to #abc', () => {
    const css = '.card { color: #aabbcc; }';
    const { ast } = parse(css);
    const issues = shortenHexColorsRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.preview).toBe('#abc');
  });

  it('shortens #000000 to #000', () => {
    const css = '.card { color: #000000; }';
    const { ast } = parse(css);
    const issues = shortenHexColorsRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.preview).toBe('#000');
  });

  it('does not shorten non-shortenable colors', () => {
    const css = '.card { color: #123456; }';
    const { ast } = parse(css);
    const issues = shortenHexColorsRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(0);
  });

  it('does not shorten already-short colors', () => {
    const css = '.card { color: #fff; }';
    const { ast } = parse(css);
    const issues = shortenHexColorsRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(0);
  });

  it('handles 8-digit hex with alpha', () => {
    const css = '.card { color: #ffffffaa; }';
    const { ast } = parse(css);
    const issues = shortenHexColorsRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.preview).toBe('#fffa');
  });

  it('case insensitive matching', () => {
    const css = '.card { color: #FFFFFF; }';
    const { ast } = parse(css);
    const issues = shortenHexColorsRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.preview).toBe('#fff');
  });
});

describe('Example 1 from spec/EXAMPLES.md', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  it('processes ".button{display:flex;color:#ffffff}" correctly', () => {
    const css = '.button{display:flex;color:#ffffff}';
    const { ast } = parse(css);

    // Run all relevant rules
    const allIssues = [
      ...noTabsRule.run(ast, css, defaultConfig),
      ...indent2SpacesRule.run(ast, css, defaultConfig),
      ...multipleDeclarationsPerLineRule.run(ast, css, defaultConfig),
      ...zeroUnitsRule.run(ast, css, defaultConfig),
      ...shortenHexColorsRule.run(ast, css, defaultConfig),
    ];

    // Should find:
    // - format/multiple-declarations-per-line (2 declarations on one line)
    // - tokens/shorten-hex-colors (#ffffff -> #fff)
    const ruleIds = allIssues.map((i) => i.rule_id);
    expect(ruleIds).toContain('format/multiple-declarations-per-line');
    expect(ruleIds).toContain('tokens/shorten-hex-colors');

    // Check hex color fix
    const hexIssue = allIssues.find((i) => i.rule_id === 'tokens/shorten-hex-colors');
    expect(hexIssue?.fix?.preview).toBe('#fff');
  });
});

describe('Example 3 from spec/EXAMPLES.md', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  it('processes tabs and zero units correctly', () => {
    const css = '.card{\n\tpadding:8px;\tmargin:0px;\n}';
    const { ast } = parse(css);

    const allIssues = [
      ...noTabsRule.run(ast, css, defaultConfig),
      ...zeroUnitsRule.run(ast, css, defaultConfig),
    ];

    // Should find tabs and zero units
    const ruleIds = allIssues.map((i) => i.rule_id);
    expect(ruleIds).toContain('format/no-tabs');
    expect(ruleIds).toContain('tokens/zero-units');

    // Check zero unit fix
    const zeroIssue = allIssues.find((i) => i.rule_id === 'tokens/zero-units');
    expect(zeroIssue?.fix?.preview).toBe('0');
  });
});

// ============================================================================
// New Rules Tests
// ============================================================================

describe('format/normalize-spaces', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  it('detects missing space after colon', () => {
    const css = '.card { padding:8px; }';
    const { ast } = parse(css);
    const issues = normalizeSpacesRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].rule_id).toBe('format/normalize-spaces');
    expect(issues[0].message).toContain('space after colon');
  });

  it('detects multiple spaces after colon', () => {
    const css = '.card { padding:   8px; }';
    const { ast } = parse(css);
    const issues = normalizeSpacesRule.run(ast, css, defaultConfig);

    expect(issues.length).toBeGreaterThanOrEqual(1);
  });

  it('accepts properly spaced CSS', () => {
    const css = '.card { padding: 8px; }';
    const { ast } = parse(css);
    const issues = normalizeSpacesRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(0);
  });
});

describe('format/single-prop-single-line', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  it('detects multi-line single-property rule', () => {
    const css = '.a {\n  color: #fff;\n}';
    const { ast } = parse(css);
    const issues = singlePropSingleLineRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].rule_id).toBe('format/single-prop-single-line');
    expect(issues[0].fix?.preview).toBe('.a { color: #fff; }');
  });

  it('ignores multi-property rules', () => {
    const css = '.a {\n  color: #fff;\n  padding: 8px;\n}';
    const { ast } = parse(css);
    const issues = singlePropSingleLineRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(0);
  });

  it('ignores already single-line rules', () => {
    const css = '.a { color: #fff; }';
    const { ast } = parse(css);
    const issues = singlePropSingleLineRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(0);
  });
});

describe('tokens/remove-trailing-zeros', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  it('removes trailing zeros from 0.50', () => {
    const css = '.card { opacity: 0.50; }';
    const { ast } = parse(css);
    const issues = removeTrailingZerosRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].rule_id).toBe('tokens/remove-trailing-zeros');
    expect(issues[0].fix?.preview).toBe('0.5');
  });

  it('removes trailing zeros from 1.0', () => {
    const css = '.card { line-height: 1.0; }';
    const { ast } = parse(css);
    const issues = removeTrailingZerosRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.preview).toBe('1');
  });

  it('ignores numbers without trailing zeros', () => {
    const css = '.card { opacity: 0.5; }';
    const { ast } = parse(css);
    const issues = removeTrailingZerosRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(0);
  });
});

describe('consolidate/shorthand-margin-padding', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  it('detects all 4 margin longhands', () => {
    const css = `.box {
  margin-top: 4px;
  margin-right: 8px;
  margin-bottom: 4px;
  margin-left: 8px;
}`;
    const { ast } = parse(css);
    const issues = shorthandMarginPaddingRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].rule_id).toBe('consolidate/shorthand-margin-padding');
    expect(issues[0].fix?.preview).toBe('margin: 4px 8px');
  });

  it('ignores partial margin longhands', () => {
    const css = `.box {
  margin-top: 4px;
  margin-bottom: 4px;
}`;
    const { ast } = parse(css);
    const issues = shorthandMarginPaddingRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(0);
  });

  it('optimizes all same values', () => {
    const css = `.box {
  padding-top: 8px;
  padding-right: 8px;
  padding-bottom: 8px;
  padding-left: 8px;
}`;
    const { ast } = parse(css);
    const issues = shorthandMarginPaddingRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.preview).toBe('padding: 8px');
  });
});

describe('consolidate/deduplicate-last-wins', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  it('detects duplicate properties', () => {
    const css = `.title {
  font-weight: 400;
  font-weight: 700;
}`;
    const { ast } = parse(css);
    const issues = deduplicateLastWinsRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].rule_id).toBe('consolidate/deduplicate-last-wins');
    expect(issues[0].message).toContain('font-weight');
  });

  it('ignores unique properties', () => {
    const css = `.title {
  font-weight: 700;
  color: red;
}`;
    const { ast } = parse(css);
    const issues = deduplicateLastWinsRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(0);
  });
});

describe('Example 4 from spec/EXAMPLES.md - margin shorthand', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  it('consolidates margin longhands correctly', () => {
    const css = `.box {
  margin-top: 4px;
  margin-right: 8px;
  margin-bottom: 4px;
  margin-left: 8px;
}`;
    const { ast } = parse(css);
    const issues = shorthandMarginPaddingRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    // 4px 8px 4px 8px -> 4px 8px (vertical horizontal)
    expect(issues[0].fix?.preview).toBe('margin: 4px 8px');
  });
});

describe('Example 5 from spec/EXAMPLES.md - deduplicate', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  it('removes duplicate font-weight', () => {
    const css = `.title {
  font-weight: 400;
  font-weight: 700;
}`;
    const { ast } = parse(css);
    const issues = deduplicateLastWinsRule.run(ast, css, defaultConfig);

    expect(issues).toHaveLength(1);
    expect(issues[0].logic.why).toContain('700');
  });
});
