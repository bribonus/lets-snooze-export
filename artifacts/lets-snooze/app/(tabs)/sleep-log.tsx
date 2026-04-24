import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, type SleepEntry } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m > 0 ? m + "m" : ""}`.trim();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  if (dateStr === todayStr) return "Today";
  if (dateStr === yesterdayStr) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getDurationColor(minutes: number, colors: ReturnType<typeof useColors>): string {
  if (minutes >= 420) return "#7db87d";
  if (minutes >= 360) return colors.sage;
  return "#e08080";
}

interface LogModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (entry: { date: string; sleepTime: string; wakeTime: string; note?: string }) => void;
}

function LogModal({ visible, onClose, onSave }: LogModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [sleepTime, setSleepTime] = useState("22:30");
  const [wakeTime, setWakeTime] = useState("06:30");
  const [note, setNote] = useState("");

  function handleSave() {
    if (!date || !sleepTime || !wakeTime) {
      Alert.alert("Missing fields", "Please fill in all required fields.");
      return;
    }
    onSave({ date, sleepTime, wakeTime, note: note || undefined });
    setDate(today);
    setSleepTime("22:30");
    setWakeTime("06:30");
    setNote("");
    onClose();
  }

  const s = StyleSheet.create({
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
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.warmBrown,
      marginBottom: 20,
    },
    label: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginBottom: 6,
      fontWeight: "500" as const,
    },
    input: {
      backgroundColor: colors.lavender,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.warmBrown,
      marginBottom: 16,
    },
    row: {
      flexDirection: "row",
      gap: 12,
    },
    half: { flex: 1 },
    saveBtn: {
      backgroundColor: colors.sage,
      borderRadius: 100,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 8,
    },
    saveBtnText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700" as const,
    },
    cancelBtn: {
      alignItems: "center",
      paddingVertical: 12,
    },
    cancelText: {
      color: colors.mutedForeground,
      fontSize: 14,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={s.overlay}>
        <ScrollView
          contentContainerStyle={s.sheet}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={s.handle} />
          <Text style={s.title}>Log Sleep</Text>
          <Text style={s.label}>Date</Text>
          <TextInput
            style={s.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.mutedForeground}
            testID="log-date"
          />
          <View style={s.row}>
            <View style={s.half}>
              <Text style={s.label}>Fell asleep</Text>
              <TextInput
                style={s.input}
                value={sleepTime}
                onChangeText={setSleepTime}
                placeholder="22:30"
                placeholderTextColor={colors.mutedForeground}
                testID="log-sleep-time"
              />
            </View>
            <View style={s.half}>
              <Text style={s.label}>Woke up</Text>
              <TextInput
                style={s.input}
                value={wakeTime}
                onChangeText={setWakeTime}
                placeholder="06:30"
                placeholderTextColor={colors.mutedForeground}
                testID="log-wake-time"
              />
            </View>
          </View>
          <Text style={s.label}>Note (optional)</Text>
          <TextInput
            style={[s.input, { minHeight: 60 }]}
            value={note}
            onChangeText={setNote}
            placeholder="How did you sleep?"
            placeholderTextColor={colors.mutedForeground}
            multiline
            testID="log-note"
          />
          <TouchableOpacity style={s.saveBtn} onPress={handleSave} testID="log-save">
            <Text style={s.saveBtnText}>Save Entry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
            <Text style={s.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

function SleepCard({ entry, onDelete }: { entry: SleepEntry; onDelete: () => void }) {
  const colors = useColors();
  const durationColor = getDurationColor(entry.durationMinutes, colors);

  const s = StyleSheet.create({
    card: {
      backgroundColor: colors.lavender,
      borderRadius: 20,
      padding: 18,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
    },
    left: { flex: 1 },
    dateText: {
      fontSize: 15,
      fontWeight: "700" as const,
      color: colors.warmBrown,
      marginBottom: 4,
    },
    timeText: {
      fontSize: 13,
      color: colors.mutedForeground,
    },
    note: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 4,
      fontStyle: "italic",
    },
    right: { alignItems: "flex-end", gap: 8 },
    duration: {
      fontSize: 18,
      fontWeight: "800" as const,
      color: durationColor,
    },
    deleteBtn: {
      padding: 6,
    },
  });

  return (
    <View style={s.card}>
      <View style={s.left}>
        <Text style={s.dateText}>{formatDate(entry.date)}</Text>
        <Text style={s.timeText}>
          {entry.sleepTime} → {entry.wakeTime}
        </Text>
        {entry.note ? <Text style={s.note}>{entry.note}</Text> : null}
      </View>
      <View style={s.right}>
        <Text style={s.duration}>{formatDuration(entry.durationMinutes)}</Text>
        <TouchableOpacity
          style={s.deleteBtn}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert("Delete entry?", "This cannot be undone.", [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: onDelete },
            ]);
          }}
        >
          <Feather name="trash-2" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SleepLogScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sleepEntries, addSleepEntry, deleteSleepEntry, currentStreak } = useApp();
  const [showModal, setShowModal] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const avgDuration =
    sleepEntries.length > 0
      ? sleepEntries.slice(0, 7).reduce((sum, e) => sum + e.durationMinutes, 0) /
        Math.min(sleepEntries.length, 7)
      : 0;

  const s = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.peach,
    },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 24,
      paddingBottom: 16,
      backgroundColor: colors.peach,
    },
    greeting: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginBottom: 4,
    },
    title: {
      fontSize: 28,
      fontWeight: "800" as const,
      color: colors.warmBrown,
    },
    statsRow: {
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 24,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.lavender,
      borderRadius: 20,
      padding: 16,
      alignItems: "center",
    },
    statValue: {
      fontSize: 24,
      fontWeight: "800" as const,
      color: colors.warmBrown,
    },
    statLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      marginTop: 2,
      textAlign: "center",
    },
    statHint: {
      fontSize: 9,
      color: colors.mutedForeground,
      marginTop: 1,
      textAlign: "center",
      opacity: 0.7,
    },
    addBtn: {
      marginHorizontal: 24,
      backgroundColor: colors.sage,
      borderRadius: 100,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 20,
    },
    addBtnText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700" as const,
    },
    listContent: {
      paddingHorizontal: 24,
      paddingBottom: bottomPad + 100,
    },
    emptyContainer: {
      alignItems: "center",
      paddingTop: 48,
      paddingHorizontal: 24,
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.lavender,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.warmBrown,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "700" as const,
      color: colors.mutedForeground,
      marginBottom: 12,
      paddingHorizontal: 24,
    },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.greeting}>Track your rest</Text>
        <Text style={s.title}>My Sleep Log</Text>
      </View>

      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Text style={s.statValue}>
            {avgDuration > 0 ? formatDuration(Math.round(avgDuration)) : "—"}
          </Text>
          <Text style={s.statLabel}>7-day avg</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statValue}>{sleepEntries.length}</Text>
          <Text style={s.statLabel}>nights logged</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statValue}>{currentStreak}</Text>
          <Text style={s.statLabel}>screen-free streak</Text>
          <Text style={s.statHint}>via Sleep Window</Text>
        </View>
      </View>

      <TouchableOpacity
        style={s.addBtn}
        onPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowModal(true);
        }}
        testID="add-sleep-btn"
      >
        <Feather name="plus" size={20} color="#fff" />
        <Text style={s.addBtnText}>+ Log New Sleep</Text>
      </TouchableOpacity>

      {sleepEntries.length > 0 && (
        <Text style={s.sectionTitle}>Recent entries</Text>
      )}

      <FlatList
        data={sleepEntries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        scrollEnabled={sleepEntries.length > 0}
        renderItem={({ item }) => (
          <SleepCard
            entry={item}
            onDelete={() => deleteSleepEntry(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <View style={s.emptyIcon}>
              <Feather name="moon" size={28} color={colors.sage} />
            </View>
            <Text style={s.emptyTitle}>No sleep logged yet</Text>
            <Text style={s.emptyText}>
              Tap the button above to log your first night of sleep and start tracking your progress.
            </Text>
          </View>
        }
      />

      <LogModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={addSleepEntry}
      />
    </View>
  );
}
