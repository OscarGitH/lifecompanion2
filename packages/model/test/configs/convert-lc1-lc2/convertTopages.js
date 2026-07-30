/** biome-ignore-all lint/suspicious/noConsole: dev process */

const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");

const INPUTS_DIR = "./inputs";
const OUTPUTS_DIR = "./outputs";

const generated = [];
let counter = 0;

const processNode = (node, parentPageGroupId) => {
	const contentId = node.id;
	const contents = [];

	const children = node.children || [];

	children.forEach((child, index) => {
		const content = {
			id: crypto.randomUUID(),
			index: index,
			...(child.text && { text: { "fr-FR": child.text } }),
			...(child.imageBase64 && { imageBase64: child.imageBase64 }),
		};

		if ((child.children && child.children.length > 0) || child.linkto) {
			const targetId = child.linkto || child.id;
			content.action = {
				kind: "navigation",
				to: {
					parentPageGroupId,
					pageId: targetId,
				},
			};
		}

		contents.push(content);
	});

	generated.push({
		id: contentId,
		index: counter++,
		contents: contents,
	});

	children.forEach((child) => {
		if (!child.linkto && child.children && child.children.length > 0) {
			processNode(child, parentPageGroupId);
		}
	});
};

const ask = (query, completions = []) => {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		completer: (line) => {
			const hits = completions.filter((c) => c.startsWith(line));

			return [hits.length ? hits : completions, line];
		},
	});

	return new Promise((resolve) => {
		rl.question(query, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
};

const main = async () => {
	if (!fs.existsSync(INPUTS_DIR)) {
		fs.mkdirSync(INPUTS_DIR, { recursive: true });
	}

	const files = fs
		.readdirSync(INPUTS_DIR)
		.filter((file) => file.endsWith(".json"));

	if (files.length === 0) {
		console.error(`Aucun JSON trouvé dans le dossier ${INPUTS_DIR}`);
		process.exit(1);
	}

	const inputFileChoice = await ask("Fichier d'entrée : ", files);
	const inputFile = path.join(INPUTS_DIR, inputFileChoice);

	if (!fs.existsSync(inputFile)) {
		console.error(`Le fichier "${inputFile}" n'existe pas.`);
		process.exit(1);
	}

	const pageGroupId = await ask("Page group parent :  ");

	if (!pageGroupId) {
		console.error("Le page group parent est obligatoire !");
		process.exit(1);
	}

	try {
		const rootNodes = JSON.parse(fs.readFileSync(inputFile, "utf8"));

		if (Array.isArray(rootNodes)) {
			rootNodes.forEach((rootNode) => {
				processNode(rootNode, pageGroupId);
			});
		} else {
			processNode(rootNodes, pageGroupId);
		}

		if (!fs.existsSync(OUTPUTS_DIR)) {
			fs.mkdirSync(OUTPUTS_DIR, { recursive: true });
		}

		const outputFile = path.join(OUTPUTS_DIR, inputFileChoice);
		fs.writeFileSync(outputFile, JSON.stringify(generated, null, 2));

		console.log(`Fichier généré avec succès : ${outputFile}`);
	} catch (error) {
		console.error("Le traitement a échoué :", error.message);
	}
};

main();
