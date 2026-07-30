const optionalWindowEventListener = <K extends keyof WindowEventMap>(
	type: K,
	listener?: (event: WindowEventMap[K]) => void,
) => {
	if (listener) {
		window.addEventListener(type, listener, true);

		return () => {
			window.removeEventListener(type, listener, true);
		};
	}

	return () => {};
};

export default optionalWindowEventListener;
