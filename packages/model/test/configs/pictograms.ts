import {
	clearContent,
	mainLayout,
	PICTOGRAMS_PAGE_GROUP_ID,
	pictoLinkTo,
	speakContent,
	textZoneContent,
} from "./commons";
import pictogramsPages from "./convert-lc1-lc2/outputs/pictograms.json";

const pictogramsLayoutSlot = {
	id: crypto.randomUUID(),
	col: 0,
	row: 1,
	colspan: 10,
	rowspan: 4,
};

const pictogramsLayout = {
	id: crypto.randomUUID(),
	title: "Pictogrammes",
	extends: mainLayout,
	slot: pictogramsLayoutSlot,
	grid: {
		id: crypto.randomUUID(),
		rows: 5,
		cols: 11,
		cells: [
			{
				id: crypto.randomUUID(),
				col: 0,
				row: 0,
				colspan: null,
				rowspan: null,
			},
			{
				id: crypto.randomUUID(),
				col: 1,
				row: 0,
				colspan: 9,
				rowspan: null,
			},
			{
				id: crypto.randomUUID(),
				col: 10,
				row: 0,
				colspan: null,
				rowspan: null,
			},
			pictogramsLayoutSlot,
			{
				id: crypto.randomUUID(),
				col: 10,
				row: 1,
				colspan: null,
				rowspan: null,
			},
			{
				id: crypto.randomUUID(),
				col: 10,
				row: 2,
				colspan: null,
				rowspan: null,
			},
			{
				id: crypto.randomUUID(),
				col: 10,
				row: 3,
				colspan: null,
				rowspan: null,
			},
			{
				id: crypto.randomUUID(),
				col: 10,
				row: 4,
				colspan: null,
				rowspan: null,
			},
		],
	},
	contents: [
		{
			id: crypto.randomUUID(),
			index: 0,
			text: { "fr-FR": "ACCUEIL", "en-US": "HOME" },
			picto: {
				id: "38222",
				name: "accueil",
				image: "https://static.arasaac.org/pictograms/38222/38222_300.png",
			},
			action: pictoLinkTo,
		},
		{
			id: crypto.randomUUID(),
			index: 1,
			...textZoneContent,
		},
		{
			id: crypto.randomUUID(),
			index: 2,
			...speakContent,
		},
		{
			id: crypto.randomUUID(),
			index: 3,
			text: {
				"fr-FR": "MOT",
				"en-US": "WORD",
			},
			picto: {
				id: "38199",
				name: "effacer",
				image: "https://static.arasaac.org/pictograms/38199/38199_300.png",
			},
		},
		{
			id: crypto.randomUUID(),
			index: 4,
			...clearContent,
		},
		{
			id: crypto.randomUUID(),
			index: 5,
			text: {
				"fr-FR": "MOTS",
				"en-US": "WORDS",
			},
			picto: {
				id: "38218",
				name: "ajouter",
				image: "https://static.arasaac.org/pictograms/38218/38218_300.png",
			},
			action: {
				kind: "pagination",
				direction: "next",
			},
		},
		{
			id: crypto.randomUUID(),
			index: 6,
			text: {
				"fr-FR": "RETOUR",
				"en-US": "BACK",
			},
			picto: {
				id: "38755",
				name: "touche haut",
				image: "https://static.arasaac.org/pictograms/38755/38755_300.png",
			},
			action: {
				kind: "history",
				direction: "previous",
			},
		},
	],
};

const pictogramsPageGroup = {
	id: PICTOGRAMS_PAGE_GROUP_ID,
	kind: "dynamic",
	layout: pictogramsLayout,
	grid: {
		id: crypto.randomUUID(),
		rows: 4,
		cols: 5,
		cells: Array.from({ length: 4 }, (_, row) =>
			Array.from({ length: 5 }, (_, col) => ({
				id: crypto.randomUUID(),
				col,
				row,
				colspan: null,
				rowspan: null,
			})),
		).flat(),
	},
	index: 1,
	pages: pictogramsPages,
};

export default pictogramsPageGroup;
