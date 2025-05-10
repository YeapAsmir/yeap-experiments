import { Completion } from '@codemirror/autocomplete';
import { DocumentationInfo } from './types';

export function getIconForType(type: string) {
  switch (type) {
    case 'function':
      return 'ƒ';
    case 'constant':
      return 'C';
    case 'variable':
      return '$';
    case 'operator':
      return '⊕';
    default:
      return '•';
  }
}

export function getDocumentation(suggestion: Completion): DocumentationInfo {
  switch (suggestion.label) {
    case 'si':
      return {
        description: 'Cette fonction évalue une condition et retourne une valeur selon que la condition est vraie ou fausse.',
        syntax: 'si(condition; valeur_si_vrai; valeur_si_faux)',
        example: 'si(edpMontant > 1000; base() + 50; base())'
      };
    case 'base()':
      return {
        description: 'Retourne la valeur de base selon le diplôme configuré.',
        syntax: 'base()',
        example: 'base() + edpMontant'
      };
    case 'somme':
      return {
        description: 'Calcule la somme de plusieurs valeurs séparées par des points-virgules.',
        syntax: 'somme(valeur1; valeur2; ...)',
        example: 'somme(100; 50; edpMontant)'
      };
    case 'moyenne':
      return {
        description: 'Calcule la moyenne de plusieurs valeurs séparées par des points-virgules.',
        syntax: 'moyenne(valeur1; valeur2; ...)',
        example: 'moyenne(edpMontant; 100; 200)'
      };
    case 'arrondi':
      return {
        description: 'Arrondit un nombre au nombre de décimales spécifié.',
        syntax: 'arrondi(nombre; decimales)',
        example: 'arrondi(edpMontant * 1.196; 2)'
      };
    case 'siNull':
      return {
        description: 'Vérifie si une valeur est nulle et retourne une valeur alternative le cas échéant.',
        syntax: 'siNull(valeur; valeur_alternative)',
        example: 'siNull(edpMontant; 0)'
      };
    default:
      return {
        description: suggestion.detail || 'Aucune description disponible.',
        syntax: suggestion.label,
        example: `${suggestion.label}`
      };
  }
}