# clodx

State management for **REACT hooks Apps**.

Features:

-   Minimal bounder size(**less than 1kb**)
-   Typescript oriented
-   Easy to get or update states **OUTSIDE the react context** and rerender the components they depend on
-   Supports to use in component development

## Install

```
npm install clodx
```

## Test

```
npm run test
```

## Methods

-   **clod**

```typescript
import { clod } from "clodx";
const a = clod(123);
```

-   **pickClod**<T>((get: ClodGetter) => T) : T

Common usage

```typescript
import { clod, pickClod } from "clodx";
const a = clod(123);
const b = pickClod((get) => get(a) + 2);
const c = pickClod((get) => get(a) + get(b));
const d = pickClod(async (get) => {
	await new Promise((res) => setTimeout(res, 1000, true));
	return get(a) + get(b);
});
const e = pickClod(async (get) => {
	return await get(d);
});
```

Update clod with customized equal

```typescript
const a = clod(123, (prev, next) => next - prev > 100);
const b = pickClod(
	(get) => get(a),
	(prev, next) => next - prev > 100
);
```

-   **makeClod**<T>(fn: (value: T, get: ClodGetter, set: ClodSetter): MaybePromise<void>)\:((value: T) => maybePromise\<void>)

```typescript
import { makeClod } from "clodx";
const a = makeClod((value: number, _get, set) => set(a, value));
const b = makeClod(async (value: number, _get, set) => {
	await new Promise((res) => setTimeout(res, 1000, true));
	set(a, value);
});
```

-   **setClodValue**<T extends StateClod | MakeClod>(clod: T, value: ClodValueTypeForSet<T>): MaybePromise\<void>

```typescript
import { clod, makeClod, setClodValue } from "clodx";

const a = clod(123);
const b = makeClod((value: number, _get, set) => set(a, value));

function example() {
	setClodValue(456);
}
```

-   **updatePickClod**(clod: PickClod): void

```typescript
import { clod, pickClod, updatePickClod, setClodValue, exportClod } from "clodx";

const a = clod(123);
const b = pickClod((get) => get(a));

function example() {
	updatePickClod(b);
}
```

-   **exportClod**<T extends StateClod | PickClod>(clod: T): ClodValueTypeForGet<T>

```typescript
import { clod, setClodValue, updatePickClod, exportClod } from "clodx";

const a = clod(123);
const b = pickClod((get) => get(a));
const c = makeClod((value: number, _get, set) => set(a, value));

function example() {
	exportClod(a); // 123
	exportClod(b); // undefined
	updatePickClod(b);
	exportClod(b); // 123
	setClodValue(c, 456);
	exportClod(a); // 456
	exportClod(b); // 456
}
```

## React Hooks

-   **useClod**<T>(value: Clod<T>): [T, (value: T) => void]

```typescript
import { clod, useClod } from "clodx";
const countState = clod(0);
function Component() {
	const [count, setCount] = useClod(countState);

	const onClick = () => {
		setCount(count++);
	};
	//...
}
```

-   **usePickClod**<T>(value: Clod<Picker<T>>): T

```typescript
import { clod, pickClod, useClod, usePickClod } from "clodx";
const countState = clod(0);
const countPlusState = pickClod((get) => get(countState) + 1);

function ComponentA() {
	const [count, setCount] = useClod(countState);

	const onClick = () => {
		setCount(count++);
	};
	// render...
}

function ComponentB() {
	const countPlus = usePickClod(countPlusState);

	/// render...
}
```

-   **useMakeClod**<T>(value: Clod<Maker<T>>): (value: T) => void

```typescript
import { clod, makeClod, useClod, useMakeClod } from "clodx";
const countState = clod(0);
const setCountState = makeClod((value: number, get, set) => {
	set(countState, value);
});

function ComponentA() {
	const [count, setCount] = useClod(countState);

	const onClick = () => {
		setCount(count++);
	};
	// render...
}

function ComponentB() {
	const setCount = useMakeClod(setCountState);

	const onClick = () => {
		setCount(count++);
	};
	/// render...
}
```

## Earth(React Components)

The `Earth` component supports us to use clod simplify in our react component development.

### Methods

The following methods have the same effect as [Methods](#Methods) except for specifying `earthName`.

-   **updatePickClodByEarthName**<T>(earthName: string, clod: StateClod<T>, value: T)

-   **setClodValueByEarthName**<T extends StateClod | MakeClod>(earthName: string, clod: T, value: ClodValueTypeForSet<T>)

-   **exportClodByEarthName**<T extends StateClod | PickClod>(earthName: string, clod: T)

### Examples

```typescript
import { clod, useClodValue, useClod } from 'clodx'
const inputValueState = clod('hello world.')

function MySubmit () {
  const value = useClodValue(inputValueState)
  const onClick = () => {
    // ...
  }

  return (
    <button onClick={onClick}>submit</button>
  )
}

function MyInput () {
  const [value, setValue] = useClod(inputValueState)

  return (
    <input value={value} onChange={(e) => setValue(e.target.value)} />
  )
}

function MyComponent () {
  return (
    <Earth>
      <MyInput />
      <MySubmit />
    <Earth />
  )
}

function MyComponentAssignEarthKey () {
  return (
    <Earth name="input">
      <MyInput />
      <MySubmit />
    <Earth />
  )
}

function App() {
  return (
    <>
      <div>
        {/** all their clod value are managed independently */}
        <MyComponent />
        <MyComponent />
        <MyComponent />
      </div>
      <div>
        {/** all their clod value are managed by same clod */}
        <MyComponentAssignEarthKey />
        <MyComponentAssignEarthKey />
      </div>
    </>
  )
}
```

## TODO

-   More tests for clodx
-   Classic component SUPPORT
-   Clodx plugin mechanism
