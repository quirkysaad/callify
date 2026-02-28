import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import * as ContactsModule from "expo-contacts";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { CallLogsModule } from "../../modules/dialer-module";
import { useContacts } from "../../utils/AppProviders";
import { loadSpamNumbers, isSpamSync } from "../../utils/spam";
import theme from "../../utils/theme";
import Animated, { FadeInUp } from "react-native-reanimated";

const ITEM_HEIGHT = 73;

const ContactItem = React.memo(({ item, onPress, onCall, isSpam }: {
  item: ContactsModule.Contact;
  onPress: () => void;
  onCall: (n: string) => void;
  isSpam: boolean;
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    className="flex-row items-center px-4 py-[14px] bg-card border-b-[0.5px] border-border h-[73px] mx-4 mb-2 rounded-2xl"
  >
    <View
      className="w-11 h-11 rounded-full mr-4 justify-center items-center"
      style={{ backgroundColor: isSpam ? theme.colors.danger + "22" : theme.colors.primaryLight }}
    >
      {isSpam ? (
        <FontAwesome name="exclamation-triangle" size={18} color={theme.colors.danger} />
      ) : (
        <FontAwesome name="user" size={20} color={theme.colors.primary} />
      )}
    </View>
    <View className="flex-1">
      <View className="flex-row items-center gap-[6px]">
        <Text
          className="text-base font-medium"
          style={{ color: isSpam ? theme.colors.danger : theme.colors.textPrimary }}
          numberOfLines={1}
        >
          {item.name || "No Name"}
        </Text>
        {isSpam ? (
          <Text className="text-[11px] font-semibold" style={{ color: theme.colors.danger }}>{"SPAM"}</Text>
        ) : null}
      </View>
      {item.phoneNumbers && item.phoneNumbers.length > 0 ? (
        <Text className="text-[13px] text-textSecondary mt-0.5">
          {item.phoneNumbers[0].number}
        </Text>
      ) : null}
    </View>
    <TouchableOpacity
      onPress={(e) => {
        e.stopPropagation?.();
        if (item.phoneNumbers && item.phoneNumbers.length > 0) {
          onCall(item.phoneNumbers[0].number || "");
        }
      }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      className="p-2 bg-primaryLight rounded-[20px] w-10 h-10 justify-center items-center"
    >
      <FontAwesome name="phone" size={18} color={theme.colors.primary} />
    </TouchableOpacity>
  </TouchableOpacity>
));

function Contacts() {
  const { contacts, loading } = useContacts();
  const router = useRouter();
  const [spamLoaded, setSpamLoaded] = useState(false);

  useEffect(() => {
    loadSpamNumbers().then(() => setSpamLoaded(true));
  }, []);

  const handleCallContact = useCallback((number: string) => {
    if (number) {
      CallLogsModule.makeCall(number);
    }
  }, []);

  const handleOpenContact = useCallback((id: string) => {
    router.push(`/contact/${id}`);
  }, [router]);

  const handleCreateContact = useCallback(() => {
    router.push("/contact/create");
  }, [router]);

  const keyExtractor = useCallback(
    (item: ContactsModule.Contact, index: number) => item.id || `contact-${index}`,
    []
  );

  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <>
      <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
        <Text className="text-[28px] font-bold text-textPrimary tracking-[-0.5px]">
          {"Contacts"}
        </Text>
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={handleCreateContact}>
            <FontAwesome name="plus" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : contacts.length > 0 ? (
          <FlatList
            data={contacts}
            keyExtractor={keyExtractor}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInUp.delay((index % 20) * 30).springify()}>
                <ContactItem
                  item={item}
                  onPress={() => handleOpenContact(item.id!)}
                  onCall={handleCallContact}
                  isSpam={spamLoaded && item.phoneNumbers?.[0]?.number ? isSpamSync(item.phoneNumbers[0].number) : false}
                />
              </Animated.View>
            )}
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={5}
            removeClippedSubviews={true}
            getItemLayout={getItemLayout}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <FontAwesome name="address-book-o" size={48} color={theme.colors.border} />
            <Text className="text-textSecondary text-[17px] mt-4 font-medium">
              {"No contacts found"}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

export default React.memo(Contacts);
