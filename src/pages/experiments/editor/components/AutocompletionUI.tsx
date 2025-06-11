// Misc
import React              from 'react';
import { cn }             from '../../../../utils';
import {
    CompletionState,
    DocumentationInfo
}                         from '../types';
import { getIconForType } from '../utils';
import { Completion }     from '@codemirror/autocomplete';
import {
    useRef,
    useState,
    useEffect
}                         from 'react';

interface AutocompletionUIProps {
  completionInfo: CompletionState;
  position: { top: number; left: number };
  activeCategory: string;
  filterText: string;
  filteredSuggestions: Completion[];
  documentation: DocumentationInfo | null;
  selectedSuggestion: Completion | null;
  showIconForType?: boolean;
  showCategories?: boolean;
  showInfoBar?: boolean;
  showSuggestionDetail?: boolean;
  setActiveCategory: (category: string) => void;
  setFilterText: (text: string) => void;
  setCompletionInfo: (updater: (prev: CompletionState) => CompletionState) => void;
  applySuggestion: (suggestion: Completion) => void;
  suggestionsRef: React.RefObject<HTMLDivElement>;
  editorRef: React.RefObject<HTMLDivElement>;
  onHoverSuggestion?: (suggestion: Completion | null) => DocumentationInfo | void;
}

const SearchIcon = () => (
  <svg viewBox="0 0 20 20" className="size-5">
    <path
      fillRule="evenodd"
      d="M12.323 13.383a5.5 5.5 0 1 1 1.06-1.06l2.897 2.897a.75.75 0 1 1-1.06 1.06zM13 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0"
    ></path>
  </svg>
);

export default SearchIcon;

export function AutocompletionUI({
  completionInfo,
  position,
  activeCategory,
  filterText,
  filteredSuggestions,
  documentation,
  selectedSuggestion,
  showCategories = true,
  showInfoBar = true,
  showSuggestionDetail = false,
  setActiveCategory,
  showIconForType = false,
  setFilterText,
  setCompletionInfo,
  applySuggestion,
  suggestionsRef,
  editorRef,
  onHoverSuggestion = () => {}
}: AutocompletionUIProps) {
  const [hoveredSuggestion, setHoveredSuggestion] = useState<Completion | null>(null);
  const [hoveredSuggestionDocumentation, setHoveredSuggestionDocumentation] = useState<DocumentationInfo | null>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, filteredSuggestions.length);
  }, [filteredSuggestions.length]);

  useEffect(() => {
    if (completionInfo.selected >= 0 && completionInfo.selected < filteredSuggestions.length && itemRefs.current[completionInfo.selected] && listContainerRef.current) {
      const selectedElement = itemRefs.current[completionInfo.selected];
      const container = listContainerRef.current;

      if (selectedElement) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = selectedElement.getBoundingClientRect();

        const isAboveVisibleArea = elementRect.top < containerRect.top;
        const isBelowVisibleArea = elementRect.bottom > containerRect.bottom;

        if (isAboveVisibleArea) {
          selectedElement.scrollIntoView({ block: "start", behavior: "auto" });
        } else if (isBelowVisibleArea) {
          selectedElement.scrollIntoView({ block: "end", behavior: "auto" });
        }
      }
    }
  }, [completionInfo.selected, filteredSuggestions.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (suggestionsRef.current && !suggestionsRef.current.contains(target) && editorRef && editorRef.current && !editorRef.current.contains(target)) {
        setCompletionInfo((prev) => ({ ...prev, active: false }));
        setFilterText("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [suggestionsRef, editorRef, setCompletionInfo, setFilterText]);

  const handleMouseEnter = (suggestion: Completion) => {
    setHoveredSuggestion(suggestion);
    const doc = onHoverSuggestion?.(suggestion);
    if (doc && 'description' in doc) {
      setHoveredSuggestionDocumentation(doc);
    }
  };
  const handleMouseLeave = () => {
    setHoveredSuggestion(null);
    onHoverSuggestion(null);
  };

  if (!completionInfo.active || completionInfo.options.length === 0) return null;
  const docSuggestion = selectedSuggestion; // Modifié pour toujours utiliser la suggestion sélectionnée
  return (
    <div
      ref={suggestionsRef}
      className="flex flex-col bg-white rounded-md overflow-hidden font-sans min-w-[360px] max-h-[300px] shadow-bevel-xs"
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
      {showCategories && (
        <div className={cn('p-2 pb-0')}>
            <div className="flex overflow-x-auto gap-1">
              {[
                { id: "all", label: "All" },
                { id: "function", label: "Fonctions" },
                { id: "variable", label: "Variables" },
                { id: "operator", label: "Opérateurs" },
                { id: "constant", label: "Constantes" },
              ].map((category) => (
                <button
                  key={category.id}
                  className={cn(
                    "outline-none px-3 py-1 text-xs text-gray-14 h-700 font-medium transition-all relative rounded-sm",
                    activeCategory === category.id ? "bg-gray-7" : "hover:bg-black/5"
                  )}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
        </div>
      )}

      {/* Conteneur principal */}
      <div className="flex h-full overflow-auto w-full p-2 gap-2">
        {/* Liste des suggestions */}
        <div ref={listContainerRef} className={cn("flex shrink-0 flex-col gap-1 overflow-y-auto no-scrollbar", {"w-44": filteredSuggestions.length > 0})}>
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.label}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  className={`flex relative items-center p-2 rounded-sm cursor-pointer ${index === completionInfo.selected ? "bg-gray-4" : "hover:bg-gray-4"}`}
                  onClick={() => applySuggestion(suggestion)}
                  onMouseEnter={() => handleMouseEnter(suggestion)}
                  onMouseLeave={handleMouseLeave}
                >
                {showIconForType && (
                  <span
                    className={`inline-flex shrink-0 mt-.5 items-center justify-center w-4 h-4 rounded mr-2 text-[0.625rem] font-medium ${
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
                  <span className="text-xs text-gray-15 font-mono">{suggestion.label}</span>
                  {showSuggestionDetail && <span className="text-xs text-gray-12 mt-2">{suggestion.detail}</span>}
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs p-4 text-gray-12 text-center">Aucune suggestion trouvée</div>
          )}
        </div>

        {/* Documentation */}
        <div className="grow flex flex-col justify-between gap-y-2">
          {docSuggestion && (
            <div className="grow">
              <div className="p-2 overflow-y-auto flex flex-col gap-1 rounded-lg bg-gray-4">
                <h3 className="text-sm font-mono font-semibold text-gray-15">
                  { hoveredSuggestion ? hoveredSuggestion.label : docSuggestion.label }
                  </h3>
                {hoveredSuggestion && hoveredSuggestionDocumentation ? (
                  <>
                    <p className="text-xs text-gray-12 leading-relaxed">
                      {hoveredSuggestionDocumentation.description}
                    </p>
                  </>
                ) : documentation ? (
                  <>
                    <p className="text-xs text-gray-12 leading-relaxed">
                      {documentation.description}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-12 leading-relaxed">Aucune documentation disponible</p>
                )}
              </div>
            </div>
          )}
          {showInfoBar && filteredSuggestions.length > 0 && (
              <div className="flex gap-2 items-center flex-wrap text-xs text-gray-12">
                <span>
                  <kbd className="mx-0.5 text-gray-12 bg-white inline-flex h-5 max-h-full items-center rounded-sm border px-1 font-[inherit] text-[0.625rem] font-medium">↑</kbd>
                  <kbd className="mx-0.5 text-gray-12 bg-white inline-flex h-5 max-h-full items-center rounded-sm border px-1 font-[inherit] text-[0.625rem] font-medium">↓</kbd> Navigation
                </span>
                <span>
                  <kbd className="mx-0.5 text-gray-12 bg-white inline-flex h-5 max-h-full items-center rounded-sm border px-1 font-[inherit] text-[0.625rem] font-medium">Enter</kbd> Sélectionner
                </span>
                <span>
                  <kbd className="mx-0.5 text-gray-12 bg-white inline-flex h-5 max-h-full items-center rounded-sm border px-1 font-[inherit] text-[0.625rem] font-medium">Esc</kbd> Fermer
                </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
