import { CLOD_TYPE } from "./constants";
import { type Clod } from "./core";

export type Update = () => any;

export type AnyFunction = (...args: any[]) => any;
export type AsyncFunction = (...args: any[]) => Promise<any>;
export type MaybePromise<T> = Promise<T> | T;

export type Arguments<Fn extends AnyFunction> = Fn extends (...args: infer Args) => any
	? Args
	: never;

export type AnyClodState = State<any> | Picker<Getter> | Maker<Setter>;
export type AnyClod = StateClod | PickClod | MakeClod;

export type StateClod<V = any> = Clod<State<V>>;
export type PickClod<P extends Getter = any> = Clod<Picker<P>>;
export type MakeClod<M extends Setter = any> = Clod<Maker<M>>;

export type StateValueTypeForGet<S extends AnyClodState> = S extends State<infer V>
	? V
	: S extends Picker<infer P>
	? ReturnType<P>
	: never;
export type ClodValueTypeForGet<C extends StateClod | PickClod> = C extends StateClod<infer V>
	? V
	: C extends PickClod<infer P>
	? ReturnType<P>
	: never;

export type StateValueTypeForSet<S extends AnyClodState> = S extends State<infer V>
	? V
	: S extends Maker<infer M>
	? Arguments<M>[0]
	: never;

export type ClodValueTypeForSet<C extends StateClod | MakeClod> = C extends StateClod<infer V>
	? V
	: C extends MakeClod<infer M>
	? Arguments<M>[0]
	: never;

export type ClodGetter = <C extends StateClod | PickClod>(clod: C) => ClodValueTypeForGet<C>;

export interface ClodSetter {
	<C extends StateClod | MakeClod>(clod: C, value: ClodValueTypeForSet<C>): C extends MakeClod<
		infer M
	>
		? M extends AsyncFunction
			? Promise<void>
			: void
		: void;
	<C extends StateClod | MakeClod>(clod: C, value: ClodValueTypeForSet<C>): MaybePromise<void>;
}

export type Getter = (get: ClodGetter) => any;
export type Setter = (value: any, get: ClodGetter, set: ClodSetter) => any;

// export type Pick = <T>(fn: (get: ClodGetter) => T) => T;
// export type Make = <T extends (value: any, get: ClodGetter, set: ClodSetter) => any>(
// 	fn: T
// ) => (
// 	value: Arguments<T>[0]
// ) => ReturnType<T> extends Promise<any> ? Promise<undefined> : undefined;

export type State<V> = {
	type: CLOD_TYPE.STATE;
	value: V;
	equal?: (prev: V, next: V) => boolean;
};

export type Picker<P extends Getter> = {
	type: CLOD_TYPE.GETTER;
	value: P;
	equal?: (prev: ReturnType<P>, next: ReturnType<P>) => boolean;
};

export type Maker<M extends Setter> = {
	type: CLOD_TYPE.SETTER;
	value: M;
};
