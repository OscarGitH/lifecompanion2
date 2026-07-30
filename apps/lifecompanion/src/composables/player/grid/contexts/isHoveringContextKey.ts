import type { InjectionKey, Ref } from "vue";
import type { HexColor } from "../../../../utils/shared/style/types";

export const IS_HOVERING_CONTEXT_KEY: InjectionKey<{
	hovered: Ref<Map<string, HexColor>>;
}> = Symbol("isHoveringContext");
