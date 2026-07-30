export type LcLocale = `${string}-${string}`;
export type LcTranslation<T> = Record<LcLocale, T>;
