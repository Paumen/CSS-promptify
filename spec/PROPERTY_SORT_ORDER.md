<!--
STATUS: Authoritative reference for property sorting
SOURCE OF TRUTH: If anything conflicts, spec/PRD_BUILD_SPEC.md wins
LLM_POLICY: Use this exact order when implementing format/sort-properties rule
-->

# Property Sort Order Specification

This document defines the **canonical property ordering** for the `format/sort-properties` rule.

---

## Sorting Modes

The rule supports two modes (configurable via `mode` parameter):

| Mode | Description |
|------|-------------|
| `grouped` | Properties sorted by logical category (default) |
| `alphabetical` | Properties sorted A-Z |

---

## Grouped Mode (Default)

Properties are sorted into logical groups in this order:

### Group 1: Content & Generation
```
content
quotes
counter-reset
counter-increment
```

### Group 2: Positioning
```
position
top
right
bottom
left
inset
inset-block
inset-block-start
inset-block-end
inset-inline
inset-inline-start
inset-inline-end
z-index
```

### Group 3: Display & Box Model
```
display
visibility
opacity
box-sizing
overflow
overflow-x
overflow-y
overflow-block
overflow-inline
clip
clip-path
```

### Group 4: Flexbox
```
flex
flex-grow
flex-shrink
flex-basis
flex-direction
flex-wrap
flex-flow
order
```

### Group 5: Grid
```
grid
grid-template
grid-template-columns
grid-template-rows
grid-template-areas
grid-auto-columns
grid-auto-rows
grid-auto-flow
grid-area
grid-row
grid-row-start
grid-row-end
grid-column
grid-column-start
grid-column-end
```

### Group 6: Alignment (Flex/Grid)
```
place-content
place-items
place-self
align-content
align-items
align-self
justify-content
justify-items
justify-self
gap
row-gap
column-gap
```

### Group 7: Dimensions
```
width
min-width
max-width
height
min-height
max-height
inline-size
min-inline-size
max-inline-size
block-size
min-block-size
max-block-size
aspect-ratio
```

### Group 8: Margin
```
margin
margin-top
margin-right
margin-bottom
margin-left
margin-block
margin-block-start
margin-block-end
margin-inline
margin-inline-start
margin-inline-end
```

### Group 9: Padding
```
padding
padding-top
padding-right
padding-bottom
padding-left
padding-block
padding-block-start
padding-block-end
padding-inline
padding-inline-start
padding-inline-end
```

### Group 10: Border
```
border
border-width
border-style
border-color
border-top
border-top-width
border-top-style
border-top-color
border-right
border-right-width
border-right-style
border-right-color
border-bottom
border-bottom-width
border-bottom-style
border-bottom-color
border-left
border-left-width
border-left-style
border-left-color
border-block
border-block-start
border-block-end
border-inline
border-inline-start
border-inline-end
border-radius
border-top-left-radius
border-top-right-radius
border-bottom-right-radius
border-bottom-left-radius
border-start-start-radius
border-start-end-radius
border-end-start-radius
border-end-end-radius
border-image
border-image-source
border-image-slice
border-image-width
border-image-outset
border-image-repeat
```

### Group 11: Background
```
background
background-color
background-image
background-repeat
background-position
background-position-x
background-position-y
background-size
background-attachment
background-origin
background-clip
background-blend-mode
```

### Group 12: Typography
```
font
font-family
font-size
font-weight
font-style
font-variant
font-stretch
font-size-adjust
line-height
letter-spacing
word-spacing
text-align
text-align-last
text-decoration
text-decoration-line
text-decoration-style
text-decoration-color
text-decoration-thickness
text-underline-offset
text-transform
text-indent
text-shadow
text-overflow
text-wrap
white-space
word-break
word-wrap
overflow-wrap
hyphens
vertical-align
```

### Group 13: Color
```
color
accent-color
caret-color
color-scheme
```

### Group 14: List
```
list-style
list-style-type
list-style-position
list-style-image
```

### Group 15: Table
```
table-layout
border-collapse
border-spacing
caption-side
empty-cells
```

### Group 16: Transform
```
transform
transform-origin
transform-style
perspective
perspective-origin
backface-visibility
```

### Group 17: Transition & Animation
```
transition
transition-property
transition-duration
transition-timing-function
transition-delay
animation
animation-name
animation-duration
animation-timing-function
animation-delay
animation-iteration-count
animation-direction
animation-fill-mode
animation-play-state
```

### Group 18: Interaction
```
cursor
pointer-events
touch-action
user-select
resize
scroll-behavior
scroll-snap-type
scroll-snap-align
scroll-margin
scroll-padding
```

### Group 19: Container Queries
```
container
container-name
container-type
```

### Group 20: Other / Misc
```
appearance
outline
outline-width
outline-style
outline-color
outline-offset
box-shadow
filter
backdrop-filter
mix-blend-mode
isolation
will-change
contain
object-fit
object-position
image-rendering
```

### Group 21: Custom Properties
```
--* (CSS custom properties, sorted alphabetically within group)
```

---

## Alphabetical Mode

When `mode: alphabetical`:
- All properties sorted A-Z
- Custom properties (`--*`) sorted alphabetically at the end
- Vendor prefixes sorted with their unprefixed equivalent

---

## Sorting Rules

1. **Within groups**: Properties maintain the order shown above
2. **Unknown properties**: Placed at end of Group 20 (Other/Misc), sorted alphabetically
3. **Custom properties**: Always last (Group 21), sorted alphabetically
4. **Vendor prefixes**: Placed immediately before their unprefixed version
5. **Shorthand before longhand**: e.g., `margin` before `margin-top`

---

## Example

**Input:**
```css
.box {
  color: blue;
  display: flex;
  margin-top: 10px;
  position: relative;
  --custom-color: red;
  padding: 20px;
  background: white;
}
```

**Output (grouped mode):**
```css
.box {
  position: relative;
  display: flex;
  margin-top: 10px;
  padding: 20px;
  background: white;
  color: blue;
  --custom-color: red;
}
```

---

## Implementation Notes

- This rule has `default_fixability: safe (auto)` and `max_fixability: safe (auto)` (sorting does not change semantics)
- Default severity: `info` (user can choose to apply)
- Enabled by default: `true`
- The fix is deterministic: same input always produces same order

---

END
