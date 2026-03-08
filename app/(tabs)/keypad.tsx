import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { Phone, Delete, UserPlus, MessageCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import KeypadButton from "../../components/KeypadButton";
import ActionButton from "../../components/ActionButton";
import { CallLogsModule } from "../../modules/dialer-module";
import { useContacts, useCallState } from "../../utils/AppProviders";
import { searchContactsT9 } from "../../utils/t9-search";
import theme from "../../utils/theme";
import ContactItem from "../../components/ContactItem";

const padRows = [
  [
    { number: "1", letters: " " },
    { number: "2", letters: "ABC" },
    { number: "3", letters: "DEF" },
  ],
  [
    { number: "4", letters: "GHI" },
    { number: "5", letters: "JKL" },
    { number: "6", letters: "MNO" },
  ],
  [
    { number: "7", letters: "PQRS" },
    { number: "8", letters: "TUV" },
    { number: "9", letters: "WXYZ" },
  ],
  [
    { number: "*", letters: "" },
    { number: "0", letters: "+" },
    { number: "#", letters: "" },
  ],
];

function KeypadScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const { contacts } = useContacts();

  const t9Results = useMemo(() => {
    if (phoneNumber.length === 0) return [];
    return searchContactsT9(phoneNumber, contacts).slice(0, 5); // Show top 5 fuzzy matches
  }, [phoneNumber, contacts]);

  const handlePress = useCallback((val: string) => {
    setPhoneNumber((prev) => prev + val);
  }, []);

  const handleBackspace = useCallback(() => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  }, []);

  const handleLongBackspace = useCallback(() => {
    setPhoneNumber("");
  }, []);

  const dialNumber = useCallback(async () => {
    if (!phoneNumber) return;
    try {
      await CallLogsModule.makeCall(phoneNumber);
    } catch (e) {
      console.log("Call failed", e);
    }
  }, [phoneNumber]);

  const { setCallState } = useCallState();

  const handleMockCall = useCallback(() => {
    setCallState({
      number: phoneNumber || "+1 234 567 8900",
      name: phoneNumber ? undefined : "Mock Contact Long Name Sample",
      state: 4, // RINGING
      callCount: 2,
    });
  }, [phoneNumber, setCallState]);

  const handleLongPress = useCallback(
    (val: string) => {
      if (val === "0") handlePress("+");
      else if (val === "1") console.log("Call Voicemail");
      else handlePress(val);
    },
    [handlePress],
  );

  return (
    <>
      <View className="flex-1 w-full justify-between items-center pb-5">
        <View className="flex-1 w-full flex-col justify-end items-center">
          <ScrollView
            className="flex-1 flex-start grow w-full mb-2"
            showsVerticalScrollIndicator={false}
          >
            {t9Results.map((result, index) => (
              <ContactItem
                key={(result as any).id || index.toString()}
                item={result}
                index={index}
                isLastLogOfSection={index === t9Results.length - 1}
                onCall={(num) => CallLogsModule.makeCall(num)}
                className="w-full"
                onPress={() => {
                  if ((result as any).id) {
                    router.push(`/contact/${(result as any).id}`);
                  }
                }}
              />
            ))}

            {phoneNumber.length > 0 && (
              <View className="px-6 pt-4 pb-2 w-full flex flex-row gap-3">
                <ActionButton
                  icon={UserPlus}
                  label="Create new contact"
                  onPress={() => {
                    router.push({
                      pathname: "/contact/create",
                      params: { number: phoneNumber },
                    });
                  }}
                  className="grow"
                />
                <ActionButton
                  icon={MessageCircle}
                  label=""
                  onPress={() => {
                    const cleanNumber =
                      phoneNumber?.replace(/[\s-()]/g, "") || "";
                    Linking.openURL(`sms:${cleanNumber}`);
                  }}
                />
              </View>
            )}
          </ScrollView>

          <View className="flex flex-row items-center justify-center pb-2 px-6">
            <Text
              className="grow text-[36px] font-normal text-textPrimary text-center"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {phoneNumber || " "}
            </Text>
          </View>
        </View>

        <View className="w-full items-center">
          {padRows.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row justify-center w-full">
              {row.map((btn, btnIndex) => (
                <View key={btn.number}>
                  <KeypadButton
                    number={btn.number}
                    letters={btn.letters}
                    onPress={handlePress}
                    onLongPress={handleLongPress}
                    className="mx-3"
                  />
                </View>
              ))}
            </View>
          ))}

          <View className="relative flex-row justify-center items-center w-full mt-2">
            {/* <View className="w-[70px]" /> */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="bg-success rounded-full w-[70px] h-[70px] justify-center items-center"
              style={{
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={dialNumber}
              onLongPress={__DEV__ ? handleMockCall : undefined}
            >
              <Phone size={36} color={theme.colors.white} />
            </TouchableOpacity>

            {/* Delete Digit Icon */}
            {phoneNumber.length > 0 && (
              <TouchableOpacity
                onPress={handleBackspace}
                onLongPress={handleLongBackspace}
                className="absolute right-[40px] w-[80px] h-[80px] justify-center items-center"
              >
                <Delete size={28} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </>
  );
}

export default React.memo(KeypadScreen);
