// Misc
import React, { useState } from "react";
import { useRef, useEffect } from "react";
import { cn } from "../../../../utils";
import { CompletionState, DocumentationInfo } from "../types";
import { getIconForType } from "../utils";
import { Completion } from "@codemirror/autocomplete";

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
  editorRef: React.RefObject<HTMLDivElement>;
  onHoverSuggestion?: (suggestion: Completion | null) => void;
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
  editorRef,
  onHoverSuggestion = () => {}, // Fonction vide par défaut
}: AutocompletionUIProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [lastSelectionMethod, setLastSelectionMethod] = useState<"hover" | "keyboard">("keyboard");

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

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    setLastSelectionMethod("hover"); // Mise à jour de la méthode
    onHoverSuggestion(filteredSuggestions[index]);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    // Ne réinitialise pas la documentation si une suggestion est sélectionnée
    if (selectedSuggestion) {
      onHoverSuggestion(selectedSuggestion);
    } else {
      onHoverSuggestion(null);
    }
  };

  // 3. Écouter les changements de sélection par clavier
  useEffect(() => {
    setLastSelectionMethod("keyboard");
  }, [completionInfo.selected]);

  if (!completionInfo.active || completionInfo.options.length === 0) return null;
  const docSuggestion = hoveredIndex !== null ? filteredSuggestions[hoveredIndex] : selectedSuggestion;
  return (
    <div
      ref={suggestionsRef}
      className="flex flex-col bg-white  rounded-lg overflow-hidden font-sans min-w-[360px] max-h-[300px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)]"
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
      {(showCategories || showSearchInput) && (
        <div className="flex gap-1 px-1 pt-1">
          {showCategories && (
            <div className="flex overflow-x-auto gap-1">
              {[
                { id: "all", label: "Tous" },
                { id: "function", label: "Fonctions" },
                { id: "variable", label: "Variables" },
                { id: "operator", label: "Opérateurs" },
                { id: "constant", label: "Constantes" },
              ].map((category) => (
                <button
                  key={category.id}
                  className={cn(
                    "outline-none px-2 py-1 text-sm text-slate-400 hover:text-slate-500 transition-all relative rounded-lg",
                    activeCategory === category.id ? "bg-slate-100 text-slate-500" : "hover:bg-slate-100"
                  )}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}

          {showSearchInput && filteredSuggestions.length > 0 && (
            <div className="relative w-full">
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
      <div className="flex h-full overflow-auto w-full p-1 gap-1">
        {/* Liste des suggestions */}
        <div ref={listContainerRef} className={cn("w-full overflow-y-auto no-scrollbar", filteredSuggestions.length > 0 ? "max-w-52" : "w-full")}>
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.label}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className={`flex relative items-center p-2 rounded-md cursor-pointer transition-all ${index === completionInfo.selected ? "bg-slate-100" : "hover:bg-slate-50/80"}`}
                onClick={() => applySuggestion(suggestion)}
                onMouseEnter={() => handleMouseEnter(index)}
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
        <div className="grow flex flex-col justify-between gap-y-2">
          {docSuggestion && (
            <div className="grow">
              <div className="p-4 overflow-y-auto flex flex-col gap-1 rounded-lg bg-slate-50">
                <h3 className="text-sm font-mono font-semibold text-black">{docSuggestion?.label}</h3>
                {documentation ? (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {/* Avertissement conditionnels sur le désalignement potentiel */}
                    {/* {hoveredIndex !== null && <span className="text-xs text-amber-500 block mb-1">Documentation pour la sélection actuelle. Utilisez les flèches pour mettre à jour.</span>} */}
                    {documentation.description}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 leading-relaxed">Aucune documentation disponible</p>
                )}
              </div>
            </div>
          )}
          {showInfoBar && filteredSuggestions.length > 0 && (
            <div className="px-2 py-1">
              <div className="flex gap-2 items-center flex-wrap text-xs text-slate-500">
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
      </div>
    </div>
  );
}
