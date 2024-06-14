import { PropsWithChildren, useRef } from "react";
import { unionId } from "../../utils";
import { EARTH_CONTEXT, EARTH_KEY_PREFIX } from "../constants";

const genEarthId = unionId();

export type EarthProps = PropsWithChildren & { name?: string };

export function Earth(props: EarthProps) {
	const earthKeyRef = useRef(props.name ?? EARTH_KEY_PREFIX + genEarthId());

	return (
		<EARTH_CONTEXT.Provider value={earthKeyRef.current}>
			{props.children}
		</EARTH_CONTEXT.Provider>
	);
}
