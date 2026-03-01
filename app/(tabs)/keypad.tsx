import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import KeypadButton from "../../components/KeypadButton";
import { CallLogsModule } from "../../modules/dialer-module";
import { useContacts } from "../../utils/AppProviders";
import { searchContactsT9 } from "../../utils/t9-search";
import theme from "../../utils/theme";

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
    const [phoneNumber, setPhoneNumber] = useState("");
    const { contacts } = useContacts();

    const t9Result = useMemo(() => {
        if (phoneNumber.length === 0) return null;
        const results = searchContactsT9(phoneNumber, contacts);
        return results.length > 0 ? results[0] : null;
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

    const handleLongPress = useCallback(
        (val: string) => {
            if (val === "0") handlePress("+");
            else if (val === "1") console.log("Call Voicemail");
            else handlePress(val);
        },
        [handlePress]
    );

    return (
        <>
            <View className="w-full flex-row justify-between items-center px-6 py-4">
                <Text className="text-2xl font-semibold text-textPrimary tracking-[-0.5px]">
                    {"Keypad"}
                </Text>
                <TouchableOpacity>
                    <FontAwesome name="search" size={22} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            <View className="flex-1 w-full justify-between items-center pb-5">
                <View className="flex-1 w-full flex-col justify-end items-center pb-6">
                    {t9Result ? (
                        <TouchableOpacity
                            className="mb-4 items-center bg-card px-6 py-2 rounded-2xl"
                            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 }}
                            onPress={() => {
                                if (t9Result.phoneNumbers && t9Result.phoneNumbers.length > 0) {
                                    CallLogsModule.makeCall(t9Result.phoneNumbers[0].number || "");
                                }
                            }}
                        >
                            <Text className="text-xl font-medium text-textPrimary">
                                {t9Result.name}
                            </Text>
                            {t9Result.phoneNumbers && t9Result.phoneNumbers.length > 0 ? (
                                <Text className="text-[13px] text-textSecondary mt-1">
                                    {t9Result.phoneNumbers[0].number}
                                </Text>
                            ) : null}
                        </TouchableOpacity>
                    ) : phoneNumber.length > 0 ? (
                        <TouchableOpacity className="mb-4">
                            <Text className="text-primary font-medium text-[17px]">
                                {"Add to contacts"}
                            </Text>
                        </TouchableOpacity>
                    ) : null}
                    <View className="flex flex-row items-center justify-center grow">
                        <Text
                            className="grow text-[36px] font-normal text-textPrimary text-center"
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {phoneNumber || " "}
                        </Text>
                        {/* Delete Digit Icon */}
                        {phoneNumber.length > 0 ? <TouchableOpacity
                            onPress={handleBackspace}
                            onLongPress={handleLongBackspace}
                            className="w-[70px] h-[70px] justify-center items-center"
                        >
                            <FontAwesome name="long-arrow-left" size={26} color={theme.colors.textPrimary} />
                        </TouchableOpacity> : null}
                    </View>
                </View>

                <View className="w-full items-center">
                    {padRows.map((row, rowIndex) => (
                        <View key={rowIndex} className="flex-row justify-center w-full mb-2">
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

                    <View className="flex-row justify-center items-center w-full mt-2">
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="bg-primary rounded-full w-[75px] h-[75px] justify-center items-center mx-3"
                            style={{
                                shadowColor: theme.colors.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 4
                            }}
                            onPress={dialNumber}
                        >
                            <FontAwesome name="phone" size={36} color={theme.colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </>
    );
}

export default React.memo(KeypadScreen);
