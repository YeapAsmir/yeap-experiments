/* eslint-disable no-template-curly-in-string */
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import {
  autocompletion,
  snippetCompletion,
  CompletionContext,
  completionStatus,
  Completion
} from "@codemirror/autocomplete";
import { EditorView, keymap, ViewPlugin } from "@codemirror/view";
import { syntaxHighlighting, defaultHighlightStyle } from "@codemirror/language";
import { StateField } from "@codemirror/state";
import { tomorrow } from "thememirror";
import { AutocompletionUI } from "./components/AutocompletionUI";
import { InfoBar } from "./components/InfoBar";
import { CompletionState, EditorProps } from "./types";
import { getDocumentation } from "./utils";
import { defaultKeymap } from "@codemirror/commands";

const allSuggestions = [
  snippetCompletion("test(#{1:hello}, #{2:sir})", {
    label: "test",
    type: "function",
    detail: "Test de la fonction",
  }),
  snippetCompletion("si(#{1:condition}; #{2:valeur_si_vrai}; #{3:valeur_si_faux})", {
    label: "si",
    type: "function",
    detail: "Évalue une condition et retourne une valeur selon le résultat",
    boost: 99,
  }),
  snippetCompletion("base()", {
    label: "base()",
    type: "function",
    detail: "Retourne la valeur de base selon le diplôme",
  }),
  snippetCompletion("siNull(#{1:valeur}; #{2:valeur_alternative})", {
    label: "siNull",
    type: "function",
    detail: "Vérifie si une valeur est nulle et retourne une valeur alternative",
  }),
  snippetCompletion("somme(#{1:valeur1}; #{2:valeur2}; #{3:...})", {
    label: "somme",
    type: "function",
    detail: "Calcule la somme de plusieurs valeurs",
  }),
  snippetCompletion("moyenne(#{1:valeur1}; #{2:valeur2}; #{3:...})", {
    label: "moyenne",
    type: "function",
    detail: "Calcule la moyenne de plusieurs valeurs",
  }),
  snippetCompletion("arrondi(#{1:nombre}; #{2:decimales})", {
    label: "arrondi",
    type: "function",
    detail: "Arrondit un nombre au nombre de décimales spécifié",
  }),
  snippetCompletion("base()=50", {
    label: "base()=50",
    type: "constant",
    detail: "CAP",
  }),
  snippetCompletion("base()=70", {
    label: "base()=70",
    type: "constant",
    detail: "BP / BAC",
  }),
  snippetCompletion("edpCommentaire", {
    label: "edpCommentaire",
    type: "variable",
    detail: "Commentaire associé à la prime",
  }),
  snippetCompletion("edpMontant", {
    label: "edpMontant",
    type: "variable",
    detail: "Montant de la prime",
  }),
  snippetCompletion(" + ", {
    label: "+",
    type: "operator",
    detail: "Concatène ou additionne",
  }),
  snippetCompletion(" != ", {
    label: "!=",
    type: "operator",
    detail: "Différent",
  }),
  snippetCompletion("concat(#{1:texte1}; #{2:texte2}; #{3:...})", {
    label: "concat",
    type: "function",
    detail: "Concatène plusieurs chaînes de caractères",
  }),
  snippetCompletion("multiplePar(#{1:montant}; #{2:coefficient})", {
    label: "multiplePar",
    type: "function",
    detail: "Multiplie par un coefficient selon le diplôme",
  }),
  snippetCompletion("anneesDiplome(#{1:dateObtention})", {
    label: "anneesDiplome",
    type: "function",
    detail: "Années écoulées depuis l'obtention du diplôme",
  }),
  snippetCompletion("majoration(#{1:montant}; #{2:pourcentage})", {
    label: "majoration",
    type: "function",
    detail: "Applique une majoration selon l'ancienneté",
  }),
  snippetCompletion("niveauDiplome()", {
    label: "niveauDiplome",
    type: "function",
    detail: "Niveau du diplôme (I à V)",
  }),
  snippetCompletion("plafond(#{1:valeur}; #{2:maximum})", {
    label: "plafond",
    type: "function",
    detail: "Limite une valeur à un maximum",
  }),
  snippetCompletion("plancher(#{1:valeur}; #{2:minimum})", {
    label: "plancher",
    type: "function",
    detail: "Assure qu'une valeur ne soit pas inférieure à un minimum",
  }),
  snippetCompletion("appartientA(#{1:valeur}; #{2:valeur1}; #{3:valeur2}; #{4:...})", {
    label: "appartientA",
    type: "function",
    detail: "Vérifie l'appartenance à une liste de valeurs",
  }),
  snippetCompletion("formatDate(#{1:date}; #{2:format})", {
    label: "formatDate",
    type: "function",
    detail: "Formate une date",
  }),
  snippetCompletion("formatMontant(#{1:montant}; #{2:devise})", {
    label: "formatMontant",
    type: "function",
    detail: "Formate un montant avec devise",
  }),
  snippetCompletion("base()=30", {
    label: "base()=30",
    type: "constant",
    detail: "CNAM",
  }),
  snippetCompletion("base()=100", {
    label: "base()=100",
    type: "constant",
    detail: "Diplôme de l'enseignement supérieur",
  }),
  snippetCompletion("edpDateObtention", {
    label: "edpDateObtention",
    type: "variable",
    detail: "Date d'obtention du diplôme",
  }),
  snippetCompletion("typeDiplome", {
    label: "typeDiplome",
    type: "variable",
    detail: "Type du diplôme",
  }),
];

const getSuggestionsHeadless = (context: CompletionContext) => {
  const word = context.matchBefore(/\w+/);
  if (!word && !context.explicit) return null;

  const wordText = word ? word.text.toLowerCase() : "";

  // Filtrer les suggestions selon le texte saisi
  const filteredSuggestions = word ? allSuggestions.filter((s) => s.label.toLowerCase().startsWith(wordText)) : allSuggestions;

  return {
    from: word ? word.from : context.pos,
    options: filteredSuggestions,
    span: word || /\w*/,
  };
};

// L'état personnalisé reste inchangé
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

export default function PayrollEditorCustomUI({ showSearchInput = true, showCategories = true, showInfoBar = false }: EditorProps) {
  const [value, setValue] = useState(`// Exemple de formule`);
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
  const suggestionsRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const editorRef = useRef<HTMLDivElement>(null);

  // Le plugin personnalisé reste inchangé
  const customPlugin = ViewPlugin.fromClass(
    class {
      view: EditorView;
      constructor(view: EditorView) {
        this.view = view;
        setEditorView(view);
      }

      update(update) {
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

  // Filtrer les suggestions selon la catégorie et le texte de filtre
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

  // Ajoutez cet useEffect à votre composant
  useEffect(() => {
    // Cette fonction gère les événements clavier au niveau de la fenêtre
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!completionInfo.active || filteredSuggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCompletionInfo((prev) => ({
          ...prev,
          selected: (prev.selected + 1) % filteredSuggestions.length,
        }));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCompletionInfo((prev) => ({
          ...prev,
          selected: prev.selected > 0 ? prev.selected - 1 : filteredSuggestions.length - 1,
        }));
      } else if (e.key === "Enter" || e.key === "Tab") {
        // Uniquement si le menu d'autocomplétion est actif
        if (completionInfo.active && filteredSuggestions.length > 0) {
          e.preventDefault();
          applySuggestion(filteredSuggestions[completionInfo.selected]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setCompletionInfo((prev) => ({ ...prev, active: false }));
        setFilterText("");
      }
    };

    // Ajouter l'écouteur d'événement quand le menu d'autocomplétion est actif
    if (completionInfo.active && filteredSuggestions.length > 0) {
      window.addEventListener("keydown", handleGlobalKeyDown, true);
    }

    // Nettoyer correctement l'écouteur d'événement
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [completionInfo.active, filteredSuggestions.length, completionInfo.selected, applySuggestion, filteredSuggestions]);

  // L'effet pour gérer les clics à l'extérieur reste inchangé
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

  // Obtenir la documentation pour la suggestion sélectionnée
  const selectedSuggestion = filteredSuggestions[completionInfo.selected] || (filteredSuggestions.length > 0 ? filteredSuggestions[0] : null);
  const documentation = selectedSuggestion ? getDocumentation(selectedSuggestion) : null;
  const onChange = useCallback((value) => setValue(value), []);
  
  const extensions = useMemo(() => [
    tomorrow,
    javascript(),
    syntaxHighlighting(defaultHighlightStyle),
    customCompletionState,
    customPlugin,
    EditorView.theme({
      "&.cm-editor": {
        backgroundColor: "white",
        color: "#333",
        fontSize: "14px",
        padding: "8px",
        fontFamily: "monospace",
      },
      "&.cm-editor .cm-scroller": {
        outline: "none !important",
      },
      "&.cm-editor .cm-content": {
        outline: "none !important",
      },
      "&.cm-editor .cm-content *:focus-visible": {
        outline: "none !important",
      },
      "&.cm-focused": {
        outline: "none !important",
      },
    }),
    autocompletion({
      override: [],
      activateOnTyping: false,
      closeOnBlur: false,
      icons: false,
    }),
    keymap.of(defaultKeymap),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const changes = update.changes;
        let shouldActivateCompletion = false;
        changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
          const text = inserted.toString();
          if (text.length === 1 && /[a-zA-Z]/.test(text)) {
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
          }
        }
      }
    }),
  ], []);
  return (
    <div className="flex flex-col w-full bg-white border border-neutral-200">
      <div className="p-2 bg-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">Éditeur avec UI d'autocomplétion personnalisée</h2>
      </div>

      <div className="relative flex-grow rounded-2xl" ref={editorRef} style={{ outline: "none", border: "none" }}>
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={extensions}
          className="outline-none border-none"
          placeholder="Entrez votre formule ici... (essayez de taper 'si' ou 'base')"
          basicSetup={false}
        />

        <AutocompletionUI
          completionInfo={completionInfo}
          position={position}
          activeCategory={activeCategory}
          filterText={filterText}
          filteredSuggestions={filteredSuggestions}
          documentation={documentation}
          selectedSuggestion={selectedSuggestion}
          showSearchInput={showSearchInput}
          showCategories={showCategories}
          showInfoBar={showInfoBar}
          setActiveCategory={setActiveCategory}
          setFilterText={setFilterText}
          setCompletionInfo={setCompletionInfo}
          applySuggestion={applySuggestion}
          suggestionsRef={suggestionsRef}
        />
      </div>

      <InfoBar />
    </div>
  );
}
