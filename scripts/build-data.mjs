// Parses data/unimathsymbols.txt (Günter Milde, LPPL) into src/latex-symbols.json,
// a reverse map: Unicode character -> the LaTeX command(s) that produce it.
//
// Source columns (caret-delimited, see the file header):
//   1 codepoint  2 char  3 (La)TeX command  4 unicode-math command
//   5 class  6 category  7 requirements/conflicts  8 comments (aliases + notes)
//
// Regenerate with: npm run build:data

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(join(root, 'data', 'unimathsymbols.txt'), 'utf8')

/** @type {Record<string, {latex: string, aliases?: string[], requires?: string, unicodeMath?: boolean, codepoint: string}>} */
const out = {}

for (const rawLine of src.split('\n')) {
    const line = rawLine.trimEnd()
    if (!line || line.startsWith('#')) continue

    const parts = line.split('^')
    if (parts.length < 8) continue
    // Comments never contain '^', but rejoin defensively if they ever do.
    const fields = parts.slice(0, 7).map(f => f.trim())
    fields.push(parts.slice(7).join('^').trim())
    const [codepoint, char, texCmd, umathCmd, , , reqRaw, comments] = fields

    if (!char) continue

    const unicodeMath = !texCmd && !!umathCmd
    const latex = texCmd || umathCmd
    if (!latex) continue
    // Skip trivial self-maps (e.g. 'x' -> 'x', '+' -> '+'): a real command has a backslash.
    // These would otherwise pop a useless hover on nearly every character in a file.
    if (!latex.includes('\\')) continue

    // Requirements: keep positive package tokens, drop conflict (-foo) and "literal" noise.
    // Some tokens name a math-font feature rather than a package; map those to the
    // package that provides them ('' = built-in, no package needed).
    const featurePackage = {
        mathbb: 'amssymb',
        mathfrak: 'amssymb',
        mathscr: 'mathrsfs',
        mathcal: '',
        mathrm: '',
        mathsf: '',
        mathbf: '',
        mathit: '',
        mathtt: '',
    }
    const requires = reqRaw
        .split(/\s+/)
        .filter(t => t && !t.startsWith('-') && t !== 'literal')
        .map(t => (t in featurePackage ? featurePackage[t] : t))
        .filter(t => t)
        .join(' ')

    // Aliases: only unqualified standard commands, i.e. a comment segment that is
    // exactly "= \cmd" or "# \cmd" with no trailing "(package)" note.
    const aliases = []
    for (const seg of comments.split(',')) {
        const m = seg.trim().match(/^[=#]\s+(\\[A-Za-z]+)$/)
        if (m && m[1] !== latex && !aliases.includes(m[1])) aliases.push(m[1])
    }

    // codepoint field is unique, so first writer wins; only fill if unseen.
    if (out[char]) continue
    const entry = { latex, codepoint: `U+${codepoint}` }
    if (aliases.length) entry.aliases = aliases
    if (requires) entry.requires = requires
    if (unicodeMath) entry.unicodeMath = true
    out[char] = entry
}

writeFileSync(join(root, 'src', 'latex-symbols.json'), JSON.stringify(out, null, 0) + '\n')
console.log(`Wrote ${Object.keys(out).length} symbols to src/latex-symbols.json`)
