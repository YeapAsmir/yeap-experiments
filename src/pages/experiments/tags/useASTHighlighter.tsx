// Misc
import React   from 'react';
import { JSX } from 'react';

type JSONBeautifierOptions = {
  indentSize?: number;
  colorScheme?: 'light' | 'dark' | 'monokai' | 'customDark';
};

/**
 * Hook pour embellir et colorer la syntaxe d'un objet JSON
 * @param json L'objet JSON à embellir
 * @param options Options de mise en forme
 * @returns Composant React pour afficher le JSON embelli
 */
export const useJSONBeautifier = (
  json: any,
  options: JSONBeautifierOptions = {}
) => {
  // Options par défaut
  const {
    indentSize = 2,
    colorScheme = 'dark'
  } = options;

  // Couleurs selon le schéma choisi
  const schemes = {
    light: {
      key: '#0366d6',
      string: '#50a14f',
      number: '#e45649',
      boolean: '#986801',
      null: '#e45649',
      bracket: '#24292e',
      punctuation: '#24292e',
      background: '#f6f8fa',
      text: '#24292e',
    },
    dark: {
      key: '#88c0d0',
      string: '#a3be8c',
      number: '#b48ead',
      boolean: '#ebcb8b',
      null: '#bf616a',
      bracket: '#d8dee9',
      punctuation: '#eceff4',
      background: '#2e3440',
      text: '#e5e9f0',
    },
    monokai: {
      key: '#fd971f',        // orange
      string: '#a6e22e',     // green
      number: '#ae81ff',     // purple
      boolean: '#66d9ef',    // blue
      null: '#f92672',       // red
      bracket: '#f8f8f2',    // light foreground
      punctuation: '#f8f8f2',
      background: '#272822',
      text: '#f8f8f2',
    },
    customDark: {
      key: '#4fc3f7',        // bleu clair pour les clés
      string: '#ffffff',     // blanc pur pour les chaînes
      number: '#81d4fa',     // bleu pastel pour les nombres
      boolean: '#29b6f6',    // bleu vif pour les booléens
      null: '#90a4ae',       // gris bleuté pour null
      bracket: '#b0bec5',    // gris clair pour crochets et accolades
      punctuation: '#eceff1',// blanc cassé pour ponctuation
      background: '#0d1117', // fond noir profond
      text: '#e0f7fa',       // texte blanc bleuté
    }
  };

  const colors = schemes[colorScheme];

  /**
   * Transforme la chaîne JSON en éléments React avec coloration syntaxique
   */
  const beautifyJSON = () => {
    try {
      // Convertir l'objet en chaîne JSON formatée
      const formattedString = typeof json === 'string'
        ? JSON.stringify(JSON.parse(json), null, indentSize)
        : JSON.stringify(json, null, indentSize);

      if (!formattedString) return null;

      // Tokenisation et coloration syntaxique
      const tokenized = tokenizeJSON(formattedString);

      return (
        <div style={{ fontFamily: 'monospace', whiteSpace: 'pre', color: colors.text }}>
          {tokenized}
        </div>
      );
    } catch (error) {
      return <div style={{ color: colors.null }}>Erreur de formatage JSON: {String(error)}</div>;
    }
  };

  /**
   * Tokenise la chaîne JSON et applique une coloration syntaxique
   */
  const tokenizeJSON = (jsonString: string): JSX.Element[] => {
    const result: JSX.Element[] = [];
    let currentPos = 0;

    // Expressions régulières pour détecter les différents tokens
    const patterns = {
      string: /"(?:\\.|[^"\\])*"/g,
      number: /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
      boolNull: /\b(?:true|false|null)\b/g,
      punctuation: /[,:]/g,
      bracket: /[[\]{}]/g,
      whiteSpace: /\s+/g,
    };

    while (currentPos < jsonString.length) {
      let match: RegExpExecArray | null = null;
      let type: keyof typeof patterns | 'key' = 'whiteSpace';
      
      for (const [tokenType, regex] of Object.entries(patterns) as [keyof typeof patterns, RegExp][]) {
        regex.lastIndex = currentPos;
        const newMatch = regex.exec(jsonString);
        
        if (newMatch && (match === null || newMatch.index < match.index)) {
          match = newMatch;
          type = tokenType;
        }
      }

      if (!match || match.index > currentPos) {
        const text = jsonString.slice(currentPos, match ? match.index : jsonString.length);
        result.push(<span key={`text-${currentPos}`}>{text}</span>);
        currentPos = match ? match.index : jsonString.length;
      }

      if (match) {
        const matchText = match[0];
        
        // Déterminer si c'est une clé d'objet (suivie de ":")
        let isKey = false;
        if (type === 'string') {
          const nextColonIdx = jsonString.indexOf(':', match.index + matchText.length);
          const nextNonWhitespace = jsonString.substring(match.index + matchText.length, nextColonIdx).trim();
          isKey = nextColonIdx !== -1 && nextNonWhitespace === '';
        }

        const colorKey = isKey ? 'key' :
                         type === 'string' ? 'string' :
                         type === 'number' ? 'number' :
                         type === 'boolNull' ? matchText === 'null' ? 'null' : 'boolean' :
                         type === 'punctuation' ? 'punctuation' :
                         type === 'bracket' ? 'bracket' :
                         'text';

        result.push(
          <span 
            key={`${type}-${currentPos}`} 
            style={{ color: colors[colorKey] }}
          >
            {matchText}
          </span>
        );

        currentPos = match.index + matchText.length;
      }
    }

    return result;
  };

  const JSONBeautified: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
      <pre
        className={`overflow-auto p-2 rounded-md ${className}`}
        style={{ backgroundColor: colors.background, margin: 0 }}
      >
        {beautifyJSON()}
      </pre>
    );
  };

  return {
    JSONBeautified,
    updateOptions: (newOptions: Partial<JSONBeautifierOptions>) => ({
      ...options,
      ...newOptions
    })
  };
};

export default useJSONBeautifier;