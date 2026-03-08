import React from "react";
import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { useTheme } from "../utils/ThemeContext";
import clsx from "clsx";

interface ActionButtonProps extends TouchableOpacityProps {
  icon: LucideIcon;
  label: string;
}

const ActionButton = ({
  icon: Icon,
  label,
  className,
  ...props
}: ActionButtonProps) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      className={clsx(
        "flex-row items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-primaryLight border border-border",
        className,
      )}
      activeOpacity={0.7}
      {...props}
    >
      <Icon size={20} color={colors.primary} />
      {label && (
        <Text className="font-medium text-[16px] text-primary">{label}</Text>
      )}
    </TouchableOpacity>
  );
};

export default ActionButton;
