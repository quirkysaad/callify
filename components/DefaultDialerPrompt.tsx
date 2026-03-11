import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  AppState,
  AppStateStatus,
  StyleSheet,
} from "react-native";
import { PhoneCall } from "lucide-react-native";
import { CallLogsModule } from "../modules/dialer-module";
import { useTheme } from "../utils/ThemeContext";

const DefaultDialerPrompt = ({ children }: { children: React.ReactNode }) => {
  const [isDefault, setIsDefault] = useState<boolean | null>(null);
  const { colors, isDark } = useTheme();

  const checkDefault = async () => {
    try {
      const result = await CallLogsModule.isDefaultDialer();
      setIsDefault(result ?? false);
    } catch (e) {
      console.log("Error checking default dialer", e);
      setIsDefault(false);
    }
  };

  useEffect(() => {
    checkDefault();

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          checkDefault();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const [showHelp, setShowHelp] = useState(false);

  const handleRequest = async () => {
    try {
      await CallLogsModule.requestDefaultDialer();
      // On some Android 13+ devices, if restricted settings are on, 
      // the prompt might not appear. We wait and check again.
      setTimeout(checkDefault, 1000);
    } catch (e) {
      console.log("Error requesting default dialer", e);
      setShowHelp(true);
    }
  };

  if (isDefault === null) return null;

  return (
    <View style={{ flex: 1 }}>
      {children}
      {!isDefault && (
        <View
          className="flex-1 items-center justify-center p-8"
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: colors.background,
            zIndex: 9999,
          }}
        >
          <View
            className="mb-6 h-20 w-20 items-center justify-center rounded-[40px]"
            style={{ backgroundColor: colors.successLight }}
          >
            <PhoneCall size={40} color={colors.success} />
          </View>
          <Text
            className="mb-3 text-center text-2xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            Default Phone App
          </Text>
          <Text
            className="mb-8 text-center text-base"
            style={{ color: colors.textSecondary }}
          >
            Shizn needs to be your default phone app to make and receive calls,
            and to show your call history.
          </Text>

          <TouchableOpacity
            onPress={handleRequest}
            className="w-full flex-row items-center justify-center rounded-xl py-4"
            style={{ backgroundColor: colors.success, marginBottom: 16 }}
          >
            <Text className="text-lg font-bold" style={{ color: colors.white }}>
              Set as Default
            </Text>
          </TouchableOpacity>

          {!showHelp ? (
            <TouchableOpacity onPress={() => setShowHelp(true)}>
              <Text style={{ color: colors.textSecondary, textDecorationLine: 'underline' }}>
                Having trouble setting it?
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                padding: 16,
                borderRadius: 16,
                width: '100%'
              }}
            >
              <Text style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: 8 }}>
                Android 13+ "Restricted Settings":
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 18 }}>
                1. Tap "Open App Info" below.{"\n"}
                2. Tap the ⋮ menu (top right).{"\n"}
                3. Select "Allow restricted settings".{"\n"}
                4. Come back and tap "Set as Default".
              </Text>
              <TouchableOpacity
                onPress={() => CallLogsModule.openAppSettings?.()}
                style={{
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: colors.primaryLight,
                  borderRadius: 8,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Open App Info</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowHelp(false)}
                style={{ marginTop: 12, alignItems: 'center' }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Hide help</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default DefaultDialerPrompt;
