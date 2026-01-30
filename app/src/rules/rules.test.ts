import { describe, it, expect, beforeEach } from 'vitest';
import { parse } from '../parser';
import { noTabsRule } from './format/no-tabs';
import { indent2SpacesRule } from './format/indent-2-spaces';
import { multipleDeclarationsPerLineRule } from './format/multiple-declarations-per-line';
import { zeroUnitsRule } from './tokens/zero-units';
import { shortenHexColorsRule } from './tokens/shorten-hex-colors';
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
