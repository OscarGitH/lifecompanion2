import { albumPageGroups } from "./albums";
import {
	albumsLinkTo,
	HOME_PAGE_GROUP_ID,
	HOME_PAGE_ID,
	keyboardLinkTo,
	mainLayout,
	pictoLinkTo,
} from "./commons";
import { keyboardPageGroup } from "./keyboard";
import pictogramsPageGroup from "./pictograms";

/*
 * CONFIG: Communiquer+
 *
 * PROBLÉMATIQUES :
 *
 * - Plusieurs "pages" dans un "OuterLayout" (menu de gauche disponible sur toutes les pages)
 * Déjà supporter par l'overflow d'items sur un OuterLayout.
 * En revanche, l'action "Page suivante" devrait être différenciée entre un layout et une page.
 * - Besoins de OuterLayouts déclinés d'autres layouts.
 * Possible avec un "layout" dans un OuterLayout, mais problématique des actions "pages suivantes"
 * qui doivent être différenciées entre chacun des layouts.
 *
 * LAYOUT AVEC BOUTON SEUL (par exemple "home"), si on veut le permettre :
 *
 * - Verrouiller la sous-grille à être en multiple de la taille de grille parente
 * Quid de l'ajout de colonne ou de ligne dans ce cas ?
 * - Verrouiller les cellules qui sont à cheval avec des cellules utilisées par le layout
 * Quid de la compréhension par les utilisateurs...
 * - Définir des items "intégrables" dans la grille enfant sur un layout
 * Quid de la définition par les utilisateurs...
 *
 * --> Si on le permet, il n'y pas de "slot cell" sur un layout, mais plutôt
 * des cells verrouillées sur l'enfant (page, etc.)
 *
 * --> Solution proposée : définir des static cells et items sur les inner layouts.
 */

const homePageGroup = {
	id: HOME_PAGE_GROUP_ID,
	kind: "static",
	layout: mainLayout,
	grid: {
		id: crypto.randomUUID(),
		rows: 12,
		cols: 5,
		cells: [
			{ id: crypto.randomUUID(), col: 0, row: 0, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 1, row: 0, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 2, row: 0, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 3, row: 0, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 4, row: 0, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 0, row: 2, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 1, row: 2, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 2, row: 2, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 3, row: 2, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 4, row: 2, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 0, row: 3, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 1, row: 3, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 2, row: 3, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 3, row: 3, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 4, row: 3, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 0, row: 5, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 1, row: 5, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 2, row: 5, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 3, row: 5, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 4, row: 5, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 0, row: 6, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 1, row: 6, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 2, row: 6, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 3, row: 6, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 4, row: 6, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 0, row: 8, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 1, row: 8, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 2, row: 8, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 3, row: 8, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 4, row: 8, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 0, row: 9, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 1, row: 9, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 2, row: 9, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 3, row: 9, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 4, row: 9, rowspan: 2, colspan: null },
			{ id: crypto.randomUUID(), col: 0, row: 11, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 1, row: 11, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 2, row: 11, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 3, row: 11, rowspan: 0, colspan: null },
			{ id: crypto.randomUUID(), col: 4, row: 11, rowspan: 0, colspan: null },
		],
	},
	index: 0,
	pages: [
		{
			id: HOME_PAGE_ID,
			title: "Accueil",
			index: 0,
			contents: [
				{
					id: crypto.randomUUID(),
					index: 0,
					text: { "fr-FR": "Ortho", "en-US": "Ortho" },
					picto: {
						id: "38209",
						name: "clavier",
						image: "https://static.arasaac.org/pictograms/38209/38209_300.png",
					},
					action: keyboardLinkTo,
				},
				{
					id: crypto.randomUUID(),
					index: 1,
					text: { "fr-FR": "Picto", "en-US": "Picto" },
					picto: {
						id: "15018",
						name: "pictogrammes",
						image: "https://static.arasaac.org/pictograms/15018/15018_300.png",
					},
					action: pictoLinkTo,
				},
				{
					id: crypto.randomUUID(),
					index: 2,
					text: { "fr-FR": "Albums", "en-us": "Albums" },
					picto: {
						id: "24925",
						name: "appareil photo",
						image: "https://static.arasaac.org/pictograms/24925/24925_300.png",
					},
					action: albumsLinkTo,
				},
			],
		},
	],
};

export const testCommuniquer = {
	id: "demoApp",
	layouts: [mainLayout],
	pageGroups: [
		homePageGroup,
		keyboardPageGroup,
		pictogramsPageGroup,
		...albumPageGroups,
	],
};
