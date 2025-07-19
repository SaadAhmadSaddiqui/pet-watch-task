import "~/lib/styles/global.css";

import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { DarkTheme, DefaultTheme, type Theme, ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import { PetProvider } from "~/contexts/pet-context";
import { useColorScheme } from "~/hooks/useColorScheme";
import { useIsomorphicLayoutEffect } from "~/hooks/useIsomorphicLayoutEffect";
import { NAV_THEME } from "~/lib/constants/nav-theme";
import { EventCategory, EventName, Analytics } from "~/lib/services/analytics";
import { setAndroidNavigationBar } from "~/lib/utils/android-navigation-bar";
import { StackProps } from "~/types/react-navigation";

export { ErrorBoundary } from "expo-router";

const LIGHT_THEME: Theme = {
	...DefaultTheme,
	colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
	...DarkTheme,
	colors: NAV_THEME.dark,
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
	duration: 1000,
	fade: true,
});

const RootLayout = () => {
	const hasMounted = useRef(false);
	const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);

	const { colorScheme, isDarkColorScheme } = useColorScheme();

	// Initialize analytics
	useEffect(() => {
		const setupAnalytics = async () => {
			try {
				// Initialize Google Analytics
				await Analytics.initializeGoogleAnalytics();

				// Track app startup event
				Analytics.trackEvent(EventCategory.APP_LIFECYCLE, EventName.APP_START, {
					platform: Platform.OS,
					version: Platform.Version,
				});
			} catch (error) {
				console.error("Failed to initialize analytics:", error);
			}
		};

		setupAnalytics();
	}, []);

	useIsomorphicLayoutEffect(() => {
		if (hasMounted.current) {
			return;
		}

		if (Platform.OS === "web") {
			// Adds the background color to the html element to prevent white background on overscroll.
			document.documentElement.classList.add("bg-background");
		}
		setAndroidNavigationBar(colorScheme);
		setIsColorSchemeLoaded(true);
		hasMounted.current = true;
	}, []);

	useEffect(() => {
		if (isColorSchemeLoaded) {
			SplashScreen.hideAsync();
		}
	}, [isColorSchemeLoaded]);

	if (!isColorSchemeLoaded) {
		return null;
	}

	return (
		<ThemeProvider value={isDarkColorScheme ? LIGHT_THEME : DARK_THEME}>
			<StatusBar style={isDarkColorScheme ? "dark" : "light"} />
			<RootLayoutNav />
		</ThemeProvider>
	);
};

export default RootLayout;

const screenOptions: StackProps["screenOptions"] = {
	headerShown: false,
	animation: "slide_from_right", // Better navigation animations
};

// Helper component to track screen views
const ScreenTracker = () => {
	const pathname = usePathname();

	useEffect(() => {
		// Track screen view when pathname changes
		if (pathname) {
			// change / to Home if it's the root path and replace / with _ and Capitalize the first letter of each word
			const screenPath =
				pathname === "/"
					? "Home"
					: pathname
							.replace("/", "_")
							.replace(/_/g, " ")
							.replace(/\b\w/g, (char) => char.toUpperCase());
			Analytics.trackScreenView(screenPath, {
				screen_path: screenPath,
			});
		}
	}, [pathname]);

	return null;
};

const RootLayoutNav = () => {
	return (
		<GestureHandlerRootView className="flex-1">
			<PetProvider>
				<SafeAreaProvider>
					<ScreenTracker />
					<Stack screenOptions={screenOptions} />
					<PortalHost />
				</SafeAreaProvider>
			</PetProvider>
		</GestureHandlerRootView>
	);
};
