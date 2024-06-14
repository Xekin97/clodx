import { Clod, clod, exportClod, makeClod, pickClod, setClodValue, updatePickClod } from "../src";
import { CLOD_TYPE } from "../src/constants";
import type { ClodGetter } from "../src/types";

describe("Test Clod class", () => {
	test("Instantiation", () => {
		const a = new Clod({
			type: CLOD_TYPE.STATE,
			value: 123,
		});
		expect(a.value).toBe(123);
		expect(a.meta.type).toBe(CLOD_TYPE.STATE);

		const b = new Clod({
			type: CLOD_TYPE.STATE,
			value: 123,
		});

		const ba = new Clod({
			type: CLOD_TYPE.GETTER,
			value: (get: ClodGetter) => get(b),
		});

		const bb = new Clod({
			type: CLOD_TYPE.GETTER,
			value: (get: ClodGetter) => get(ba),
		});

		expect(ba.value).toBeUndefined();
		expect(bb.value).toBeUndefined();

		const c = new Clod({
			type: CLOD_TYPE.STATE,
			value: 123,
		});

		const ca = new Clod({
			type: CLOD_TYPE.SETTER,
			value: (value: number, get, set) => {
				set(c, value + get(c));
			},
		});

		expect(ca.value).toBeUndefined();
	});

	test("Customized equal clod value", () => {
		const a = new Clod({
			type: CLOD_TYPE.STATE,
			value: 123,
			equal: (prev, current) => current < prev,
		});

		let updateCount = 0;
		a.onUpdate(() => {
			updateCount++;
		});

		a.updateValue(456);
		expect(updateCount).toBe(1);

		a.updateValue(123);
		expect(updateCount).toBe(1);

		a.updateValue(456);
		expect(updateCount).toBe(2);
	});

	test("Pick a clod", () => {
		const s = new Clod({
			type: CLOD_TYPE.STATE,
			value: 123,
		});

		const gs = new Clod({
			type: CLOD_TYPE.GETTER,
			value: (get: ClodGetter) => get(s),
		});

		gs.pick();
		expect(gs.value).toBe(123);
		s.value = 456;
		expect(gs.value).toBe(123);
		gs.pick();
		expect(gs.value).toBe(456);
	});

	test("Pick a pick clod", () => {
		const s = new Clod({
			type: CLOD_TYPE.STATE,
			value: 123,
		});

		const gs = new Clod({
			type: CLOD_TYPE.GETTER,
			value: (get: ClodGetter) => get(s),
		});

		const ggs = new Clod({
			type: CLOD_TYPE.GETTER,
			value: (get: ClodGetter) => get(gs),
		});

		ggs.pick();
		expect(gs.value).toBe(123);
		expect(ggs.value).toBe(123);
		s.value = 456;
		ggs.pick();
		expect(gs.value).toBe(456);
		expect(ggs.value).toBe(456);
	});

	test("Pick a clod asynchronously", (done) => {
		const s = new Clod({
			type: CLOD_TYPE.STATE,
			value: 123,
		});

		const ags = new Clod({
			type: CLOD_TYPE.GETTER,
			value: async (get: ClodGetter) => {
				await Promise.resolve();
				return get(s);
			},
		});

		ags.pick().then(() => {
			expect(ags.value).toBe(123);
			done();
		});
		expect(ags.value).toBeUndefined();
	});

	test("Pick an async pickClod asynchronously", (done) => {
		const s = new Clod({
			type: CLOD_TYPE.STATE,
			value: 123,
		});

		const ags = new Clod({
			type: CLOD_TYPE.GETTER,
			value: async (get: ClodGetter) => {
				await Promise.resolve();
				return get(s);
			},
		});

		const agsgs = new Clod({
			type: CLOD_TYPE.GETTER,
			value: async (get: ClodGetter) => {
				const value = await get(ags);
				return value;
			},
		});

		expect(ags.value).toBeUndefined();
		expect(agsgs.value).toBeUndefined();

		agsgs.pick().then(() => {
			expect(ags.value).toBe(123);
			expect(agsgs.value).toBe(123);
			done();
		});
	});

	test("Make a clod", () => {
		const s = new Clod({
			type: CLOD_TYPE.STATE,
			value: 123,
		});

		const ms = new Clod({
			type: CLOD_TYPE.SETTER,
			value: (value: number, get, set) => {
				set(s, value);
			},
		});

		ms.make(456);
		expect(s.value).toBe(456);
	});

	test("Make a makeClod", () => {
		const s = new Clod({
			type: CLOD_TYPE.STATE,
			value: 123,
		});

		const ms = new Clod({
			type: CLOD_TYPE.SETTER,
			value: (value: number, get, set) => {
				set(s, value);
			},
		});

		const mms = new Clod({
			type: CLOD_TYPE.SETTER,
			value: (value: number, get, set) => {
				set(ms, value);
			},
		});

		mms.make(457);
		expect(s.value).toBe(457);
	});

	test("Make an async makeClod", (done) => {
		const s = new Clod({
			type: CLOD_TYPE.STATE,
			value: 123,
		});
		const ams = new Clod({
			type: CLOD_TYPE.SETTER,
			value: async (value: number, get, set) => {
				await Promise.resolve(1);
				set(s, value);
			},
		});
		ams.make(456).then(() => {
			expect(s.value).toBe(456);
			done();
		});
	});

	test("Make an async makeClod asynchronously", (done) => {
		const s = new Clod({
			type: CLOD_TYPE.STATE,
			value: 123,
		});

		const ams = new Clod({
			type: CLOD_TYPE.SETTER,
			value: async (value: number, get, set) => {
				await Promise.resolve(1);
				set(s, value);
			},
		});

		const amsms = new Clod({
			type: CLOD_TYPE.SETTER,
			value: async (value: number, get, set) => {
				await set(ams, value);
			},
		});

		amsms.make(456).then(() => {
			expect(s.value).toBe(456);
			done();
		});
	});

	test("Auto depended between clods pick", () => {
		const s = new Clod({
			type: CLOD_TYPE.STATE,
			value: 123,
		});
		const gs = new Clod({
			type: CLOD_TYPE.GETTER,
			value: (get: ClodGetter) => get(s),
		});
		const ggs = new Clod({
			type: CLOD_TYPE.GETTER,
			value: (get: ClodGetter) => get(gs),
		});

		ggs.pick();

		expect(gs.depClodSet.has(ggs)).toBe(true);
		expect(s.depClodSet.has(gs)).toBe(true);
	});

	it("Should work when clods update", () => {
		let sUpdateCount = 0;
		let gsUpdateCount = 0;
		let ggsUpdateCount = 0;

		const s = new Clod({
			type: CLOD_TYPE.STATE,
			value: 123,
		});

		const gs = new Clod({
			type: CLOD_TYPE.GETTER,
			value: (get: ClodGetter) => get(s),
		});

		const ggs = new Clod({
			type: CLOD_TYPE.GETTER,
			value: (get: ClodGetter) => get(gs),
		});

		const ms = new Clod({
			type: CLOD_TYPE.SETTER,
			value: (value: number, get, set) => {
				set(s, value);
			},
		});

		const mms = new Clod({
			type: CLOD_TYPE.SETTER,
			value: (value: number, get, set) => {
				set(ms, value);
			},
		});

		s.onUpdate(() => {
			sUpdateCount++;
		});
		gs.onUpdate(() => {
			gsUpdateCount++;
		});
		ggs.onUpdate(() => {
			ggsUpdateCount++;
		});

		gs.pick();
		expect(sUpdateCount).toBe(0);
		expect(gsUpdateCount).toBe(1);
		expect(ggsUpdateCount).toBe(0);

		ms.make(1);
		expect(sUpdateCount).toBe(1);
		expect(gsUpdateCount).toBe(2);
		expect(ggsUpdateCount).toBe(0);

		ms.make(1);
		expect(sUpdateCount).toBe(1);
		expect(gsUpdateCount).toBe(2);
		expect(ggsUpdateCount).toBe(0);

		ggs.pick();
		expect(sUpdateCount).toBe(1);
		expect(gsUpdateCount).toBe(2);
		expect(ggsUpdateCount).toBe(1);

		mms.make(2);
		expect(sUpdateCount).toBe(2);
		expect(gsUpdateCount).toBe(3);
		expect(ggsUpdateCount).toBe(2);
	});
});

describe("Test common functions", () => {
	test("clod", () => {
		const a = clod(1);
		const b = clod(2);

		expect(a.value).toBe(1);
		expect(b.value).toBe(2);
	});

	test("pickCold", () => {
		const a = clod(1);
		const b = pickClod((get) => get(a));

		b.pick();
		expect(b.value).toBe(1);
	});

	test("makeClod", () => {
		const a = clod(1);
		const b = makeClod((value: number, get, set) => {
			set(a, get(a) + value);
		});

		b.make(123);
		expect(a.value).toBe(124);
	});

	test("setClodValue", () => {
		const a = clod(123);
		const b = makeClod((value: number, get, set) => set(a, value));

		expect(a.value).toBe(123);
		setClodValue(a, 456);
		expect(a.value).toBe(456);
		setClodValue(b, 567);
		expect(a.value).toBe(567);
	});

	test("updatePickClod", () => {
		const a = clod(123);
		const b = pickClod((get) => get(a));

		expect(b.value).toBeUndefined();
		updatePickClod(b);
		expect(b.value).toBe(123);
	});

	test("exportClod", () => {
		const a = clod(123);
		const b = pickClod((get) => get(a));
		const c = makeClod((value: number, _get, set) => set(a, value));

		expect(exportClod(a)).toBe(123); // 123
		expect(exportClod(b)).toBeUndefined(); // undefined
		updatePickClod(b);
		expect(exportClod(b)).toBe(123); // 123
		setClodValue(c, 456);
		expect(exportClod(a)).toBe(456); // 456
		expect(exportClod(b)).toBe(456); // 456
	});
});
