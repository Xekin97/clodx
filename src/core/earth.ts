import {
	AnyClod,
	ClodValueTypeForGet,
	ClodValueTypeForSet,
	Getter,
	MakeClod,
	PickClod,
	StateClod,
} from "../types";
import { Clod } from "./clod";

// { [earthName]: { [originalClodKey]: [clonedClodKey] } }
const earthMap: Record<string, Record<string, AnyClod>> = Object.create(null);

export function getClodFromEarth<C extends AnyClod>(clod: C, earthName: string) {
	if (!Reflect.has(earthMap, earthName)) {
		Reflect.set(earthMap, earthName, Object.create(null));
	}

	if (!Reflect.has(earthMap[earthName], clod.key)) {
		const clonedClod = Clod.clone(clod);

		const originGetter = clonedClod.get.bind(clonedClod);
		const originSetter = clonedClod.set;

		clonedClod.get = (clod) => {
			const target = getClodFromEarth(clod, earthName);
			return originGetter(target);
		};

		clonedClod.set = (clod, value) => {
			const target = getClodFromEarth(clod, earthName);
			return originSetter(target, value);
		};

		Reflect.set(earthMap[earthName], clod.key, clonedClod);
		return clonedClod;
	}

	return earthMap[earthName][clod.key] as C;
}

export function updatePickClodByEarthName<T extends Getter>(
	earthName: string,
	clod: PickClod<T>
): ReturnType<T> {
	const target = getClodFromEarth(clod, earthName);
	return target.pick();
}

export function setClodValueByEarthName<T extends StateClod | MakeClod>(
	earthName: string,
	clod: T,
	value: ClodValueTypeForSet<T>
) {
	const target = getClodFromEarth(clod, earthName);
	return target.make(value);
}

export function exportClodByEarthName<T extends StateClod | PickClod>(
	earthName: string,
	clod: T
): ClodValueTypeForGet<T> {
	const target = getClodFromEarth(clod, earthName);
	return target.value;
}
