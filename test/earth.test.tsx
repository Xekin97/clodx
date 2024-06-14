/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import {
	Earth,
	clod,
	exportClodByEarthName,
	getClodFromEarth,
	makeClod,
	pickClod,
	setClodValueByEarthName,
	updatePickClodByEarthName,
	useClodValue,
	useSetClod,
} from "../src";

describe("Test earth methods", () => {
	const EARTH_Name = "hello";

	test("setClodValueFromEarth", () => {
		const a = clod(123);
		const b = makeClod((value: number, _get, set) => set(a, value));
		const ea = getClodFromEarth(a, EARTH_Name);

		expect(a.value).toBe(123);
		setClodValueByEarthName(EARTH_Name, a, 456);
		expect(a.value).toBe(123);
		expect(ea.value).toBe(456);
		setClodValueByEarthName(EARTH_Name, b, 567);
		expect(a.value).toBe(123);
		expect(ea.value).toBe(567);
	});

	test("updatePickClodFromEarth", () => {
		const a = clod(123);
		const b = pickClod((get) => get(a));
		const eb = getClodFromEarth(b, EARTH_Name);

		expect(b.value).toBeUndefined();
		updatePickClodByEarthName(EARTH_Name, b);
		expect(b.value).toBeUndefined();
		expect(eb.value).toBe(123);
	});

	test("exportClodFromEarth", () => {
		const a = clod(123);
		const b = pickClod((get) => get(a));
		const c = makeClod((value: number, _get, set) => set(a, value));

		expect(a.value).toBe(123);
		expect(b.value).toBeUndefined();

		updatePickClodByEarthName(EARTH_Name, b);
		expect(exportClodByEarthName(EARTH_Name, b)).toBe(123);
		setClodValueByEarthName(EARTH_Name, c, 456);
		expect(exportClodByEarthName(EARTH_Name, a)).toBe(456);
		expect(exportClodByEarthName(EARTH_Name, b)).toBe(456);

		expect(a.value).toBe(123);
		expect(b.value).toBeUndefined();
	});
});

describe("Test Earth react component", () => {
	test("When components are wraped by Earth, all clods inner are managed independently", async () => {
		const countState = clod(0);

		const Recorder = (props: { name: string }) => {
			const count = useClodValue(countState);
			return (
				<div>
					{" "}
					{props.name} - count: {count}
				</div>
			);
		};

		const PlusButton = () => {
			const setCount = useSetClod(countState);
			const plus = () => {
				setCount((count) => count + 1);
			};
			return <button onClick={plus}>plus</button>;
		};

		function MyComponent(props: { name: string }) {
			return (
				<Earth>
					<Recorder name={props.name} />
					<PlusButton />
				</Earth>
			);
		}

		render(
			<StrictMode>
				<MyComponent name="A" />
				<MyComponent name="B" />
				<MyComponent name="C" />
			</StrictMode>
		);

		const buttons = screen.getAllByText("plus");

		fireEvent.click(buttons[0]);
		fireEvent.click(buttons[1]);
		fireEvent.click(buttons[1]);
		fireEvent.click(buttons[2]);
		fireEvent.click(buttons[2]);
		fireEvent.click(buttons[2]);
		await screen.findByText("A - count: 1");
		await screen.findByText("B - count: 2");
		await screen.findByText("C - count: 3");
	});

	test("when components are wraped by Earth with same key, all clods inner are managed in one.", async () => {
		const countState = clod(0);

		const Recorder = (props: { name: string }) => {
			const count = useClodValue(countState);
			return (
				<div>
					{props.name} - count: {count}
				</div>
			);
		};

		const PlusButton = () => {
			const setCount = useSetClod(countState);
			const plus = () => {
				setCount((count) => count + 1);
			};
			return <button onClick={plus}>plus</button>;
		};

		function MyComponent(props: { name: string }) {
			return (
				<Earth name="holy">
					<Recorder name={props.name} />
					<PlusButton />
				</Earth>
			);
		}

		render(
			<StrictMode>
				<Recorder name="other" />
				<MyComponent name="A" />
				<MyComponent name="B" />
				<MyComponent name="C" />
			</StrictMode>
		);

		const buttons = screen.getAllByText("plus");

		fireEvent.click(buttons[0]);
		fireEvent.click(buttons[1]);
		fireEvent.click(buttons[1]);
		fireEvent.click(buttons[2]);
		fireEvent.click(buttons[2]);
		fireEvent.click(buttons[2]);
		await screen.findByText("other - count: 0");
		await screen.findByText("A - count: 6");
		await screen.findByText("B - count: 6");
		await screen.findByText("C - count: 6");
	});
});
