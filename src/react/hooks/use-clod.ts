import { useCallback } from "react";
import type {
	AnyClod,
	Arguments,
	ClodValueTypeForGet,
	MakeClod,
	PickClod,
	Setter,
	StateClod,
} from "../../types";
import { useOnce, useUnmount, useUpdate } from "./common";
import { useEarth } from "./use-earth";

function useClodDepUpdate(clod: AnyClod) {
	const update = useUpdate();

	useOnce(() => {
		clod.depUpdate(update);
	});

	useUnmount(() => {
		clod.unDepUpdate(update);
	});
}

export function useClod<T>(clod: StateClod<T>) {
	const target = useEarth(clod);
	return [useClodValue(target), useSetClod(target)] as const;
}

export function useClodValue<T>(clod: StateClod<T>): T {
	const target = useEarth(clod);
	useClodDepUpdate(target);
	return target.value!;
}

export function useSetClod<T>(clod: StateClod<T>) {
	const target = useEarth(clod);
	return useCallback((value: T | ((current: T) => T)) => {
		if (typeof value !== "function") {
			return target.make(value);
		}

		if (typeof target.value === "function") {
			return target.make(value as T);
		}

		const result = (value as (current: T) => T)(target.value!);
		return target.make(result);
	}, []);
}

export function usePickClod<C extends PickClod>(clod: C): ClodValueTypeForGet<C> {
	const target = useEarth(clod);
	useClodDepUpdate(target);
	useOnce(() => {
		target.pick();
	});
	return target.value;
}

export function useMakeClod<S extends Setter>(clod: MakeClod<S>) {
	const target = useEarth(clod);
	return useCallback((value: Arguments<S>[0]) => {
		return target.make(value);
	}, []);
}
