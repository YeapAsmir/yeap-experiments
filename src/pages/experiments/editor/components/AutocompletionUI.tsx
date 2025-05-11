// Misc
import React              from 'react';
import {
    useRef,
    useEffect
}                         from 'react';
import { cn }             from '../../../../utils';
import {
    CompletionState,
    DocumentationInfo
}                         from '../types';
import { getIconForType } from '../utils';
import { Completion }     from '@codemirror/autocomplete';

interface AutocompletionUIProps {
  completionInfo: CompletionState;
  position: { top: number; left: number };
  activeCategory: string;
  filterText: string;
  filteredSuggestions: Completion[];
  documentation: DocumentationInfo | null;
  selectedSuggestion: Completion | null;
  showSearchInput?: boolean;
  showIconForType?: boolean;
  showCategories?: boolean;
  showInfoBar?: boolean;
  showSuggestionDetail?: boolean;
  setActiveCategory: (category: string) => void;
  setFilterText: (text: string) => void;
  setCompletionInfo: (updater: (prev: CompletionState) => CompletionState) => void;
  applySuggestion: (suggestion: Completion) => void;
  suggestionsRef: React.RefObject<HTMLDivElement>;
}

export function AutocompletionUI({
  completionInfo,
  position,
  activeCategory,
  filterText,
  filteredSuggestions,
  documentation,
  selectedSuggestion,
  showSearchInput = true,
  showCategories = true,
  showInfoBar = true,
  showSuggestionDetail = false,
  setActiveCategory,
  showIconForType = false,
  setFilterText,
  setCompletionInfo,
  applySuggestion,
  suggestionsRef,
}: AutocompletionUIProps) {
  // Référence pour le conteneur de la liste déroulante
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Tableau de références pour chaque élément de suggestion
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Mettre à jour la taille du tableau de refs quand les suggestions changent
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, filteredSuggestions.length);
  }, [filteredSuggestions.length]);

  // Effet pour faire défiler automatiquement pour maintenir l'élément sélectionné visible
  useEffect(() => {
    // S'assurer que nous avons un élément sélectionné et que nos refs sont prêtes
    if (completionInfo.selected >= 0 && completionInfo.selected < filteredSuggestions.length && itemRefs.current[completionInfo.selected] && listContainerRef.current) {
      const selectedElement = itemRefs.current[completionInfo.selected];
      const container = listContainerRef.current;

      if (selectedElement) {
        // Obtenir les informations de position
        const containerRect = container.getBoundingClientRect();
        const elementRect = selectedElement.getBoundingClientRect();

        // Vérifier si l'élément n'est pas entièrement visible
        const isAboveVisibleArea = elementRect.top < containerRect.top;
        const isBelowVisibleArea = elementRect.bottom > containerRect.bottom;

        if (isAboveVisibleArea) {
          // Si l'élément est au-dessus de la zone visible, défilez vers le haut
          selectedElement.scrollIntoView({ block: "start", behavior: "auto" });
        } else if (isBelowVisibleArea) {
          // Si l'élément est en dessous de la zone visible, défilez vers le bas
          selectedElement.scrollIntoView({ block: "end", behavior: "auto" });
        }
      }
    }
  }, [completionInfo.selected, filteredSuggestions.length]);

  if (!completionInfo.active || completionInfo.options.length === 0) return null;

  return (
    <div
      ref={suggestionsRef}
      className="flex flex-col bg-white rounded-lg overflow-hidden font-sans min-w-[360px] max-h-[300px] shadow border border-slate-200"
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 1000,
        minWidth: "550px",
        maxWidth: "550px",
        width: "auto",
      }}
    >
      {/* En-tête avec catégories */}
      {showCategories && (
        <div className='px-1 pt-1'>
          <div className="flex overflow-x-auto gap-1">
            <button
              className={`outline-none px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-all relative rounded-lg
                ${activeCategory === "all" ? "bg-slate-100" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              Tous
            </button>
            <button
              className={`outline-none px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-all relative rounded-lg
                ${activeCategory === "function" ? "bg-slate-100" : ""}`}
              onClick={() => setActiveCategory("function")}
            >
              Fonctions
            </button>
            <button
              className={`outline-none px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-all relative rounded-lg
                ${activeCategory === "variable" ? "bg-slate-100" : ""}`}
              onClick={() => setActiveCategory("variable")}
            >
              Variables
            </button>
            <button
              className={`outline-none px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-all relative rounded-lg
                ${activeCategory === "operator" ? "bg-slate-100" : ""}`}
              onClick={() => setActiveCategory("operator")}
            >
              Opérateurs
            </button>
            <button
              className={`outline-none px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-all relative rounded-lg
                ${activeCategory === "constant" ? "bg-slate-100" : ""}`}
              onClick={() => setActiveCategory("constant")}
            >
              Constantes
            </button>
          </div>

          {/* Barre de recherche */}
          {showSearchInput && (
            <div className='pt-1 relative'>
              <input
                type="text"
                placeholder="Filtrer les suggestions..."
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition-all pr-8"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* Conteneur principal */}
      <div className="flex h-min overflow-auto w-full p-1 gap-2">
        {/* Liste des suggestions */}
        <div ref={listContainerRef} className={cn(
          "w-full overflow-y-auto overflow-hidden",
          filteredSuggestions.length > 0 ? "max-w-52" : "w-full"
        )}>
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.label}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className={`flex relative items-center p-2 rounded-md cursor-pointer transition-all hover:bg-slate-100 ${index === completionInfo.selected ? "bg-slate-100 border-l-slate-500" : "border-l-transparent"}`}
                onClick={() => applySuggestion(suggestion)}
                onMouseEnter={() => setCompletionInfo((prev) => ({ ...prev, selected: index }))}
              >
                {showIconForType && (
                  <span
                    className={`inline-flex shrink-0 mt-.5 items-center justify-center w-5 h-5 rounded mr-2 text-xs font-semibold ${
                      suggestion.type === "function"
                        ? "bg-indigo-100 text-indigo-600"
                        : suggestion.type === "constant"
                        ? "bg-emerald-100 text-emerald-600"
                        : suggestion.type === "variable"
                        ? "bg-amber-100 text-amber-600"
                        : suggestion.type === "operator"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {getIconForType(suggestion.type || "default")}
                  </span>
                )}
                <div className="flex flex-col">
                  <span className="text-xs text-slate-700 font-mono">{suggestion.label}</span>
                  {showSuggestionDetail && <span className="text-xs text-slate-400 mt-2">{suggestion.detail}</span>}
                </div>
                {index === completionInfo.selected && (
                  <kbd className="absolute right-2 bg-background text-slate-500 bg-white ms-1 -me-1 inline-flex h-5 max-h-full items-center rounded-md border px-1 font-[inherit] text-[0.625rem] font-medium">↵ Enter</kbd>
                )}
              </div>
            ))
          ) : (
            <div className="text-xs p-4 text-slate-400 text-center">Aucune suggestion trouvée</div>
          )}
        </div>

        {/* Documentation */}
        {selectedSuggestion && documentation && (
          <div className="grow p-4 overflow-y-auto flex flex-col gap-2 rounded-lg bg-slate-50">
            <h3 className="text-sm font-mono font-semibold text-slate-800">{selectedSuggestion.label}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{documentation.description}</p>
            {/* <div className="mb-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Syntaxe</h4>
              <code className="block font-mono text-sm p-3 bg-slate-50 rounded border border-slate-200 text-slate-700 overflow-x-auto whitespace-pre">{documentation.syntax}</code>
            </div> */}
          </div>
        )}
      </div>

      {showInfoBar && (
        <div className="p-2 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center flex-wrap justify-end text-xs text-slate-500">
            <span className="ml-3">
              <kbd className="px-1.5 py-0.5 text-[11px] font-mono bg-slate-200 rounded text-slate-400 mx-0.5">↑</kbd>
              <kbd className="px-1.5 py-0.5 text-[11px] font-mono bg-slate-200 rounded text-slate-400 mx-0.5">↓</kbd> Navigation
            </span>
            <span className="ml-3">
              <kbd className="px-1.5 py-0.5 text-[11px] font-mono bg-slate-200 rounded text-slate-400 mx-0.5">Enter</kbd> Sélectionner
            </span>
            <span className="ml-3">
              <kbd className="px-1.5 py-0.5 text-[11px] font-mono bg-slate-200 rounded text-slate-400 mx-0.5">Esc</kbd> Fermer
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
