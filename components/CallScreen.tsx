import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  FadeInDown,
  SlideInDown,
  ZoomIn,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Phone,
  BellOff,
  MicOff,
  Grid,
  Volume2,
  X,
  Delete,
  Pause,
  Play,
  UserPlus,
  Users,
} from "lucide-react-native";
import { CallLogsModule } from "../modules/dialer-module";
import { useCallState, useContacts } from "../utils/AppProviders";
import theme from "../utils/theme";

const formatTimer = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const DTMF_KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "#"],
];

const CallScreen = () => {
  const { callState } = useCallState();
  const { contacts } = useContacts();
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [dtmfDigits, setDtmfDigits] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const wasInCall = useRef(false);

  useEffect(() => {
    if (callState) {
      wasInCall.current = true;
    }

    if (callState?.state === 4 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    if (!callState) {
      if (wasInCall.current) {
        // Call just concluded, minimize the app
        try {
          CallLogsModule.moveTaskToBack?.();
        } catch (_e) {}
        wasInCall.current = false;
      }

      setTimer(0);
      setIsMuted(false);
      setIsSpeaker(false);
      setShowKeypad(false);
      setDtmfDigits("");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [callState?.state]);

  // Sync native audio state to UI
  useEffect(() => {
    if (callState) {
      if (callState.isMuted !== undefined) setIsMuted(callState.isMuted);
      if (callState.audioRoute !== undefined)
        setIsSpeaker(callState.audioRoute === 2); // 2 is SPEAKER in Android
    }
  }, [callState?.isMuted, callState?.audioRoute]);

  const handleAnswer = useCallback(() => {
    try {
      CallLogsModule.answerCall?.();
    } catch (_e) {}
  }, []);
  const handleReject = useCallback(() => {
    try {
      CallLogsModule.rejectCall?.();
    } catch (_e) {}
  }, []);
  const handleEndCall = useCallback(() => {
    try {
      CallLogsModule.disconnectCall?.();
    } catch (_e) {}
  }, []);

  const handleToggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    try {
      CallLogsModule.toggleMute?.(newMuted);
    } catch (_e) {}
  }, [isMuted]);

  const handleToggleSpeaker = useCallback(() => {
    const newSpeaker = !isSpeaker;
    setIsSpeaker(newSpeaker);
    try {
      CallLogsModule.toggleSpeaker?.(newSpeaker);
    } catch (_e) {}
  }, [isSpeaker]);

  const handleToggleHold = useCallback(() => {
    const isOnHold = callState?.state === 3;
    try {
      CallLogsModule.toggleHold?.(!isOnHold);
    } catch (_e) {}
  }, [callState?.state]);

  const handleMerge = useCallback(() => {
    try {
      CallLogsModule.mergeCalls?.();
    } catch (_e) {}
  }, []);

  const [lastDigit, setLastDigit] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSendDtmf = useCallback((digit: string) => {
    setDtmfDigits((prev) => prev + digit);
    setLastDigit(digit);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => {
      setLastDigit(null);
      flashTimer.current = null;
    }, 800);

    try {
      CallLogsModule.sendDtmf?.(digit);
    } catch (_e) {}
  }, []);

  const handleBackspace = useCallback(() => {
    setDtmfDigits((prev) => prev.slice(0, -1));
    setLastDigit(null);
  }, []);

  const handleLongBackspace = useCallback(() => {
    setDtmfDigits("");
    setLastDigit(null);
  }, []);

  const matchedContact = React.useMemo(() => {
    if (!callState?.number || callState.number === "Unknown") return null;

    // Normalize: remove all non-digits
    const cleanNumber = callState.number.replace(/\D/g, "");
    if (!cleanNumber) return null;

    // Match based on the last 10 digits for better compatibility with/without country codes
    const matchTarget =
      cleanNumber.length >= 10 ? cleanNumber.slice(-10) : cleanNumber;

    return contacts.find((c) =>
      c.phoneNumbers?.some((p) => {
        const pClean = (p.number || "").replace(/\D/g, "");
        if (!pClean) return false;
        const pTarget = pClean.length >= 10 ? pClean.slice(-10) : pClean;
        return pTarget === matchTarget;
      }),
    );
  }, [contacts, callState?.number]);

  if (!callState) return null;

  const isRinging = callState.state === 2;
  const isHold = callState.state === 3;
  const isDialing = callState.state === 9 || callState.state === 1;
  const isActive = callState.state === 4;

  const statusText = isRinging
    ? "Incoming call"
    : isHold
      ? "On hold"
      : isDialing
        ? "Calling..."
        : isActive
          ? formatTimer(timer)
          : "Connecting...";

  // Prioritize matchedContact.name over callState.name
  const displayName =
    matchedContact?.name || callState.name || callState.number;

  const secondaryText = matchedContact ? callState.number : "Mobile";

  return (
    <Animated.View
      entering={SlideInDown.duration(400)}
      className="absolute inset-0 z-[9999] bg-background elevation-[999]"
    >
      <SafeAreaView className="flex-1">
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          className="items-center mt-10 h-[120px] justify-center"
        >
          {showKeypad && lastDigit ? (
            <Animated.Text
              key={dtmfDigits.length} // Force re-animation on new press
              entering={ZoomIn.duration(200)}
              className="text-primary text-[56px] font-light"
            >
              {lastDigit}
            </Animated.Text>
          ) : (
            <>
              <Text className="text-textSecondary text-base font-medium tracking-[1px] mb-2">
                {statusText}
              </Text>
              <Text
                className="text-textPrimary text-[28px] font-light tracking-[-0.5px] mb-2 text-center px-6"
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                {displayName}
              </Text>
              {showKeypad && dtmfDigits ? (
                <Text
                  className="text-textPrimary text-[24px] font-normal tracking-[2px] px-10"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {dtmfDigits}
                </Text>
              ) : (
                <Text className="text-textSecondary text-sm">
                  {secondaryText}
                </Text>
              )}
            </>
          )}
        </Animated.View>

        {!showKeypad ? (
          <Animated.View
            entering={ZoomIn.delay(300).duration(400)}
            className="items-center my-5 flex-1 justify-center"
          >
            <View className="w-[120px] h-[120px] rounded-[60px] bg-primaryLight justify-center items-center">
              <User size={56} color={theme.colors.primary} />
            </View>
          </Animated.View>
        ) : (
          <View className="flex-1 justify-center px-[50px]">
            {DTMF_KEYS.map((row, rowIdx) => (
              <View key={rowIdx} className="flex-row justify-evenly mb-3">
                {row.map((digit) => (
                  <TouchableOpacity
                    key={digit}
                    activeOpacity={0.6}
                    className="w-[72px] h-[72px] bg-card justify-center items-center active:bg-primaryLight"
                    onPress={() => handleSendDtmf(digit)}
                  >
                    <Text className="text-textPrimary text-[28px] font-light">
                      {digit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}

        {!isRinging && (
          <View>
            <Animated.View
              entering={FadeInDown.delay(100).duration(300)}
              className="flex-row justify-evenly px-[30px] mb-6"
            >
              <ActionButton
                Icon={MicOff}
                label="Mute"
                active={isMuted}
                onPress={handleToggleMute}
              />
              <ActionButton
                Icon={Grid}
                label={showKeypad ? "Hide" : "Keypad"}
                active={showKeypad}
                onPress={() => setShowKeypad(!showKeypad)}
              />
              <ActionButton
                Icon={Volume2}
                label="Speaker"
                active={isSpeaker}
                onPress={handleToggleSpeaker}
              />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(200).duration(300)}
              className="flex-row justify-evenly px-[30px] mb-8"
            >
              <ActionButton
                Icon={UserPlus}
                label="Add call"
                onPress={() => {
                  try {
                    CallLogsModule.moveTaskToBack?.();
                  } catch (_e) {}
                }}
              />
              <ActionButton
                Icon={isHold ? Play : Pause}
                label={isHold ? "Resume" : "Hold"}
                active={isHold}
                onPress={handleToggleHold}
              />
              <ActionButton
                Icon={Users}
                label="Merge"
                disabled={!callState?.callCount || callState.callCount < 2}
                onPress={handleMerge}
              />
            </Animated.View>
          </View>
        )}

        <Animated.View
          entering={FadeInDown.delay(500).duration(400)}
          className="px-10 pb-24"
        >
          {isRinging ? (
            <View className="flex-row justify-between items-end">
              <View className="items-center">
                <TouchableOpacity
                  className="w-[70px] h-[70px] rounded-full bg-danger justify-center items-center"
                  style={{
                    shadowColor: theme.colors.danger,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  onPress={handleReject}
                >
                  <X size={32} color="white" />
                </TouchableOpacity>
                <Text className="text-textSecondary text-[13px] mt-2 font-medium">
                  {"Decline"}
                </Text>
              </View>
              <View className="items-center">
                <TouchableOpacity
                  className="w-[60px] h-[60px] rounded-[30px] bg-primaryLight justify-center items-center"
                  onPress={() => {
                    try {
                      CallLogsModule.silenceRingtone?.();
                    } catch (_e) {}
                  }}
                >
                  <BellOff size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text className="text-textSecondary text-[13px] mt-2 font-medium">
                  {"Silence"}
                </Text>
              </View>
              <View className="items-center">
                <TouchableOpacity
                  className="w-[70px] h-[70px] rounded-full bg-success justify-center items-center"
                  style={{
                    shadowColor: theme.colors.success,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  onPress={handleAnswer}
                >
                  <Phone size={32} color="white" />
                </TouchableOpacity>
                <Text className="text-textSecondary text-[13px] mt-2 font-medium">
                  {"Accept"}
                </Text>
              </View>
            </View>
          ) : (
            <View className="relative flex-row justify-center items-center">
              <TouchableOpacity
                className="w-[75px] h-[75px] rounded-[37.5px] bg-danger justify-center items-center"
                style={{
                  shadowColor: theme.colors.danger,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={handleEndCall}
              >
                <Phone size={32} color="white" />
              </TouchableOpacity>

              {showKeypad && dtmfDigits.length > 0 && (
                <TouchableOpacity
                  onPress={handleBackspace}
                  onLongPress={handleLongBackspace}
                  className="absolute right-8 w-[60px] h-[60px] justify-center items-center"
                >
                  <Delete size={28} color={theme.colors.textPrimary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
};

const ActionButton = ({
  Icon,
  label,
  active,
  disabled,
  onPress,
}: {
  Icon: any;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={`w-[72px] h-[72px] rounded-[36px] justify-center items-center ${active ? "bg-primary" : "bg-primaryLight"}`}
    style={{ opacity: disabled ? 0.3 : 1 }}
  >
    <Icon
      size={18}
      color={active ? theme.colors.white : theme.colors.primary}
    />
    <Text
      className={`text-[11px] mt-1 font-medium ${active ? "text-primaryLight" : "text-primary"}`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export default React.memo(CallScreen);
