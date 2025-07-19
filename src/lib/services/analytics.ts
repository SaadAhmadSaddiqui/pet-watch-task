import { getAnalytics, logEvent, logScreenView, setAnalyticsCollectionEnabled } from "@react-native-firebase/analytics";

// Define event categories for better organization
export enum EventCategory {
	SCREEN_VIEW = "screen_view",
	USER_ACTION = "user_action",
	WEATHER = "weather",
	APP_LIFECYCLE = "app_lifecycle",
	ERROR = "error",
	FEATURE = "feature",
	PERFORMANCE = "performance",
}

// Define standard event names
export enum EventName {
	// Screen views
	VIEW_HOME = "view_home",
	VIEW_FORECAST_MODAL = "view_forecast_modal",

	// User actions
	CITY_SELECTED = "city_selected",
	CITY_SEARCHED = "city_searched",
	RECENT_CITY_SELECTED = "recent_city_selected",
	OPEN_FULL_FORECAST = "open_full_forecast",

	// Weather data
	WEATHER_FETCH_SUCCESS = "weather_fetch_success",
	WEATHER_FETCH_ERROR = "weather_fetch_error",

	// App lifecycle
	APP_START = "app_start",
	APP_BACKGROUND = "app_background",
	APP_FOREGROUND = "app_foreground",

	// Error events
	API_ERROR = "api_error",
	APP_ERROR = "app_error",

	// Feature usage
	CLOSE_FORECAST_MODAL = "close_forecast_modal",

	// Performance metrics
	LOAD_TIME = "load_time",
}

interface AnalyticsEvent {
	category: EventCategory;
	name: EventName | string;
	properties?: Record<string, any>;
	timestamp: number;
}

// Singleton Analytics Service for tracking events and screen views
class AnalyticsService {
	private static instance: AnalyticsService;
	private googleAnalyticsInitialized = false;

	private constructor() {}

	// Get instance of AnalyticsService
	public static getInstance(): AnalyticsService {
		if (!AnalyticsService.instance) {
			AnalyticsService.instance = new AnalyticsService();
		}
		return AnalyticsService.instance;
	}

	public async initializeGoogleAnalytics(): Promise<boolean> {
		try {
			const analytics = getAnalytics();

			await setAnalyticsCollectionEnabled(analytics, true);

			this.googleAnalyticsInitialized = true;
			return true;
		} catch (error) {
			console.error("Failed to initialize Google Analytics:", error);
			return false;
		}
	}

	private async sendToGoogleAnalytics(event: AnalyticsEvent): Promise<void> {
		if (!this.googleAnalyticsInitialized) {
			return;
		}

		try {
			const analytics = getAnalytics();

			await logEvent(analytics, event.name, {
				...event.properties,
				event_category: event.category,
				timestamp: event.timestamp,
			});
		} catch (error) {
			console.error("Error sending event to Google Analytics:", error);
		}
	}

	public async trackEvent(category: EventCategory, name: EventName | string, properties?: Record<string, any>): Promise<void> {
		try {
			const event: AnalyticsEvent = {
				category,
				name,
				properties,
				timestamp: Date.now(),
			};

			await this.sendToGoogleAnalytics(event);
		} catch (error) {
			console.error("Error tracking analytics event:", error);
		}
	}

	public async trackScreenView(screenName: string, properties?: Record<string, any>): Promise<void> {
		if (this.googleAnalyticsInitialized) {
			try {
				const analytics = getAnalytics();

				await logScreenView(analytics, {
					screen_name: screenName + "_Screen",
					screen_class: screenName + "_Screen",
					...properties,
				});
			} catch (error) {
				console.error("Error tracking screen view:", error);
			}
		}
	}
}

// Create the singleton instance
export const Analytics = AnalyticsService.getInstance();
