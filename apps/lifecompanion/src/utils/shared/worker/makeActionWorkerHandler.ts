/** biome-ignore-all lint/suspicious/noExplicitAny: generic worker handler */

const makeActionWorkerHandler = (
	actionRegistry: Record<string, (payload?: any) => Promise<any>>,
) => {
	return async (event: MessageEvent) => {
		const { requestId, actionName, payload } = event.data;
		const workerName = self.name || "Worker";

		if (!requestId || !actionName) {
			postMessage({
				requestId,
				status: "error",
				error: new Error(
					`[${workerName} Error] Invalid data in event. Missing requestId or actionName.`,
				),
			});
			return;
		}

		const action = actionRegistry[actionName];

		if (!action) {
			postMessage({
				requestId,
				status: "error",
				error: new Error(
					`[${workerName} Error] Action ${actionName} not registered in action registry.`,
				),
			});
			return;
		}

		try {
			postMessage({
				requestId,
				status: "success",
				result: await action(payload),
			});
		} catch (error) {
			postMessage({
				requestId,
				status: "error",
				error: error instanceof Error ? error : new Error(String(error)),
			});
		}
	};
};

export default makeActionWorkerHandler;
