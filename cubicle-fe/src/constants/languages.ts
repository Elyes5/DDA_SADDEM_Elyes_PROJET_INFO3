/**
 * The single source of truth for all supported languages in Cubicle.
 * Used by FilterSortBar, CreateSnippetModal, EditSnippetModal, and CodeEditor.
 * The casing here is what gets stored in the DB — do not change it.
 */
export const LANGUAGES = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C',
    'C++',
    'C#',
    'Go',
    'Rust',
    'PHP',
    'Ruby',
    'Swift',
    'Kotlin',
    'React JSX',
    'SQL',
    'CSS',
    'HTML',
    'Bash',
] as const

export type Language = (typeof LANGUAGES)[number]

/** Maps a stored language value to the Prism grammar key. */
export const LANGUAGE_TO_PRISM: Record<string, string> = {
    JavaScript: 'javascript',
    TypeScript: 'typescript',
    Python: 'python',
    Java: 'java',
    C: 'c',
    'C++': 'cpp',
    'C#': 'csharp',
    Go: 'go',
    Rust: 'rust',
    PHP: 'php',
    Ruby: 'ruby',
    Swift: 'swift',
    Kotlin: 'kotlin',
    'React JSX': 'jsx',
    SQL: 'sql',
    CSS: 'css',
    HTML: 'markup',
    Bash: 'bash',
}

/** Maps a stored language value to the react-syntax-highlighter / Prism language key. */
export const LANGUAGE_TO_HIGHLIGHTER: Record<string, string> = {
    ...LANGUAGE_TO_PRISM,
    HTML: 'html',  // react-syntax-highlighter uses 'html' not 'markup'
}

/** Dot/badge color for each language, keyed by the stored value lowercased. */
export const LANG_COLORS: Record<string, string> = {
    javascript: '#F0DB4F',
    typescript: '#3178C6',
    python: '#3572A5',
    java: '#B07219',
    c: '#555555',
    'c++': '#F34B7D',
    'c#': '#178600',
    go: '#00ACD7',
    rust: '#CE412B',
    php: '#4F5D95',
    ruby: '#701516',
    swift: '#FA7343',
    kotlin: '#A97BFF',
    'react jsx': '#61DAFB',
    sql: '#E38C00',
    css: '#563D7C',
    html: '#E34C26',
    bash: '#4EAA25',
}

/** Returns the dot color for a language, falling back to a neutral grey. */
export function getLangColor(lang?: string | null): string {
    return LANG_COLORS[lang?.toLowerCase() ?? ''] ?? '#9E9E9E'
}
