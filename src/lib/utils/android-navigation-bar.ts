import { Platform } from "react-native";

import * as NavigationBar from "expo-navigation-bar";

import { NAV_THEME } from "~/lib/constants/nav-theme";

export const setAndroidNavigationBar = async (theme: "light" | "dark") => {
	if (Platform.OS !== "android") return;
	await NavigationBar.setButtonStyleAsync(theme === "dark" ? "light" : "dark");
	await NavigationBar.setBackgroundColorAsync(theme === "dark" ? NAV_THEME.dark.background : NAV_THEME.light.background);
};
