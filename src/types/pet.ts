export interface Pet {
	id: string;
	name: string;
	breed: string;
	age: number;
	description: string;
	imageUrl: string;
	adoptionFee: number;
	isAvailable: boolean;
	location: {
		latitude: number;
		longitude: number;
		address: string;
	};
	characteristics: string[];
	medicalInfo?: {
		vaccinated: boolean;
		neutered: boolean;
		healthNotes?: string;
	};
}

export interface UserLocation {
	latitude: number;
	longitude: number;
	address?: string;
}
