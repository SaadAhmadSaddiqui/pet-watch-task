import "~/lib/styles/global.css";

import React, { useCallback } from "react";
import { View, SafeAreaView, StatusBar } from "react-native";

import { useRouter } from "expo-router";

import { LocationDisplay } from "~/components/location-display";
import { PetList } from "~/components/pet-list";
import { Text } from "~/components/ui/text";
import { usePetStore } from "~/contexts/pet-context";
import { Pet, UserLocation } from "~/types/pet";

const PetWatchApp = () => {
	const router = useRouter();
	const [_state, setState] = usePetStore();

	const handleLocationUpdate = useCallback(
		(location: UserLocation) => {
			setState({ userLocation: location });
		},
		[setState],
	);

	const handlePetSelect = useCallback(
		(pet: Pet) => {
			router.push({
				pathname: "/pet-details",
				params: { petId: pet.id },
			});
		},
		[router],
	);

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			<StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

			{/* Header */}
			<View className="border-b border-gray-200 bg-white px-4 py-3">
				<Text className="text-center text-2xl font-bold text-gray-900">🐾 Pet Watch</Text>
				<Text className="mt-1 text-center text-sm text-gray-600">Find your perfect companion</Text>
			</View>

			{/* Location Display */}
			<LocationDisplay onLocationUpdate={handleLocationUpdate} />

			{/* Pet List */}
			<PetList onPetSelect={handlePetSelect} />
		</SafeAreaView>
	);
};

export default PetWatchApp;
