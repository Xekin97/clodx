export const ERROR_PREFIX = "[x-clod]: ";

export const CLOD_KEY_PREFIX = "#CLOD_";

export const __DEV__ = process.env.NODE_ENV !== "production";

export const enum CLOD_TYPE {
	STATE = "_STATE",
	GETTER = "_GETTER",
	SETTER = "_SETTER",
}
