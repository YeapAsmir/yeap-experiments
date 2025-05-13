// Misc
import React             from 'react';
import useJSONBeautifier from './useASTHighlighter';
import {
    FC,
    useRef,
    useState,
    ReactNode,
    useEffect
}                        from 'react';
import {
    ASTNode,
    tagParser,
    useTagParser
}                        from './tagParser';

// ------------- CLASSE GESTIONNAIRE D'EXEMPLES -------------

/**
 * Classe pour la gestion des exemples d'expressions
 */
class ExamplesManager {
  private static instance: ExamplesManager;
  private _examples: { text: string; ast: any }[];

  /**
   * Constructeur privé pour le pattern Singleton
   */
  private constructor() {
    // Initialisation des exemples
    this._examples = [
      {
        text: "39500 || 39520 || 79500.099",
        ast: {
          type: "OR",
          children: [
            {
              type: "TAG",
              value: "39500",
            },
            {
              type: "TAG",
              value: "39520",
            },
            {
              type: "TAG",
              value: "79500.099",
            },
          ],
        },
      },
      {
        text: "95150.700.1000 || 95150.700.1010",
        ast: {
          type: "OR",
          children: [
            {
              type: "TAG",
              value: "95150.700.1000",
            },
            {
              type: "TAG",
              value: "95150.700.1010",
            },
          ],
        },
      },
      {
        text: "39500..39600",
        ast: {
          type: "RANGE",
          from: {
            type: "TAG",
            value: "39500",
          },
          to: {
            type: "TAG",
            value: "39600",
          },
        },
      },
      {
        text: "95000.699 , 95150.700.1000",
        ast: {
          type: "AND",
          children: [
            {
              type: "TAG",
              value: "95000.699",
            },
            {
              type: "TAG",
              value: "95150.700.1000",
            },
          ],
        },
      },
      {
        text: "39500..39600 || 79500.099",
        ast: {
          type: "OR",
          children: [
            {
              type: "RANGE",
              from: {
                type: "TAG",
                value: "39500",
              },
              to: {
                type: "TAG",
                value: "39600",
              },
            },
            {
              type: "TAG",
              value: "79500.099",
            },
          ],
        },
      },
      {
        text: "asmir || titouan || john..robert",
        ast: {
          type: "OR",
          children: [
            {
              type: "TAG",
              value: "asmir",
            },
            {
              type: "TAG",
              value: "titouan",
            },
            {
              type: "RANGE",
              from: {
                type: "TAG",
                value: "john",
              },
              to: {
                type: "TAG",
                value: "robert",
              },
            },
          ],
        },
      },
      {
        text: "39500..39600 || 79500.099,80000",
        ast: {
          type: "OR",
          children: [
            {
              type: "RANGE",
              from: {
                type: "TAG",
                value: "39500",
              },
              to: {
                type: "TAG",
                value: "39600",
              },
            },
            {
              type: "AND",
              children: [
                {
                  type: "TAG",
                  value: "79500.099",
                },
                {
                  type: "TAG",
                  value: "80000",
                },
              ],
            },
          ],
        },
      },
    ];
  }

  /**
   * Obtenir l'instance singleton du gestionnaire d'exemples
   * @returns L'instance du gestionnaire d'exemples
   */
  public static getInstance(): ExamplesManager {
    if (!ExamplesManager.instance) {
      ExamplesManager.instance = new ExamplesManager();
    }
    return ExamplesManager.instance;
  }

  /**
   * Récupérer tous les exemples complets
   * @returns Liste des exemples
   */
  public getExamples(): { text: string; ast: any }[] {
    return this._examples;
  }

  /**
   * Récupérer seulement les textes des exemples
   * @returns Liste des textes d'exemples
   */
  public getExampleTexts(): string[] {
    return this._examples.map((item) => item.text);
  }

  /**
   * Trouver l'AST correspondant à un exemple
   * @param exampleText Texte de l'exemple à rechercher
   * @returns AST typé correspondant ou null si non trouvé
   */
  public findASTForExample(exampleText: string): ASTNode | null {
    const found = this._examples.find((item) => item.text === exampleText);
    return found ? tagParser.convertToTypedAST(found.ast) : null;
  }

  /**
   * Obtenir le premier exemple
   * @returns Premier exemple ou chaîne vide
   */
  public getFirstExample(): string {
    return this._examples.length > 0 ? this._examples[0].text : "";
  }
}

// Instance singleton du gestionnaire d'exemples
const examplesManager = ExamplesManager.getInstance();

// Extraire les textes des exemples pour le dropdown
const examples = examplesManager.getExampleTexts();

// ------------- COMPOSANTS DE VISUALISATION -------------

/**
 * Propriétés du composant TagPill
 */
interface TagPillProps {
  value: string;
}

/**
 * Composant pour afficher un tag simple
 */
const TagPill: FC<TagPillProps> = ({ value }) => {
  return <span className="font-mono px-1.5 mx-.5 h-7 flex items-center justify-center text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">{value}</span>;
};

/**
 * Propriétés du composant OperatorPill
 */
interface OperatorPillProps {
  type: string;
}

/**
 * Composant pour afficher un opérateur
 */
const OperatorPill: FC<OperatorPillProps> = ({ type }) => {
  const label = type === "AND" ? "et" : type === "OR" ? "ou" : "";

  return <span className="first:ml-1 text-sm font-medium text-gray-500">{label}</span>;
};

/**
 * Classe pour le rendu de l'AST
 */
class ASTRenderer {
  /**
   * Méthode récursive pour afficher l'AST
   * @param node Nœud de l'AST à afficher
   * @returns Élément React correspondant
   */
  public static render(node: ASTNode): ReactNode {
    if (!node) return null;

    switch (node.type) {
      case "TAG":
        return <TagPill value={node.value} />;

      case "RANGE":
        return (
          <>
            <span className="first:ml-1 text-sm font-medium text-gray-500">de</span>
            {ASTRenderer.render(node.from)}
            <span className="first:ml-1 text-sm font-medium text-gray-500">à</span>
            {ASTRenderer.render(node.to)}
          </>
        );

      case "AND": {
        if (!node.children || node.children.length === 0) return null;

        return (
          <>
            {node.children.map((child, index) => (
              <React.Fragment key={index}>
                {ASTRenderer.render(child)}
                {index < node.children.length - 1 && <OperatorPill type="AND" />}
              </React.Fragment>
            ))}
          </>
        );
      }

      case "OR": {
        if (!node.children || node.children.length === 0) return null;

        return (
          <>
            {node.children.map((child, index) => (
              <React.Fragment key={index}>
                {ASTRenderer.render(child)}
                {index < node.children.length - 1 && <OperatorPill type="OR" />}
              </React.Fragment>
            ))}
          </>
        );
      }

      default:
        return null;
    }
  }
}

/**
 * Hook personnalisé pour gérer les exemples sélectionnés
 * @param defaultExample Exemple par défaut
 * @param onExampleChange Fonction appelée quand l'exemple change
 */
const useExampleSelector = (defaultExample: string, onExampleChange: (value: string) => void) => {
  const [selectedExample, setSelectedExample] = useState<string>(defaultExample);
  const initializedRef = useRef<boolean>(false);

  // Effet pour initialiser avec l'exemple par défaut (une seule fois)
  useEffect(() => {
    if (!initializedRef.current) {
      onExampleChange(defaultExample);
      initializedRef.current = true;
    }
  }, [defaultExample, onExampleChange]);

  // Gestionnaire de changement d'exemple
  const handleExampleChange = (value: string) => {
    setSelectedExample(value);
    onExampleChange(value);
  };

  return {
    selectedExample,
    handleExampleChange,
  };
};

/**
 * Composant principal pour visualiser les expressions de tags
 */
const TagVisualizer: FC = () => {
  // Options de coloration syntaxique
  const [indentSize, setIndentSize] = useState<number>(2);

  // Utiliser notre hook personnalisé pour l'analyse des expressions
  const { ast, userInput, setUserInput } = useTagParser();

  // Utiliser un nouveau hook pour la gestion des exemples
  const { selectedExample, handleExampleChange } = useExampleSelector(examplesManager.getFirstExample(), setUserInput);

  // Utiliser notre hook pour le beautifier JSON
  const { JSONBeautified } = useJSONBeautifier(ast || { type: "TAG", value: "" }, {
    colorScheme: "customDark",
    indentSize,
  });

  return (
    <div className="max-w-2xl mx-auto flex flex-col w-full gap-4">
      {/* <div className="space-y-4">
        <label className="text-sm font-semibold text-gray-700">Entrez votre expression</label>
        <textarea
          className="w-full border rounded-md border-neutral-200 p-2 resize-none"
          rows={3}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Entrez une expression de tag (ex: 39500 || 39520 || 79500.099)"
        />
      </div> */}

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Choisir un exemple</label>
        <select className="appearance-none h-[38px] w-full px-2 border rounded-lg border-neutral-200 ring-0 outline-none text-sm font-medium text-gray-500" value={selectedExample} onChange={(e) => handleExampleChange(e.target.value)}>
          <option value="">Sélectionner un exemple...</option>
          {examples.map((example, index) => (
            <option key={index} value={example}>
              {example}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Visualisation</label>
        <div className="flex flex-wrap gap-y-2 gap-x-1 p-1 border rounded-lg border-neutral-200">
          {ast ? (
            <div className="flex flex-wrap items-center gap-1">{ASTRenderer.render(ast)}</div>
          ) : (
            <div className="text-gray-400 italic">Saisissez une expression de tag ci-dessus pour voir la visualisation</div>
          )}
        </div>
      </div>

      <div className="p-3 bg-[#fdfbfc] rounded-md border border-neutral-200">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-sm mb-1 text-black space-y-1">Structure de l'AST</h2>
          <div className="flex space-x-4">
            <div className="flex items-center text-sm">
              <label className="mr-2">Indentation:</label>
              <select value={indentSize} onChange={(e) => setIndentSize(Number(e.target.value))} className="border rounded-md px-2 py-1">
                <option value="2">2 espaces</option>
                <option value="4">4 espaces</option>
              </select>
            </div>
          </div>
        </div>
        <JSONBeautified className="text-sm" />
      </div>
    </div>
  );
};

export default TagVisualizer;
