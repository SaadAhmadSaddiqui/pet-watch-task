import React, { useCallback, useMemo } from "react";
import { TouchableOpacity, View, Image } from "react-native";

import { Text } from "~/components/ui/text";
import { Pet } from "~/types/pet";

interface PetCardProps {
	pet: Pet;
	onPress: (pet: Pet) => void;
}

export const PetCard = ({ pet, onPress }: PetCardProps) => {
	const handlePress = useCallback(() => onPress(pet), [onPress, pet]);
	const accessibilityLabel = `${pet.name}, ${pet.breed}, ${pet.age} years old`;
	const imageSource = useMemo(() => ({ uri: pet.imageUrl }), [pet.imageUrl]);

	return (
		<TouchableOpacity
			onPress={handlePress}
			className="mx-4 mb-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
			accessible={true}
			accessibilityLabel={accessibilityLabel}
		>
			<View className="flex-row">
				<Image source={imageSource} className="mr-4 h-16 w-16 rounded-lg" resizeMode="cover" />
				<View className="flex-1">
					<View className="flex-row items-start justify-between">
						<Text className="text-lg font-bold text-gray-900">{pet.name}</Text>
						<Text className="text-lg font-bold text-primary">${pet.adoptionFee}</Text>
					</View>
					<Text className="mb-1 text-sm text-gray-600">
						{pet.breed} • {pet.age} year{pet.age !== 1 ? "s" : ""} old
					</Text>
					<Text className="mb-2 text-xs text-gray-500" numberOfLines={2}>
						{pet.description}
					</Text>
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center">
							<View className={`mr-2 h-2 w-2 rounded-full ${pet.isAvailable ? "bg-green-500" : "bg-red-500"}`} />
							<Text className={`text-xs font-medium ${pet.isAvailable ? "text-green-600" : "text-red-600"}`}>{pet.isAvailable ? "Available" : "Not Available"}</Text>
						</View>
						<Text className="text-xs text-gray-400">{pet.location.address}</Text>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
};
