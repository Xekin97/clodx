import { useCallback, useEffect, useRef, useState } from "react";

export function useLatest<T>(value: T) {
	const ref = useRef(value);
	ref.current = value;
	return ref;
}

export function useUpdate() {
	const [_, setState] = useState(Object.create(null));
	return useCallback(() => {
		setState(Object.create(null));
	}, []);
}

export function useMount(fn: () => void) {
	const mount = useLatest(fn);

	useEffect(() => {
		mount.current();
	}, []);
}

// Strict Mode
// render => render => mount => unmount => mount
// update(setState) => render => render => unmount
export function useOnce(fn: () => void) {
	const loaded = useRef(false);

	if (!loaded.current) {
		fn();
		loaded.current = true;
	}

	// for react strict mode
	useMount(() => {
		if (!loaded.current) {
			fn();
			loaded.current = true;
		}
	});

	useUnmount(() => {
		loaded.current = false;
	});
}

export function useUnmount(fn: () => void) {
	const unmount = useLatest(fn);
	useEffect(
		() => () => {
			unmount.current();
		},
		[]
	);
}
