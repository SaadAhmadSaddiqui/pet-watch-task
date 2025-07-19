/* eslint-disable react-perf/jsx-no-new-function-as-prop */
import React from "react";
import { Text as RNText, View, TouchableOpacity } from "react-native";

export const Text = ({ children, ...props }: any) => <RNText {...props}>{children}</RNText>;

export const Select = ({ children, onValueChange, value }: any) => {
	const triggerChild = React.Children.toArray(children).find((child: any) => child.type === SelectTrigger);
	const contentChild = React.Children.toArray(children).find((child: any) => child.type === SelectContent);

	const onItemSelect = (item: any) => {
		if (onValueChange) {
			onValueChange(item);
		}
	};

	const contextValue = { onItemSelect, value };

	return (
		<View>
			{triggerChild}
			{contentChild && React.cloneElement(contentChild as React.ReactElement, { context: contextValue })}
		</View>
	);
};

export const SelectTrigger = ({ children }: any) => <TouchableOpacity>{children}</TouchableOpacity>;

export const SelectValue = ({ placeholder, ...props }: any) => {
	const parentValue = props.value?.label || placeholder;
	return <Text>{parentValue}</Text>;
};

export const SelectContent = ({ children, context }: any) => {
	return (
		<View>
			{React.Children.map(children, (child) => {
				if (React.isValidElement(child)) {
					return React.cloneElement(child, { onSelect: context?.onItemSelect } as any);
				}
				return child;
			})}
		</View>
	);
};

export const SelectItem = ({ children, value, label, onSelect }: any) => <TouchableOpacity onPress={() => onSelect && onSelect({ value, label })}>{children}</TouchableOpacity>;

export const Dialog = ({ children, open }: any) => {
	if (!open) return null;
	return <View>{children}</View>;
};

export const DialogContent = ({ children }: any) => <View>{children}</View>;

export const DialogHeader = ({ children }: any) => <View>{children}</View>;

export const DialogTitle = ({ children }: any) => <Text>{children}</Text>;
