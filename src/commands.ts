import {
  ApplicationCommandOptionType,
  ApplicationCommandPartial,
} from "./deps.ts";

export const commands: ApplicationCommandPartial[] = [
  {
    name: "version",
    description: "Affiche le numéro de version de Kinobot.",
  },
  {
    name: "open",
    description: "Ouvre les propositions de film (2 max par personne).",
    options: [
      {
        name: "nombre",
        description:
          "Change le nombre de propositions max par personne (0 = infini)",
        required: false,
        type: ApplicationCommandOptionType.NUMBER,
      },
    ],
  },
  {
    name: "propose",
    description: "Propose un film avec un lien Letterboxd.",
    options: [
      {
        name: "lien",
        description: "Lien Letterboxd du film",
        required: true,
        type: ApplicationCommandOptionType.STRING,
      },
    ],
  },
  {
    name: "proposelist",
    description: "Propose un film aléatoirement depuis une liste Letterboxd.",
    options: [
      {
        name: "lien",
        description: "Lien Letterboxd de la liste",
        required: true,
        type: ApplicationCommandOptionType.STRING,
      },
    ],
  },
  {
    name: "cancel",
    description: "Annule un film proposé.",
    options: [
      {
        name: "lien",
        description:
          "Lien (ex: https://letterboxd.com/film/dune-2021/) ou ID (ex: dune-2021) du film proposé",
        required: false,
        type: ApplicationCommandOptionType.STRING,
      },
    ],
  },
  {
    name: "list",
    description:
      "Affiche la liste des films proposés dans la session en cours.",
  },
  {
    name: "subscribe",
    description: "Inscrit à la séance en cours.",
  },
  {
    name: "unsubscribe",
    description: "Désinscrit de la séance en cours.",
  },
  {
    name: "subscribers",
    description: "Liste les personnes inscrites.",
  },
  {
    name: "openvotes",
    description: "Clôt les propositions et ouvre les votes.",
  },
  {
    name: "countvotes",
    description: "Affiche le nombre de personnes ayant voté.",
  },
  {
    name: "closevotes",
    description: "Clôt les votes et annonce le film gagnant.",
  },
  {
    name: "quit",
    description: "Annule la session en cours.",
  },
  {
    name: "history",
    description: "Affiche l'historique des films visionnés.",
  },
  {
    name: "miskine",
    description:
      "Affiche les film les plus proposés sans qu'ils n'aient été sélectionnés.",
  },
  {
    name: "genres",
    description:
      "Affiche un camembert représentant les genres les plus visionnés.",
  },
];
