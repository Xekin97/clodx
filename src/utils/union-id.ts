export function unionId() {
	let id = 0;
	return () => ++id + "";
}
