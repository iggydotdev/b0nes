# b0nes CSS Utility Library

This is the documentation for the b0nes utility-first CSS library. It includes multiple CSS files for modularity, simplicity, and speed.

## Files Included

* reset.css
* tokens.css
* core.css
* layout.css
* grid.css
* utilities.css
* responsive.css

## Installation

Include the files in your HTML:

```html
<link rel="stylesheet" href="/styles/b0nes/reset.css">
<link rel="stylesheet" href="/styles/b0nes/tokens.css">
<link rel="stylesheet" href="/styles/b0nes/core.css">
<link rel="stylesheet" href="/styles/b0nes/layout.css">
<link rel="stylesheet" href="/styles/b0nes/grid.css">
<link rel="stylesheet" href="/styles/b0nes/utilities.css">
<link rel="stylesheet" href="/styles/b0nes/responsive.css">
```

## Usage Example

```html
<div class="container grid sm-cols-2 p3">
  <div class="p2 round shadow">Card</div>
  <div class="p2 round shadow">Card</div>
</div>
```


✅ b0nes-css: a minimal, utility-first CSS library
Design Goals

Human-readable class names (no md:grid-cols-3, no weird abbreviations).

Small + fast (no build step required).

Grid-first layout using grid areas where possible.

Classic utilities for spacing, typography, colors.

Mobile-first but use semantic breakpoint classes, not embedded queries in every rule.

Composable, predictable, “you always know what it does”.