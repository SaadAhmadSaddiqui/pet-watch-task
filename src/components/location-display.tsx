import React, { useCallback, useEffect, useState } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";

import * as Location from "expo-location";

import { Text } from "~/components/ui/text";
import { UserLocation } from "~/types/pet";

interface LocationDisplayProps {
	onLocationUpdate?: (location: UserLocation) => void;
}

export const LocationDisplay = ({ onLocationUpdate }: LocationDisplayProps) => {
	const [location, setLocation] = useState<UserLocation | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const getCurrentLocation = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			// Request permission
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				setError("Location permission denied");
				return;
			}

			// Get current position
			const position = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.Balanced,
			});

			const userLocation: UserLocation = {
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
			};

			// Try to get address (optional)
			try {
				const geocode = await Location.reverseGeocodeAsync({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
				});

				if (geocode[0]) {
					const address = [geocode[0].city, geocode[0].region, geocode[0].country].filter(Boolean).join(", ");

					userLocation.address = address || "Unknown location";
				}
			} catch (_geocodeError) {
				// Geocoding failed, but we still have coordinates
			}

			setLocation(userLocation);
			onLocationUpdate?.(userLocation);
		} catch (_locationError) {
			setError("Failed to get location");
			Alert.alert("Location Error", "Unable to get your current location. Please try again.");
		} finally {
			setLoading(false);
		}
	}, [onLocationUpdate]);

	useEffect(() => {
		getCurrentLocation();
	}, [getCurrentLocation]);

	// Create map region when location is available
	const mapRegion = location
		? {
				latitude: location.latitude,
				longitude: location.longitude,
				latitudeDelta: 0.005,
				longitudeDelta: 0.005,
			}
		: null;

	// Create marker coordinate when location is available
	const markerCoordinate = location
		? {
				latitude: location.latitude,
				longitude: location.longitude,
			}
		: null;

	if (error) {
		return (
			<View className="mx-4 mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
				<Text className="mb-2 font-medium text-red-800">Location Error</Text>
				<Text className="mb-2 text-sm text-red-600">{error}</Text>
				<TouchableOpacity onPress={getCurrentLocation} className="self-start rounded bg-red-100 px-3 py-1">
					<Text className="text-sm font-medium text-red-800">Retry</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View className="mx-4 mb-4 overflow-hidden rounded-lg border border-border bg-secondary">
			{/* Header */}
			<View className="flex-row items-center justify-between p-3">
				<Text className="font-medium text-primary">Your Location</Text>
				<TouchableOpacity onPress={getCurrentLocation} disabled={loading} className="rounded bg-accent px-2 py-1">
					<Text className="text-xs font-medium text-accent-foreground">{loading ? "Updating..." : "Refresh"}</Text>
				</TouchableOpacity>
			</View>

			{/* Map View */}
			{location && mapRegion && markerCoordinate && (
				<View className="h-48">
					<MapView
						className="flex-1"
						initialRegion={mapRegion}
						region={mapRegion}
						showsUserLocation={true}
						showsMyLocationButton={false}
						showsCompass={false}
						toolbarEnabled={false}
					>
						<Marker coordinate={markerCoordinate} title="Your Location" description={location.address || "Current Position"} pinColor="red" />
					</MapView>
				</View>
			)}

			{/* Location Details */}
			<View className="p-3">
				{location ? (
					<View>
						{location.address && <Text className="mb-1 text-sm text-primary">{location.address}</Text>}
						<Text className="mb-1 text-xs text-muted-foreground">
							📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
						</Text>
						<Text className="text-xs text-muted-foreground">• Find pets near your location</Text>
					</View>
				) : (
					<Text className="text-sm text-muted-foreground">{loading ? "Getting your location..." : "Location not available"}</Text>
				)}
			</View>
		</View>
	);
};
