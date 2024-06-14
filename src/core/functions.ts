import { CLOD_TYPE } from "../constants";
import type {
	ClodValueTypeForGet,
	ClodValueTypeForSet,
	Getter,
	MakeClod,
	PickClod,
	Setter,
	StateClod,
} from "../types";
import { Clod } from "./clod";

export function clod<T>(value: T, equal?: (prev: T, current: T) => boolean): StateClod<T> {
	return new Clod({
		type: CLOD_TYPE.STATE,
		value,
		equal,
	});
}

export function pickClod<T extends Getter>(
	picker: T,
	equal?: (prev: ReturnType<T>, current: ReturnType<T>) => boolean
): PickClod<T> {
	return new Clod({
		type: CLOD_TYPE.GETTER,
		value: picker,
		equal,
	});
}

export function makeClod<M extends Setter>(maker: M): MakeClod<M> {
	return new Clod({
		type: CLOD_TYPE.SETTER,
		value: maker,
	});
}

export function updatePickClod<T extends Getter>(clod: PickClod<T>): ReturnType<T> {
	return clod.pick();
}

export function setClodValue<T extends StateClod | MakeClod>(
	clod: T,
	value: ClodValueTypeForSet<T>
) {
	return clod.make(value);
}

export function exportClod<T extends StateClod | PickClod>(clod: T): ClodValueTypeForGet<T> {
	return clod.value;
}
