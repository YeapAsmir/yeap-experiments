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
      className="custom-autocomplete-panel"
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
      <div className="autocomplete-header">
        {showCategories && (
          <div className="category-tabs">
            <button 
              className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              Tous
            </button>
            <button 
              className={`category-tab ${activeCategory === 'function' ? 'active' : ''}`}
              onClick={() => setActiveCategory('function')}
            >
              Fonctions
            </button>
            <button 
              className={`category-tab ${activeCategory === 'variable' ? 'active' : ''}`}
              onClick={() => setActiveCategory('variable')}
            >
              Variables
            </button>
            <button 
              className={`category-tab ${activeCategory === 'operator' ? 'active' : ''}`}
              onClick={() => setActiveCategory('operator')}
            >
              Opérateurs
            </button>
            <button 
              className={`category-tab ${activeCategory === 'constant' ? 'active' : ''}`}
              onClick={() => setActiveCategory('constant')}
            >
              Constantes
            </button>
          </div>
        )}
        
        {/* Barre de recherche */}
        {showSearchInput && (
          <div className="filter-container">
            <input
              type="text"
              placeholder="Filtrer les suggestions..."
              className="filter-input"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            {filterText && (
              <button 
                className="clear-filter" 
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
      <div className="autocomplete-content">
        {/* Liste des suggestions */}
        <div className="max-w-52 border-r border-neutral-200 overflow-y-auto overflow-hidden">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.label}
                className={`suggestion-item ${index === completionInfo.selected ? 'selected' : ''} type-${suggestion.type || 'default'}`}
                onClick={() => applySuggestion(suggestion)}
                onMouseEnter={() => setCompletionInfo(prev => ({ ...prev, selected: index }))}
              >
                <div className="item-header">
                  <span className="item-icon">{getIconForType(suggestion.type || 'default')}</span>
                  <span className="item-label">{suggestion.label}</span>
                </div>
                <div className="item-detail">{suggestion.detail}</div>
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
          <div className="documentation-panel">
            <h3 className="documentation-title">
              {selectedSuggestion.label}
            </h3>
            
            <p className="documentation-description">
              {documentation.description}
            </p>
            
            <div className="documentation-section">
              <h4 className="section-title">Syntaxe</h4>
              <code className="code-block">{documentation.syntax}</code>
            </div>
          </div>
        )}
      </div>
      
      {showInfoBar && (
        <div className="autocomplete-footer">
          <div className="keyboard-shortcuts">
            <span className="shortcut"><kbd>↑</kbd><kbd>↓</kbd> Navigation</span>
            <span className="shortcut"><kbd>Enter</kbd> Sélectionner</span>
            <span className="shortcut"><kbd>Esc</kbd> Fermer</span>
          </div>
        </div>
      )}
      
    </div>
  );
}