import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

const EMOJI_OPTIONS = [
  { emoji: "😴", label: "Exhausted", score: 1 },
  { emoji: "😔", label: "Tired", score: 2 },
  { emoji: "😐", label: "Okay", score: 3 },
  { emoji: "😊", label: "Good", score: 4 },
  { emoji: "🌟", label: "Energized", score: 5 },
];

export function MorningPulse() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { morningPulseShown, addAlertnessEntry, setMorningPulseShown, alertnessEntries } = useApp();
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isVisible = !morningPulseShown;

  useEffect(() => {
    if (isVisible) {
      setSelected(null);
      setSubmitted(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const lastScore = alertnessEntries.length > 0 ? alertnessEntries[0].score : null;

  async function handleSelect(score: number) {
    await Haptics.selectionAsync();
    setSelected(score);
  }

  async function handleSubmit() {
    if (selected === null) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const today = new Date().toISOString().split("T")[0];
    await addAlertnessEntry({ date: today, score: selected });
    setSubmitted(true);
    setTimeout(() => {
      setMorningPulseShown(true);
    }, 1200);
  }

  async function handleSkip() {
    await setMorningPulseShown(true);
  }

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(74, 55, 40, 0.4)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.cream,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: Math.max(insets.bottom, 24),
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: "700" as const,
      color: colors.warmBrown,
      textAlign: "center",
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 8,
    },
    lastScore: {
      fontSize: 13,
      color: colors.sage,
      textAlign: "center",
      marginBottom: 20,
    },
    emojiRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
      paddingHorizontal: 8,
    },
    emojiBtn: {
      alignItems: "center",
      padding: 10,
      borderRadius: 20,
      flex: 1,
      marginHorizontal: 2,
    },
    emojiBtnSelected: {
      backgroundColor: colors.lavender,
    },
    emojiText: {
      fontSize: 32,
    },
    emojiLabel: {
      fontSize: 10,
      marginTop: 4,
      color: colors.mutedForeground,
      textAlign: "center",
    },
    emojiLabelSelected: {
      color: colors.sage,
      fontWeight: "600" as const,
    },
    selectHint: {
      textAlign: "center",
      fontSize: 13,
      color: colors.mutedForeground,
      marginBottom: 10,
    },
    submitBtn: {
      backgroundColor: colors.sage,
      borderRadius: 100,
      paddingVertical: 16,
      alignItems: "center",
      marginBottom: 12,
    },
    submitBtnDisabled: {
      backgroundColor: colors.border,
    },
    submitText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700" as const,
    },
    skipBtn: {
      alignItems: "center",
      paddingVertical: 10,
    },
    skipText: {
      color: colors.mutedForeground,
      fontSize: 14,
    },
    successContainer: {
      alignItems: "center",
      paddingVertical: 24,
    },
    successEmoji: {
      fontSize: 56,
      marginBottom: 12,
    },
    successText: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.warmBrown,
    },
  });

  return (
    <Modal transparent animationType="slide" visible statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {submitted ? (
            <View style={styles.successContainer}>
              <Text style={styles.successEmoji}>
                {EMOJI_OPTIONS.find((e) => e.score === selected)?.emoji}
              </Text>
              <Text style={styles.successText}>Thanks for checking in!</Text>
            </View>
          ) : (
            <>
              <Text style={styles.title}>Good morning!</Text>
              <Text style={styles.subtitle}>
                How alert and rested do you feel right now?
              </Text>
              {lastScore !== null && (
                <Text style={styles.lastScore}>
                  Yesterday you scored:{" "}
                  {EMOJI_OPTIONS.find((e) => e.score === lastScore)?.emoji}{" "}
                  {EMOJI_OPTIONS.find((e) => e.score === lastScore)?.label}
                </Text>
              )}
              <View style={styles.emojiRow}>
                {EMOJI_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.score}
                    style={[
                      styles.emojiBtn,
                      selected === opt.score && styles.emojiBtnSelected,
                    ]}
                    onPress={() => handleSelect(opt.score)}
                    testID={`pulse-emoji-${opt.score}`}
                  >
                    <Text style={styles.emojiText}>{opt.emoji}</Text>
                    <Text
                      style={[
                        styles.emojiLabel,
                        selected === opt.score && styles.emojiLabelSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selected === null && (
                <Text style={styles.selectHint}>Tap a mood above to continue</Text>
              )}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  selected === null && styles.submitBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={selected === null}
                testID="pulse-submit"
              >
                <Text style={styles.submitText}>Log My Score</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
