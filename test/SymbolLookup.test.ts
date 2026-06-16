import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { lookupAt } from '../src/SymbolLookup'

describe('lookupAt', () => {
    it('finds the primary LaTeX command for a symbol', () => {
        const r = lookupAt('∀ x, P', 0)
        assert.equal(r?.symbol.latex, '\\forall')
        assert.equal(r?.match, '∀')
    })

    it('reports aliases when present', () => {
        const r = lookupAt('a → b', 2)
        assert.equal(r?.symbol.latex, '\\rightarrow')
        assert.deepEqual(r?.symbol.aliases, ['\\to'])
    })

    it('reports the package a command requires', () => {
        const r = lookupAt('ℝ', 0)
        assert.equal(r?.symbol.latex, '\\mathbb{R}')
        assert.equal(r?.symbol.requires, 'amssymb')
    })

    it('tags unicode-math-only commands', () => {
        const r = lookupAt('·', 0) // U+00B7, \cdotp is unicode-math
        assert.equal(r?.symbol.unicodeMath, true)
    })

    it('handles astral characters (surrogate pairs)', () => {
        const line = 'x 𝔸 y' // 𝔸 = U+1D538, two UTF-16 units starting at index 2
        const r = lookupAt(line, 2)
        assert.equal(r?.symbol.latex, '\\mathbb{A}')
        assert.equal(r?.match, '𝔸')
        assert.equal(r?.match.length, 2, 'match should span both surrogate halves')
    })

    it('respects the cursor offset, reading the char at that position', () => {
        const line = 'α∀'
        assert.equal(lookupAt(line, 0)?.symbol.latex, '\\alpha')
        assert.equal(lookupAt(line, 1)?.symbol.latex, '\\forall')
    })

    it('returns undefined for plain ASCII (no LaTeX command needed)', () => {
        assert.equal(lookupAt('x = 0 + 1', 0), undefined) // letter
        assert.equal(lookupAt('x = 0 + 1', 6), undefined) // '+'
    })

    it('returns undefined past the end of the text', () => {
        assert.equal(lookupAt('αβ', 5), undefined)
        assert.equal(lookupAt('', 0), undefined)
    })
})
