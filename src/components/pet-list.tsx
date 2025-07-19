import React, { useCallback, useEffect, useState } from "react";
import { FlatList, View, ActivityIndicator } from "react-native";

import { PetCard } from "~/components/pet-card";
import { Text } from "~/components/ui/text";
import { usePetStore } from "~/contexts/pet-context";
import petsData from "~/lib/data/pets.json";
import { Pet } from "~/types/pet";

interface PetListProps {
	onPetSelect: (pet: Pet) => void;
}

export const PetList = ({ onPetSelect }: PetListProps) => {
	const [state, setState] = usePetStore();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Load pets into the global store if not already loaded
		const loadPets = async () => {
			try {
				// Only load if pets aren't already in the store
				if (state.pets.length === 0) {
					// Simulate network delay
					await new Promise((resolve) => setTimeout(resolve, 500));
					setState({ pets: petsData as Pet[] });
				} else {
					// Pets already loaded, no need to show loading
					setLoading(false);
				}
			} catch (error) {
				console.error("Error loading pets:", error);
			} finally {
				setLoading(false);
			}
		};

		loadPets();
	}, [state.pets.length, setState]);

	const renderPet = useCallback(({ item }: { item: Pet }) => <PetCard pet={item} onPress={onPetSelect} />, [onPetSelect]);

	const keyExtractor = useCallback((item: Pet) => item.id, []);

	if (loading && state.pets.length === 0) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator size="large" color="#2563eb" />
				<Text className="mt-2 text-gray-600">Loading pets...</Text>
			</View>
		);
	}

	return (
		<View className="flex-1">
			<View className="border-b border-gray-200 bg-gray-50 px-4 py-2">
				<Text className="text-lg font-bold text-gray-900">Available Pets</Text>
				<Text className="text-sm text-gray-600">{state.pets.length} pets looking for homes</Text>
			</View>
			<FlatList
				data={state.pets.filter((pet: Pet) => pet.isAvailable)}
				renderItem={renderPet}
				keyExtractor={keyExtractor}
				contentContainerClassName="py-2"
				showsVerticalScrollIndicator={false}
				initialNumToRender={10}
				maxToRenderPerBatch={5}
			/>
		</View>
	);
};
