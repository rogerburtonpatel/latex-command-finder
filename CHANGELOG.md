# Changelog

All notable changes to this extension are documented here.

## [0.1.0] - 2026-06-09

### Added

- Hover over a Unicode character to see the LaTeX command that produces it
  (e.g. `→` → `\rightarrow` or `\to`, `ℝ` → `\mathbb{R}`, requires `amssymb`).
- Falls back to the `unicode-math` command (tagged `(unicode-math)`) when no
  classic LaTeX command exists.
- Settings: `latex-command-finder.languages`, `latex-command-finder.showAliases`,
  `latex-command-finder.showRequires`.
- Symbol data derived from Günter Milde's `unimathsymbols.txt` (2429 symbols).
