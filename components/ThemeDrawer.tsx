import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";
import { Sun, Moon, Smartphone, Check, X, RefreshCw, Info } from "lucide-react-native";
import { useTheme, ThemeMode } from "../utils/ThemeContext";
import { CallLogsModule } from "../modules/dialer-module";
import { checkUpdate, openUpdateLink } from "../utils/updateChecker";
import Constants from "expo-constants";
import CustomModal from "./CustomModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;

interface ThemeDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: {
  mode: ThemeMode;
  label: string;
  icon: any;
  description: string;
}[] = [
    {
      mode: "light",
      label: "Light",
      icon: Sun,
      description: "Always use the light theme",
    },
    {
      mode: "dark",
      label: "Dark",
      icon: Moon,
      description: "Always use the dark theme",
    },
    {
      mode: "system",
      label: "System Default",
      icon: Smartphone,
      description: "Match your device settings",
    },
  ];

const ThemeDrawer = ({ visible, onClose }: ThemeDrawerProps) => {
  const { mode, setMode, colors, isDark } = useTheme();
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const overlayOpacity = useSharedValue(0);
  const [shouldRender, setShouldRender] = React.useState(visible);
  const [isCheckingUpdate, setIsCheckingUpdate] = React.useState(false);
  const [alertConfig, setAlertConfig] = React.useState<{
    visible: boolean;
    title: string;
    description: string;
    buttons: any[];
  }>({ visible: false, title: '', description: '', buttons: [] });
  const appVersion = Constants.expoConfig?.version || "1.0.0";

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      translateX.value = withSpring(0, {
        damping: 22,
        stiffness: 200,
        mass: 0.8,
      });
      overlayOpacity.value = withTiming(1, { duration: 300 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 250 });
      translateX.value = withTiming(
        -DRAWER_WIDTH,
        { duration: 250 },
        (finished) => {
          if (finished) {
            runOnJS(setShouldRender)(false);
          }
        },
      );
    }
  }, [visible]);

  const drawerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handleSelect = (selectedMode: ThemeMode) => {
    setMode(selectedMode);
  };

  const handleManualUpdateCheck = async () => {
    setIsCheckingUpdate(true);
    try {
      const update = await checkUpdate();
      if (update && update.isNewer) {
        setAlertConfig({
          visible: true,
          title: "Update Available",
          description: `Version ${update.version} is available. Would you like to update now?`,
          buttons: [
            { text: "Update Now", onPress: () => { openUpdateLink(update.url); setAlertConfig(p => ({ ...p, visible: false })); } },
            { text: "Later", variant: 'secondary', onPress: () => setAlertConfig(p => ({ ...p, visible: false })) }
          ]
        });
      } else {
        setAlertConfig({
          visible: true,
          title: "Up to Date",
          description: `Shizn is already running the latest version (${appVersion}).`,
          buttons: [{ text: "Awesome", onPress: () => setAlertConfig(p => ({ ...p, visible: false })) }]
        });
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: "Check Failed",
        description: "Could not check for updates. Please check your internet connection.",
        buttons: [{ text: "OK", onPress: () => setAlertConfig(p => ({ ...p, visible: false })) }]
      });
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9998,
      }}
    >
      <CustomModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        description={alertConfig.description}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig(p => ({ ...p, visible: false }))}
      />
      {/* Overlay */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
          },
          overlayAnimatedStyle,
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: DRAWER_WIDTH,
            backgroundColor: colors.background,
            borderTopRightRadius: 24,
            borderBottomRightRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 4, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 20,
          },
          drawerAnimatedStyle,
        ]}
      >
        {/* Header */}
        <View
          style={{
            paddingTop: 60,
            paddingHorizontal: 24,
            paddingBottom: 24,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: colors.textPrimary,
                letterSpacing: -0.5,
              }}
            >
              Appearance
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.primaryLight,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginTop: 6,
            }}
          >
            Choose how Shizn looks to you
          </Text>
        </View>

        {/* Theme Options */}
        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
          {THEME_OPTIONS.map((option, index) => {
            const isSelected = mode === option.mode;
            const IconComponent = option.icon;

            return (
              <TouchableOpacity
                key={option.mode}
                activeOpacity={0.7}
                onPress={() => handleSelect(option.mode)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  marginBottom: 8,
                  borderRadius: 16,
                  backgroundColor: isSelected
                    ? isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.04)"
                    : "transparent",
                  borderWidth: isSelected ? 1.5 : 1,
                  borderColor: isSelected
                    ? isDark
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(0,0,0,0.15)"
                    : colors.border,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: isSelected
                      ? isDark
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(0,0,0,0.06)"
                      : colors.primaryLight,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 14,
                  }}
                >
                  <IconComponent
                    size={22}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: isSelected ? "600" : "500",
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
                    {option.description}
                  </Text>
                </View>
                {isSelected && (
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: colors.primary,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Check size={16} color={isDark ? "#000000" : "#FFFFFF"} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Preview Indicator */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 24,
            padding: 16,
            borderRadius: 16,
            backgroundColor: isDark
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.02)",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            Currently using{" "}
            <Text
              style={{
                color: colors.textPrimary,
                fontWeight: "700",
              }}
            >
              {isDark ? "Dark" : "Light"}
            </Text>{" "}
            theme
          </Text>
        </View>

        {/* Footer Actions */}
        <View style={{ marginTop: 'auto', paddingBottom: 40 }}>
          {/* App Settings Button */}
          <TouchableOpacity
            onPress={() => CallLogsModule.openAppSettings?.()}
            style={{
              marginHorizontal: 16,
              marginTop: 16,
              padding: 14,
              borderRadius: 12,
              backgroundColor: colors.primaryLight,
              flexDirection: 'row',
              alignItems: "center",
              justifyContent: 'center'
            }}
          >
            <Smartphone size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              App Settings
            </Text>
          </TouchableOpacity>

          {/* Check for Updates Button */}
          <TouchableOpacity
            onPress={handleManualUpdateCheck}
            disabled={isCheckingUpdate}
            style={{
              marginHorizontal: 16,
              marginTop: 12,
              padding: 14,
              borderRadius: 12,
              backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: 'row',
              alignItems: "center",
              justifyContent: 'center'
            }}
          >
            {isCheckingUpdate ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <>
                <RefreshCw size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>
                  Check for Updates
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Version Info */}
          <Text style={{
            textAlign: 'center',
            marginTop: 16,
            fontSize: 12,
            color: colors.textSecondary,
            opacity: 0.6
          }}>
            Shizn v{appVersion}
          </Text>
        </View>
      </Animated.View>

    </View>
  );
};

export default ThemeDrawer;
