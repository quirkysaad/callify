import React from "react";
import { View, StatusBar } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import CallScreen from "../components/CallScreen";
import DefaultDialerPrompt from "../components/DefaultDialerPrompt";
import {
  ContactsProvider,
  RecentsProvider,
  CallStateProvider,
} from "../utils/AppProviders";
import { ThemeProvider, useTheme } from "../utils/ThemeContext";

const LayoutContent = () => {
  const { colors, isDark } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ContactsProvider>
          <RecentsProvider>
            <CallStateProvider>
              <DefaultDialerPrompt>
                <View style={{ flex: 1 }}>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: {
                        flex: 1,
                        backgroundColor: colors.background,
                      },
                      animation: "none",
                    }}
                  >
                    <Stack.Screen name="(tabs)" />
                  </Stack>
                  <CallScreen />
                </View>
              </DefaultDialerPrompt>
            </CallStateProvider>
          </RecentsProvider>
        </ContactsProvider>
      </GestureHandlerRootView>
    </View>
  );
};

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LayoutContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
