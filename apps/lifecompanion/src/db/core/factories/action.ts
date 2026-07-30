import type { DBActionRegistry } from "../../actions/dbActionRegistryregistry";

export const makeDBAction = <K extends keyof DBActionRegistry<unknown>>(
	_name: K,
	exec: <P>(
		payload: Parameters<DBActionRegistry<P>[K]>[0],
	) => ReturnType<DBActionRegistry<P>[K]>,
) => {
	return exec;
};
