// Misc
import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { AutocompletionUI } from "./components/AutocompletionUI";
import { CompletionState, DocumentationInfo } from "./types";
import { allSuggestions, getDocumentation } from "./utils";
import { Completion, closeBrackets, autocompletion, completionStatus, CompletionContext } from "@codemirror/autocomplete";
import { history, defaultKeymap, historyKeymap, indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { indentOnInput, bracketMatching } from "@codemirror/language";
import { StateField } from "@codemirror/state";
import { keymap, EditorView, ViewPlugin, lineNumbers } from "@codemirror/view";
import { useHotkeys } from "react-hotkeys-hook";
import { ayuLight } from "thememirror";
import UIOptionsCheckbox from "./components/UIOptionsCheckbox";

const getSuggestionsHeadless = (context: CompletionContext) => {
  // Rechercher les mots alphanumériques
  const word = context.matchBefore(/\w+/);
  // Rechercher les symboles (|, &, =, !, etc.)
  const symbol = context.matchBefore(/[|&=!.+]+/);

  // Si ni mot ni symbole n'est trouvé et que ce n'est pas explicite, ne rien retourner
  if (!word && !symbol && !context.explicit) return null;

  // Détermine le texte à utiliser pour la recherche
  const match = word || symbol;
  const matchText = match ? match.text.toLowerCase() : "";

  // Filtrer les suggestions selon le texte saisi
  const filteredSuggestions = match ? allSuggestions.filter((s) => s.label.toLowerCase().startsWith(matchText)) : allSuggestions;

  return {
    from: match ? match.from : context.pos,
    options: filteredSuggestions,
    span: match || /[\w|&=!.+]*/,
  };
};

const customCompletionState = StateField.define<CompletionState>({
  create(): CompletionState {
    return {
      active: false,
      options: [],
      selected: 0,
      from: 0,
      to: 0,
      explicitly: false,
    };
  },
  update(value, tr) {
    if (!tr.docChanged && !tr.selection) return value;

    const status = completionStatus(tr.state);

    if (!status || status !== "active") {
      return { ...value, active: false };
    }

    const context = new CompletionContext(tr.state, tr.state.selection.main.head, false);
    const result = getSuggestionsHeadless(context);

    if (!result) return { ...value, active: false };

    return {
      active: true,
      options: result.options,
      selected: 0,
      from: result.from,
      to: tr.state.selection.main.head,
      explicitly: context.explicit || false,
    };
  },
});

export default function PayrollEditorCustomUI() {
  const [value, setValue] = useState();
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const [completionInfo, setCompletionInfo] = useState<CompletionState>({
    active: false,
    options: [],
    selected: 0,
    from: 0,
    to: 0,
    explicitly: false,
  });
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [activeCategory, setActiveCategory] = useState("all");
  const [filterText, setFilterText] = useState("");
  const [uiOptions, setUiOptions] = useState({
    showCategories: false,
    showSearchInput: false,
    showSuggestionDetail: false,
    showIconForType: false,
    showInfoBar: true,
  });
  const suggestionsRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const editorRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  const customPlugin = ViewPlugin.fromClass(
    class {
      view: EditorView;
      constructor(view: EditorView) {
        this.view = view;
        setEditorView(view);
      }

      update(update: { docChanged?: boolean; selectionSet?: boolean; state: any; view: EditorView }) {
        if (update.docChanged || update.selectionSet) {
          const state = update.state.field(customCompletionState, false);
          if (state) {
            setCompletionInfo(state);

            if (state.active) {
              const pos = update.view.coordsAtPos(state.from);
              if (pos) {
                const editorRect = update.view.dom.getBoundingClientRect();
                setPosition({
                  top: pos.bottom - editorRect.top,
                  left: pos.left - editorRect.left,
                });
              }
            }
          }
        }
      }
    }
  );

  const filteredSuggestions = completionInfo.options.filter((suggestion) => {
    const matchesCategory = activeCategory === "all" || suggestion.type === activeCategory;
    const matchesText = !filterText || suggestion.label.toLowerCase().includes(filterText.toLowerCase()) || (suggestion.detail && suggestion.detail.toLowerCase().includes(filterText.toLowerCase()));
    return matchesCategory && matchesText;
  });

  const applySuggestion = useCallback(
    (suggestion: Completion) => {
      if (!editorView || !completionInfo.active) return;

      const { from, to } = completionInfo;

      if (typeof suggestion.apply === "function") {
        suggestion.apply(editorView, suggestion, from, to);
      } else {
        const insertText = suggestion.label;
        editorView.dispatch({
          changes: { from, to, insert: insertText },
          selection: { anchor: from + insertText.length },
        });
      }

      setCompletionInfo((prev) => ({ ...prev, active: false }));
      setFilterText("");

      setTimeout(() => {
        editorView.focus();
      }, 0);
    },
    [editorView, completionInfo, setCompletionInfo, setFilterText]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (suggestionsRef.current && !suggestionsRef.current.contains(target) && editorRef.current && !editorRef.current.contains(target)) {
        setCompletionInfo((prev) => ({ ...prev, active: false }));
        setFilterText("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedSuggestion = filteredSuggestions[completionInfo.selected] || (filteredSuggestions.length > 0 ? filteredSuggestions[0] : null);
  const [activeDocumentation, setActiveDocumentation] = useState<DocumentationInfo | null>(null);
  const onChange = useCallback((value) => setValue(value), []);

  const setActiveSuggestion = useCallback(
    (suggestion: Completion | null) => {
      if (suggestion && selectedSuggestion && suggestion.label === selectedSuggestion.label) {
        setActiveDocumentation(getDocumentation(suggestion));
      } else if (suggestion) {
        setActiveDocumentation(getDocumentation(suggestion));
      } else {
        setActiveDocumentation(null);
      }
    },
    [selectedSuggestion]
  );

  const handleToggleOption = useCallback((optionId, value) => {
    setUiOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }));
  }, []);

  const extensions = useMemo(
    () => [
      // Misc
      ayuLight,
      javascript(),
      customCompletionState,
      customPlugin,

      // Extensions supplémentaires
      history(),
      bracketMatching(),
      lineNumbers(),
      closeBrackets(),
      indentOnInput(),

      // Customisation de l'UI
      EditorView.theme({
        "&.cm-editor": {
          border: "1px solid #e5e5e5",
          height: "200px",
          overflow: "hidden",
          color: "#5c6166",
          borderRadius: "8px !important",
          backgroundColor: "#f1f1f1",
        },
        "&.cm-editor .cm-scroller": {
          outline: "none !important",
          padding: "8px 0",
          overflow: "auto",
        },
        "&.cm-editor .cm-content": {
          outline: "none !important",
        },
        "&.cm-editor .cm-content *:focus-visible": {
          outline: "none !important",
        },
        ".cm-gutters": {
          backgroundColor: "transparent !important",
          borderRight: "none",
        },
        ".cm-gutterElement": {
          padding: "0 8px 0 14px !important",
        },
        ".cm-placeholder": {
          color: "#00000040",
        },
        "&.cm-focused": {
          outline: "none !important",
        },
      }),

      // Autocomplétion
      autocompletion({
        override: [],
        activateOnTyping: false,
        closeOnBlur: false,
        icons: false,
      }),

      // Raccourcis clavier / commandes
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),

      // Hook pour la gestion des snippets / positionnement de l'UI de suggestion
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const changes = update.changes;
          let shouldActivateCompletion = false;

          // Vérifier s'il y a du texte avant la position du curseur
          const cursor = update.state.selection.main.head;
          const line = update.state.doc.lineAt(cursor);
          const lineText = line.text.substring(0, cursor - line.from);

          // Activer les suggestions si:
          // 1. Il y a du texte avant le curseur (pour ne pas activer à une ligne vide)
          // 2. Le texte correspond à un motif alphanumérique ou un symbole spécial
          if (lineText.length > 0 && (/\w+$/.test(lineText) || /[|&=!.+]+$/.test(lineText))) {
            shouldActivateCompletion = true;
          }

          // Vérifier également si un caractère vient d'être ajouté (comportement original)
          changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
            const text = inserted.toString();
            if (text.length === 1 && (/[a-zA-Z]/.test(text) || /[|&=!.+]/.test(text))) {
              shouldActivateCompletion = true;
            }
          });

          if (shouldActivateCompletion) {
            const context = new CompletionContext(update.state, update.state.selection.main.head, false);
            const result = getSuggestionsHeadless(context);

            if (result && result.options.length > 0) {
              const word = context.matchBefore(/\w+/);
              const to = word ? word.to : update.state.selection.main.head;

              setCompletionInfo({
                active: true,
                options: result.options,
                selected: 0,
                from: result.from,
                to: to,
                explicitly: false,
              });

              const pos = update.view.coordsAtPos(result.from);
              if (pos) {
                const editorRect = update.view.dom.getBoundingClientRect();
                setPosition({
                  top: pos.bottom - editorRect.top,
                  left: pos.left - editorRect.left,
                });
              }
            } else {
              // Si aucune suggestion n'est trouvée, fermer l'UI de suggestion
              setCompletionInfo((prev) => ({ ...prev, active: false }));
            }
          }
        }
      }),
    ],
    []
  );

  useEffect(() => {
    if (!editorRef.current) return;

    const handleSuggestionNavigation = (e) => {
      if (!completionInfo.active || filteredSuggestions.length === 0) return;

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();

        setCompletionInfo((prev) => {
          const newSelected = e.key === "ArrowDown" ? (prev.selected + 1) % filteredSuggestions.length : prev.selected > 0 ? prev.selected - 1 : filteredSuggestions.length - 1;

          setActiveDocumentation(getDocumentation(filteredSuggestions[newSelected]));

          return {
            ...prev,
            selected: newSelected,
          };
        });
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        applySuggestion(filteredSuggestions[completionInfo.selected]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setCompletionInfo((prev) => ({ ...prev, active: false }));
        setFilterText("");

        setTimeout(() => {
          editorView?.focus();
        }, 0);
      }
    };

    document.addEventListener("keydown", handleSuggestionNavigation, { capture: true });

    return () => {
      document.removeEventListener("keydown", handleSuggestionNavigation, { capture: true });
    };
  }, [completionInfo.active, filteredSuggestions, completionInfo.selected, applySuggestion, editorView]);

  useEffect(() => {
    if (selectedSuggestion) {
      setActiveDocumentation(getDocumentation(selectedSuggestion));
    } else {
      setActiveDocumentation(null);
    }
  }, [selectedSuggestion]);

  useHotkeys(
    "ctrl+space",
    (e) => {
      e.preventDefault();

      if (editorView) {
        console.log("Ctrl+Space detected via useHotkeys");

        const context = new CompletionContext(editorView.state, editorView.state.selection.main.head, true);
        const result = getSuggestionsHeadless(context);

        if (result && result.options.length > 0) {
          const pos = editorView.coordsAtPos(result.from);
          if (pos) {
            const editorRect = editorView.dom.getBoundingClientRect();
            setPosition({
              top: pos.bottom - editorRect.top,
              left: pos.left - editorRect.left,
            });

            setCompletionInfo({
              active: true,
              options: result.options,
              selected: 0,
              from: result.from,
              to: editorView.state.selection.main.head,
              explicitly: true,
            });
          }
        }
      }
    },
    {
      enableOnContentEditable: true,
      preventDefault: true,
    },
    [editorView]
  );

  return (
    <div className="max-w-2xl mx-auto flex flex-col w-full gap-4">
      <h2 className="text-sm font-semibold text-gray-700">Éditeur avec UI d'autocomplétion personnalisée</h2>
      <UIOptionsCheckbox {...uiOptions} onToggleOption={handleToggleOption} />
      <div className="relative flex-grow" ref={editorRef}>
        <CodeMirror value={value} onChange={onChange} extensions={extensions} className="outline-none border-none" placeholder="Entrez votre code ici..." basicSetup={false} />
        <AutocompletionUI
          completionInfo={completionInfo}
          position={position}
          activeCategory={activeCategory}
          filterText={filterText}
          filteredSuggestions={filteredSuggestions}
          documentation={activeDocumentation}
          selectedSuggestion={selectedSuggestion}
          // Utilisation des options UI dynamiques
          showCategories={uiOptions.showCategories}
          showSearchInput={uiOptions.showSearchInput}
          showSuggestionDetail={uiOptions.showSuggestionDetail}
          showIconForType={uiOptions.showIconForType}
          showInfoBar={uiOptions.showInfoBar}
          setActiveCategory={setActiveCategory}
          setFilterText={setFilterText}
          setCompletionInfo={setCompletionInfo}
          applySuggestion={applySuggestion}
          suggestionsRef={suggestionsRef}
          editorRef={editorRef}
          onHoverSuggestion={setActiveSuggestion}
        />
      </div>
      <div className="p-3 bg-white rounded-md shadow-bevel-xs">
        <div className="flex flex-col gap-2 text-gray-15">
          <p className="font-semibold text-sm">Fonctionnalités</p>
            <ul className="space-y-1 list-disc pl-4 text-xs">
            <li>Navigation intuitive avec les flèches ↑/↓ et sélection avec Enter</li>
            <li>Filtrage par catégorie et recherche textuelle</li>
            <li>Documentation détaillée et exemples d'utilisation</li>
            <li>Activation automatique pendant la frappe ou avec Ctrl+Space</li>
            </ul>
        </div>
      </div>
    </div>
  );
}
