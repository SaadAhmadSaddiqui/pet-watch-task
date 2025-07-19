// Mock for @rn-primitives/slot
jest.mock("@rn-primitives/slot", () => ({
	Slot: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock for @rn-primitives/select
jest.mock("@rn-primitives/select", () => ({
	Root: ({ children }: { children: React.ReactNode }) => children,
	Trigger: ({ children }: { children: React.ReactNode }) => children,
	Value: ({ children }: { children: React.ReactNode }) => children,
	Portal: ({ children }: { children: React.ReactNode }) => children,
	Content: ({ children }: { children: React.ReactNode }) => children,
	Item: ({ children }: { children: React.ReactNode }) => children,
	ItemText: ({ children }: { children: React.ReactNode }) => children,
	ItemIndicator: ({ children }: { children: React.ReactNode }) => children,
	Label: ({ children }: { children: React.ReactNode }) => children,
	Separator: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock for @rn-primitives/types
jest.mock("@rn-primitives/types", () => ({}));
