import React from 'react';

/**
 * Composant pour gérer les options d'affichage de l'interface d'autocomplétion
 * 
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.showCategories - Afficher les catégories
 * @param {boolean} props.showSearchInput - Afficher la barre de recherche
 * @param {boolean} props.showSuggestionDetail - Afficher les détails des suggestions
 * @param {boolean} props.showIconForType - Afficher les icônes pour les types
 * @param {boolean} props.showInfoBar - Afficher la barre d'informations
 * @param {Function} props.onToggleOption - Fonction appelée lors du changement d'état
 */
export const UIOptionsCheckbox = ({
  showCategories,
  showSuggestionDetail,
  showIconForType,
  showInfoBar,
  onToggleOption
}) => {
  const options = [
    { id: 'showCategories', label: 'Afficher les catégories', checked: showCategories },
    { id: 'showSuggestionDetail', label: 'Afficher les détails des suggestions', checked: showSuggestionDetail },
    { id: 'showIconForType', label: 'Afficher les icônes des types', checked: showIconForType },
    { id: 'showInfoBar', label: 'Afficher la barre d\'informations', checked: showInfoBar }
  ];

  return (
      <div className="p-3 bg-white flex flex-col gap-2 rounded-md shadow-bevel-xs">
          <p className="font-semibold text-sm">Fonctionnalités</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {options.map((option) => (
          <div key={option.id} className="flex items-center gap-2">
            <button
              type="button"
              role="checkbox"
              aria-checked={option.checked}
              data-state={option.checked ? "checked" : "unchecked"}
              value="on"
              data-slot="checkbox"
              className={`peer size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${
                option.checked 
                  ? "bg-gray-16 border-gray-16 text-white" 
                  : "border-gray-300 bg-white"
              }`}
              onClick={() => onToggleOption(option.id, !option.checked)}
            >
              {option.checked && (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="size-3 text-white mx-auto"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>
            <label 
              data-slot="label" 
              onClick={() => onToggleOption(option.id, !option.checked)}
              className="text-foreground text-sm leading-4 font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UIOptionsCheckbox;