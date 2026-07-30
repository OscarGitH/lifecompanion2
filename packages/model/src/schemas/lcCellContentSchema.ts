import type { Schema } from "./core";
import { makeSchema } from "./core/factories/schema";
import type { LcAction, LcPicto, LcTranslation } from "./types";

export interface LcCellContentSchema extends Schema<"cell-contents"> {
	id: string;
	text?: LcTranslation<string> | undefined;
	index?: number | null;
	action?: LcAction;
	picto?: LcPicto | undefined;
	imageBase64?: string | null;
	imageBlob?: Blob | null;
	bgColor?: string;
}

export const lcCellContentSchema =
	makeSchema<LcCellContentSchema>("cell-contents");
