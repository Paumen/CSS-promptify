import { useMemo } from 'react';
import { tokenizeCSS, getTokenClassName, type Token, type IssueMarker } from './tokenizer';
import styles from './CSSHighlighter.module.css';

export interface CSSHighlighterProps {
  /** CSS source code to highlight */
  code: string;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Issue markers for severity highlighting */
  issueMarkers?: IssueMarker[];
  /** Additional class name */
  className?: string;
  /** Maximum height before scrolling */
  maxHeight?: number | string;
  /** Minimum height */
  minHeight?: number | string;
}

/**
 * Split tokens into lines for rendering with line numbers
 */
function splitTokensIntoLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];
  let currentLine = 0;

  for (const token of tokens) {
    // Handle tokens that span multiple lines (mainly whitespace with newlines)
    if (token.type === 'whitespace' && token.value.includes('\n')) {
      const parts = token.value.split('\n');
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) {
          currentLine++;
          lines[currentLine] = [];
        }
        if (parts[i]) {
          lines[currentLine].push({
            ...token,
            value: parts[i],
            line: currentLine + 1
          });
        }
      }
    } else {
      lines[currentLine].push(token);
    }
  }

  return lines;
}

/**
 * Get severity markers for a specific line
 */
function getLineMarkers(lineNumber: number, markers: IssueMarker[]): IssueMarker[] {
  return markers.filter(m => lineNumber >= m.startLine && lineNumber <= m.endLine);
}

/**
 * Get the highest severity on a line
 */
function getHighestSeverity(markers: IssueMarker[]): 'error' | 'warning' | 'info' | null {
  if (markers.some(m => m.severity === 'error')) return 'error';
  if (markers.some(m => m.severity === 'warning')) return 'warning';
  if (markers.some(m => m.severity === 'info')) return 'info';
  return null;
}

/**
 * Convert token class name(s) to CSS module class string
 * Handles multiple class names (e.g., "syntax-brace syntax-brace-1")
 */
function getTokenStyles(token: Token): string {
  const classNames = getTokenClassName(token).split(' ');
  return classNames
    .map(name => {
      // Convert syntax-brace-1 to syntax_brace_1 for CSS modules
      const moduleKey = name.replace(/-/g, '_');
      return styles[moduleKey] || '';
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * CSSHighlighter component
 *
 * Renders CSS code with:
 * - Syntax highlighting for all token types
 * - Line numbers (optional)
 * - Nesting depth colors for braces
 * - Distinction between tool comments and user comments
 * - Severity highlighting for issues (in line numbers only to preserve code readability)
 */
export function CSSHighlighter({
  code,
  showLineNumbers = true,
  issueMarkers = [],
  className,
  maxHeight = 400,
  minHeight = 300
}: CSSHighlighterProps) {
  const { lines, hasContent } = useMemo(() => {
    if (!code || code.trim() === '') {
      return { lines: [], hasContent: false };
    }

    const tokens = tokenizeCSS(code);
    const tokenLines = splitTokensIntoLines(tokens);

    return { lines: tokenLines, hasContent: true };
  }, [code]);

  if (!hasContent) {
    return (
      <div
        className={`${styles.highlighter} ${className ?? ''}`}
        style={{
          minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
          maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight
        }}
      >
        <pre className={styles.code}>
          <code className={styles.emptyMessage}>(No output yet)</code>
        </pre>
      </div>
    );
  }

  return (
    <div
      className={`${styles.highlighter} ${className ?? ''}`}
      style={{
        minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
        maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight
      }}
    >
      {/* Scrollbar severity indicators */}
      {issueMarkers.length > 0 && (
        <div className={styles.scrollbarMarkers}>
          {issueMarkers.map((marker, idx) => {
            const totalLines = lines.length || 1;
            const top = ((marker.startLine - 1) / totalLines) * 100;
            const height = Math.max(2, ((marker.endLine - marker.startLine + 1) / totalLines) * 100);
            return (
              <div
                key={idx}
                className={`${styles.scrollbarMarker} ${styles[`severity_${marker.severity}`]}`}
                style={{ top: `${top}%`, height: `${height}%` }}
                title={`${marker.severity}: Line ${marker.startLine}${marker.endLine !== marker.startLine ? `-${marker.endLine}` : ''}`}
              />
            );
          })}
        </div>
      )}

      <pre className={styles.code}>
        <code>
          {lines.map((lineTokens, lineIndex) => {
            const lineNumber = lineIndex + 1;
            const lineMarkers = getLineMarkers(lineNumber, issueMarkers);
            const severity = getHighestSeverity(lineMarkers);

            return (
              <div
                key={lineIndex}
                className={styles.line}
              >
                {showLineNumbers && (
                  <span className={`${styles.lineNumber} ${severity ? styles[`lineNumber_${severity}`] : ''}`}>
                    {lineNumber}
                  </span>
                )}
                <span className={styles.lineContent}>
                  {lineTokens.length > 0 ? (
                    lineTokens.map((token, tokenIndex) => (
                      <span
                        key={tokenIndex}
                        className={getTokenStyles(token)}
                        data-token-type={token.type}
                      >
                        {token.value}
                      </span>
                    ))
                  ) : (
                    // Empty line
                    '\n'
                  )}
                </span>
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
