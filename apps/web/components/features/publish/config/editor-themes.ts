export const editorThemes = {
  dark: {
    base: "vs-dark" as const,
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#1c1c1c",
      "editor.foreground": "#c9d1d9",
      "editor.lineHighlightBackground": "#161b22",
      "editorLineNumber.foreground": "#6e7681",
      "editor.selectionBackground": "#163356",
      "scrollbarSlider.background": "#24292f40",
      "scrollbarSlider.hoverBackground": "#32383f60",
      "scrollbarSlider.activeBackground": "#424a5380",
    },
  },
  light: {
    base: "vs" as const,
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#f5f5f5",
      "editor.foreground": "#24292f",
      "editor.lineHighlightBackground": "#f6f8fa",
      "editorLineNumber.foreground": "#8c959f",
      "editor.selectionBackground": "#b6e3ff",
      "scrollbarSlider.background": "#24292f20",
      "scrollbarSlider.hoverBackground": "#32383f30",
      "scrollbarSlider.activeBackground": "#424a5340",
    },
  },
}

export const editorOptions = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 14,
  lineNumbers: "off",
  folding: true,
  wordWrap: "on",
  automaticLayout: true,
  padding: { top: 16, bottom: 16 },
  scrollbar: {
    vertical: "visible",
    horizontal: "visible",
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
    useShadows: false,
  },
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  overviewRulerBorder: false,
  renderLineHighlight: "none",
  contextmenu: false,
  formatOnPaste: false,
  formatOnType: false,
  quickSuggestions: false,
  suggest: {
    showKeywords: false,
    showSnippets: false,
  },
  renderValidationDecorations: "off",
  hover: { enabled: false },
  inlayHints: { enabled: "off" },
  occurrencesHighlight: "off",
  selectionHighlight: false,
} as const