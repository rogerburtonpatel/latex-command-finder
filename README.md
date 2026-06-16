# latex-command-finder
VSCode extension that shows the **LaTeX command** for a Unicode character on hover.


Hover over `→` and you get *"`→` — LaTeX: `\rightarrow` or `\to`"*; hover over `ℝ` and
you get *"`ℝ` — LaTeX: `\mathbb{R}` · Requires `amssymb`"*. Works in any file, so it's handy
for Rocq/Coq (`.v`), Lean, Agda, Markdown, or plain notes full of math symbols.

Unlike input-method tables (e.g. Lean's `\all` → ∀), this reports the *real* LaTeX command
(`\forall`), falling back to the [`unicode-math`](https://ctan.org/pkg/unicode-math) command
(tagged `(unicode-math)`) when no classic command exists.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `latex-command-finder.languages` | `["*"]` | Language ids to enable hover for. `*` = all files. e.g. `["coq", "lean4", "markdown"]`. |
| `latex-command-finder.showAliases` | `true` | Also show equivalent commands (e.g. `\to` for →). |
| `latex-command-finder.showRequires` | `true` | Show the package a command needs (e.g. `amssymb`). |

## Development

```bash
npm install
npm run build      # bundle to dist/extension.js (esbuild)
npm run compile    # type-check only
```

Press <kbd>F5</kbd> to launch the Extension Development Host, then hover a Unicode symbol.

### Regenerating the symbol table

`src/latex-symbols.json` is generated from `data/unimathsymbols.txt`:

```bash
npm run build:data
```

## Credits & licensing

- The symbol data in `data/unimathsymbols.txt` is **`unimathsymbols.txt`** by Günter Milde,
  distributed under the [LaTeX Project Public License](https://www.latex-project.org/lppl.txt).
  `src/latex-symbols.json` is a derived reverse map.
- The hover approach is adapted from
  [`vscode-lean4`](https://github.com/leanprover/vscode-lean4) (Apache-2.0).

This extension is licensed under MIT (see `LICENSE`).
