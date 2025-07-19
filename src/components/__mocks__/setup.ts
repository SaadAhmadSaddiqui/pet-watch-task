jest.mock("@react-native-async-storage/async-storage", () => require("@react-native-async-storage/async-storage/jest/async-storage-mock"));

// Mock analytics
jest.mock("~/lib/services/analytics", () => ({
	EventCategory: {
		USER_ACTION: "user_action",
	},
	EventName: {
		RECENT_CITY_SELECTED: "recent_city_selected",
	},
	Analytics: {
		trackEvent: jest.fn(),
	},
}));

// Mock the useWeather hook
jest.mock("~/hooks/useWeather", () => ({
	useWeather: jest.fn(() => ({
		data: {
			fullForecast: [],
			current: { temp: 30 },
		},
		isLoading: false,
	})),
}));

// Mock the useWeatherStore
jest.mock("~/contexts/weather-context", () => ({
	useWeatherStore: jest.fn(() => [{ recentSearches: [], selectedCity: null }, jest.fn()]),
}));
