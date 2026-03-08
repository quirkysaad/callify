import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import * as ContactsModule from "expo-contacts";
import { User, Phone } from "lucide-react-native";
import clsx from "clsx";
import { useTheme } from "../utils/ThemeContext";
import { SwipeableRow } from "./SwipeableRow";

interface ContactItemProps {
  item: ContactsModule.Contact;
  index: number;
  isLastLogOfSection?: boolean;
  onPress?: () => void;
  onCall?: (n: string) => void;
  className?: string; // Additional classNames to override container styles
  swipeDisabled?: boolean;
}

const ContactItem = React.memo(
  ({
    item,
    index,
    isLastLogOfSection = false,
    onPress,
    onCall,
    className,
    swipeDisabled = false,
  }: ContactItemProps) => {
    const { colors } = useTheme();
    const handleCall = useCallback(() => {
      const number = item.phoneNumbers?.[0]?.number;
      if (number) {
        onCall?.(number);
      }
    }, [item.phoneNumbers, onCall]);

    const handleMessage = useCallback(() => {
      const number = item.phoneNumbers?.[0]?.number;
      if (number) {
        Linking.openURL(`sms:${number}`);
      }
    }, [item.phoneNumbers]);

    return (
      <SwipeableRow
        onCall={handleCall}
        onMessage={handleMessage}
        isFirst={index === 0}
        isLast={isLastLogOfSection}
        disabled={swipeDisabled}
        containerStyle={{ marginHorizontal: 8 }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          style={{
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          }}
          className={clsx("flex-row items-center border-b-[0.5px] px-2 py-5", {
            "rounded-t-2xl": index === 0,
            "rounded-b-2xl": isLastLogOfSection,
          })}
        >
          <View
            className="w-11 h-11 rounded-full mr-4 justify-center items-center"
            style={{ backgroundColor: colors.primaryLight }}
          >
            <User size={20} color={colors.primary} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-[6px]">
              <Text
                className="text-base font-medium"
                style={{ color: colors.textPrimary }}
                numberOfLines={1}
              >
                {item.name || "No Name"}
              </Text>
            </View>
            {item.phoneNumbers && item.phoneNumbers.length > 0 ? (
              <Text className="text-[13px] text-textSecondary mt-0.5">
                {item.phoneNumbers[0].number}
              </Text>
            ) : null}
          </View>
          {onCall && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                handleCall();
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="p-2 bg-primaryLight rounded-[20px] w-10 h-10 justify-center items-center"
            >
              <Phone size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </SwipeableRow>
    );
  },
);

export default ContactItem;
