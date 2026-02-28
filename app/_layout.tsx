import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import CallScreen from "../components/CallScreen";
import { CallLogsModule } from "../modules/dialer-module";
import { ContactsProvider, RecentsProvider, CallStateProvider } from "../utils/AppProviders";
import theme from "../utils/theme";

const RootLayout = () => {
  useEffect(() => {
    (async () => {
      try {
        await CallLogsModule.requestDefaultDialer();
      } catch (e) {
        console.log("Error requesting default dialer", e);
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ContactsProvider>
        <RecentsProvider>
          <CallStateProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  paddingTop: StatusBar.currentHeight,
                  backgroundColor: theme.colors.background,
                },
                animation: "none",
              }}
            >
              <Stack.Screen name="(tabs)" />
            </Stack>
            <CallScreen />
          </CallStateProvider>
        </RecentsProvider>
      </ContactsProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
