import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { View, TouchableOpacity, Alert, ActivityIndicator, ScrollView, SafeAreaView } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Text } from "~/components/ui/text";
import { usePetStore } from "~/contexts/pet-context";
import { adoptionValidationSchema, getDefaultAdoptionFormValues, type AdoptionFormData } from "~/lib/validations/adoption";

const AdoptionScreen = () => {
	const router = useRouter();
	const { petId } = useLocalSearchParams<{ petId: string }>();
	const [state] = usePetStore();

	// Find the pet by ID
	const pet = state.pets.find((p) => p.id === petId);

	// Form setup
	const defaultFormValues = useMemo(() => getDefaultAdoptionFormValues(), []);

	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<AdoptionFormData>({
		resolver: zodResolver(adoptionValidationSchema),
		defaultValues: defaultFormValues,
	});

	const paymentMethod = watch("paymentMethod");
	const requiresCardDetails = paymentMethod === "credit-card" || paymentMethod === "debit-card";

	// Payment loading state
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);

	// Reset form when screen loads
	useEffect(() => {
		reset(defaultFormValues);
	}, [reset, defaultFormValues]);

	const handleBack = useCallback(() => {
		router.back();
	}, [router]);

	const onSubmit = useCallback(
		async (data: AdoptionFormData) => {
			if (!pet) return;

			try {
				// Start loading
				setIsProcessingPayment(true);

				if (requiresCardDetails) {
					// Simulate card validation (check for test card numbers)
					const isTestCard = data.cardNumber === "4242424242424242" || data.cardNumber === "4111111111111111";

					if (!isTestCard && data.cardNumber && data.cardNumber.replace(/\s/g, "").length < 16) {
						setIsProcessingPayment(false);
						Alert.alert("Payment Failed", "Invalid card number. Try using 4242 4242 4242 4242 for testing.");
						return;
					}

					// Simulate processing time for card payments
					await new Promise((resolve) => setTimeout(resolve, 3700));
				} else {
					// Simulate processing time for cash payments
					await new Promise((resolve) => setTimeout(resolve, 2800));
				}

				// Stop loading
				setIsProcessingPayment(false);

				// Success message with payment details
				const paymentDetails = requiresCardDetails
					? `Payment of $${pet.adoptionFee} was successfully charged to your ${data.paymentMethod === "credit-card" ? "credit" : "debit"} card ending in ${data.cardNumber?.slice(-4) || "****"}.`
					: `Cash payment of $${pet.adoptionFee} will be collected upon pickup.`;

				Alert.alert(
					"Adoption Successful! 🎉",
					`Congratulations! You've successfully adopted ${pet.name}.\n\n${paymentDetails}\n\nWe'll contact you at ${data.email} within 24 hours to arrange the pickup.`,
					[
						{
							text: "OK",
							onPress: () => {
								// Navigate back to home
								router.navigate("/");
							},
						},
					],
				);
			} catch (_error) {
				setIsProcessingPayment(false);
				Alert.alert("Adoption Error", "Something went wrong during payment processing. Please try again.");
			}
		},
		[pet, router, requiresCardDetails],
	);

	const getPaymentMethodLabel = useCallback((value: string) => {
		switch (value) {
			case "credit-card":
				return "Credit Card";
			case "debit-card":
				return "Debit Card";
			default:
				return "Cash";
		}
	}, []);

	// Helper functions
	const formatCardNumber = useCallback((value: string) => {
		const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
		const matches = v.match(/\d{4,16}/g);
		const match = (matches && matches[0]) || "";
		const parts = [];

		for (let i = 0, len = match.length; i < len; i += 4) {
			parts.push(match.substring(i, i + 4));
		}

		if (parts.length) {
			return parts.join(" ");
		} else {
			return v;
		}
	}, []);

	// Render functions
	const renderNameField = useCallback(
		({ field: { onChange, value } }: any) => <Input placeholder="Enter your full name" value={value} onChangeText={onChange} className="w-full" />,
		[],
	);

	const renderEmailField = useCallback(
		({ field: { onChange, value } }: any) => (
			<Input placeholder="Enter your email address" value={value} onChangeText={onChange} keyboardType="email-address" autoCapitalize="none" className="w-full" />
		),
		[],
	);

	const renderPhoneField = useCallback(
		({ field: { onChange, value } }: any) => <Input placeholder="Enter your phone number" value={value} onChangeText={onChange} keyboardType="phone-pad" className="w-full" />,
		[],
	);

	const handleCardNumberChange = useCallback((onChange: (value: string) => void) => (text: string) => onChange(formatCardNumber(text)), [formatCardNumber]);

	const handleCvvChange = useCallback((onChange: (value: string) => void) => (text: string) => onChange(text.replace(/\D/g, "")), []);

	const handleSelectChange = useCallback((onChange: (value: string) => void) => (option: { value: string; label: string } | undefined) => option && onChange(option.value), []);

	const renderCardNumberField = useCallback(
		({ field: { onChange, value } }: any) => (
			<Input placeholder="1234 5678 9012 3456" value={value} onChangeText={handleCardNumberChange(onChange)} keyboardType="numeric" maxLength={19} className="w-full" />
		),
		[handleCardNumberChange],
	);

	const renderCardholderNameField = useCallback(
		({ field: { onChange, value } }: any) => <Input placeholder="Name on card" value={value} onChangeText={onChange} autoCapitalize="words" className="w-full" />,
		[],
	);

	const renderExpiryMonthField = useCallback(
		({ field: { onChange, value } }: any) => {
			const monthValue = value ? { value, label: value.padStart(2, "0") } : undefined;

			return (
				<Select value={monthValue} onValueChange={handleSelectChange(onChange)}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="MM" />
					</SelectTrigger>
					<SelectContent>
						{Array.from({ length: 12 }, (_, i) => {
							const month = (i + 1).toString().padStart(2, "0");
							return <SelectItem key={month} label={month} value={month} />;
						})}
					</SelectContent>
				</Select>
			);
		},
		[handleSelectChange],
	);

	const renderExpiryYearField = useCallback(
		({ field: { onChange, value } }: any) => {
			const yearValue = value ? { value, label: value } : undefined;
			const currentYear = new Date().getFullYear();

			return (
				<Select value={yearValue} onValueChange={handleSelectChange(onChange)}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="YYYY" />
					</SelectTrigger>
					<SelectContent>
						{Array.from({ length: 20 }, (_, i) => {
							const year = (currentYear + i).toString();
							return <SelectItem key={year} label={year} value={year} />;
						})}
					</SelectContent>
				</Select>
			);
		},
		[handleSelectChange],
	);

	const renderCvvField = useCallback(
		({ field: { onChange, value } }: any) => (
			<Input placeholder="123" value={value} onChangeText={handleCvvChange(onChange)} keyboardType="numeric" maxLength={4} secureTextEntry={true} className="w-full" />
		),
		[handleCvvChange],
	);

	const createSelectValue = useCallback(
		(value: string) => ({
			value,
			label: getPaymentMethodLabel(value),
		}),
		[getPaymentMethodLabel],
	);

	const createSelectChangeHandler = useCallback(
		(onChange: (value: string) => void) => (option: { value: string; label: string } | undefined) => option && onChange(option.value),
		[],
	);

	const renderPaymentMethodField = useCallback(
		({ field: { onChange, value } }: any) => {
			const selectValue = createSelectValue(value);
			const handleSelectChange = createSelectChangeHandler(onChange);

			return (
				<Select value={selectValue} onValueChange={handleSelectChange}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select payment method" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem label="Credit Card" value="credit-card" />
						<SelectItem label="Debit Card" value="debit-card" />
						<SelectItem label="Cash" value="cash" />
					</SelectContent>
				</Select>
			);
		},
		[createSelectValue, createSelectChangeHandler],
	);

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
					<Text className="flex-1 text-xl font-bold text-gray-900">Adopt {pet.name}</Text>
				</View>
			</View>

			<ScrollView className="flex-1" contentContainerClassName="pb-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
				{/* Adoption Summary */}
				<View className="mx-4 mb-6 mt-4 rounded-lg bg-secondary p-4">
					<Text className="mb-3 text-lg font-semibold text-primary">Adoption Summary</Text>
					<View className="mb-3 flex-row items-center">
						{pet.imageUrl && (
							<View className="mr-3 h-16 w-16 overflow-hidden rounded-full bg-gray-200">
								<Text className="mt-6 text-center text-xs text-gray-500">📷</Text>
							</View>
						)}
						<View className="flex-1">
							<Text className="text-lg font-semibold text-primary">{pet.name}</Text>
							<Text className="text-accent-foreground">
								{pet.breed} • {pet.age} years old
							</Text>
							<Text className="text-sm text-muted-foreground">{pet.location.address}</Text>
						</View>
					</View>
					<View className="flex-row items-center justify-between border-t border-border pt-3">
						<Text className="font-semibold text-accent-foreground">Adoption Fee:</Text>
						<Text className="text-lg font-bold text-primary">${pet.adoptionFee}</Text>
					</View>
				</View>

				{/* Contact Information */}
				<View className="mb-6 px-4">
					<Text className="mb-4 text-lg font-semibold text-gray-900">Contact Information</Text>

					<View className="mb-4">
						<Text className="mb-1 text-sm font-medium text-gray-700">Full Name *</Text>
						<Controller control={control} name="name" render={renderNameField} />
						{errors.name && <Text className="mt-1 text-sm text-red-600">{errors.name.message}</Text>}
					</View>

					<View className="mb-4">
						<Text className="mb-1 text-sm font-medium text-gray-700">Email Address *</Text>
						<Controller control={control} name="email" render={renderEmailField} />
						{errors.email && <Text className="mt-1 text-sm text-red-600">{errors.email.message}</Text>}
					</View>

					<View className="mb-4">
						<Text className="mb-1 text-sm font-medium text-gray-700">Phone Number *</Text>
						<Controller control={control} name="phone" render={renderPhoneField} />
						{errors.phone && <Text className="mt-1 text-sm text-red-600">{errors.phone.message}</Text>}
					</View>
				</View>

				{/* Payment Method */}
				<View className="mb-6 px-4">
					<Text className="mb-4 text-lg font-semibold text-gray-900">Payment Method</Text>

					<View className="mb-4">
						<Text className="mb-1 text-sm font-medium text-gray-700">Payment Method *</Text>
						<Controller control={control} name="paymentMethod" render={renderPaymentMethodField} />
						{errors.paymentMethod && <Text className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</Text>}
					</View>

					{/* Card Details - Only show for credit/debit cards */}
					{requiresCardDetails && (
						<View className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
							<Text className="mb-3 text-base font-semibold text-blue-900">💳 Card Details</Text>

							<View className="mb-4">
								<Text className="mb-1 text-sm font-medium text-gray-700">Card Number *</Text>
								<Controller control={control} name="cardNumber" render={renderCardNumberField} />
								{errors.cardNumber && <Text className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</Text>}
							</View>

							<View className="mb-4">
								<Text className="mb-1 text-sm font-medium text-gray-700">Cardholder Name *</Text>
								<Controller control={control} name="cardholderName" render={renderCardholderNameField} />
								{errors.cardholderName && <Text className="mt-1 text-sm text-red-600">{errors.cardholderName.message}</Text>}
							</View>

							<View className="mb-4 flex-row">
								<View className="mr-2 flex-1">
									<Text className="mb-1 text-sm font-medium text-gray-700">Expiry Month *</Text>
									<Controller control={control} name="expiryMonth" render={renderExpiryMonthField} />
									{errors.expiryMonth && <Text className="mt-1 text-sm text-red-600">{errors.expiryMonth.message}</Text>}
								</View>

								<View className="mr-2 flex-1">
									<Text className="mb-1 text-sm font-medium text-gray-700">Expiry Year *</Text>
									<Controller control={control} name="expiryYear" render={renderExpiryYearField} />
									{errors.expiryYear && <Text className="mt-1 text-sm text-red-600">{errors.expiryYear.message}</Text>}
								</View>

								<View className="flex-1">
									<Text className="mb-1 text-sm font-medium text-gray-700">CVV *</Text>
									<Controller control={control} name="cvv" render={renderCvvField} />
									{errors.cvv && <Text className="mt-1 text-sm text-red-600">{errors.cvv.message}</Text>}
								</View>
							</View>

							<View className="rounded-lg border border-green-200 bg-green-50 p-2">
								<Text className="text-xs font-medium text-green-800">💡 Test Card Numbers:</Text>
								<Text className="text-xs text-green-700">• 4242 4242 4242 4242 (Visa)</Text>
								<Text className="text-xs text-green-700">• 4111 1111 1111 1111 (Visa)</Text>
							</View>
						</View>
					)}

					<View className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
						<Text className="mb-1 text-sm font-medium text-yellow-800">🔒 Secure Payment Simulation</Text>
						<Text className="text-xs text-yellow-700">This is a demo app. No real payment will be processed.</Text>
					</View>
				</View>

				{/* Terms */}
				<View className="mb-6 px-4">
					<View className="rounded-lg border border-gray-200 bg-gray-50 p-4">
						<Text className="mb-2 text-sm font-semibold text-gray-800">📋 Adoption Agreement</Text>
						<Text className="text-sm leading-relaxed text-gray-600">
							By proceeding with this adoption, you agree to provide a loving home for {pet.name} and understand that this is a demo application. No actual payment will be
							processed or adoption finalized.
						</Text>
					</View>
				</View>

				{/* Spacing for fixed buttons */}
				<View className="h-[120px]" />
			</ScrollView>

			{/* Fixed Action Buttons */}
			<View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 pb-8">
				<TouchableOpacity
					onPress={handleSubmit(onSubmit)}
					disabled={isSubmitting || isProcessingPayment}
					className={`mb-3 flex-row items-center justify-center rounded-lg py-4 shadow-sm ${isSubmitting || isProcessingPayment ? "bg-gray-400" : "bg-green-600"}`}
					accessible={true}
					accessibilityLabel={`Complete adoption of ${pet.name}`}
				>
					{isProcessingPayment && <ActivityIndicator size="small" color="white" className="mr-2" />}
					<Text className="text-center text-lg font-bold text-white">
						{isSubmitting || isProcessingPayment ? "Processing Adoption..." : `Complete Adoption - $${pet.adoptionFee}`}
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={handleBack}
					disabled={isSubmitting || isProcessingPayment}
					className="rounded-lg border border-gray-300 py-3"
					accessible={true}
					accessibilityLabel="Cancel adoption"
				>
					<Text className="text-center font-medium text-gray-700">Cancel</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

export default AdoptionScreen;
