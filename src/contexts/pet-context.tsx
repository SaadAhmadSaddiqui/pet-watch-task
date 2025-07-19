import createFastContext from "~/lib/utils/create-fast-context";
import { Pet, UserLocation } from "~/types/pet";

interface PetState {
	pets: Pet[];
	favoritePets: string[];
	adoptedPets: string[];
	userLocation: UserLocation | null;
	selectedPet: Pet | null;
}

const initialState: PetState = {
	pets: [],
	favoritePets: [],
	adoptedPets: [],
	userLocation: null,
	selectedPet: null,
};

export const {
	StoreProvider: PetProvider,
	useStore: usePetStore,
	withProvider: withPetProvider,
} = createFastContext({
	initialState,
	name: "pet",
	persist: true,
});
