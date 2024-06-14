import { useContext } from "react";
import { getClodFromEarth } from "../../core";
import type { AnyClod } from "../../types";
import { EARTH_CONTEXT } from "../constants";

export function useEarth<C extends AnyClod>(clod: C) {
	const earthName = useContext(EARTH_CONTEXT);

	if (!earthName) {
		return clod;
	}

	return getClodFromEarth(clod, earthName);
}
