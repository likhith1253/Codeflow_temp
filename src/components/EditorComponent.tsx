import Editor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

interface EditorComponentProps {
  code: string;
  language: string;
  onChange: (value: string | undefined) => void;
}

const languageMap: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  c: "c",
  cpp: "cpp",
  csharp: "csharp",
  java: "java",
  kotlin: "kotlin",
  swift: "swift",
  php: "php",
  ruby: "ruby",
  go: "go",
  rust: "rust",
  r: "r",
  perl: "perl",
  bash: "shell",
  sql: "sql",
  scala: "scala",
  haskell: "haskell",
  lua: "lua",
  elixir: "elixir",
  clojure: "clojure",
  fsharp: "fsharp",
  dart: "dart",
  fortran: "fortran",
  cobol: "cobol",
  pascal: "pascal",
  assembly: "asm",
  arduino: "cpp",
};

const EditorComponent = ({ code, language, onChange }: EditorComponentProps) => {
  const monacoLanguage = languageMap[language] || "javascript";

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-editor-border bg-editor-bg">
      <Editor
        height="100%"
        language={monacoLanguage}
        value={code}
        onChange={onChange}
        theme="vs-dark"
        loading={
          <div className="flex h-full items-center justify-center bg-editor-bg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          lineNumbers: "on",
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          tabSize: 2,
        }}
      />
    </div>
  );
};

export default EditorComponent;
