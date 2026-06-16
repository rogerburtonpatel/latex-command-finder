import { Hover, HoverProvider, MarkdownString, Position, Range, TextDocument, workspace } from 'vscode'
import { lookupAt } from './SymbolLookup'

/**
 * Shows the LaTeX command for the Unicode character under the cursor.
 *
 * Adapted from vscode-lean4's AbbreviationHoverProvider, but backed by a real
 * Unicode→LaTeX table (unimathsymbols) rather than Lean input abbreviations,
 * so it reports e.g. `\forall` and `\rightarrow` rather than `\all` or `\r`.
 */
export class LatexHoverProvider implements HoverProvider {
    provideHover(document: TextDocument, pos: Position): Hover | undefined {
        const line = document.lineAt(pos.line).text
        const found = lookupAt(line, pos.character)
        if (!found) {
            return undefined
        }

        const { match, symbol } = found
        const config = workspace.getConfiguration('latex-command-finder')
        const showAliases = config.get<boolean>('showAliases', true)
        const showRequires = config.get<boolean>('showRequires', true)

        const code = (s: string): string => '`' + s + '`'

        const commands = [symbol.latex, ...(showAliases ? (symbol.aliases ?? []) : [])].map(code)
        let line1 = `${code(match)} — LaTeX: ${commands.join(' or ')}`
        if (symbol.unicodeMath) {
            line1 += ' _(unicode-math)_'
        }

        const md = new MarkdownString(line1)
        if (showRequires && symbol.requires) {
            md.appendMarkdown(`\n\nRequires ${symbol.requires.split(' ').map(code).join(' or ')}`)
        }
        md.appendMarkdown(`\n\n${symbol.codepoint}`)

        const range = new Range(pos, pos.translate(0, match.length))
        return new Hover(md, range)
    }
}
