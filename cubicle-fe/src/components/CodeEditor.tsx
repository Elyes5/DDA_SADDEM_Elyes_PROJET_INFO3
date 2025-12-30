import React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import { Box } from '@mui/material';

import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-tomorrow.css';

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (code: string) => void;
}

const LANGUAGE_MAP: { [key: string]: string } = {
  'Javascript': 'javascript',
  'Python': 'python',
  'Typescript': 'typescript',
  'React JSX': 'jsx',
  'SQL': 'sql',
  'Java': 'java',
  'CSS': 'css'
};

const CodeEditor: React.FC<CodeEditorProps> = ({ value, language, onChange }) => {
const EditorComponent = (Editor as { default?: typeof Editor }).default || Editor;

  const highlightCode = (code: string) => {
    const lang = LANGUAGE_MAP[language] || 'javascript';
    return Prism.highlight(code, Prism.languages[lang], lang);
  };

  return (
    <Box sx={{ 
      borderRadius: 2, 
      overflow: 'hidden', 
      border: '1px solid #ddd',
      bgcolor: '#2d2d2d', 
      color: 'white',
      minHeight: '250px',
      fontFamily: '"Fira code", "Fira Mono", monospace',
      fontSize: 14,
      '& textarea': { outline: 'none !important' }
    }}>
      <EditorComponent
        value={value}
        onValueChange={onChange}
        highlight={highlightCode}
        padding={15}
        style={{ minHeight: '250px' }}
      />
    </Box>
  );
};

export default CodeEditor;