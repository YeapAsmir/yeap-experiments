// PayrollEditor.jsx
import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { autocompletion, snippetCompletion, CompletionContext, startCompletion } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { EditorView, keymap } from '@codemirror/view';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import './style.css'
// Définition des suggestions avec leur format snippet pour CodeMirror 6
const getSuggestions = (context) => {
  // Vérifier s'il y a un mot à compléter
  const word = context.matchBefore(/\w+/);
  if (!word && !context.explicit) return null;

  const wordText = word ? word.text.toLowerCase() : "";
  
  // Construire la liste des suggestions et les filtrer selon le texte saisi
  const allSuggestions = [
    snippetCompletion('si(${1:condition}; ${2:valeur_si_vrai}; ${3:valeur_si_faux})', {
      label: 'si',
      type: 'function',
      detail: 'Évalue une condition et retourne une valeur selon le résultat',
      boost: 99, // Augmente la priorité de cette suggestion
    }),
    snippetCompletion('base()', {
      label: 'base()',
      type: 'function',
      detail: 'Retourne la valeur de base selon le diplôme',
    }),
    snippetCompletion('siNull(${1:valeur}; ${2:valeur_alternative})', {
      label: 'siNull',
      type: 'function',
      detail: 'Vérifie si une valeur est nulle et retourne une valeur alternative',
    }),
    snippetCompletion('somme(${1:valeur1}; ${2:valeur2}; ${3:...})', {
      label: 'somme',
      type: 'function',
      detail: 'Calcule la somme de plusieurs valeurs',
    }),
    snippetCompletion('moyenne(${1:valeur1}; ${2:valeur2}; ${3:...})', {
      label: 'moyenne',
      type: 'function',
      detail: 'Calcule la moyenne de plusieurs valeurs',
    }),
    snippetCompletion('arrondi(${1:nombre}; ${2:decimales})', {
      label: 'arrondi',
      type: 'function',
      detail: 'Arrondit un nombre au nombre de décimales spécifié',
    }),
    // Constantes
    snippetCompletion('base()=50', {
      label: 'base()=50',
      type: 'constant',
      detail: 'CAP',
    }),
    snippetCompletion('base()=70', {
      label: 'base()=70',
      type: 'constant',
      detail: 'BP / BAC',
    }),
    snippetCompletion('base()=30', {
      label: 'base()=30',
      type: 'constant',
      detail: 'Certificat CNAM',
    }),
    snippetCompletion('base()=100', {
      label: 'base()=100',
      type: 'constant',
      detail: 'Enseignement supérieur',
    }),
    // Variables
    snippetCompletion('edpCommentaire', {
      label: 'edpCommentaire',
      type: 'variable',
      detail: 'Commentaire associé à la prime',
    }),
    snippetCompletion('edpMontant', {
      label: 'edpMontant',
      type: 'variable',
      detail: 'Montant de la prime',
    }),
    // Opérateurs (avec espace pour meilleure lisibilité)
    snippetCompletion(' + ', {
      label: '+',
      type: 'operator',
      detail: 'Concatène ou additionne',
    }),
    snippetCompletion(' != ', {
      label: '!=',
      type: 'operator',
      detail: 'Différent',
    }),
    snippetCompletion(' = ', {
      label: '=',
      type: 'operator',
      detail: 'Égalité',
    }),
  ];
  
  // Filtrer les suggestions en fonction du texte saisi
  const filteredSuggestions = word 
    ? allSuggestions.filter(s => s.label.toLowerCase().startsWith(wordText))
    : allSuggestions;

  return {
    from: word ? word.from : context.pos,
    options: filteredSuggestions,
    span: word || /\w*/, // Utiliser le mot actuel pour déterminer la portée des suggestions
  };
};

// Composant principal de l'éditeur de formules
export default function PayrollEditor() {
  const [value, setValue] = useState('');

  // Configuration des extensions CodeMirror
  const extensions = [
    // Support du langage JavaScript (pour la coloration syntaxique)
    javascript(),
    
    // Application du style de coloration par défaut
    syntaxHighlighting(defaultHighlightStyle),
    
    // Autocomplétion personnalisée avec nos suggestions
    autocompletion({
      override: [getSuggestions],
      activateOnTyping: true, // Active les suggestions dès qu'on tape
      icons: true, // Affiche des icônes dans les suggestions
      defaultKeymap: true, // Utiliser les raccourcis clavier par défaut
      closeOnBlur: true, // Fermer les suggestions quand on quitte l'éditeur
      maxRenderedOptions: 10, // Limiter le nombre d'options affichées
      addToOptions: [
        {
          render: (completion) => {
            const element = document.createElement('span');
            element.className = `cm-completionDetail cm-completionDetail-${completion.type || ''}`;
            element.textContent = completion.detail || '';
            return element;
          },
          position: 80,
        },
      ],
    }),
    
    // Support de la touche Tab pour la navigation entre les placeholders
    keymap.of([
      indentWithTab,
      ...defaultKeymap,
      {
        key: 'Ctrl-Space',
        run: startCompletion
      }
    ]),
    
    // Styles d'éditeur personnalisés
    EditorView.theme({
      '&': {
        height: '300px',
        fontSize: '14px',
        fontFamily: 'monospace',
      },
      '.cm-scroller': {
        overflow: 'auto',
      },
      '.cm-completionIcon': {
        marginRight: '8px',
        opacity: '0.7',
      },
      '.cm-completionIcon-function::before': {
        content: "'ƒ'",
        color: '#6366f1',
      },
      '.cm-completionIcon-constant::before': {
        content: "'C'",
        color: '#10b981',
      },
      '.cm-completionIcon-variable::before': {
        content: "'$'",
        color: '#f59e0b',
      },
      '.cm-completionIcon-operator::before': {
        content: "'⊕'",
        color: '#ef4444',
      },
      '.cm-completionDetail': {
        marginLeft: '8px',
        fontSize: '12px',
        fontStyle: 'italic',
        color: '#6b7280',
      },
      '.cm-tooltip-autocomplete': {
        '& > ul > li': {
          padding: '4px 8px',
        },
        '& > ul > li[aria-selected]': {
          backgroundColor: '#ebf4ff',
          color: '#2563eb',
        },
        '& > ul > li:hover': {
          backgroundColor: '#f3f4f6',
        },
      },
    }),
  ];

  return (
    <div className="flex flex-col w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-2 bg-gray-100 border-b border-gray-300">
        <h2 className="text-sm font-semibold text-gray-700">Éditeur de Formules de Paie</h2>
      </div>
      
      <div className="flex-grow">
        <CodeMirror
          value={value}
          onChange={setValue}
          extensions={extensions}
          placeholder="Entrez votre formule ici... (essayez de taper 'si' ou 'base')"
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            dropCursor: true,
            allowMultipleSelections: false,
            indentOnInput: false,
            bracketMatching: true,
          }}
        />
      </div>
      
      <div className="p-4 bg-gray-100 border-t border-gray-300">
        <div className="text-sm font-medium text-gray-700 mb-2">Contenu édité :</div>
        <pre className="p-3 bg-white border border-gray-200 rounded font-mono text-sm overflow-x-auto">
          {value || "<Aucun contenu>"}
        </pre>
      </div>
      
      <div className="p-3 bg-blue-50 border-t border-blue-200">
        <div className="text-xs text-blue-800">
          <p className="font-semibold mb-1">Fonctionnalités :</p>
          <p className="mb-1">• Autocomplétion intelligente des fonctions, variables et opérateurs</p>
          <p className="mb-1">• Navigation entre les placeholders avec la touche Tab</p>
          <p className="mb-1">• Ctrl+Space pour afficher manuellement les suggestions</p>
          <p className="mb-1">• Supporte les fonctions imbriquées comme si(somme(...); moyenne(...); ...)</p>
        </div>
      </div>
    </div>
  );
}