import type { LcActionNavigate } from "../../src";

export const HOME_PAGE_GROUP_ID = "homePageGroup";
export const HOME_PAGE_ID = "homePage";

export const PICTOGRAMS_PAGE_GROUP_ID = "pictogramsPageGroup";
export const PICTOGRAMS_HOME_PAGE_ID = "c395e29b-7e9b-4d6a-b284-a748eb971f85";

export const ALBUMS_PAGE_GROUP_ID = "albumsPageGroup";
export const ALBUMS_HOME_PAGE_ID = "albumsPage";

export const KEYBOARD_PAGE_GROUP_ID = "keyboardPageGroup";
export const KEYBOARD_AZERTY_PAGE_ID = "keyboardAzertyPage";

const mainLayoutNextCellContent = {
	id: crypto.randomUUID(),
	picto: {
		id: "38754",
		name: "touche bas",
		image: "https://static.arasaac.org/pictograms/38754/38754_300.png",
	},
	action: {
		kind: "pagination",
		direction: "next",
		layoutId: "mainLayoutId",
	},
};

export const homeLinkTo: LcActionNavigate = {
	kind: "navigation",
	to: {
		pageGroupId: HOME_PAGE_GROUP_ID,
		pageId: HOME_PAGE_ID,
	},
};

export const pictoLinkTo: LcActionNavigate = {
	kind: "navigation",
	to: {
		pageGroupId: PICTOGRAMS_PAGE_GROUP_ID,
		pageId: PICTOGRAMS_HOME_PAGE_ID,
	},
};

export const albumsLinkTo: LcActionNavigate = {
	kind: "navigation",
	to: {
		pageGroupId: ALBUMS_PAGE_GROUP_ID,
		pageId: ALBUMS_HOME_PAGE_ID,
	},
};

export const keyboardLinkTo: LcActionNavigate = {
	kind: "navigation",
	to: {
		pageGroupId: KEYBOARD_PAGE_GROUP_ID,
		pageId: KEYBOARD_AZERTY_PAGE_ID,
	},
};

const mainLayoutSlot = {
	id: crypto.randomUUID(),
	col: 1,
	row: 0,
	colspan: 9,
	rowspan: 5,
};

export const mainLayout = {
	id: crypto.randomUUID(),
	title: "Principal",
	extends: null,
	slot: mainLayoutSlot,
	grid: {
		id: crypto.randomUUID(),
		rows: 5,
		cols: 10,
		cells: [
			{
				id: crypto.randomUUID(),
				col: 0,
				row: 0,
				colspan: null,
				rowspan: null,
				style: { minWidth: "100px" },
			},
			{
				id: crypto.randomUUID(),
				col: 0,
				row: 1,
				colspan: null,
				rowspan: null,
			},
			{
				id: crypto.randomUUID(),
				col: 0,
				row: 2,
				colspan: null,
				rowspan: null,
			},
			{
				id: crypto.randomUUID(),
				col: 0,
				row: 3,
				colspan: null,
				rowspan: null,
			},
			{
				id: crypto.randomUUID(),
				col: 0,
				row: 4,
				colspan: null,
				rowspan: null,
				lockedContent: mainLayoutNextCellContent,
			},
			mainLayoutSlot,
		],
	},
	contents: [
		{
			id: crypto.randomUUID(),
			index: 0,
			text: { "fr-FR": "PLANNING", "en-US": "PLANNING" },
			picto: {
				id: "37731",
				name: "aujourd'hui",
				image: "https://static.arasaac.org/pictograms/37731/37731_300.png",
			},
		},
		{
			id: crypto.randomUUID(),
			index: 1,
			text: { "fr-FR": "PICTO", "en-US": "PICTO" },
			action: pictoLinkTo,
			picto: {
				id: "15018",
				name: "pictogrammes",
				image: "https://static.arasaac.org/pictograms/15018/15018_300.png",
			},
		},
		{
			id: crypto.randomUUID(),
			index: 2,
			text: { "fr-FR": "ABC", "en-US": "ABC" },
			picto: {
				id: "38209",
				name: "clavier",
				image: "https://static.arasaac.org/pictograms/38209/38209_300.png",
			},
			action: keyboardLinkTo,
		},
		{
			id: crypto.randomUUID(),
			index: 3,
			picto: {
				id: "38217",
				name: "menu",
				image: "https://static.arasaac.org/pictograms/38217/38217_300.png",
			},
			action: homeLinkTo,
		},
		{
			id: crypto.randomUUID(),
			index: 5,
			picto: {
				id: "38755",
				name: "touche haut",
				image: "https://static.arasaac.org/pictograms/38755/38755_300.png",
			},
			action: {
				kind: "pagination",
				direction: "previous",
				layoutId: "mainLayoutId",
			},
		},
		{
			id: crypto.randomUUID(),
			index: 6,
			text: { "fr-FR": "DESSINER", "en-US": "DRAW" },
			picto: {
				id: "11238",
				name: "dessiner",
				image: "https://static.arasaac.org/pictograms/11238/11238_300.png",
			},
		},
		{
			id: crypto.randomUUID(),
			index: 7,
			text: { "fr-FR": "ALBUMS", "en-US": "ALBUMS" },
			picto: {
				id: "24925",
				name: "appareil photo",
				image: "https://static.arasaac.org/pictograms/24925/24925_300.png",
			},
			action: albumsLinkTo,
		},
		{
			id: crypto.randomUUID(),
			index: 8,
			text: { "fr-FR": "MINUTEUR", "en-US": "TIMER" },
			picto: {
				id: "22631",
				name: "temps",
				image: "https://static.arasaac.org/pictograms/22631/22631_300.png",
			},
		},
		{
			id: crypto.randomUUID(),
			index: 10,
			picto: {
				id: "38755",
				name: "touche haut",
				image: "https://static.arasaac.org/pictograms/38755/38755_300.png",
			},
			action: {
				kind: "pagination",
				direction: "previous",
				layoutId: "mainLayoutId",
			},
		},
		{
			id: crypto.randomUUID(),
			index: 11,
			text: { "fr-FR": "SÉQUENCES", "en-US": "SEQUENCES" },
			picto: {
				id: "30207",
				name: "liste",
				image: "https://static.arasaac.org/pictograms/30207/30207_300.png",
			},
		},
		{
			id: crypto.randomUUID(),
			index: 12,
			text: { "fr-FR": "CAHIER DE VIE", "en-US": "LIFE JOURNAL" },
			picto: {
				id: "2359",
				name: "cahier",
				image: "https://static.arasaac.org/pictograms/2359/2359_300.png",
			},
		},
	],
};

export const textZoneContent = {
	text: {
		"fr-FR": "{ zone d'affichage de la saisie }",
		"en-US": "{ input display area }",
	},
};

export const speakContent = {
	text: {
		"fr-FR": "DIRE",
		"en-US": "SPEAK",
	},
	picto: {
		id: "38216",
		name: "bouton volume",
		image: "https://static.arasaac.org/pictograms/38216/38216_300.png",
	},
};

export const clearContent = {
	text: {
		"fr-FR": "VIDER",
		"en-US": "CLEAR",
	},
	picto: {
		id: "38202",
		name: "supprimer",
		image: "https://static.arasaac.org/pictograms/38202/38202_300.png",
	},
};
