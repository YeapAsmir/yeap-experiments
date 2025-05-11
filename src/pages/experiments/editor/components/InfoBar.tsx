export function InfoBar() {
  return (
    <div className="p-3 bg-[#fdfbfc] rounded-md border border-neutral-200">
      <div className="text-xs text-gray-700">
        <p className="font-semibold mb-1 text-black">Fonctionnalités sympatoche :</p>
        <p className="mb-1">• Navigation intuitive avec les flèches ↑/↓ et sélection avec Enter</p>
        <p className="mb-1">• Filtrage par catégorie et recherche textuelle</p>
        <p className="mb-1">• Documentation détaillée et exemples d'utilisation</p>
        <p className="mb-1">• Activation automatique pendant la frappe ou avec Ctrl+Space</p>
      </div>
    </div>
  );
}