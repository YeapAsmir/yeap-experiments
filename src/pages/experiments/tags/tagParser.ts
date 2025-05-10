// tagParser.ts - Implémentation POO du parseur d'expressions de tags
import { useState } from 'react';
import * as ohm from 'ohm-js';

// ------------- TYPES -------------

export type TagValue = {
  type: 'TAG';
  value: string;
};

export type RangeNode = {
  type: 'RANGE';
  from: TagValue;
  to: TagValue;
};

export type AndNode = {
  type: 'AND';
  children: ASTNode[];
};

export type OrNode = {
  type: 'OR';
  children: ASTNode[];
};

// Type union pour tous les nœuds possibles dans l'AST
export type ASTNode = TagValue | RangeNode | AndNode | OrNode;

// ------------- CLASSE PARSEUR -------------

/**
 * Classe principale pour le parsing d'expressions de tags
 */
export class TagParser {
  private static instance: TagParser;
  private tagGrammar: ohm.Grammar;
  private tagSemantics: ohm.Semantics;
  
  // Définition de la grammaire avec Ohm-js
  private static readonly tagGrammarSource = `
  TagGrammar {
    Expression = OrExpression

    OrExpression = 
      | OrExpression orOp AndExpression  -- or
      | AndExpression

    AndExpression = 
      | AndExpression andOp RangeExpression  -- and
      | RangeExpression

    RangeExpression = 
      | PrimaryExpression rangeOp PrimaryExpression  -- range
      | PrimaryExpression

    PrimaryExpression = identifier

    identifier = (~(orOp | andOp | rangeOp) (alnum | "." | "_" | "-"))+
    
    // Opérateurs
    orOp = "||"
    andOp = ","
    rangeOp = ".."
    
    // Ignore les espaces
    space += comment
    comment = "//" (~lineTerminator any)* lineTerminator?
    lineTerminator = "\\n" | "\\r" | "\\u2028" | "\\u2029"
  }
  `;
  
  /**
   * Constructeur privé pour le pattern Singleton
   */
  private constructor() {
    // Création de la grammaire
    this.tagGrammar = ohm.grammar(TagParser.tagGrammarSource);
    
    // Création du sémantique pour construire l'AST
    this.tagSemantics = this.tagGrammar.createSemantics();
    
    // Initialisation des opérations sémantiques
    this.initializeSemantics();
  }
  
  /**
   * Obtenir l'instance singleton du parseur
   * @returns L'instance du parseur
   */
  public static getInstance(): TagParser {
    if (!TagParser.instance) {
      TagParser.instance = new TagParser();
    }
    return TagParser.instance;
  }
  
  /**
   * Initialiser les opérations sémantiques pour le parsing
   */
  private initializeSemantics(): void {
    this.tagSemantics.addOperation('toAST', {
      Expression(e) {
        return e.toAST();
      },
      
      OrExpression_or(left, _op, right) {
        const leftNode = left.toAST();
        const rightNode = right.toAST();
        
        // Si le nœud de gauche est déjà un OR, ajouter le nœud de droite à ses enfants
        if (leftNode.type === 'OR') {
          return {
            type: 'OR' as const,
            children: [...leftNode.children, rightNode]
          };
        }
        
        // Sinon, créer un nouveau nœud OR
        return {
          type: 'OR' as const,
          children: [leftNode, rightNode]
        };
      },
      
      OrExpression(e) {
        return e.toAST();
      },
      
      AndExpression_and(left, _op, right) {
        const leftNode = left.toAST();
        const rightNode = right.toAST();
        
        // Si le nœud de gauche est déjà un AND, ajouter le nœud de droite à ses enfants
        if (leftNode.type === 'AND') {
          return {
            type: 'AND' as const,
            children: [...leftNode.children, rightNode]
          };
        }
        
        // Sinon, créer un nouveau nœud AND
        return {
          type: 'AND' as const,
          children: [leftNode, rightNode]
        };
      },
      
      AndExpression(e) {
        return e.toAST();
      },
      
      RangeExpression_range(from, _op, to) {
        return {
          type: 'RANGE' as const,
          from: from.toAST() as TagValue,
          to: to.toAST() as TagValue
        };
      },
      
      RangeExpression(e) {
        return e.toAST();
      },
      
      PrimaryExpression(e) {
        return e.toAST();
      },
      
      identifier(_chars) {
        return {
          type: 'TAG' as const,
          value: this.sourceString
        };
      }
    });
  }
  
  /**
   * Convertit un AST générique en AST correctement typé
   * @param ast AST brut à convertir
   * @returns AST correctement typé
   */
  public convertToTypedAST(ast: any): ASTNode {
    if (!ast) return { type: 'TAG' as const, value: '' };
    
    if (ast.type === 'TAG') {
      return { type: 'TAG' as const, value: ast.value };
    } else if (ast.type === 'RANGE') {
      return {
        type: 'RANGE' as const,
        from: { type: 'TAG' as const, value: ast.from.value },
        to: { type: 'TAG' as const, value: ast.to.value }
      };
    } else if (ast.type === 'AND' || ast.type === 'OR') {
      return {
        type: ast.type as 'AND' | 'OR',
        children: ast.children.map((child: any) => this.convertToTypedAST(child))
      };
    }
    
    // Fallback au cas où
    return { type: 'TAG' as const, value: '' };
  }
  
  /**
   * Parse une expression de tag en utilisant Ohm-js
   * @param input Expression de tag à parser
   * @returns AST correspondant à l'expression ou null en cas d'erreur
   */
  public parseWithOhm(input: string): ASTNode | null {
    try {
      // Matcher l'expression avec la grammaire
      const matchResult = this.tagGrammar.match(input);
      
      // Si le match a réussi, construire l'AST
      if (matchResult.succeeded()) {
        const semanticResult = this.tagSemantics(matchResult);
        return semanticResult.toAST() as ASTNode;
      }
      
      // En cas d'échec, retourner null
      return null;
    } catch (error) {
      console.error('Erreur lors du parsing:', error);
      return null;
    }
  }
  
  /**
   * Implémentation manuelle de parsing comme fallback
   * @param expression Expression à parser
   * @returns AST résultant ou null en cas d'erreur
   */
  private manualParseExpression(expression: string): ASTNode | null {
    if (!expression || expression.trim() === '') {
      return null;
    }

    // Fonction pour trouver la position des opérateurs qui ne sont pas à l'intérieur de nœuds déjà reconnus
    const findOperatorPositions = (text: string, operator: string): number[] => {
      const positions: number[] = [];
      let depth = 0;
      let inTag = false;
      
      for (let i = 0; i < text.length; i++) {
        if (text.substring(i, i + operator.length) === operator && depth === 0 && !inTag) {
          positions.push(i);
          i += operator.length - 1; // Sauter le reste de l'opérateur
        }
      }
      
      return positions;
    };
    
    // 1. Rechercher les opérateurs OR (||) qui ont la priorité la plus basse
    const orPositions = findOperatorPositions(expression, '||');
    
    // Si nous avons au moins un opérateur OR
    if (orPositions.length > 0) {
      const children: ASTNode[] = [];
      let startPos = 0;
      
      // Traiter chaque segment séparé par ||
      for (const pos of orPositions) {
        const part = expression.substring(startPos, pos).trim();
        if (part) {
          const subNode = this.manualParseSubExpression(part);
          if (subNode) children.push(subNode);
        }
        startPos = pos + 2; // Longueur de '||'
      }
      
      // Traiter le dernier segment
      const lastPart = expression.substring(startPos).trim();
      if (lastPart) {
        const subNode = this.manualParseSubExpression(lastPart);
        if (subNode) children.push(subNode);
      }
      
      if (children.length > 0) {
        return {
          type: 'OR' as const,
          children
        };
      }
    }
    
    // Si ce n'est pas un OR, on passe au sous-parsing
    return this.manualParseSubExpression(expression);
  }
  
  /**
   * Fonction pour parser les sous-expressions (après avoir traité les OR)
   * @param expr Expression à parser
   * @returns AST résultant ou null en cas d'erreur
   */
  private manualParseSubExpression(expr: string): ASTNode | null {
    if (!expr || expr.trim() === '') {
      return null;
    }
    
    // Fonction pour trouver les virgules qui ne sont pas à l'intérieur de plages déjà reconnues
    const findCommaPositions = (text: string): number[] => {
      const positions: number[] = [];
      let inRange = false;
      
      for (let i = 0; i < text.length; i++) {
        // Vérifier si on entre dans une plage
        if (text.substring(i, i + 2) === '..' && !inRange) {
          inRange = true;
          i++; // Sauter le deuxième point
        } 
        // Vérifier si on rencontre une virgule en dehors d'une plage
        else if (text[i] === ',' && !inRange) {
          positions.push(i);
        }
      }
      
      return positions;
    };
    
    // 2. Rechercher les opérateurs AND (,)
    const commaPositions = findCommaPositions(expr);
    
    // Si nous avons au moins une virgule
    if (commaPositions.length > 0) {
      const children: ASTNode[] = [];
      let startPos = 0;
      
      // Traiter chaque segment séparé par ,
      for (const pos of commaPositions) {
        const part = expr.substring(startPos, pos).trim();
        if (part) {
          const subNode = this.manualParseRangeOrTag(part);
          if (subNode) children.push(subNode);
        }
        startPos = pos + 1; // Longueur de ','
      }
      
      // Traiter le dernier segment
      const lastPart = expr.substring(startPos).trim();
      if (lastPart) {
        const subNode = this.manualParseRangeOrTag(lastPart);
        if (subNode) children.push(subNode);
      }
      
      if (children.length > 0) {
        return {
          type: 'AND' as const,
          children
        };
      }
    }
    
    // 3. Si ce n'est pas un AND, vérifier si c'est une plage
    return this.manualParseRangeOrTag(expr);
  }
  
  /**
   * Fonction pour parser les plages ou les tags simples
   * @param expr Expression à parser
   * @returns AST résultant ou null en cas d'erreur
   */
  private manualParseRangeOrTag(expr: string): ASTNode | null {
    if (!expr || expr.trim() === '') {
      return null;
    }
    
    // Vérifier si c'est une plage en cherchant '..'
    const rangeIndex = expr.indexOf('..');
    
    if (rangeIndex !== -1) {
      const fromValue = expr.substring(0, rangeIndex).trim();
      const toValue = expr.substring(rangeIndex + 2).trim();
      
      if (fromValue && toValue) {
        return {
          type: 'RANGE' as const,
          from: { type: 'TAG' as const, value: fromValue },
          to: { type: 'TAG' as const, value: toValue }
        };
      }
    }
    
    // Si ce n'est pas une plage, c'est un tag simple
    return { type: 'TAG' as const, value: expr.trim() };
  }
  
  /**
   * Fonction principale de parsing - tente d'abord avec Ohm, puis avec fallback manuel
   * @param expression Expression à parser
   * @returns AST résultant ou null en cas d'erreur
   */
  public parseExpression(expression: string): ASTNode | null {
    if (!expression || expression.trim() === '') {
      return null;
    }
    
    try {
      // Essayer de parser avec Ohm
      const result = this.parseWithOhm(expression);
      if (result) {
        return result;
      }
    } catch (error) {
      console.error('Erreur lors du parsing avec Ohm:', error);
      // En cas d'erreur, passer au fallback
    }
    
    // Fallback: utiliser l'implémentation manuelle
    return this.manualParseExpression(expression);
  }
}

// Export d'une instance singleton du parseur
export const tagParser = TagParser.getInstance();

// ------------- HOOK PERSONNALISÉ -------------

type UseTagParserReturn = {
  ast: ASTNode | null;
  userInput: string;
  setUserInput: (input: string) => void;
};

/**
 * Hook personnalisé pour gérer le parsing d'expressions de tag
 * @returns Un objet contenant l'AST, l'entrée utilisateur et la fonction de mise à jour
 */
export const useTagParser = (): UseTagParserReturn => {
  // États
  const [ast, setAst] = useState<ASTNode | null>(null);
  const [userInput, setUserInput] = useState<string>("");
  
  // Mettre à jour l'AST quand l'entrée utilisateur change
  const handleInputChange = (value: string) => {
    setUserInput(value);
    
    // Tenter de parser l'expression en utilisant le singleton
    const result = tagParser.parseExpression(value);
    if (result) {
      setAst(result);
    } else {
      setAst(null);
    }
  };
  
  return {
    ast,
    userInput,
    setUserInput: handleInputChange
  };
};