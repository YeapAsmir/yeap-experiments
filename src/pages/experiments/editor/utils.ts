// Misc
import { DocumentationInfo } from './types';
import {
    Completion,
    snippetCompletion
}                            from '@codemirror/autocomplete';

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

export const allSuggestions = [
  snippetCompletion("test(#{1:hello}, #{2:sir})", {
    label: "test",
    type: "function",
    detail: "Test de la fonction",
  }),
  snippetCompletion("si(#{1:condition}; #{2:valeur_si_vrai}; #{3:valeur_si_faux})", {
    label: "si",
    type: "function",
    detail: "Évalue une condition et retourne une valeur selon le résultat",
    boost: 99,
  }),
  snippetCompletion("base()", {
    label: "base()",
    type: "function",
    detail: "Retourne la valeur de base selon le diplôme",
  }),
  snippetCompletion("siNull(#{1:valeur}; #{2:valeur_alternative})", {
    label: "siNull",
    type: "function",
    detail: "Vérifie si une valeur est nulle et retourne une valeur alternative",
  }),
  snippetCompletion("somme(#{1:valeur1}; #{2:valeur2}; #{3:...})", {
    label: "somme",
    type: "function",
    detail: "Calcule la somme de plusieurs valeurs",
  }),
  snippetCompletion("moyenne(#{1:valeur1}; #{2:valeur2}; #{3:...})", {
    label: "moyenne",
    type: "function",
    detail: "Calcule la moyenne de plusieurs valeurs",
  }),
  snippetCompletion("arrondi(#{1:nombre}; #{2:decimales})", {
    label: "arrondi",
    type: "function",
    detail: "Arrondit un nombre au nombre de décimales spécifié",
  }),
  snippetCompletion("base()=50", {
    label: "base()=50",
    type: "constant",
    detail: "CAP",
  }),
  snippetCompletion("base()=70", {
    label: "base()=70",
    type: "constant",
    detail: "BP / BAC",
  }),
  snippetCompletion("edpCommentaire", {
    label: "edpCommentaire",
    type: "variable",
    detail: "Commentaire associé à la prime",
  }),
  snippetCompletion("edpMontant", {
    label: "edpMontant",
    type: "variable",
    detail: "Montant de la prime",
  }),
  snippetCompletion(" + ", {
    label: "+",
    type: "operator",
    detail: "Concatène ou additionne",
  }),
  snippetCompletion(" != ", {
    label: "!=",
    type: "operator",
    detail: "Différent",
  }),
  snippetCompletion(" .. ", {
    label: "..",
    type: "operator",
    detail: "Plage de valeurs",
  }),
  snippetCompletion(" || ", {
    label: "||",
    type: "operator",
    detail: "OU logique",
  }),
  snippetCompletion(" , ", {
    label: ",",
    type: "operator",
    detail: "ET logique",
  }),
  snippetCompletion(" && ", {
    label: "&&",
    type: "operator",
    detail: "ET logique",
  }),
  snippetCompletion("concat(#{1:texte1}; #{2:texte2}; #{3:...})", {
    label: "concat",
    type: "function",
    detail: "Concatène plusieurs chaînes de caractères",
  }),
  snippetCompletion("multiplePar(#{1:montant}; #{2:coefficient})", {
    label: "multiplePar",
    type: "function",
    detail: "Multiplie par un coefficient selon le diplôme",
  }),
  snippetCompletion("anneesDiplome(#{1:dateObtention})", {
    label: "anneesDiplome",
    type: "function",
    detail: "Années écoulées depuis l'obtention du diplôme",
  }),
  snippetCompletion("majoration(#{1:montant}; #{2:pourcentage})", {
    label: "majoration",
    type: "function",
    detail: "Applique une majoration selon l'ancienneté",
  }),
  snippetCompletion("niveauDiplome()", {
    label: "niveauDiplome",
    type: "function",
    detail: "Niveau du diplôme (I à V)",
  }),
  snippetCompletion("plafond(#{1:valeur}; #{2:maximum})", {
    label: "plafond",
    type: "function",
    detail: "Limite une valeur à un maximum",
  }),
  snippetCompletion("plancher(#{1:valeur}; #{2:minimum})", {
    label: "plancher",
    type: "function",
    detail: "Assure qu'une valeur ne soit pas inférieure à un minimum",
  }),
  snippetCompletion("appartientA(#{1:valeur}; #{2:valeur1}; #{3:valeur2}; #{4:...})", {
    label: "appartientA",
    type: "function",
    detail: "Vérifie l'appartenance à une liste de valeurs",
  }),
  snippetCompletion("formatDate(#{1:date}; #{2:format})", {
    label: "formatDate",
    type: "function",
    detail: "Formate une date",
  }),
  snippetCompletion("formatMontant(#{1:montant}; #{2:devise})", {
    label: "formatMontant",
    type: "function",
    detail: "Formate un montant avec devise",
  }),
  snippetCompletion("base()=30", {
    label: "base()=30",
    type: "constant",
    detail: "CNAM",
  }),
  snippetCompletion("base()=100", {
    label: "base()=100",
    type: "constant",
    detail: "Diplôme de l'enseignement supérieur",
  }),
  snippetCompletion("edpDateObtention", {
    label: "edpDateObtention",
    type: "variable",
    detail: "Date d'obtention du diplôme",
  }),
  snippetCompletion("typeDiplome", {
    label: "typeDiplome",
    type: "variable",
    detail: "Type du diplôme",
  }),
];

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
    case '..':
      return {
        description: 'Opérateur de plage. Utilisé pour créer des plages de valeurs.',
        syntax: 'valeur1..valeur2',
        example: '1..10'
      };
    case '||':
      return {
        description: 'Opérateur logique OU. Retourne vrai si au moins une des expressions est vraie.',
        syntax: 'expression1 || expression2',
        example: 'si(edpMontant > 1000 || edpCommentaire != ""; "Prime élevée"; "Prime normale")'
      };
    case ',':
      return {
        description: 'Opérateur logique ET. Retourne vrai si les deux expressions sont vraies.',
        syntax: 'expression1, expression2',
        example: 'si(edpMontant > 1000, edpCommentaire != ""; "Prime élevée avec commentaire"; "Prime normale")'
      };
    case '&&':
      return {
        description: 'Opérateur logique ET. Retourne vrai si les deux expressions sont vraies.',
        syntax: 'expression1 && expression2',
        example: 'si(edpMontant > 1000 && edpCommentaire != ""; "Prime élevée"; "Prime normale")'
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