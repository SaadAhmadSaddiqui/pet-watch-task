import { z } from "zod";

// Base schema for all fields
const baseAdoptionSchema = z.object({
	name: z.string().min(1, "Please enter your full name").min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),

	email: z.string().min(1, "Please enter your email address").email("Please enter a valid email address"),

	phone: z.string().min(1, "Please enter your phone number").min(10, "Phone number must be at least 10 digits").max(20, "Phone number must be less than 20 characters"),

	paymentMethod: z.enum(["credit-card", "debit-card", "cash"], {
		required_error: "Please select a payment method",
	}),

	// Card details - optional by default, will be validated conditionally
	cardNumber: z.string().optional(),
	cardholderName: z.string().optional(),
	expiryMonth: z.string().optional(),
	expiryYear: z.string().optional(),
	cvv: z.string().optional(),
});

// Helper function to check if payment method requires card details
const requiresCardDetails = (paymentMethod: string) => paymentMethod === "credit-card" || paymentMethod === "debit-card";

// Enhanced schema with conditional validation
export const adoptionValidationSchema = baseAdoptionSchema.superRefine((data, ctx) => {
	const needsCardDetails = requiresCardDetails(data.paymentMethod);

	if (needsCardDetails) {
		// Card Number validation
		if (!data.cardNumber || data.cardNumber.trim().length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Please enter your card number",
				path: ["cardNumber"],
			});
		} else {
			// Remove spaces and validate length
			const cardNumberNoSpaces = data.cardNumber.replace(/\s/g, "");
			if (!/^\d+$/.test(cardNumberNoSpaces)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Please enter only numbers",
					path: ["cardNumber"],
				});
			} else if (cardNumberNoSpaces.length < 16) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Please enter a valid card number",
					path: ["cardNumber"],
				});
			}
		}

		// Cardholder Name validation
		if (!data.cardholderName || data.cardholderName.trim().length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Please enter the cardholder name",
				path: ["cardholderName"],
			});
		} else if (data.cardholderName.trim().length < 2) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Name must be at least 2 characters",
				path: ["cardholderName"],
			});
		}

		// Expiry Month validation
		if (!data.expiryMonth || data.expiryMonth.trim().length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Please select expiry month",
				path: ["expiryMonth"],
			});
		}

		// Expiry Year validation
		if (!data.expiryYear || data.expiryYear.trim().length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Please select expiry year",
				path: ["expiryYear"],
			});
		}

		// CVV validation
		if (!data.cvv || data.cvv.trim().length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Please enter CVV",
				path: ["cvv"],
			});
		} else {
			if (!/^\d+$/.test(data.cvv)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "CVV must contain only numbers",
					path: ["cvv"],
				});
			} else if (data.cvv.length < 3 || data.cvv.length > 4) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "CVV must be 3 or 4 digits",
					path: ["cvv"],
				});
			}
		}
	}
});

// Type inference from schema
export type AdoptionFormData = z.infer<typeof adoptionValidationSchema>;

// Helper function to get default values for the form
export const getDefaultAdoptionFormValues = (): AdoptionFormData => ({
	name: "Saad Ahmad",
	email: "mehunsaadi@gmail.com",
	phone: "+971565756806",
	paymentMethod: "credit-card",
	cardNumber: "4242 4242 4242 4242",
	cardholderName: "Saad Ahmad",
	expiryMonth: "01",
	expiryYear: "2029",
	cvv: "000",
});
