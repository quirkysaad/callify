import React, { useCallback, useEffect, useState } from "react";
import { View, Text, SectionList, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as ContactsModule from "expo-contacts";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { CallLogsModule } from "../../modules/dialer-module";
import { useContacts } from "../../utils/AppProviders";
import theme from "../../utils/theme";
import clsx from "clsx";

const ContactItem = React.memo(({ item, index, onPress, onCall, isLastLogOfSection }: {
  item: ContactsModule.Contact;
  index: number;
  isLastLogOfSection: boolean;
  onPress: () => void;
  onCall: (n: string) => void;
}) => (
  <View>
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={clsx("flex-row items-center border-b-[0.5px] border-border px-4 py-5 mx-4 bg-card", {
        "rounded-t-2xl": index === 0,
        "rounded-b-2xl": isLastLogOfSection,
      })}
    >
      <View
        className="w-11 h-11 rounded-full mr-4 justify-center items-center"
        style={{ backgroundColor: theme.colors.primaryLight }}
      >
        <FontAwesome name="user" size={20} color={theme.colors.primary} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-[6px]">
          <Text
            className="text-base font-medium"
            style={{ color: theme.colors.textPrimary }}
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
  </View>
));

function Contacts() {
  const { contacts, loading } = useContacts();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const sections = React.useMemo(() => {
    let filteredContacts = contacts;
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.trim().toLowerCase();
      filteredContacts = contacts.filter((c) => {
        const matchName = c.name?.toLowerCase().includes(lowerQuery);
        const matchPhone = c.phoneNumbers?.some((p) => p.number?.toLowerCase().includes(lowerQuery));
        return matchName || matchPhone;
      });
    }

    const grouped = filteredContacts.reduce((acc, contact) => {
      let initial = contact.name?.trim()?.[0]?.toUpperCase() || "#";
      if (!/[A-Z]/.test(initial)) {
        initial = "#";
      }
      if (!acc[initial]) {
        acc[initial] = [];
      }
      acc[initial].push(contact);
      return acc;
    }, {} as Record<string, ContactsModule.Contact[]>);

    return Object.keys(grouped)
      .sort((a, b) => {
        if (a === "#") return 1;
        if (b === "#") return -1;
        return a.localeCompare(b);
      })
      .map((key) => ({
        title: key,
        data: grouped[key].sort((c1, c2) => (c1.name || "").localeCompare(c2.name || "")),
      }));
  }, [contacts, searchQuery]);

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

      <View className="px-5 pb-3">
        <View className="flex-row items-center bg-card rounded-xl px-4 py-2 border border-border">
          <FontAwesome name="search" size={16} color={theme.colors.textSecondary} />
          <TextInput
            className="flex-1 ml-2 text-base text-textPrimary"
            placeholder="Search contacts..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} className="p-1">
              <FontAwesome name="times-circle" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : contacts.length > 0 ? (
          <SectionList
            sections={sections}
            keyExtractor={keyExtractor}
            renderItem={({ section, item, index }) => (
              <ContactItem
                item={item}
                index={index}
                onPress={() => handleOpenContact(item.id!)}
                onCall={handleCallContact}
                isLastLogOfSection={index === section.data.length - 1}
              />
            )}
            renderSectionHeader={({ section }) => (
              <View className="mx-6 mt-4 mb-2 bg-background">
                <Text className="text-textSecondary font-semibold text-[13px] uppercase tracking-[0.5px]">
                  {section.title}
                </Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={5}
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
