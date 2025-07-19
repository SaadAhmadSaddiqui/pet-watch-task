import React, { useCallback, useMemo } from "react";
import { View, Image, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import { Text } from "~/components/ui/text";
import { usePetStore } from "~/contexts/pet-context";

const PetDetailsScreen = () => {
	const router = useRouter();
	const { petId } = useLocalSearchParams<{ petId: string }>();
	const [state] = usePetStore();

	// Find the pet by ID
	const pet = state.pets.find((p) => p.id === petId);

	const handleAdopt = useCallback(() => {
		if (pet) {
			router.push({
				pathname: "/adoption",
				params: { petId: pet.id },
			});
		}
	}, [pet, router]);

	const handleBack = useCallback(() => {
		router.back();
	}, [router]);

	// Memoize image source object to avoid creating it in JSX
	const imageSource = useMemo(() => ({ uri: pet?.imageUrl }), [pet?.imageUrl]);

	if (!pet) {
		return (
			<SafeAreaView className="flex-1 bg-white">
				<View className="flex-1 items-center justify-center p-4">
					<Text className="text-lg text-gray-900">Pet not found</Text>
					<TouchableOpacity onPress={handleBack} className="mt-4 rounded-lg bg-primary px-6 py-3">
						<Text className="text-center font-semibold text-white">Go Back</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-white">
			{/* Header */}
			<View className="border-b border-gray-200 bg-white px-4 py-3">
				<View className="flex-row items-center">
					<TouchableOpacity onPress={handleBack} className="mr-3 p-1">
						<Text className="text-lg text-primary">←</Text>
					</TouchableOpacity>
					<Text className="flex-1 text-xl font-bold text-gray-900">{pet.name}</Text>
				</View>
			</View>

			<ScrollView className="flex-1" contentContainerClassName="pb-4" showsVerticalScrollIndicator={false}>
				{/* Image */}
				<Image source={imageSource} className="mb-4 h-64 w-full" resizeMode="cover" />

				{/* Basic Info */}
				<View className="mb-4 px-4">
					<View className="mb-2 flex-row items-start justify-between">
						<View className="flex-1">
							<Text className="mb-1 text-3xl font-bold text-gray-900">{pet.name}</Text>
							<Text className="text-xl text-gray-600">{pet.breed}</Text>
						</View>
						<View className="items-end">
							<Text className="text-3xl font-bold text-primary">${pet.adoptionFee}</Text>
							<Text className="text-sm text-gray-500">adoption fee</Text>
						</View>
					</View>

					<View className="mb-3 flex-row items-center">
						<Text className="mr-4 text-lg text-gray-700">
							{pet.age} year{pet.age !== 1 ? "s" : ""} old
						</Text>
						<View className="flex-row items-center">
							<View className={`mr-2 h-3 w-3 rounded-full ${pet.isAvailable ? "bg-green-500" : "bg-red-500"}`} />
							<Text className={`text-sm font-medium ${pet.isAvailable ? "text-green-600" : "text-red-600"}`}>{pet.isAvailable ? "Available for Adoption" : "Not Available"}</Text>
						</View>
					</View>
				</View>

				{/* Description */}
				<View className="mb-6 px-4">
					<Text className="mb-2 text-xl font-semibold text-gray-900">About {pet.name}</Text>
					<Text className="text-base leading-relaxed text-gray-700">{pet.description}</Text>
				</View>

				{/* Characteristics */}
				<View className="mb-6 px-4">
					<Text className="mb-3 text-xl font-semibold text-gray-900">Characteristics</Text>
					<View className="flex-row flex-wrap">
						{pet.characteristics.map((characteristic: string, index: number) => (
							<View key={index} className="mb-2 mr-2 rounded-full bg-secondary px-3 py-2">
								<Text className="text-sm text-accent-foreground">{characteristic}</Text>
							</View>
						))}
					</View>
				</View>

				{/* Medical Info */}
				{pet.medicalInfo && (
					<View className="mb-6 px-4">
						<Text className="mb-3 text-xl font-semibold text-gray-900">Medical Information</Text>
						<View className="rounded-lg bg-gray-50 p-4">
							<View className="mb-3 flex-row items-center">
								<Text className="mr-2 text-base text-gray-700">Vaccinated:</Text>
								<Text className={`font-semibold ${pet.medicalInfo.vaccinated ? "text-green-600" : "text-red-600"}`}>{pet.medicalInfo.vaccinated ? "Yes" : "No"}</Text>
							</View>
							<View className="mb-3 flex-row items-center">
								<Text className="mr-2 text-base text-gray-700">Neutered:</Text>
								<Text className={`font-semibold ${pet.medicalInfo.neutered ? "text-green-600" : "text-red-600"}`}>{pet.medicalInfo.neutered ? "Yes" : "No"}</Text>
							</View>
							{pet.medicalInfo.healthNotes && (
								<View>
									<Text className="mb-1 text-base text-gray-700">Health Notes:</Text>
									<Text className="text-sm italic text-gray-600">{pet.medicalInfo.healthNotes}</Text>
								</View>
							)}
						</View>
					</View>
				)}

				{/* Location */}
				<View className="mb-6 px-4">
					<Text className="mb-3 text-xl font-semibold text-gray-900">Location</Text>
					<View className="rounded-lg bg-gray-50 p-4">
						<Text className="mb-1 text-base text-gray-700">{pet.location.address}</Text>
						<Text className="text-sm text-gray-500">
							Coordinates: {pet.location.latitude.toFixed(4)}, {pet.location.longitude.toFixed(4)}
						</Text>
					</View>
				</View>

				{/* Spacing for fixed button */}
				<View className="h-[100px]" />
			</ScrollView>

			{/* Fixed Adopt Button */}
			{pet.isAvailable && (
				<View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 pb-8">
					<TouchableOpacity onPress={handleAdopt} className="rounded-lg bg-primary px-6 py-4 shadow-lg" accessible={true} accessibilityLabel={`Adopt ${pet.name}`}>
						<Text className="text-center text-lg font-bold text-white">Adopt {pet.name}</Text>
					</TouchableOpacity>
				</View>
			)}
		</SafeAreaView>
	);
};

export default PetDetailsScreen;
