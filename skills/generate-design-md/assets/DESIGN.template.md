---
version: alpha
name: <SYSTEM_NAME>
description: <CORE_DESCRIPTION_AND_SCOPE>
colors:
  primary: "<COLOR>"
  on-primary: "<COLOR>"
  canvas: "<COLOR>"
  surface: "<COLOR>"
  ink: "<COLOR>"
  ink-muted: "<COLOR>"
  hairline: "<COLOR>"
typography:
  display-lg:
    fontFamily: <FONT_STACK>
    fontSize: <SIZE>
    fontWeight: <WEIGHT>
    lineHeight: <LINE_HEIGHT>
    letterSpacing: <LETTER_SPACING>
  title-md:
    fontFamily: <FONT_STACK>
    fontSize: <SIZE>
    fontWeight: <WEIGHT>
    lineHeight: <LINE_HEIGHT>
    letterSpacing: <LETTER_SPACING>
  body-md:
    fontFamily: <FONT_STACK>
    fontSize: <SIZE>
    fontWeight: <WEIGHT>
    lineHeight: <LINE_HEIGHT>
    letterSpacing: <LETTER_SPACING>
  label-sm:
    fontFamily: <FONT_STACK>
    fontSize: <SIZE>
    fontWeight: <WEIGHT>
    lineHeight: <LINE_HEIGHT>
    letterSpacing: <LETTER_SPACING>
rounded:
  sm: <DIMENSION>
  md: <DIMENSION>
  lg: <DIMENSION>
spacing:
  xs: <DIMENSION>
  sm: <DIMENSION>
  md: <DIMENSION>
  lg: <DIMENSION>
  xl: <DIMENSION>
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "<PADDING>"
---

# DESIGN.md

## Overview

<VISUAL_THEME_DENSITY_AND_SIGNATURE_RELATIONSHIPS>

## Colors

<SEMANTIC_COLOR_ROLES_AND_COMBINATIONS>

## Typography

<TYPE_HIERARCHY_RULES_AND_FONT_SUBSTITUTES>

## Layout

<SPACING_CONTAINER_GRID_AND_WHITESPACE_RULES>

## Elevation & Depth

<SURFACE_BORDER_AND_SHADOW_LADDER>

## Shapes

<RADIUS_ASPECT_RATIO_AND_GEOMETRY_RULES>

## Components

<CORE_COMPONENTS_VARIANTS_AND_STATES>

## Do's and Don'ts

### Do

- <DO_RULE>

### Don't

- <DONT_RULE>

## Responsive Behavior

<OBSERVED_BREAKPOINTS_COLLAPSING_AND_TOUCH_RULES>

## Agent Prompt Guide

<SHORT_IMPLEMENTATION_PROMPT_USING_TOKENS>

## Source Scope & Confidence

- 分析日期：<YYYY-MM-DD>
- 来源范围：<PAGES_FILES_OR_SCREENSHOTS>
- 已检查视口：<VIEWPORTS>
- 高置信项：<DIRECTLY_OBSERVED_OR_EXTRACTED>
- 中低置信项：<INFERRED_ITEMS>
- 未观察内容：<MISSING_STATES_OR_SURFACES>
- 声明：<THIRD_PARTY_OR_FIRST_PARTY_STATUS>

## Known Gaps

- <FONT_LICENSE_UNOBSERVED_STATES_OR_OUT_OF_SCOPE_SURFACES>
