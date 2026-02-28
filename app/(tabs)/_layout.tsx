import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import theme from "../../utils/theme";

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 75,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShown: false,
        freezeOnBlur: true,
        animation: "none",
      }}
    >
      <Tabs.Screen
        name="keypad"
        options={{
          title: "Keypad",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="th" color={color} />
          ),

        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Recents",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="clock-o" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: "Contacts",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
