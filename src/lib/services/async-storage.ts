import AsyncStorage from "@react-native-async-storage/async-storage";

export const setStorageItem = async <TValue>(key: string, value: TValue) => {
	const jsonValue = JSON.stringify(value);
	try {
		await AsyncStorage.setItem(key, jsonValue);
	} catch (error) {
		console.error(error);
	}
};

export const getStorageItem = async <T>(key: string) => {
	try {
		const jsonValue = await AsyncStorage.getItem(key);
		return jsonValue !== null ? (JSON.parse(jsonValue) as T) : null;
	} catch (error) {
		console.error(error);
		return null;
	}
};
