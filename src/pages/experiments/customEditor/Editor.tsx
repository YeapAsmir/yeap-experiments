import React, { useState, useRef, useEffect } from 'react';

// Types pour les suggestions
interface Suggestion {
  label: string;
  type: string;
  detail: string;
  apply: string;
}

interface PlaceholderRange {
  idx: number;
  start: number;
  end: number;
  text: string;
}

// Suggestions avec syntaxe de snippets (${index:placeholder})
const advancedSuggestions: Suggestion[] = [
  {
    label: 'si',
    type: 'function',
    detail: 'Évalue une condition et retourne une valeur selon le résultat',
    apply: `si(\${1:condition}; \${2:valeur_si_vrai}; \${3:valeur_si_faux})`,
  },
  {
    label: 'base()',
    type: 'function',
    detail: 'Retourne la valeur de base selon le diplôme',
    apply: 'base()',
  },
  {
    label: 'siNull',
    type: 'function',
    detail:
      'Vérifie si une valeur est nulle et retourne une valeur alternative',
    apply: `siNull(\${1:valeur}; \${2:valeur_alternative})`,
  },
  {
    label: 'somme',
    type: 'function',
    detail: 'Calcule la somme de plusieurs valeurs',
    apply: `somme(\${1:valeur1}; \${2:valeur2}; \${3:...})`,
  },
  {
    label: 'moyenne',
    type: 'function',
    detail: 'Calcule la moyenne de plusieurs valeurs',
    apply: `moyenne(\${1:valeur1}; \${2:valeur2}; \${3:...})`,
  },
  {
    label: 'arrondi',
    type: 'function',
    detail: 'Arrondit un nombre au nombre de décimales spécifié',
    apply: `arrondi(\${1:nombre}; \${2:decimales})`,
  },
  // Constantes
  { 
    label: 'base()=50', 
    type: 'constant', 
    detail: 'CAP', 
    apply: 'base()=50',
  },
  {
    label: 'base()=70',
    type: 'constant',
    detail: 'BP / BAC',
    apply: 'base()=70',
  },
  {
    label: 'base()=30',
    type: 'constant',
    detail: 'Certificat CNAM',
    apply: 'base()=30',
  },
  {
    label: 'base()=100',
    type: 'constant',
    detail: 'Enseignement supérieur',
    apply: 'base()=100',
  },
  // Variables
  {
    label: 'edpCommentaire',
    type: 'variable',
    detail: 'Commentaire associé à la prime',
    apply: 'edpCommentaire',
  },
  {
    label: 'edpMontant',
    type: 'variable',
    detail: 'Montant de la prime',
    apply: 'edpMontant',
  },
  // Opérateurs
  {
    label: '+',
    type: 'operator',
    detail: 'Concatène ou additionne',
    apply: ' + ',
  },
  {
    label: '!=',
    type: 'operator',
    detail: 'Différent',
    apply: ' != ',
  },
  {
    label: '=',
    type: 'operator',
    detail: 'Égalité',
    apply: ' = ',
  },
];

// Composant principal
export default function PayrollEditor() {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [placeholderRanges, setPlaceholderRanges] = useState<PlaceholderRange[]>([]);
  const [currentPlaceholder, setCurrentPlaceholder] = useState<number | null>(null);
  const [lineHeight, setLineHeight] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  // Calculer la hauteur de ligne réelle
  useEffect(() => {
    const calculateLineHeight = () => {
      const textarea = textareaRef.current;
      const measure = measureRef.current;
      if (!textarea || !measure) return;

      // Copier les styles pertinents du textarea
      const computedStyle = window.getComputedStyle(textarea);
      measure.style.fontFamily = computedStyle.fontFamily;
      measure.style.fontSize = computedStyle.fontSize;
      measure.style.padding = computedStyle.padding;
      measure.style.lineHeight = computedStyle.lineHeight;
      
      // Insérer un caractère et mesurer la hauteur
      measure.textContent = 'X';
      const height = measure.offsetHeight;
      setLineHeight(height);
    };

    calculateLineHeight();
    // Recalculer si la fenêtre est redimensionnée
    window.addEventListener('resize', calculateLineHeight);
    return () => window.removeEventListener('resize', calculateLineHeight);
  }, []);

  // Insère le snippet et initialise les placeholders
  const insertSuggestion = (suggestion: Suggestion) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const cursorPos = textarea.selectionStart;
    
    // Trouver le début du mot actuel - amélioré pour fonctionner n'importe où
    let startPos = cursorPos;
    while (startPos > 0 && /[a-zA-Z0-9_]/.test(value[startPos - 1])) {
      startPos--;
    }
    
    // Extraire les parties du texte
    const before = value.slice(0, startPos);
    const after = value.slice(cursorPos);
    const snippet = suggestion.apply;

    // Initialiser les variables pour l'analyse des placeholders
    const regex = /\$\{(\d+):([^}]+)\}/g;
    let match;
    let cleaned = '';
    let lastIndex = 0;
    const ranges: PlaceholderRange[] = [];
    
    // Analyser et transformer le snippet
    while ((match = regex.exec(snippet)) !== null) {
      const [full, idx, text] = match;
      
      // Ajouter le texte avant le placeholder
      cleaned += snippet.slice(lastIndex, match.index);
      
      // Calculer la position du texte du placeholder
      const start = before.length + cleaned.length;
      cleaned += text;
      const end = before.length + cleaned.length;
      
      // Enregistrer les informations du placeholder
      ranges.push({ idx: Number(idx), start, end, text });
      
      // Mettre à jour l'index pour continuer l'analyse
      lastIndex = match.index + full.length;
    }
    
    // Ajouter le reste du texte après le dernier placeholder
    cleaned += snippet.slice(lastIndex);

    // Mettre à jour la valeur du textarea
    const newValue = before + cleaned + after;
    setValue(newValue);
    
    // Fermer les suggestions
    setShowSuggestions(false);

    // Trier les placeholders par index et les stocker
    ranges.sort((a, b) => a.idx - b.idx);
    setPlaceholderRanges(ranges);
    
    // Initialiser sur le premier placeholder
    setCurrentPlaceholder(ranges.length > 0 ? 0 : null);

    // Positionner le curseur sur le premier placeholder
    setTimeout(() => {
      if (!textarea) return;
      textarea.focus();
      if (ranges.length > 0) {
        const { start, end } = ranges[0];
        textarea.setSelectionRange(start, end);
      } else {
        const newPosition = startPos + cleaned.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Gérer explicitement la validation des suggestions avec Enter ou Tab
    if (showSuggestions && (e.key === 'Enter' || e.key === 'Tab')) {
      e.preventDefault();
      e.stopPropagation();
      if (suggestions.length > 0) {
        insertSuggestion(suggestions[selectedIndex]);
        return;
      }
    }
    
    // Navigation dans la liste de suggestions
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
        );
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
        return;
      }
    }
    
    // Navigation entre les placeholders avec Tab ou Enter
    if (currentPlaceholder !== null && placeholderRanges.length > 0 && 
        (e.key === 'Tab' || e.key === 'Enter')) {
      e.preventDefault();
      
      const nextIndex = currentPlaceholder + 1;
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      // S'il y a un prochain placeholder
      if (nextIndex < placeholderRanges.length) {
        const next = placeholderRanges[nextIndex];
        
        // Sélectionner le texte du prochain placeholder
        textarea.setSelectionRange(next.start, next.end);
        setCurrentPlaceholder(nextIndex);
      } else {
        // Fin des placeholders - positionner après le dernier
        const last = placeholderRanges[placeholderRanges.length - 1];
        textarea.setSelectionRange(last.end, last.end);
        
        // Réinitialiser l'état
        setCurrentPlaceholder(null);
        setPlaceholderRanges([]);
      }
    }
  };

  // Gestion de la frappe et mise à jour de l'autocomplétion
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // Si le texte a changé, réinitialiser les placeholders
    // (sauf si la modification est juste de remplir un placeholder)
    if (newValue !== value) {
      const cursorPos = e.target.selectionStart;
      
      let keepPlaceholders = false;
      
      // Vérifier si nous sommes en train d'éditer un placeholder
      if (currentPlaceholder !== null && placeholderRanges.length > 0) {
        const current = placeholderRanges[currentPlaceholder];
        
        // Si le curseur est à l'intérieur du placeholder actuel,
        // mettre à jour ses positions et garder l'état des placeholders
        if (cursorPos >= current.start && cursorPos <= current.end + 1) {
          keepPlaceholders = true;
          
          // Calculer la différence de longueur
          const lengthDiff = newValue.length - value.length;
          
          // Mettre à jour les positions des placeholders après le curseur
          const updatedRanges = placeholderRanges.map((range, index) => {
            if (index === currentPlaceholder) {
              // Mettre à jour la fin du placeholder actuel
              return { ...range, end: range.end + lengthDiff };
            } else if (index > currentPlaceholder) {
              // Décaler les placeholders suivants
              return {
                ...range,
                start: range.start + lengthDiff,
                end: range.end + lengthDiff
              };
            }
            return range;
          });
          
          setPlaceholderRanges(updatedRanges);
        }
      }
      
      if (!keepPlaceholders) {
        setCurrentPlaceholder(null);
        setPlaceholderRanges([]);
      }
    }
    
    // Traitement de l'autocomplétion
    const cursorPos = e.target.selectionStart;
    let startPos = cursorPos;
    
    // Trouver le début du mot actuel - amélioration pour fonctionner n'importe où dans la ligne
    // On s'arrête à tout caractère qui n'est pas une lettre, un chiffre ou un underscore
    while (startPos > 0 && /[a-zA-Z0-9_]/.test(newValue[startPos - 1])) {
      startPos--;
    }
    
    const currentWord = newValue.substring(startPos, cursorPos).toLowerCase();
    
    // Si nous avons un mot à compléter
    if (currentWord.length > 0) {
      // Filtrer les suggestions correspondantes
      const filtered = advancedSuggestions.filter(
        (s) => s.label.toLowerCase().includes(currentWord)
      );
      
      if (filtered.length > 0) {
        setSuggestions(filtered);
        setShowSuggestions(true);
        setSelectedIndex(0);
        
        // Positionner la boîte de suggestions
        const textarea = e.target;
        const { scrollTop } = textarea;
        const style = window.getComputedStyle(textarea);
        const paddingLeft = parseInt(style.paddingLeft, 10);
        const paddingTop = parseInt(style.paddingTop, 10);
        
        // Dimensions de la boîte de suggestions
        const SUGGESTION_BOX_WIDTH = 256;
        const SUGGESTION_BOX_HEIGHT = 200; // Hauteur maximale approximative
        const MARGIN = 5; // Marge de sécurité
        
        // Configurer l'élément de mesure
        const measure = measureRef.current;
        if (!measure) return setShowSuggestions(false);
        
        // Copier les styles pertinents du textarea
        measure.style.fontFamily = style.fontFamily;
        measure.style.fontSize = style.fontSize;
        measure.style.letterSpacing = style.letterSpacing;
        measure.style.whiteSpace = 'pre';
        
        // Obtenir le texte de la ligne courante
        const lines = newValue.substring(0, cursorPos).split('\n');
        const currentLineIndex = lines.length - 1;
        const currentLine = lines[currentLineIndex];
        
        // Mesurer le texte jusqu'au curseur
        measure.textContent = currentLine.substring(0, currentLine.length - (cursorPos - startPos));
        const textWidth = measure.offsetWidth;
        
        // Calculer la position verticale de base
        const baseVerticalPos = paddingTop + (currentLineIndex * (lineHeight || 21)) - scrollTop;
        
        // Vérifier si on doit afficher au-dessus de la ligne au lieu d'en-dessous
        const bottomSpace = textarea.offsetHeight - baseVerticalPos;
        const showAbove = bottomSpace < SUGGESTION_BOX_HEIGHT;
        
        // Calculer la position finale
        const verticalPos = showAbove
          ? baseVerticalPos - SUGGESTION_BOX_HEIGHT - MARGIN
          : baseVerticalPos + (lineHeight || 21) + MARGIN;
        
        // Position horizontale avec contraintes
        const horizontalPos = Math.min(
          paddingLeft + textWidth,
          textarea.offsetWidth - SUGGESTION_BOX_WIDTH - MARGIN
        );
        
        setPosition({
          top: Math.max(paddingTop, verticalPos),
          left: Math.max(paddingLeft, horizontalPos)
        });
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Fermer les suggestions si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        e.target !== textareaRef.current
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Élément de mesure caché */}
      <div
        ref={measureRef}
        className="absolute invisible w-auto h-auto"
        style={{ whiteSpace: 'pre', position: 'absolute', top: '-9999px' }}
      />
      <div className="p-2 bg-gray-100 border-b border-gray-300">
        <h2 className="text-sm font-semibold text-gray-700">Éditeur de Formules de Paie</h2>
      </div>
      
      <div className="relative flex-grow">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full h-64 p-4 font-mono text-sm focus:outline-none resize-none"
          placeholder="Entrez votre formule ici... (essayez de taper 'si' ou 'base')"
          spellCheck="false"
        />
        
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-64 max-h-64 overflow-y-auto bg-white border border-gray-300 rounded shadow-lg"
            style={{
              top: position.top + 'px',
              left: position.left + 'px',
            }}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.label}
                className={`p-2 cursor-pointer hover:bg-blue-50 ${
                  index === selectedIndex ? 'bg-blue-100' : ''
                }`}
                onClick={() => insertSuggestion(suggestion)}
              >
                <div className="flex items-center">
                  <span className="font-bold text-blue-600 mr-2">{suggestion.label}</span>
                  <span className="text-xs text-gray-500">{suggestion.type}</span>
                </div>
                <div className="text-xs text-gray-600">{suggestion.detail}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gray-100 border-t border-gray-300">
        <div className="text-sm font-medium text-gray-700 mb-2">Contenu édité :</div>
        <pre className="p-3 bg-white border border-gray-200 rounded font-mono text-sm overflow-x-auto">
          {value || "<Aucun contenu>"}
        </pre>
      </div>
      
      <div className="p-3 bg-blue-50 border-t border-blue-200">
        <div className="text-xs text-blue-800">
          <p className="font-semibold mb-1">Suggestions disponibles :</p>
          <p className="mb-1">• Fonctions : si, base(), siNull, somme, moyenne, arrondi</p>
          <p className="mb-1">• Variables : edpCommentaire, edpMontant</p>
          <p className="mb-1">• Opérateurs : +, =, !=</p>
          <p className="font-semibold mt-2">Navigation :</p>
          <p>• Après insertion d'une fonction, utilisez la touche Tab ou Enter pour naviguer entre les placeholders</p>
        </div>
      </div>
    </div>
  );
}