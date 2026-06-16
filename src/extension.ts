import { Disposable, ExtensionContext, languages, workspace } from 'vscode'
import { LatexHoverProvider } from './LatexHoverProvider'

let registration: Disposable | undefined

function register(): void {
    registration?.dispose()
    // A plain string selector is a language id; '*' is the documented wildcard.
    const langs = workspace.getConfiguration('latex-command-finder').get<string[]>('languages', ['*'])
    registration = languages.registerHoverProvider(langs, new LatexHoverProvider())
}

export function activate(context: ExtensionContext): void {
    register()
    context.subscriptions.push(
        workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('latex-command-finder.languages')) {
                register()
            }
        }),
        { dispose: () => registration?.dispose() },
    )
}

export function deactivate(): void {
    registration?.dispose()
    registration = undefined
}
