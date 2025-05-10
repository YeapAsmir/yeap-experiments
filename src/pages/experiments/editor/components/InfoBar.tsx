import React from 'react';

export function InfoBar() {
  
  return (
    <div className="p-3 bg-blue-50 border-t border-blue-200">
      <div className="text-xs text-blue-800">
        <p className="font-semibold mb-1">UI d'autocomplétion améliorée :</p>
        <p className="mb-1">• Navigation intuitive avec les flèches ↑/↓ et sélection avec Enter</p>
        <p className="mb-1">• Filtrage par catégorie et recherche textuelle</p>
        <p className="mb-1">• Documentation détaillée et exemples d'utilisation</p>
        <p className="mb-1">• Activation automatique pendant la frappe ou avec Ctrl+Space</p>
      </div>
    </div>
  );
}