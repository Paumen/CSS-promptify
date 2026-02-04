
const fs = require('fs');
const path = require('path');

const specDir = path.join(__dirname, '..', 'spec');
const testCasesPath = path.join(specDir, 'test-cases.json');
const examplesPath = path.join(specDir, 'EXAMPLES.md');

function generateMarkdownForTestCase(testCase, index) {
  let md = `---

## Example ${index + 1} — ${testCase.name}

`;

  if (testCase.description) {
    md += `${testCase.description}\n\n`;
  }

  md += `### Input\n\
```css\n${testCase.input}\n```\n\n`;

  if (testCase.expected_issues) {
    md += `### Expected issues (summary)\n`;
    md += testCase.expected_issues.map(issue => `- ${issue.rule_id} (${issue.severity})`).join('\n') + '\n\n';
  }

  if (testCase.expected_output_no_comments) {
    md += `### Expected output (no comments)\n\
```css\n${testCase.expected_output_no_comments}\n```\n\n`;
  }

  if (testCase.expected_output_with_comments) {
    md += `### Expected output (with comments)\n\
```css\n${testCase.expected_output_with_comments}\n```\n\n`;
  }
  
  if (testCase.notes) {
    md += `### Notes\n${testCase.notes}\n\n`;
  }

  return md;
}

function main() {
  const testCasesData = fs.readFileSync(testCasesPath, 'utf8');
  const testCases = JSON.parse(testCasesData);

  const header = `<!--
STATUS: Authoritative reference for this topic
SOURCE OF TRUTH: If anything conflicts, spec/PRD_BUILD_SPEC.md wins
LLM_POLICY: You may READ this file. You may SUGGEST edits as a patch/diff, but do not rewrite silently. Human review required.
-->

# Examples (v1)

These examples define expected behavior for analysis, fixes, formatting, inline comments, prompt generation, and the selection/recompute model.

> Source of truth: If anything conflicts, 
`spec/PRD_BUILD_SPEC.md
` wins.
`;

  let markdownContent = header;

  testCases.test_cases.forEach((testCase, index) => {
    markdownContent += generateMarkdownForTestCase(testCase, index);
  });
  
  markdownContent += '\n---\n\nEND\n';


  fs.writeFileSync(examplesPath, markdownContent);
  console.log('Successfully generated spec/EXAMPLES.md from spec/test-cases.json');
}

main();
