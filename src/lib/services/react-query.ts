import { useEffect } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { focusManager, onlineManager, QueryClient } from "@tanstack/react-query";
import { PersistQueryClientOptions } from "@tanstack/react-query-persist-client";

// Constants
const MAX_AGE_PERSISTENCE = 30 * 60 * 1000; // Only persist data less than 30 minutes old

// Create Query Client with optimized defaults
export const reactQueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 2,
			// Reduce the default stale time for all queries
			staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
			gcTime: 30 * 60 * 1000, // 30 minutes - how long to keep in memory
		},
	},
});

// Create persister with minimal configuration
export const asyncStoragePersister = createAsyncStoragePersister({
	storage: AsyncStorage,
	key: "WEATHER_APP_QUERY_CACHE",
	// Don't do complex filtering during serialization as all queries are weather-related anyway
	// Just drop the data that is too old
	serialize: (data) => {
		// Keep it simple - only filter by timestamp to avoid excessive storage
		const filteredCache = {
			...data,
			clientState: {
				...data.clientState,
				queries: data.clientState.queries.filter(
					(query) =>
						// Only keep if we have a timestamp and it's recent
						query.state.dataUpdatedAt && Date.now() - query.state.dataUpdatedAt < MAX_AGE_PERSISTENCE,
				),
			},
		};
		return JSON.stringify(filteredCache);
	},
});

// Basic persist options
export const reactQueryPersistOptions: Omit<PersistQueryClientOptions, "queryClient"> = {
	persister: asyncStoragePersister,
	dehydrateOptions: {
		shouldDehydrateQuery: (query) => {
			// Only include successful queries with recent data
			return Boolean(query.state.status === "success" && query.state.dataUpdatedAt && Date.now() - query.state.dataUpdatedAt < MAX_AGE_PERSISTENCE);
		},
	},
};

export const onAppStateChange = (status: AppStateStatus) => {
	// React Query already supports in web browser refetch on window focus by default
	if (Platform.OS !== "web") {
		focusManager.setFocused(status === "active");
	}
};

export const useOnlineManager = () => {
	// eslint-disable-next-line consistent-return
	useEffect(() => {
		// React Query already supports on reconnect auto refetch in web browser
		if (Platform.OS !== "web") {
			return NetInfo.addEventListener((state) => {
				onlineManager.setOnline(state.isConnected != null && state.isConnected && Boolean(state.isInternetReachable));
			});
		}
	}, []);
};

export const useAppState = (onChange: (status: AppStateStatus) => void) => {
	useEffect(() => {
		const sub = AppState.addEventListener("change", onChange);
		return () => {
			sub.remove();
		};
	}, [onChange]);
};
