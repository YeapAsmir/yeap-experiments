import React from 'react';
import { Completion } from '@codemirror/autocomplete';
import { CompletionState, DocumentationInfo } from '../types';
import { getIconForType } from '../utils';

interface AutocompletionUIProps {
  completionInfo: CompletionState;
  position: { top: number; left: number };
  activeCategory: string;
  filterText: string;
  filteredSuggestions: Completion[];
  documentation: DocumentationInfo | null;
  selectedSuggestion: Completion | null;
  showSearchInput?: boolean;
  showCategories?: boolean;
  showInfoBar?: boolean;
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
  setActiveCategory,
  setFilterText,
  setCompletionInfo,
  applySuggestion,
  suggestionsRef
}: AutocompletionUIProps) {
  if (!completionInfo.active || completionInfo.options.length === 0) return null;

  return (
    <div
      ref={suggestionsRef}
      className="bg-white rounded-lg shadow-lg overflow-hidden font-sans min-w-[360px] border border-slate-200"
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 1000,
        minWidth: '550px',
        maxWidth: '550px',
        width: 'auto',
      }}
    >
      {/* En-tête avec catégories */}
      <div className="border-b border-slate-200 bg-slate-50">
        {showCategories && (
          <div className="flex overflow-x-auto">
            <button 
              className={`px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all relative
                ${activeCategory === 'all' ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              Tous
            </button>
            <button 
              className={`px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all relative
                ${activeCategory === 'function' ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600' : ''}`}
              onClick={() => setActiveCategory('function')}
            >
              Fonctions
            </button>
            <button 
              className={`px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all relative
                ${activeCategory === 'variable' ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600' : ''}`}
              onClick={() => setActiveCategory('variable')}
            >
              Variables
            </button>
            <button 
              className={`px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all relative
                ${activeCategory === 'operator' ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600' : ''}`}
              onClick={() => setActiveCategory('operator')}
            >
              Opérateurs
            </button>
            <button 
              className={`px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all relative
                ${activeCategory === 'constant' ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600' : ''}`}
              onClick={() => setActiveCategory('constant')}
            >
              Constantes
            </button>
          </div>
        )}
        
        {/* Barre de recherche */}
        {showSearchInput && (
          <div className="relative p-2 border-t border-slate-200">
            <input
              type="text"
              placeholder="Filtrer les suggestions..."
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all pr-8"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            {filterText && (
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setFilterText('')}
                title="Effacer le filtre"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* Conteneur principal */}
      <div className="flex max-h-[400px]">
        {/* Liste des suggestions */}
        <div className="max-w-52 border-r border-neutral-200 overflow-y-auto overflow-hidden">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.label}
                className={`px-3 py-2.5 cursor-pointer border-l-4 transition-all hover:bg-slate-50 ${
                  index === completionInfo.selected ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent'
                }`}
                onClick={() => applySuggestion(suggestion)}
                onMouseEnter={() => setCompletionInfo(prev => ({ ...prev, selected: index }))}
              >
                <div className="flex items-center mb-1">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded mr-2 text-sm font-semibold ${
                    suggestion.type === 'function' ? 'bg-indigo-100 text-indigo-600' :
                    suggestion.type === 'constant' ? 'bg-emerald-100 text-emerald-600' :
                    suggestion.type === 'variable' ? 'bg-amber-100 text-amber-600' :
                    suggestion.type === 'operator' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>{getIconForType(suggestion.type || 'default')}</span>
                  <span className="text-sm font-medium text-slate-700">{suggestion.label}</span>
                </div>
                <div className="text-xs text-slate-500 ml-8 truncate">{suggestion.detail}</div>
              </div>
            ))
          ) : (
            <div className="text-xs p-4 text-neutral-400">
              Aucune suggestion trouvée
            </div>
          )}
        </div>
        
        {/* Documentation */}
        {selectedSuggestion && documentation && (
          <div className="w-3/5 p-4 overflow-y-auto">
            <h3 className="text-base font-semibold text-slate-800 mb-2">
              {selectedSuggestion.label}
            </h3>
            
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {documentation.description}
            </p>
            
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Syntaxe</h4>
              <code className="block font-mono text-sm p-3 bg-slate-50 rounded border border-slate-200 text-slate-700 overflow-x-auto whitespace-pre">{documentation.syntax}</code>
            </div>
          </div>
        )}
      </div>
      
      {showInfoBar && (
        <div className="p-2 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center flex-wrap justify-end text-xs text-slate-500">
            <span className="ml-3"><kbd className="px-1.5 py-0.5 text-[11px] font-mono bg-slate-200 rounded shadow-sm text-slate-600 mx-0.5">↑</kbd><kbd className="px-1.5 py-0.5 text-[11px] font-mono bg-slate-200 rounded shadow-sm text-slate-600 mx-0.5">↓</kbd> Navigation</span>
            <span className="ml-3"><kbd className="px-1.5 py-0.5 text-[11px] font-mono bg-slate-200 rounded shadow-sm text-slate-600 mx-0.5">Enter</kbd> Sélectionner</span>
            <span className="ml-3"><kbd className="px-1.5 py-0.5 text-[11px] font-mono bg-slate-200 rounded shadow-sm text-slate-600 mx-0.5">Esc</kbd> Fermer</span>
          </div>
        </div>
      )}
      
    </div>
  );
}