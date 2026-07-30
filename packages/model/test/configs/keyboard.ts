import {
	clearContent,
	KEYBOARD_AZERTY_PAGE_ID,
	KEYBOARD_PAGE_GROUP_ID,
	mainLayout,
	speakContent,
	textZoneContent,
} from "./commons";

const keyboarLayoutSlot = {
	id: crypto.randomUUID(),
	row: 3,
	col: 0,
	rowspan: 3,
	colspan: 10,
};

const keyboardLayout = {
	id: crypto.randomUUID(),
	title: "Clavier",
	extends: mainLayout,
	slot: keyboarLayoutSlot,
	grid: {
		id: crypto.randomUUID(),
		cols: 11,
		rows: 7,
		cells: [
			{
				id: crypto.randomUUID(),
				row: 0,
				col: 0,
				rowspan: 2,
				colspan: 10,
			},
			{
				id: crypto.randomUUID(),
				row: 0,
				col: 10,
				rowspan: null,
				colspan: null,
			},
			{
				id: crypto.randomUUID(),
				row: 1,
				col: 10,
				rowspan: null,
				colspan: null,
			},
			{
				id: crypto.randomUUID(),
				row: 2,
				col: 0,
				rowspan: null,
				colspan: 2,
			},
			{
				id: crypto.randomUUID(),
				row: 2,
				col: 2,
				rowspan: null,
				colspan: 2,
			},
			{
				id: crypto.randomUUID(),
				row: 2,
				col: 4,
				rowspan: null,
				colspan: 2,
			},
			{
				id: crypto.randomUUID(),
				row: 2,
				col: 6,
				rowspan: null,
				colspan: 2,
			},
			{
				id: crypto.randomUUID(),
				row: 2,
				col: 8,
				rowspan: null,
				colspan: 2,
			},
			{
				id: crypto.randomUUID(),
				row: 2,
				col: 10,
				rowspan: null,
				colspan: null,
			},
			keyboarLayoutSlot,
			{
				id: crypto.randomUUID(),
				row: 3,
				col: 10,
				rowspan: 2,
				colspan: null,
			},
			{
				id: crypto.randomUUID(),
				row: 5,
				col: 10,
				rowspan: null,
				colspan: null,
			},
			{
				id: crypto.randomUUID(),
				row: 6,
				col: 0,
				rowspan: null,
				colspan: null,
			},
			{
				id: crypto.randomUUID(),
				row: 6,
				col: 1,
				rowspan: null,
				colspan: 7,
			},
			{
				id: crypto.randomUUID(),
				row: 6,
				col: 8,
				rowspan: null,
				colspan: null,
			},
			{
				id: crypto.randomUUID(),
				row: 6,
				col: 9,
				rowspan: null,
				colspan: null,
			},
			{
				id: crypto.randomUUID(),
				row: 6,
				col: 10,
				rowspan: null,
				colspan: null,
			},
		],
	},
	contents: [
		{
			id: crypto.randomUUID(),
			index: 0,
			...textZoneContent,
		},
		{
			id: crypto.randomUUID(),
			index: 1,
			...speakContent,
		},
		{
			id: crypto.randomUUID(),
			index: 2,
			...clearContent,
		},
		{
			id: crypto.randomUUID(),
			index: 3,
			text: { "fr-FR": "{ prédiction }", "en-US": "{ prediction }" },
		},
		{
			id: crypto.randomUUID(),
			index: 4,
			text: { "fr-FR": "{ prédiction }", "en-US": "{ prediction }" },
		},
		{
			id: crypto.randomUUID(),
			index: 5,
			text: { "fr-FR": "{ prédiction }", "en-US": "{ prediction }" },
		},
		{
			id: crypto.randomUUID(),
			index: 6,
			text: { "fr-FR": "{ prédiction }", "en-US": "{ prediction }" },
		},
		{
			id: crypto.randomUUID(),
			index: 7,
			text: { "fr-FR": "{ prédiction }", "en-US": "{ prediction }" },
		},
		{
			id: crypto.randomUUID(),
			index: 8,
			picto: {
				id: "16121",
				name: "inférieur",
				image: "https://static.arasaac.org/pictograms/16121/16121_300.png",
			},
		},
		{
			id: crypto.randomUUID(),
			index: 9,
			text: { "fr-FR": "ENTRÉE", "en-US": "ENTER" },
		},
		{
			id: crypto.randomUUID(),
			index: 10,
			picto: {
				id: "38199",
				name: "effacer",
				image: "https://static.arasaac.org/pictograms/38199/38199_300.png",
			},
		},
		{
			id: crypto.randomUUID(),
			index: 11,
			text: { "fr-FR": "123?!", "en-US": "123?!" },
		},
		{
			id: crypto.randomUUID(),
			index: 12,
			text: { "fr-FR": "ESPACE", "en-US": "SPACE" },
		},
		{
			id: crypto.randomUUID(),
			index: 13,
			text: { "fr-FR": "TEXTE 1", "en-US": "TEXT 1" },
			picto: {
				image: "https://static.arasaac.org/pictograms/37340/37340_300.png",
				name: "document",
				id: "37340",
			},
		},
		{
			id: crypto.randomUUID(),
			index: 14,
			text: { "fr-FR": "TEXTE 2", "en-US": "TEXT 2" },
			picto: {
				image: "https://static.arasaac.org/pictograms/37340/37340_300.png",
				name: "document",
				id: "37340",
			},
		},
		{
			id: crypto.randomUUID(),
			index: 15,
			text: { "fr-FR": "RECHERCHER", "en-US": "SEARCH" },
			picto: {
				image: "https://static.arasaac.org/pictograms/30015/30015_300.png",
				name: "monde",
				id: "30015",
			},
		},
	],
};

export const keyboardPageGroup = {
	id: KEYBOARD_PAGE_GROUP_ID,
	index: 0,
	kind: "static",
	layout: keyboardLayout,
	grid: {
		id: crypto.randomUUID(),
		cols: 10,
		rows: 3,
		cells: Array.from({ length: 30 }).map((_, i) => ({
			id: crypto.randomUUID(),
			col: i % 10,
			row: Math.floor(i / 10),
			colspan: null,
			rowspan: null,
		})),
	},
	pages: [
		{
			id: KEYBOARD_AZERTY_PAGE_ID,
			index: 0,
			title: "Clavier azerty",
			contents: Array.from("ABCDKFGHIJLEMNOPQRSTUVWXYZ.?!").reduce(
				(acc: Record<string, unknown>[], char) => {
					let index = acc.length;

					if (index === 20) {
						acc.push({
							id: crypto.randomUUID(),
							index,
							picto: {
								image:
									"https://static.arasaac.org/pictograms/38755/38755_300.png",
								name: "touche haut",
								id: "38755",
							},
						});

						index = acc.length;
					}

					acc.push({
						id: crypto.randomUUID(),
						index,
						text: {
							"fr-FR": char,
							"en-US": char,
						},
					});

					return acc;
				},
				[],
			),
		},
	],
};
