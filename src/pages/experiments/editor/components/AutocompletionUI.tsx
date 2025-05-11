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
      className="flex flex-col bg-white rounded-lg overflow-hidden font-sans min-w-[360px] max-h-[300px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)]"
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
            {[
              { id: 'all', label: 'Tous' },
              { id: 'function', label: 'Fonctions' },
              { id: 'variable', label: 'Variables' },
              { id: 'operator', label: 'Opérateurs' },
              { id: 'constant', label: 'Constantes' }
            ].map(category => (
              <button
                key={category.id}
                className={cn('outline-none px-2 py-1 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-all relative rounded-lg',
                  activeCategory === category.id ? "bg-slate-100 text-slate-500" : ""
            )}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Barre de recherche */}
          {showSearchInput && filteredSuggestions.length > 0 && (
            <div className='pt-1 relative'>
              <input
                type="text"
                placeholder="Filtrer les suggestions..."
                className="w-full px-2 py-1 text-sm rounded-lg bg-white border border-slate-100 ring-0 outline-none"
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
                className={`flex relative items-center p-2 rounded-md cursor-pointer transition-all hover:bg-slate-100 ${index === completionInfo.selected ? "bg-slate-100/70" : ""}`}
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
                  <kbd className="absolute right-1 mx-0.5 text-slate-500 bg-white inline-flex h-5 max-h-full items-center rounded-md border px-1 font-[inherit] text-[0.625rem] font-medium">Enter</kbd>
                )}
              </div>
            ))
          ) : (
            <div className="text-xs p-4 text-slate-400 text-center">Aucune suggestion trouvée</div>
          )}
        </div>

        {/* Documentation */}
        {selectedSuggestion && documentation && (
          <div className="grow p-4 overflow-y-auto flex flex-col gap-1 rounded-lg bg-slate-50">
            <h3 className="text-sm font-mono font-semibold text-black">{selectedSuggestion.label}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{documentation.description}</p>
          </div>
        )}
      </div>

      {showInfoBar && filteredSuggestions.length > 0 && (
        <div className="px-2 py-1">
          <div className="flex gap-2 items-center flex-wrap justify-end text-xs text-slate-500">
            <span>
              <kbd className="mx-0.5 text-slate-500 bg-white inline-flex h-5 max-h-full items-center rounded-md border px-1 font-[inherit] text-[0.625rem] font-medium">↑</kbd>
              <kbd className="mx-0.5 text-slate-500 bg-white inline-flex h-5 max-h-full items-center rounded-md border px-1 font-[inherit] text-[0.625rem] font-medium">↓</kbd> Navigation
            </span>
            <span>
              <kbd className="mx-0.5 text-slate-500 bg-white inline-flex h-5 max-h-full items-center rounded-md border px-1 font-[inherit] text-[0.625rem] font-medium">Enter</kbd> Sélectionner
            </span>
            <span>
              <kbd className="mx-0.5 text-slate-500 bg-white inline-flex h-5 max-h-full items-center rounded-md border px-1 font-[inherit] text-[0.625rem] font-medium">Esc</kbd> Fermer
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
