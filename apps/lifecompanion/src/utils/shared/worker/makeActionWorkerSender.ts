/** biome-ignore-all lint/suspicious/noExplicitAny: generic worker post message sender */

const makeActionWorkerSender = <
	T extends (action: any, payload?: any) => Promise<any> = never,
>(
	worker: Worker,
	options: { workerName: string; timeout: number },
) => {
	return ((actionName, payload?) => {
		return new Promise<any>((resolve, reject) => {
			const requestId = crypto.randomUUID();

			const handler = (event: MessageEvent) => {
				const message = event.data;

				if (message.requestId !== requestId) return;

				worker.removeEventListener("message", handler);
				clearTimeout(timeout);

				if (event.data.status === "success") {
					resolve(message.result);
					return;
				}

				reject(
					event.data.error instanceof Error
						? event.data.error
						: new Error(
								`[${options.workerName} Error] failed silently on ${actionName}.`,
							),
				);
			};

			const timeout = setTimeout(() => {
				worker.removeEventListener("message", handler);
				reject(
					new Error(
						`[${options.workerName} Timeout]: No response for ${actionName} after ${options.timeout}ms`,
					),
				);
			}, options.timeout);

			worker.addEventListener("message", handler);
			worker.postMessage({ requestId, actionName, payload });
		});
	}) as T;
};

export default makeActionWorkerSender;
