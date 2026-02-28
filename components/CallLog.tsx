import React, { useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import MaterialIcons, {
  MaterialIconsIconName,
} from "@react-native-vector-icons/material-icons";
import ReanimatedSwipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated from "react-native-reanimated";
import { CallLogsModule } from "../modules/dialer-module";
import { CallSectionProps, CallTypes } from "../types";
import { isSpamSync, markAsSpam, unmarkSpam } from "../utils/spam";
import { Alert } from "react-native";
import theme from "../utils/theme";

interface CallLogItemProps {
  logIndex: number;
  isLastLogOfSection: boolean;
  logItem: CallSectionProps["data"][number];
}

type ActionProps = {
  direction: "right" | "left";
} & Omit<CallLogItemProps, "logItem">;

const IconMap: Record<
  Exclude<CallTypes, "UNKNOWN">,
  { iconName: MaterialIconsIconName; color: string }
> = {
  INCOMING: { iconName: "phone-callback", color: theme.colors.success },
  OUTGOING: { iconName: "phone", color: theme.colors.primary },
  MISSED: { iconName: "phone-missed", color: theme.colors.danger },
  REJECTED: { iconName: "phone-missed", color: theme.colors.danger },
};

const formatDuration = (seconds: number): string => {
  if (seconds === 0) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

const CallLog = ({
  logItem,
  logIndex,
  isLastLogOfSection,
  onSpamStatusChanged,
}: CallLogItemProps & { onSpamStatusChanged?: () => void }) => {
  const swipeRef = useRef<SwipeableMethods>(null);

  const iconData = IconMap[logItem.type as keyof typeof IconMap] || {
    iconName: "phone" as MaterialIconsIconName,
    color: theme.colors.textSecondary,
  };

  const handleCall = useCallback(() => {
    if (logItem.number && logItem.number !== "Unknown") {
      CallLogsModule.makeCall(logItem.number);
    }
  }, [logItem.number]);

  const handleMessage = useCallback(() => {
    if (logItem.number && logItem.number !== "Unknown") {
      Linking.openURL(`sms:${logItem.number}`);
    }
  }, [logItem.number]);

  const handleLongPress = useCallback(() => {
    if (!logItem.number || logItem.number === "Unknown") return;

    const spam = isSpamSync(logItem.number);
    Alert.alert(
      spam ? "Unmark Spam" : "Mark as Spam",
      `Do you want to ${spam ? "unmark" : "mark"} ${logItem.number} as spam?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: spam ? "Unmark" : "Mark Spam",
          style: spam ? "default" : "destructive",
          onPress: async () => {
            if (spam) {
              await unmarkSpam(logItem.number!);
            } else {
              await markAsSpam(logItem.number!);
            }
            onSpamStatusChanged?.();
          }
        }
      ]
    );
  }, [logItem.number, onSpamStatusChanged]);

  const duration = formatDuration(logItem.duration);
  const isSpam = logItem.number && logItem.number !== "Unknown" ? isSpamSync(logItem.number) : false;

  return (
    <ReanimatedSwipeable
      ref={swipeRef}
      dragOffsetFromLeftEdge={30}
      leftThreshold={120}
      renderLeftActions={() => (
        <ActionWrapper
          direction="left"
          logIndex={logIndex}
          isLastLogOfSection={isLastLogOfSection}
        />
      )}
      dragOffsetFromRightEdge={30}
      rightThreshold={120}
      renderRightActions={() => (
        <ActionWrapper
          direction="right"
          logIndex={logIndex}
          isLastLogOfSection={isLastLogOfSection}
        />
      )}
      onSwipeableOpen={(direction) => {
        if (direction === "left") {
          handleMessage();
        } else {
          handleCall();
        }
        swipeRef.current?.close();
      }}
      containerStyle={{ overflow: "hidden" }}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleCall}
        onLongPress={handleLongPress}
        className="flex-row items-center bg-background px-4 py-[14px] mx-2"
        style={{
          borderBottomWidth: isLastLogOfSection ? 0 : 0.5,
          borderBottomColor: theme.colors.border,
          borderTopLeftRadius: logIndex === 0 ? 20 : 0,
          borderTopRightRadius: logIndex === 0 ? 20 : 0,
          borderBottomLeftRadius: isLastLogOfSection ? 20 : 0,
          borderBottomRightRadius: isLastLogOfSection ? 20 : 0,
        }}
      >
        <View
          className="w-11 h-11 rounded-full justify-center items-center mr-[14px]"
        >
          {isSpam ? (
            <MaterialIcons name="report" color={theme.colors.danger} size={22} />
          ) : (
            <MaterialIcons name={iconData.iconName} color={iconData.color} size={22} />
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-[6px]">
            <Text
              className="text-[17px] font-medium"
              style={{
                fontSize: 17,
                fontWeight: "500",
                color: isSpam ? theme.colors.danger : logItem.type === "MISSED" ? theme.colors.danger : theme.colors.textPrimary,
              }}
              numberOfLines={1}
            >
              {logItem.name && logItem.name !== "Unknown" ? logItem.name : logItem.number}
            </Text>
            {isSpam && <Text className="text-[11px] font-semibold" style={{ color: theme.colors.danger }}>SPAM</Text>}
          </View>
          <View className="flex-row items-center mt-[3px]">
            <Text className="text-[13px]" style={{ color: theme.colors.textSecondary }}>
              {logItem.type === "INCOMING"
                ? "Incoming"
                : logItem.type === "OUTGOING"
                  ? "Outgoing"
                  : logItem.type === "MISSED"
                    ? "Missed"
                    : "Rejected"}
            </Text>
            {duration ? (
              <Text className="text-[13px]" style={{ color: theme.colors.textSecondary }}>
                {" \u00B7 "}
                {duration}
              </Text>
            ) : null}
          </View>
        </View>
        <TouchableOpacity
          onPress={handleCall}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ padding: 8, backgroundColor: theme.colors.primaryLight, borderRadius: 20, width: 40, height: 40, justifyContent: "center", alignItems: "center" }}
        >
          <MaterialIcons name="call" color={theme.colors.primary} size={20} />
        </TouchableOpacity>
      </TouchableOpacity>
    </ReanimatedSwipeable>
  );
};

const ActionWrapper = ({
  direction,
  logIndex,
  isLastLogOfSection,
}: ActionProps) => {
  return (
    <Reanimated.View
      style={{
        paddingHorizontal: 8,
        width: "100%",
        overflow: "hidden",
        borderTopLeftRadius: logIndex === 0 ? 20 : 0,
        borderTopRightRadius: logIndex === 0 ? 20 : 0,
        borderBottomLeftRadius: isLastLogOfSection ? 20 : 0,
        borderBottomRightRadius: isLastLogOfSection ? 20 : 0,
      }}
    >
      {direction === "right" ? <RightAction /> : <LeftAction />}
    </Reanimated.View>
  );
};

const RightAction = () => (
  <View
    className="flex-row justify-end items-center gap-2 w-full h-full bg-primary px-4"
  >
    <Text className="text-lg font-semibold" style={{ color: theme.colors.white }}>{"Message"}</Text>
    <MaterialIcons name="message" size={22} color={theme.colors.white} />
  </View>
);

const LeftAction = () => (
  <View
    className="flex-row items-center gap-2 w-full h-full bg-success px-4"
  >
    <MaterialIcons name="call" size={22} color={theme.colors.white} />
    <Text className="text-lg font-semibold" style={{ color: theme.colors.white }}>{"Call"}</Text>
  </View>
);

export default React.memo(CallLog);
