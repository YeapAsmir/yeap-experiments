export function InfoBar() {
  return (
    <div className="p-3 bg-[#fdfbfc] rounded-md border border-neutral-200">
      <div className="text-xs text-gray-700">
        <p className="font-semibold mb-1 text-black space-y-1">Fonctionnalités sympatoche :</p>
        <p>• Navigation intuitive avec les flèches ↑/↓ et sélection avec Enter</p>
        <p>• Filtrage par catégorie et recherche textuelle</p>
        <p>• Documentation détaillée et exemples d'utilisation</p>
        <p>• Activation automatique pendant la frappe ou avec Ctrl+Space</p>
      </div>
    </div>
  );
}