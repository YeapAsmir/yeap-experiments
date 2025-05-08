// TagVisualizer.tsx - Composant React pour visualiser les expressions de tags
import React, { useState } from 'react';
import { useTagParser, ASTNode } from './tagParser';
import useJSONBeautifier from './useASTHighlighter';

// Composant pour afficher un tag simple
const TagPill: React.FC<{ value: string }> = ({ value }) => {
  return (
    <kbd className="px-1.5 h-7 flex items-center justify-center text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
      {value}
    </kbd>
  );
};

// Composant pour afficher un opérateur
const OperatorPill: React.FC<{ type: string }> = ({ type }) => {
  const label = type === 'AND' ? 'et' : type === 'OR' ? 'ou' : '';
  
  return (
    <span className="first:ml-1 text-sm font-medium text-gray-500">
      {label}
    </span>
  );
};

// Fonction récursive pour afficher l'AST
const renderAST = (node: ASTNode): React.ReactNode => {
  if (!node) return null;

  switch (node.type) {
    case 'TAG':
      return <TagPill value={node.value} />;
      
    case 'RANGE':
      return (
        <>
          <span className="first:ml-1 text-sm font-medium text-gray-500">de</span>
          {renderAST(node.from)}
          <span className="first:ml-1 text-sm font-medium text-gray-500">à</span>
          {renderAST(node.to)}
        </>
      );
      
    case 'AND': {
      if (!node.children || node.children.length === 0) return null;
      
      return (
        <>
          {node.children.map((child, index) => (
            <React.Fragment key={index}>
              {renderAST(child)}
              {index < node.children.length - 1 && <OperatorPill type="AND" />}
            </React.Fragment>
          ))}
        </>
      );
    }
      
    case 'OR': {
      if (!node.children || node.children.length === 0) return null;
      
      return (
        <>
          {node.children.map((child, index) => (
            <React.Fragment key={index}>
              {renderAST(child)}
              {index < node.children.length - 1 && <OperatorPill type="OR" />}
            </React.Fragment>
          ))}
        </>
      );
    }
      
    default:
      return null;
  }
};

const TagVisualizer: React.FC = () => {
  // Utiliser notre hook personnalisé
  const { 
    ast, 
    userInput, 
    selectedExample, 
    examples, 
    setUserInput, 
    setSelectedExample 
  } = useTagParser();
  
  // Options de coloration syntaxique
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [indentSize, setIndentSize] = useState<number>(2);
  
  // Utiliser notre nouveau hook pour le beautifier JSON
  const { JSONBeautified } = useJSONBeautifier(ast, {
    colorScheme,
    indentSize
  });
  
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Visualiseur d'expressions de tags</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Entrez votre expression
        </label>
        <textarea
          className="w-full border rounded-md border-neutral-200 p-2 resize-none"
          rows={3}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Entrez une expression de tag (ex: 39500 || 39520 || 79500.099)"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Choisir un exemple
        </label>
        <select 
          className="w-full p-2 border border-gray-300 rounded-md"
          value={selectedExample}
          onChange={(e) => setSelectedExample(e.target.value)}
        >
          <option value="">Sélectionner un exemple...</option>
          {examples.map((example, index) => (
            <option key={index} value={example}>{example}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Visualisation
        </label>
        <div className="flex flex-wrap gap-y-2 gap-x-1 p-1 border rounded-lg border-neutral-200">
          {ast ? (
            <div className="flex flex-wrap items-center gap-1">
              {renderAST(ast)}
            </div>
          ) : (
            <div className="text-gray-400 italic">
              Saisissez une expression de tag ci-dessus pour voir la visualisation
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium">Structure de l'AST</h2>
          <div className="flex space-x-4">
            <div className="flex items-center text-sm">
              <label className="mr-2">Indentation:</label>
              <select
                value={indentSize}
                onChange={(e) => setIndentSize(Number(e.target.value))}
                className="border rounded-md px-2 py-1"
              >
                <option value="2">2 espaces</option>
                <option value="4">4 espaces</option>
                <option value="8">8 espaces</option>
              </select>
            </div>
            <select
              value={colorScheme}
              onChange={(e) => setColorScheme(e.target.value as 'light' | 'dark')}
              className="text-sm border rounded-md px-2 py-1"
            >
              <option value="dark">Thème sombre</option>
              <option value="light">Thème clair</option>
            </select>
          </div>
        </div>
        <JSONBeautified className="text-sm" />
      </div>
    </div>
  );
};

export default TagVisualizer;