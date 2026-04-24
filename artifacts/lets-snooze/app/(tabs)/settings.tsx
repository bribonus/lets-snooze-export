import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { getReminderTime } from "@/services/notifications";

function getReminderTimeLabel(bedtime: string): string {
  const t = getReminderTime(bedtime);
  if (!t) return "";
  const period = t.hour < 12 ? "AM" : "PM";
  const hour12 = t.hour % 12 === 0 ? 12 : t.hour % 12;
  return `${hour12}:${String(t.minute).padStart(2, "0")} ${period}`;
}
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

function SettingRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: FeatherIconName;
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  const colors = useColors();
  const s = StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.peach,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    label: {
      flex: 1,
      fontSize: 15,
      color: colors.warmBrown,
      fontWeight: "500" as const,
    },
    value: {
      fontSize: 15,
      color: colors.mutedForeground,
      marginRight: 6,
    },
  });
  return (
    <TouchableOpacity style={s.row} onPress={onPress} disabled={!onPress}>
      <View style={s.iconBox}>
        <Feather name={icon} size={18} color={colors.sage} />
      </View>
      <Text style={s.label}>{label}</Text>
      {value !== undefined && <Text style={s.value}>{value}</Text>}
      {onPress && <Feather name="chevron-right" size={18} color={colors.border} />}
    </TouchableOpacity>
  );
}

interface AppToggleRowProps {
  icon: FeatherIconName;
  label: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
}

function AppToggleRow({ icon, label, enabled, onToggle }: AppToggleRowProps) {
  const colors = useColors();
  const s = StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: enabled ? colors.lavender : colors.muted,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    label: {
      flex: 1,
      fontSize: 15,
      color: colors.warmBrown,
      fontWeight: "500" as const,
    },
  });
  return (
    <View style={s.row}>
      <View style={s.iconBox}>
        <Feather name={icon} size={18} color={enabled ? colors.sage : colors.mutedForeground} />
      </View>
      <Text style={s.label}>{label}</Text>
      <Switch
        value={enabled}
        onValueChange={async (v) => {
          await Haptics.selectionAsync();
          onToggle(v);
        }}
        trackColor={{ false: colors.border, true: colors.sage }}
        thumbColor="#fff"
      />
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    appSettings,
    updateAppSettings,
    sleepEntries,
    alertnessEntries,
    curfewSettings,
    updateCurfewSettings,
  } = useApp();

  const [bedtime, setBedtime] = useState(appSettings.targetBedtime);
  const [wakeTime, setWakeTime] = useState(appSettings.targetWakeTime);
  const [notificationsEnabled, setNotificationsEnabled] = useState(appSettings.notificationsEnabled);
  const [editing, setEditing] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  async function handleSave() {
    await updateAppSettings({
      targetBedtime: bedtime,
      targetWakeTime: wakeTime,
      notificationsEnabled,
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditing(false);
  }

  function updateAppRestriction(key: keyof typeof curfewSettings.restrictedApps, value: boolean) {
    updateCurfewSettings({
      restrictedApps: { ...curfewSettings.restrictedApps, [key]: value },
    });
  }

  function handleClearData() {
    Alert.alert(
      "Clear all data?",
      "This will delete all sleep logs, alertness scores, and streak data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: () => {
            Alert.alert("Coming soon", "Data clearing will be available in a future update.");
          },
        },
      ]
    );
  }

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
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
    titleGroup: {},
    subtitle: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginBottom: 4,
    },
    title: {
      fontSize: 28,
      fontWeight: "800" as const,
      color: colors.warmBrown,
    },
    editBtn: {
      backgroundColor: colors.lavender,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    editBtnText: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: colors.sage,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: bottomPad + 100,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: colors.mutedForeground,
      textTransform: "uppercase" as const,
      letterSpacing: 0.8,
      marginBottom: 8,
      marginTop: 20,
    },
    card: {
      backgroundColor: colors.lavender,
      borderRadius: 20,
      paddingHorizontal: 18,
      overflow: "hidden",
    },
    label: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginTop: 16,
      marginBottom: 6,
      fontWeight: "500" as const,
    },
    input: {
      backgroundColor: colors.cream,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.warmBrown,
      marginBottom: 16,
    },
    notifRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      gap: 12,
    },
    notifLabel: {
      fontSize: 15,
      color: colors.warmBrown,
      fontWeight: "500" as const,
      marginBottom: 2,
    },
    notifSubtitle: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
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
    appsSubtitle: {
      fontSize: 13,
      color: colors.mutedForeground,
      paddingTop: 12,
      paddingBottom: 4,
    },
    subSectionHeader: {
      fontSize: 12,
      fontWeight: "700" as const,
      color: colors.mutedForeground,
      textTransform: "uppercase" as const,
      letterSpacing: 0.8,
      paddingTop: 12,
      paddingBottom: 2,
    },
    statsCard: {
      backgroundColor: colors.lavender,
      borderRadius: 20,
      padding: 20,
    },
    statRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statLabel: {
      fontSize: 14,
      color: colors.mutedForeground,
    },
    statValue: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: colors.warmBrown,
    },
    dangerCard: {
      backgroundColor: "#fde8e8",
      borderRadius: 20,
      paddingHorizontal: 18,
      overflow: "hidden",
    },
    dangerBtn: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      gap: 12,
    },
    dangerText: {
      fontSize: 15,
      color: "#e08080",
      fontWeight: "500" as const,
    },
    aboutCard: {
      backgroundColor: colors.lavender,
      borderRadius: 20,
      padding: 20,
    },
    aboutTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.warmBrown,
      marginBottom: 8,
    },
    aboutText: {
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 20,
    },
    versionText: {
      fontSize: 12,
      color: colors.border,
      textAlign: "center",
      marginTop: 16,
    },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.titleGroup}>
          <Text style={s.subtitle}>Customize your experience</Text>
          <Text style={s.title}>Settings</Text>
        </View>
        <TouchableOpacity
          style={s.editBtn}
          onPress={editing ? handleSave : () => setEditing(true)}
          testID="settings-edit"
        >
          <Text style={s.editBtnText}>{editing ? "Save" : "Edit"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTitle}>Sleep Schedule</Text>
        <View style={s.card}>
          {editing ? (
            <>
              <Text style={s.label}>Target Bedtime</Text>
              <TextInput
                style={s.input}
                value={bedtime}
                onChangeText={setBedtime}
                placeholder="22:00"
                placeholderTextColor={colors.mutedForeground}
                testID="settings-bedtime"
              />
              <Text style={s.label}>Target Wake Time</Text>
              <TextInput
                style={s.input}
                value={wakeTime}
                onChangeText={setWakeTime}
                placeholder="06:30"
                placeholderTextColor={colors.mutedForeground}
                testID="settings-wake-time"
              />
              <TouchableOpacity style={s.saveBtn} onPress={handleSave} testID="settings-save">
                <Text style={s.saveBtnText}>Save Settings</Text>
              </TouchableOpacity>
              <View style={{ height: 16 }} />
            </>
          ) : (
            <>
              <SettingRow icon="moon" label="Target Bedtime" value={appSettings.targetBedtime} />
              <SettingRow icon="sun" label="Target Wake Time" value={appSettings.targetWakeTime} />
            </>
          )}
        </View>

        <Text style={s.sectionTitle}>Notifications</Text>
        <View style={s.card}>
          <View style={s.notifRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.notifLabel}>Bedtime Reminders</Text>
              <Text style={s.notifSubtitle}>
                {notificationsEnabled
                  ? `Reminder at ${getReminderTimeLabel(appSettings.targetBedtime)} — 1 hour before bedtime`
                  : "Enable to receive a reminder 1 hour before bedtime"}
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={async (v) => {
                await Haptics.selectionAsync();
                setNotificationsEnabled(v);
                await updateAppSettings({ notificationsEnabled: v });
              }}
              trackColor={{ false: colors.border, true: colors.sage }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <Text style={s.sectionTitle}>Restricted Apps</Text>
        <View style={s.card}>
          <Text style={s.appsSubtitle}>
            These apps will trigger a friction prompt during your digital curfew.
          </Text>
          <Text style={s.subSectionHeader}>Social Media</Text>
          <AppToggleRow
            icon="instagram"
            label="Instagram"
            enabled={curfewSettings.restrictedApps.instagram}
            onToggle={(v) => updateAppRestriction("instagram", v)}
          />
          <AppToggleRow
            icon="video"
            label="TikTok"
            enabled={curfewSettings.restrictedApps.tiktok}
            onToggle={(v) => updateAppRestriction("tiktok", v)}
          />
          <AppToggleRow
            icon="camera"
            label="Snapchat"
            enabled={curfewSettings.restrictedApps.snapchat}
            onToggle={(v) => updateAppRestriction("snapchat", v)}
          />
          <AppToggleRow
            icon="twitter"
            label="Twitter / X"
            enabled={curfewSettings.restrictedApps.twitter}
            onToggle={(v) => updateAppRestriction("twitter", v)}
          />
          <AppToggleRow
            icon="facebook"
            label="Facebook"
            enabled={curfewSettings.restrictedApps.facebook}
            onToggle={(v) => updateAppRestriction("facebook", v)}
          />
          <Text style={s.subSectionHeader}>Work Apps</Text>
          <AppToggleRow
            icon="mail"
            label="Email"
            enabled={curfewSettings.restrictedApps.email}
            onToggle={(v) => updateAppRestriction("email", v)}
          />
          <AppToggleRow
            icon="slack"
            label="Slack"
            enabled={curfewSettings.restrictedApps.slack}
            onToggle={(v) => updateAppRestriction("slack", v)}
          />
          <AppToggleRow
            icon="briefcase"
            label="Other Work Apps"
            enabled={curfewSettings.restrictedApps.workApps}
            onToggle={(v) => updateAppRestriction("workApps", v)}
          />
          <View style={{ height: 4 }} />
        </View>

        <Text style={s.sectionTitle}>My Progress</Text>
        <View style={s.statsCard}>
          <View style={s.statRow}>
            <Text style={s.statLabel}>Total nights logged</Text>
            <Text style={s.statValue}>{sleepEntries.length}</Text>
          </View>
          <View style={s.statRow}>
            <Text style={s.statLabel}>Readiness scores</Text>
            <Text style={s.statValue}>{alertnessEntries.length}</Text>
          </View>
          <View style={[s.statRow, { borderBottomWidth: 0 }]}>
            <Text style={s.statLabel}>Member since</Text>
            <Text style={s.statValue}>Today</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>About</Text>
        <View style={s.aboutCard}>
          <Text style={s.aboutTitle}>Let's Snooze</Text>
          <Text style={s.aboutText}>
            Designed for high-pressure professionals who want to reclaim their final hour of the day. Let's Snooze helps you break the bedtime scrolling habit, log your sleep, and track how rest impacts your next-day performance.{"\n\n"}Your data stays on your device — always private, always yours.
          </Text>
        </View>

        <Text style={s.sectionTitle}>Data</Text>
        <View style={s.dangerCard}>
          <TouchableOpacity style={s.dangerBtn} onPress={handleClearData}>
            <Feather name="trash-2" size={18} color="#e08080" />
            <Text style={s.dangerText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.versionText}>Let's Snooze v1.0.0</Text>
      </ScrollView>
    </View>
  );
}
