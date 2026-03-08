import React, { useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  BackHandler,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { Sun, Moon, Monitor, Check, X } from "lucide-react-native";
import { useTheme, ThemeMode } from "../utils/ThemeContext";

const DRAWER_WIDTH = Dimensions.get("window").width * 0.78;

interface AppDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const AppDrawer = ({ visible, onClose }: AppDrawerProps) => {
  const { themeMode, setThemeMode, colors, isDark } = useTheme();
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const isOpen = useRef(false);

  const options: {
    label: string;
    value: ThemeMode;
    Icon: any;
    desc: string;
  }[] = [
    {
      label: "Light",
      value: "light",
      Icon: Sun,
      desc: "Always use light theme",
    },
    { label: "Dark", value: "dark", Icon: Moon, desc: "Always use dark theme" },
    {
      label: "System",
      value: "system",
      Icon: Monitor,
      desc: "Follow device settings",
    },
  ];

  const openDrawer = useCallback(() => {
    translateX.value = withTiming(0, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
    isOpen.current = true;
  }, []);

  const closeDrawer = useCallback(() => {
    translateX.value = withTiming(-DRAWER_WIDTH, {
      duration: 250,
      easing: Easing.in(Easing.cubic),
    });
    isOpen.current = false;
    setTimeout(onClose, 260);
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      openDrawer();
    }
  }, [visible, openDrawer]);

  // Handle back button
  useEffect(() => {
    if (!visible) return;
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      closeDrawer();
      return true;
    });
    return () => handler.remove();
  }, [visible, closeDrawer]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-DRAWER_WIDTH, 0], [0, 0.5]),
  }));

  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
      }}
    >
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={closeDrawer}>
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#000",
            },
            overlayStyle,
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Drawer Panel */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: DRAWER_WIDTH,
            backgroundColor: colors.background,
            borderRightWidth: 1,
            borderRightColor: colors.border,
            paddingTop: 56,
            paddingHorizontal: 20,
          },
          drawerStyle,
        ]}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: colors.textPrimary,
            }}
          >
            Settings
          </Text>
          <TouchableOpacity onPress={closeDrawer}>
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Theme Section */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: colors.textSecondary,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Appearance
        </Text>

        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: "hidden",
          }}
        >
          {options.map((option, index) => {
            const isSelected = themeMode === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setThemeMode(option.value)}
                activeOpacity={0.6}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  borderBottomWidth: index < options.length - 1 ? 0.5 : 0,
                  borderBottomColor: colors.border,
                  backgroundColor: isSelected
                    ? isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.03)"
                    : "transparent",
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    backgroundColor: isSelected
                      ? colors.primaryLight
                      : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 14,
                  }}
                >
                  <option.Icon
                    size={20}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color: colors.textPrimary,
                    }}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    {option.desc}
                  </Text>
                </View>
                {isSelected && <Check size={20} color={colors.success} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
};

export default AppDrawer;
