import { readFileSync } from 'fs'
import { join } from 'path'

export interface LatexSymbol {
    /** Preferred LaTeX command, e.g. `\rightarrow` or `\mathbb{R}`. */
    latex: string
    /** Equivalent standard commands, e.g. `\to` for `\rightarrow`. */
    aliases?: string[]
    /** Package(s) the command needs, space-separated, e.g. `amssymb`. */
    requires?: string
    /** True when only a `unicode-math` command exists (no classic LaTeX one). */
    unicodeMath?: boolean
    /** Unicode code point, e.g. `U+2192`. */
    codepoint: string
}

// The symbol table ships as a plain JSON data file next to the bundled
// extension (dist/latex-symbols.json), loaded at runtime rather than inlined
// into the code, so the package stays small and transparent. __dirname is the
// bundle's directory (dist/ in the extension, dist/test/ when running tests).
function loadTable(): Record<string, LatexSymbol> {
    const candidates = [join(__dirname, 'latex-symbols.json'), join(__dirname, '..', 'latex-symbols.json')]
    for (const path of candidates) {
        try {
            return JSON.parse(readFileSync(path, 'utf8')) as Record<string, LatexSymbol>
        } catch {
            // try next candidate
        }
    }
    throw new Error(`latex-command-finder: could not find latex-symbols.json (looked in ${candidates.join(', ')})`)
}

let cachedTable: Record<string, LatexSymbol> | undefined
const table = (): Record<string, LatexSymbol> => (cachedTable ??= loadTable())

/**
 * Looks up the LaTeX command(s) for the character at `offset` within `text`.
 *
 * Returns the matched symbol together with the matched substring so callers can
 * build a precise hover range. Tries a two-code-point sequence first (to catch
 * combining marks such as `≠` written as `=` + U+0338) and then a single code
 * point (which may be a surrogate pair, e.g. `𝔸`).
 */
export function lookupAt(text: string, offset: number): { match: string; symbol: LatexSymbol } | undefined {
    const cps = [...text.slice(offset)]
    if (cps.length === 0) {
        return undefined
    }

    const symbols = table()
    const two = cps.length >= 2 ? cps[0] + cps[1] : undefined
    if (two && symbols[two]) {
        return { match: two, symbol: symbols[two] }
    }

    const one = cps[0]
    if (symbols[one]) {
        return { match: one, symbol: symbols[one] }
    }

    return undefined
}
