/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";

import { StrictMode } from "react";
import {
	clod,
	makeClod,
	pickClod,
	useClod,
	useClodValue,
	useMakeClod,
	usePickClod,
	useSetClod,
} from "../src";

describe("Test hooks", () => {
	test("useClodValue and useSetClod", async () => {
		const countState = clod(0);

		const Recorder = () => {
			const count = useClodValue(countState);
			return <div>count: {count}</div>;
		};

		const PlusButton = () => {
			const setCount = useSetClod(countState);
			const plus = () => {
				setCount((count) => count + 1);
			};
			return <button onClick={plus}>plus</button>;
		};

		render(
			<StrictMode>
				<Recorder />
				<PlusButton />
			</StrictMode>
		);

		const button = screen.getByText("plus");
		fireEvent.click(button);
		await screen.findByText("count: 1");
	});

	test("useClod", async () => {
		const countState = clod(0);

		const Counter = () => {
			const [count, setCount] = useClod(countState);

			const onClickA = () => {
				setCount((c) => c + 1);
			};

			const onClickB = () => {
				setCount(10);
			};

			return (
				<>
					<div>count: {count}</div>
					<button onClick={onClickA}>buttonA</button>
					<button onClick={onClickB}>buttonB</button>
				</>
			);
		};

		render(
			<StrictMode>
				<Counter />
			</StrictMode>
		);

		const buttonA = screen.getByText("buttonA");
		const buttonB = screen.getByText("buttonB");
		fireEvent.click(buttonA);
		await screen.findByText("count: 1");
		fireEvent.click(buttonB);
		await screen.findByText("count: 10");
	});

	test("usePickClod", async () => {
		const countState = clod(0);
		const countPlusState = pickClod((get) => get(countState) + 1);

		const Recorder = () => {
			const count = usePickClod(countPlusState);
			return <div>count: {count}</div>;
		};

		const PlusButton = () => {
			const setCount = useSetClod(countState);
			const plus = () => {
				setCount((count) => count + 1);
			};
			return <button onClick={plus}>plus</button>;
		};

		render(
			<StrictMode>
				<Recorder />
				<PlusButton />
			</StrictMode>
		);

		const button = screen.getByText("plus");
		fireEvent.click(button);
		await screen.findByText("count: 2");
	});

	test("useMakeClod", async () => {
		const countState = clod(0);
		const plusCountState = makeClod((value: number, _get, set) => set(countState, value));

		const Recorder = () => {
			const count = useClodValue(countState);
			return <div>count: {count}</div>;
		};

		const PlusButton = () => {
			const setCount = useMakeClod(plusCountState);
			const plus = () => {
				setCount(123);
			};
			return <button onClick={plus}>plus</button>;
		};

		render(
			<StrictMode>
				<Recorder />
				<PlusButton />
			</StrictMode>
		);

		const button = screen.getByText("plus");
		fireEvent.click(button);
		await screen.findByText("count: 123");
	});
});
