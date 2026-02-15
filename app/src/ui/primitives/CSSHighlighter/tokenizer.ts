/**
 * CSS Tokenizer for Syntax Highlighting
 *
 * Produces tokens for CSS syntax highlighting with support for:
 * - Modern CSS features (@layer, @container, light-dark(), is(), has(), etc.)
 * - Nesting depth tracking for brace coloring
 * - Tool comments (review:) vs user comments distinction
 * - Modern units (fr, dvh, cqi, etc.)
 */

/**
 * Token types for CSS syntax highlighting
 * These map directly to CSS custom properties in tokens.css
 */
export type TokenType =
  | 'selector'
  | 'property'
  | 'custom-property'  // CSS custom properties (--var-name) - consistent color everywhere
  | 'value'
  | 'unit'
  | 'number'
  | 'color-hex'
  | 'string'
  | 'keyword'
  | 'function'
  | 'atrule'
  | 'atrule-name'
  | 'punctuation'
  | 'operator'
  | 'comment-user'
  | 'comment-tool'
  | 'brace'
  | 'whitespace'
  | 'text';

/**
 * A single token produced by the tokenizer
 */
export interface Token {
  type: TokenType;
  value: string;
  /** Start offset in source */
  start: number;
  /** End offset in source */
  end: number;
  /** Line number (1-based) */
  line: number;
  /** Column number (1-based) */
  column: number;
  /** Brace nesting depth (0 = top level) */
  depth?: number;
}

/**
 * Issue marker for highlighting severity in the code
 */
export interface IssueMarker {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Modern CSS functions that should be recognized
 */
const MODERN_FUNCTIONS = new Set([
  'light-dark', 'is', 'has', 'not', 'where', 'calc', 'min', 'max', 'clamp',
  'var', 'env', 'url', 'rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch',
  'oklch', 'oklab', 'color', 'color-mix', 'linear-gradient', 'radial-gradient',
  'conic-gradient', 'repeating-linear-gradient', 'repeating-radial-gradient',
  'repeating-conic-gradient', 'attr', 'counter', 'counters', 'fit-content',
  'minmax', 'repeat', 'image-set', 'cross-fade', 'element', 'paint',
  'anchor', 'anchor-size', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  'atan2', 'pow', 'sqrt', 'hypot', 'log', 'exp', 'abs', 'sign', 'round',
  'mod', 'rem', 'path', 'polygon', 'circle', 'ellipse', 'inset', 'rect',
  'xywh'
]);

/**
 * Modern CSS units including container query, viewport, and other modern units
 */
const MODERN_UNITS = new Set([
  // Absolute
  'px', 'cm', 'mm', 'in', 'pt', 'pc', 'Q',
  // Relative
  'em', 'rem', 'ex', 'rex', 'cap', 'rcap', 'ch', 'rch', 'ic', 'ric', 'lh', 'rlh',
  // Viewport (including modern large/small/dynamic)
  'vw', 'vh', 'vmin', 'vmax', 'vi', 'vb',
  'svw', 'svh', 'lvw', 'lvh', 'dvw', 'dvh', 'svi', 'svb', 'lvi', 'lvb', 'dvi', 'dvb',
  // Container query
  'cqw', 'cqh', 'cqi', 'cqb', 'cqmin', 'cqmax',
  // Grid/flex
  'fr',
  // Percentage
  '%',
  // Angle
  'deg', 'grad', 'rad', 'turn',
  // Time
  's', 'ms',
  // Frequency
  'Hz', 'kHz',
  // Resolution
  'dpi', 'dpcm', 'dppx', 'x'
]);

/**
 * Tokenizer state
 */
type State =
  | 'default'
  | 'selector'
  | 'property'
  | 'value'
  | 'atrule'
  | 'atrule-params'
  | 'comment';

/**
 * Tokenize CSS source code for syntax highlighting
 */
export function tokenizeCSS(source: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  let line = 1;
  let column = 1;
  let state: State = 'default';
  let braceDepth = 0;

  const peek = (offset = 0): string => source[pos + offset] ?? '';

  const advance = (): string => {
    const char = source[pos];
    pos++;
    if (char === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
    return char;
  };

  const addToken = (type: TokenType, value: string, startPos: number, startLine: number, startColumn: number, depth?: number) => {
    tokens.push({
      type,
      value,
      start: startPos,
      end: pos,
      line: startLine,
      column: startColumn,
      depth
    });
  };

  const isWhitespace = (char: string): boolean => /\s/.test(char);
  const isIdentStart = (char: string): boolean => /[a-zA-Z_-]/.test(char);
  const isIdentChar = (char: string): boolean => /[a-zA-Z0-9_-]/.test(char);
  const isDigit = (char: string): boolean => /[0-9]/.test(char);

  const consumeWhitespace = (): void => {
    const startPos = pos;
    const startLine = line;
    const startColumn = column;
    let value = '';
    while (pos < source.length && isWhitespace(peek())) {
      value += advance();
    }
    if (value) {
      addToken('whitespace', value, startPos, startLine, startColumn);
    }
  };

  const consumeComment = (): void => {
    const startPos = pos;
    const startLine = line;
    const startColumn = column;
    let value = '';

    // Consume /*
    value += advance();
    value += advance();

    // Consume until */
    while (pos < source.length && !(peek() === '*' && peek(1) === '/')) {
      value += advance();
    }

    // Consume */
    if (pos < source.length) {
      value += advance();
      value += advance();
    }

    // Check if it's a tool comment
    const isToolComment = value.includes('review:');
    addToken(isToolComment ? 'comment-tool' : 'comment-user', value, startPos, startLine, startColumn);
  };

  const consumeString = (quote: string): void => {
    const startPos = pos;
    const startLine = line;
    const startColumn = column;
    let value = advance(); // opening quote

    while (pos < source.length && peek() !== quote) {
      if (peek() === '\\' && pos + 1 < source.length) {
        value += advance(); // backslash
      }
      value += advance();
    }

    if (peek() === quote) {
      value += advance(); // closing quote
    }

    addToken('string', value, startPos, startLine, startColumn);
  };

  const consumeNumber = (): string => {
    let value = '';

    // Optional leading minus/plus
    if (peek() === '-' || peek() === '+') {
      value += advance();
    }

    // Integer part
    while (isDigit(peek())) {
      value += advance();
    }

    // Decimal part
    if (peek() === '.' && isDigit(peek(1))) {
      value += advance(); // .
      while (isDigit(peek())) {
        value += advance();
      }
    }

    // Scientific notation
    if ((peek() === 'e' || peek() === 'E') && (isDigit(peek(1)) || peek(1) === '+' || peek(1) === '-')) {
      value += advance(); // e/E
      if (peek() === '+' || peek() === '-') {
        value += advance();
      }
      while (isDigit(peek())) {
        value += advance();
      }
    }

    return value;
  };

  const consumeIdentifier = (): string => {
    let value = '';
    while (isIdentChar(peek()) || peek() === '-') {
      value += advance();
    }
    return value;
  };

  const consumeNumberWithUnit = (): void => {
    const startPos = pos;
    const startLine = line;
    const startColumn = column;

    const numValue = consumeNumber();
    addToken('number', numValue, startPos, startLine, startColumn);

    // Check for unit
    if (isIdentStart(peek()) || peek() === '%') {
      const unitStartPos = pos;
      const unitStartLine = line;
      const unitStartColumn = column;

      let unitValue = '';
      if (peek() === '%') {
        unitValue = advance();
      } else {
        unitValue = consumeIdentifier();
      }

      if (MODERN_UNITS.has(unitValue)) {
        addToken('unit', unitValue, unitStartPos, unitStartLine, unitStartColumn);
      } else {
        // Unknown unit, still tokenize it
        addToken('unit', unitValue, unitStartPos, unitStartLine, unitStartColumn);
      }
    }
  };

  const consumeHexColor = (): void => {
    const startPos = pos;
    const startLine = line;
    const startColumn = column;
    let value = advance(); // #

    while (/[0-9a-fA-F]/.test(peek())) {
      value += advance();
    }

    addToken('color-hex', value, startPos, startLine, startColumn);
  };

  const consumeSelector = (): void => {
    const startPos = pos;
    const startLine = line;
    const startColumn = column;
    let value = '';

    while (pos < source.length) {
      const char = peek();

      // End of selector
      if (char === '{' || char === ',' || char === ')') {
        break;
      }

      // Handle comments within selectors
      if (char === '/' && peek(1) === '*') {
        if (value) {
          addToken('selector', value, startPos, startLine, startColumn);
        }
        consumeComment();
        return;
      }

      // Handle strings
      if (char === '"' || char === "'") {
        if (value) {
          addToken('selector', value, startPos, startLine, startColumn);
          value = '';
        }
        consumeString(char);
        continue;
      }

      // Handle function calls in selectors (like :is(), :has(), etc.)
      if (char === '(') {
        // Check if we're in a pseudo-class function
        const lastColon = value.lastIndexOf(':');
        if (lastColon !== -1) {
          const funcName = value.slice(lastColon + 1).toLowerCase();
          if (MODERN_FUNCTIONS.has(funcName)) {
            // Output selector up to function name
            const beforeFunc = value.slice(0, lastColon + 1);
            if (beforeFunc) {
              addToken('selector', beforeFunc, startPos, startLine, startColumn);
            }
            // Output function name
            const funcStartLine = line;
            const funcStartColumn = column - funcName.length;
            addToken('function', funcName + advance(), pos - funcName.length - 1, funcStartLine, funcStartColumn);
            // Parse inside parens
            let parenDepth = 1;
            let parenContent = '';
            const parenStartPos = pos;
            const parenStartLine = line;
            const parenStartColumn = column;
            while (pos < source.length && parenDepth > 0) {
              const c = peek();
              if (c === '(') parenDepth++;
              if (c === ')') parenDepth--;
              if (parenDepth > 0) {
                parenContent += advance();
              }
            }
            if (parenContent) {
              addToken('selector', parenContent, parenStartPos, parenStartLine, parenStartColumn);
            }
            if (peek() === ')') {
              addToken('punctuation', advance(), pos - 1, line, column - 1);
            }
            return;
          }
        }
      }

      value += advance();
    }

    if (value) {
      addToken('selector', value, startPos, startLine, startColumn);
    }
  };

  const consumeProperty = (): void => {
    const startPos = pos;
    const startLine = line;
    const startColumn = column;
    let value = '';
    let isCustomProperty = false;

    // Handle custom properties (--var-name)
    if (peek() === '-' && peek(1) === '-') {
      isCustomProperty = true;
      value += advance() + advance();
    }

    while (isIdentChar(peek()) || peek() === '-') {
      value += advance();
    }

    if (value) {
      // Use 'custom-property' for CSS variables for consistent highlighting
      addToken(isCustomProperty ? 'custom-property' : 'property', value, startPos, startLine, startColumn);
    }
  };

  /**
   * Consume a custom property (--var-name) - used inside functions like var()
   */
  const consumeCustomProperty = (): void => {
    const startPos = pos;
    const startLine = line;
    const startColumn = column;
    let value = '';

    // Consume --
    value += advance() + advance();

    // Consume the rest of the identifier
    while (isIdentChar(peek()) || peek() === '-') {
      value += advance();
    }

    if (value) {
      addToken('custom-property', value, startPos, startLine, startColumn);
    }
  };

  const consumeValue = (): void => {
    while (pos < source.length) {
      const char = peek();

      // End of value
      if (char === ';' || char === '}' || char === '!') {
        break;
      }

      // Whitespace
      if (isWhitespace(char)) {
        consumeWhitespace();
        continue;
      }

      // Comments
      if (char === '/' && peek(1) === '*') {
        consumeComment();
        continue;
      }

      // Strings
      if (char === '"' || char === "'") {
        consumeString(char);
        continue;
      }

      // Hex colors
      if (char === '#') {
        consumeHexColor();
        continue;
      }

      // Numbers with units
      if (isDigit(char) || (char === '.' && isDigit(peek(1))) ||
          ((char === '-' || char === '+') && (isDigit(peek(1)) || (peek(1) === '.' && isDigit(peek(2)))))) {
        consumeNumberWithUnit();
        continue;
      }

      // Functions and identifiers
      if (isIdentStart(char)) {
        const startPos = pos;
        const startLine = line;
        const startColumn = column;
        const ident = consumeIdentifier();

        // Check if it's a function
        if (peek() === '(') {
          addToken('function', ident, startPos, startLine, startColumn);
          addToken('punctuation', advance(), pos - 1, line, column - 1); // (

          // Handle nested function content
          let parenDepth = 1;
          while (pos < source.length && parenDepth > 0) {
            const c = peek();

            if (c === '(') {
              parenDepth++;
              addToken('punctuation', advance(), pos - 1, line, column - 1);
            } else if (c === ')') {
              parenDepth--;
              if (parenDepth > 0) {
                addToken('punctuation', advance(), pos - 1, line, column - 1);
              }
            } else if (isWhitespace(c)) {
              consumeWhitespace();
            } else if (c === '/' && peek(1) === '*') {
              consumeComment();
            } else if (c === '"' || c === "'") {
              consumeString(c);
            } else if (c === '#') {
              consumeHexColor();
            } else if (c === ',') {
              addToken('punctuation', advance(), pos - 1, line, column - 1);
            } else if (c === '-' && peek(1) === '-') {
              // Custom property inside function (e.g., var(--my-var))
              consumeCustomProperty();
            } else if (isDigit(c) || (c === '.' && isDigit(peek(1))) ||
                       ((c === '-' || c === '+') && (isDigit(peek(1)) || (peek(1) === '.' && isDigit(peek(2)))))) {
              consumeNumberWithUnit();
            } else if (isIdentStart(c)) {
              // Recursive function or value
              const innerStartPos = pos;
              const innerStartLine = line;
              const innerStartColumn = column;
              const innerIdent = consumeIdentifier();

              if (peek() === '(') {
                addToken('function', innerIdent, innerStartPos, innerStartLine, innerStartColumn);
              } else {
                addToken('value', innerIdent, innerStartPos, innerStartLine, innerStartColumn);
              }
            } else {
              // Other characters
              addToken('value', advance(), pos - 1, line, column - 1);
            }
          }

          if (peek() === ')') {
            addToken('punctuation', advance(), pos - 1, line, column - 1);
          }
        } else {
          addToken('value', ident, startPos, startLine, startColumn);
        }
        continue;
      }

      // Comma
      if (char === ',') {
        addToken('punctuation', advance(), pos - 1, line, column - 1);
        continue;
      }

      // Other characters (operators, etc.)
      const startPos = pos;
      const startLine = line;
      const startColumn = column;
      addToken('value', advance(), startPos, startLine, startColumn);
    }
  };

  // Main tokenization loop
  while (pos < source.length) {
    const char = peek();

    // Whitespace
    if (isWhitespace(char)) {
      consumeWhitespace();
      continue;
    }

    // Comments
    if (char === '/' && peek(1) === '*') {
      consumeComment();
      continue;
    }

    // At-rules
    if (char === '@') {
      const startPos = pos;
      const startLine = line;
      const startColumn = column;
      advance(); // @

      const atRuleName = consumeIdentifier();
      const fullAtRule = '@' + atRuleName;
      addToken('atrule', fullAtRule, startPos, startLine, startColumn);

      // At-rule parameters
      consumeWhitespace();

      // Consume at-rule name/identifier if present
      if (isIdentStart(peek()) || peek() === '"' || peek() === "'") {
        if (peek() === '"' || peek() === "'") {
          consumeString(peek());
        } else {
          const nameStartPos = pos;
          const nameStartLine = line;
          const nameStartColumn = column;
          const name = consumeIdentifier();
          addToken('atrule-name', name, nameStartPos, nameStartLine, nameStartColumn);
        }
        consumeWhitespace();
      }

      // Handle at-rule body until { or ;
      while (pos < source.length && peek() !== '{' && peek() !== ';') {
        if (isWhitespace(peek())) {
          consumeWhitespace();
        } else if (peek() === '/' && peek(1) === '*') {
          consumeComment();
        } else if (peek() === '(') {
          addToken('punctuation', advance(), pos - 1, line, column - 1);
        } else if (peek() === ')') {
          addToken('punctuation', advance(), pos - 1, line, column - 1);
        } else if (peek() === ',') {
          addToken('punctuation', advance(), pos - 1, line, column - 1);
        } else if (peek() === ':') {
          addToken('punctuation', advance(), pos - 1, line, column - 1);
        } else if (isDigit(peek()) || (peek() === '.' && isDigit(peek(1)))) {
          consumeNumberWithUnit();
        } else if (isIdentStart(peek())) {
          const identStartPos = pos;
          const identStartLine = line;
          const identStartColumn = column;
          const ident = consumeIdentifier();

          if (peek() === '(') {
            addToken('function', ident, identStartPos, identStartLine, identStartColumn);
          } else {
            addToken('value', ident, identStartPos, identStartLine, identStartColumn);
          }
        } else {
          addToken('value', advance(), pos - 1, line, column - 1);
        }
      }

      continue;
    }

    // Opening brace
    if (char === '{') {
      braceDepth++;
      addToken('brace', advance(), pos - 1, line, column - 1, braceDepth);
      state = 'property';
      continue;
    }

    // Closing brace
    if (char === '}') {
      addToken('brace', advance(), pos - 1, line, column - 1, braceDepth);
      braceDepth = Math.max(0, braceDepth - 1);
      state = braceDepth > 0 ? 'property' : 'default';
      continue;
    }

    // Inside a rule block
    if (braceDepth > 0) {
      // Colon - end of property
      if (char === ':') {
        addToken('punctuation', advance(), pos - 1, line, column - 1);
        state = 'value';
        consumeWhitespace();
        consumeValue();
        continue;
      }

      // Semicolon - end of declaration
      if (char === ';') {
        addToken('punctuation', advance(), pos - 1, line, column - 1);
        state = 'property';
        continue;
      }

      // !important
      if (char === '!') {
        const startPos = pos;
        const startLine = line;
        const startColumn = column;
        advance();
        consumeWhitespace();
        const keyword = consumeIdentifier();
        addToken('keyword', '!' + keyword, startPos, startLine, startColumn);
        continue;
      }

      // Property name
      if (state === 'property' && (isIdentStart(char) || char === '-')) {
        consumeProperty();
        continue;
      }

      // Nested selector (CSS nesting)
      if (char === '&' || char === '.' || char === '#' || char === '[' || char === '*') {
        consumeSelector();
        continue;
      }
    }

    // Selector
    if (braceDepth === 0 && (isIdentStart(char) || char === '.' || char === '#' ||
        char === '[' || char === '*' || char === ':' || char === '&')) {
      consumeSelector();
      continue;
    }

    // Default: just consume the character
    addToken('text', advance(), pos - 1, line, column - 1);
  }

  return tokens;
}

/**
 * Get the CSS class name for a token type
 */
export function getTokenClassName(token: Token): string {
  if (token.type === 'brace' && token.depth !== undefined) {
    const depthClass = ((token.depth - 1) % 6) + 1;
    return `syntax-brace syntax-brace-${depthClass}`;
  }
  return `syntax-${token.type}`;
}
