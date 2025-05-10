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
        example: 'siNull(edpCommentaire; "")'
      };
    case 'base()=50':
      return {
        description: 'Prime versée à l\'obtention d\'un CAP.',
        syntax: 'base()=50',
        example: 'si(base()=50; "Prime versée à l\'obtention d\'un CAP"; "")'
      };
    case 'base()=70':
      return {
        description: 'Prime versée à l\'obtention d\'un BP / BAC.',
        syntax: 'base()=70',
        example: 'si(base()=70; "Prime versée à l\'obtention d\'un BP / BAC"; "")'
      };
    case 'edpCommentaire':
      return {
        description: 'Commentaire associé à la prime.',
        syntax: 'edpCommentaire',
        example: 'si(edpCommentaire != ""; ", " + edpCommentaire; "")'
      };
    case 'edpMontant':
      return {
        description: 'Montant de la prime versée.',
        syntax: 'edpMontant',
        example: 'somme(base(); edpMontant)'
      };
    case '+':
      return {
        description: 'Opérateur de concaténation pour les chaînes ou d\'addition pour les nombres.',
        syntax: 'expression1 + expression2',
        example: '"Montant: " + edpMontant + " €"'
      };
    case '!=':
      return {
        description: 'Opérateur de différence. Retourne vrai si les expressions ne sont pas égales.',
        syntax: 'expression1 != expression2',
        example: 'si(edpCommentaire != ""; edpCommentaire; "Aucun commentaire")'
      };
    // Nouvelles fonctions que vous pourriez ajouter
    case 'concat':
      return {
        description: 'Concatène plusieurs chaînes de caractères.',
        syntax: 'concat(texte1; texte2; ...)',
        example: 'concat("Prime: "; edpMontant; "€")'
      };
    case 'multiplePar':
      return {
        description: 'Multiplie une valeur par un coefficient selon le niveau de diplôme.',
        syntax: 'multiplePar(montant; coefficient)',
        example: 'multiplePar(base(); 1.5)'
      };
    case 'anneesDiplome':
      return {
        description: 'Calcule le nombre d\'années depuis l\'obtention du diplôme.',
        syntax: 'anneesDiplome(dateObtention)',
        example: 'anneesDiplome(edpDateObtention)'
      };
    case 'majoration':
      return {
        description: 'Applique une majoration à un montant selon l\'ancienneté du diplôme.',
        syntax: 'majoration(montant; pourcentage)',
        example: 'majoration(base(); 5)'
      };
    case 'niveauDiplome':
      return {
        description: 'Retourne le niveau du diplôme selon la nomenclature française (I à V).',
        syntax: 'niveauDiplome()',
        example: 'si(niveauDiplome() <= 3; base() * 1.2; base())'
      };
    case 'plafond':
      return {
        description: 'Limite une valeur à un maximum spécifié.',
        syntax: 'plafond(valeur; maximum)',
        example: 'plafond(base() + bonus(); 1500)'
      };
    case 'plancher':
      return {
        description: 'Assure qu\'une valeur ne soit pas inférieure à un minimum spécifié.',
        syntax: 'plancher(valeur; minimum)',
        example: 'plancher(base() - deduction(); 50)'
      };
    case 'appartientA':
      return {
        description: 'Vérifie si une valeur appartient à une liste de valeurs possibles.',
        syntax: 'appartientA(valeur; valeur1; valeur2; ...)',
        example: 'appartientA(typeDiplome; "CAP"; "BP"; "BAC")'
      };
    case 'formatDate':
      return {
        description: 'Formate une date selon le format spécifié.',
        syntax: 'formatDate(date; "format")',
        example: 'formatDate(edpDateObtention; "DD/MM/YYYY")'
      };
    case 'formatMontant':
      return {
        description: 'Formate un montant avec le symbole de devise et séparateurs.',
        syntax: 'formatMontant(montant; "devise")',
        example: 'formatMontant(base(); "EUR")'
      };
    default:
      return {
        description: suggestion.detail || 'Aucune description disponible.',
        syntax: suggestion.label,
        example: suggestion.label
      };
  }
}