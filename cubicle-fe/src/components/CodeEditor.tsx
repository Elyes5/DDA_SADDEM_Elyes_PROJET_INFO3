import React from 'react'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import { Box } from '@mui/material'
import { LANGUAGE_TO_PRISM } from '../constants/languages'

// Core grammars
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-ruby'
import 'prismjs/components/prism-swift'
import 'prismjs/components/prism-kotlin'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-markup'  // HTML
import 'prismjs/components/prism-bash'

import 'prismjs/themes/prism-tomorrow.css'

interface CodeEditorProps {
  value: string
  language: string
  onChange: (code: string) => void
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  language,
  onChange,
}) => {
  const EditorComponent =
    (Editor as { default?: typeof Editor }).default ||
    Editor

  const highlightCode = (code: string) => {
    const prismKey = LANGUAGE_TO_PRISM[language] ?? 'javascript'
    const grammar = Prism.languages[prismKey] ?? Prism.languages.javascript
    return Prism.highlight(code, grammar, prismKey)
  }

  return (
    <Box
      sx={{
        borderRadius: 1,
        overflow: 'hidden',
        border: '1px solid #ddd',
        bgcolor: '#2d2d2d',
        color: 'white',
        minHeight: '250px',
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 14,
        '& textarea': { outline: 'none !important' },
      }}
    >
      <EditorComponent
        value={value}
        onValueChange={onChange}
        highlight={highlightCode}
        padding={15}
        style={{ minHeight: '250px' }}
      />
    </Box>
  )
}

export default CodeEditor
