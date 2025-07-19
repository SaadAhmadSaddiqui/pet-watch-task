import React, { createContext, useCallback, useRef, useState, useEffect } from "react";

import { getStorageItem, setStorageItem } from "~/lib/services/async-storage";

interface CreateFastContextOptions<TStore> {
	initialState: TStore;
	name: string;
	persist?: boolean;
}

const createFastContext = <TStore,>({ initialState, name, persist = false }: CreateFastContextOptions<TStore>) => {
	const useStoreData = (
		initialValue?: TStore,
	): {
		get: () => TStore;
		set: React.Dispatch<React.SetStateAction<Partial<TStore>>>;
		subscribe: (callback: (val: TStore) => void) => () => void;
	} => {
		const state = useRef(initialValue || initialState);
		const subscribers = useRef(new Set<(val: TStore) => void>());

		const get = useCallback(() => state.current, []);

		const set: React.Dispatch<React.SetStateAction<Partial<TStore>>> = useCallback((val) => {
			if (typeof val === "object") {
				state.current = { ...state.current, ...val };
			} else if (typeof val === "function") {
				type TVal = (prev: Partial<TStore>) => TStore;
				state.current = (val as TVal)(state.current);
			} else {
				state.current = val;
			}
			if (persist) setStorageItem(name, state.current);
			subscribers.current.forEach((callback) => callback(val as TStore));
		}, []);

		const subscribe = useCallback((callback: (val: TStore) => void) => {
			subscribers.current.add(callback);
			return () => subscribers.current.delete(callback);
		}, []);

		// Load from AsyncStorage
		useEffect(() => {
			const loadInitialState = async () => {
				if (persist && name) {
					try {
						const storedState = await getStorageItem<TStore>(name);
						if (storedState !== null && storedState !== undefined) {
							state.current = storedState;
							subscribers.current.forEach((callback) => callback(state.current));
						}
					} catch (error) {
						console.error(`Failed to load state for ${name}:`, error);
					}
				}
			};
			loadInitialState();
		}, []);

		return {
			get,
			set,
			subscribe,
		};
	};

	type UseStoreDataReturnType = ReturnType<typeof useStoreData>;

	const StoreContext = createContext<UseStoreDataReturnType>(null as any);

	const StoreProvider = ({ children, initialValue }: { children: React.ReactNode; initialValue?: TStore }) => (
		<StoreContext.Provider value={useStoreData(initialValue)}>{children}</StoreContext.Provider>
	);

	const useStore = <TSelect extends TStore>(selector?: (val: TStore) => TSelect): [TSelect | TStore, React.Dispatch<React.SetStateAction<Partial<TStore>>>] => {
		const store = React.useContext(StoreContext);
		if (!store) {
			throw new Error(`use${name || ""}Store must be used within a ${name || ""}Provider`);
		}

		const _selector = selector || ((val) => val);

		const [state, setState] = useState(_selector(store.get()));

		// eslint-disable-next-line react-hooks/exhaustive-deps
		useEffect(() => store.subscribe(() => setState(_selector(store.get()))), []);

		return [state, store.set];
	};

	const withProvider = (Component: React.ComponentType<any>) => (props: any) => (
		<StoreProvider>
			<Component {...props} />
		</StoreProvider>
	);

	return {
		StoreProvider,
		withProvider,
		useStore,
	};
};

export default createFastContext;
