import React, { useCallback, useEffect, useState } from "react";
import { View, Text, SectionList, TouchableOpacity, ActivityIndicator } from "react-native";
import CallLog from "../../components/CallLog";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRecents } from "../../utils/AppProviders";
import { loadSpamNumbers } from "../../utils/spam";
import theme from "../../utils/theme";
import Animated, { FadeInUp } from "react-native-reanimated";

const Home = () => {
  const { sections, loading, loadMore, hasMore } = useRecents();
  const [spamUpdated, setSpamUpdated] = useState(0);

  useEffect(() => {
    loadSpamNumbers().then(() => setSpamUpdated((prev) => prev + 1));
  }, []);

  const handleSpamStatusChanged = useCallback(() => {
    setSpamUpdated((prev) => prev + 1);
  }, []);

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;
    return (
      <View className="py-5 items-center">
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [hasMore]);

  return (
    <>
      <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
        <Text className="text-[28px] font-bold text-textPrimary tracking-[-0.5px]">
          {"Recents"}
        </Text>
        <View className="flex-row gap-4">
          <TouchableOpacity>
            <FontAwesome name="search" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity>
            <FontAwesome name="ellipsis-v" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 pt-2">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : sections.length > 0 ? (
          <SectionList
            className="bg-background px-2"
            sections={sections}
            stickySectionHeadersEnabled={false}
            renderItem={({ section, item, index }) => (
              <Animated.View entering={FadeInUp.delay(index * 50).springify()}>
                <CallLog
                  key={`${index}-${spamUpdated}`}
                  logItem={item}
                  logIndex={index}
                  isLastLogOfSection={index === section.data.length - 1}
                  onSpamStatusChanged={handleSpamStatusChanged}
                />
              </Animated.View>
            )}
            renderSectionHeader={({ section }) => (
              <View className="mx-5 mt-6 mb-2">
                <Text className="text-textSecondary font-semibold text-[13px] uppercase tracking-[0.5px]">
                  {section.title}
                </Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <FontAwesome name="clock-o" size={48} color={theme.colors.border} />
            <Text className="text-textSecondary text-[17px] mt-4 font-medium">
              {"No recent calls"}
            </Text>
          </View>
        )}
      </View>
    </>
  );
};

export default React.memo(Home);
