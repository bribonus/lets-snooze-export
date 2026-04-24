import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Modal,
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

interface AppToggleProps {
  label: string;
  icon: FeatherIconName;
  enabled: boolean;
  onToggle: (v: boolean) => void;
}

function AppToggle({ label, icon, enabled, onToggle }: AppToggleProps) {
  const colors = useColors();
  const s = StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconContainer: {
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
      <View style={s.iconContainer}>
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

export default function SleepWindowScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { curfewSettings, updateCurfewSettings, startCurfew, stopCurfew, appSettings, updateAppSettings } = useApp();
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [bedtimeInput, setBedtimeInput] = useState(appSettings.targetBedtime);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  async function handleCurfewToggle() {
    if (curfewSettings.isActive) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "End curfew?",
        "You'll lose progress on tonight's screen-free window.",
        [
          { text: "Keep going", style: "cancel" },
          {
            text: "End curfew",
            style: "destructive",
            onPress: () => stopCurfew(),
          },
        ]
      );
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await startCurfew();
    }
  }

  async function handleDelay() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDelayModal(true);
  }

  async function handleSaveBedtime() {
    await updateAppSettings({ targetBedtime: bedtimeInput });
    await updateCurfewSettings({ targetBedtime: bedtimeInput });
  }

  function updateAppToggle(key: keyof typeof curfewSettings.restrictedApps, value: boolean) {
    updateCurfewSettings({
      restrictedApps: { ...curfewSettings.restrictedApps, [key]: value },
    });
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
    },
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
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: bottomPad + 100,
    },
    curfewCard: {
      borderRadius: 24,
      padding: 24,
      marginBottom: 16,
      backgroundColor: curfewSettings.isActive ? colors.sage : colors.lavender,
    },
    curfewStatus: {
      fontSize: 13,
      fontWeight: "600" as const,
      marginBottom: 8,
      color: curfewSettings.isActive ? "rgba(255,255,255,0.8)" : colors.mutedForeground,
    },
    curfewTitle: {
      fontSize: 22,
      fontWeight: "800" as const,
      color: curfewSettings.isActive ? "#fff" : colors.warmBrown,
      marginBottom: 20,
    },
    curfewBtn: {
      backgroundColor: curfewSettings.isActive ? "rgba(255,255,255,0.25)" : colors.sage,
      borderRadius: 100,
      paddingVertical: 16,
      alignItems: "center",
      marginBottom: 12,
      borderWidth: curfewSettings.isActive ? 1 : 0,
      borderColor: "rgba(255,255,255,0.4)",
    },
    curfewBtnText: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: "#fff",
    },
    delayBtn: {
      alignItems: "center",
      paddingVertical: 8,
    },
    delayText: {
      fontSize: 14,
      color: curfewSettings.isActive ? "rgba(255,255,255,0.7)" : colors.mutedForeground,
    },
    bedtimeCard: {
      backgroundColor: colors.lavender,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: colors.warmBrown,
      marginBottom: 12,
    },
    timeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    timeInput: {
      flex: 1,
      backgroundColor: colors.cream,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 22,
      fontWeight: "700" as const,
      color: colors.warmBrown,
    },
    saveBtn: {
      backgroundColor: colors.sage,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    saveBtnText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "700" as const,
    },
    appsCard: {
      backgroundColor: colors.lavender,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
    },
    appsSubtitle: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginBottom: 12,
    },
    sectionHeader: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.mutedForeground,
      marginTop: 12,
      marginBottom: 4,
      textTransform: "uppercase" as const,
      letterSpacing: 0.8,
    },
    overlayModal: {
      flex: 1,
      backgroundColor: "rgba(74,55,40,0.4)",
      justifyContent: "flex-end",
    },
    modalSheet: {
      backgroundColor: colors.cream,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 28,
      paddingBottom: Math.max(insets.bottom, 28),
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.warmBrown,
      marginBottom: 16,
    },
    delayOptions: {
      gap: 10,
    },
    delayOption: {
      backgroundColor: colors.lavender,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: "center",
    },
    delayOptionText: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: colors.warmBrown,
    },
    cancelDelay: {
      alignItems: "center",
      paddingTop: 16,
    },
    cancelDelayText: {
      color: colors.mutedForeground,
      fontSize: 14,
    },
    inputHint: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 8,
    },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.subtitle}>Set your boundaries</Text>
        <Text style={s.title}>My Sleep Window</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Curfew Control */}
        <View style={s.curfewCard}>
          <Text style={s.curfewStatus}>
            {curfewSettings.isActive ? "OFF-SCREEN MODE IS ACTIVE" : "OFF-SCREEN MODE IS INACTIVE"}
          </Text>
          <Text style={s.curfewTitle}>
            {curfewSettings.isActive
              ? "You're protecting your sleep!"
              : "Start your digital curfew"}
          </Text>
          <TouchableOpacity
            style={s.curfewBtn}
            onPress={handleCurfewToggle}
            testID="curfew-toggle"
          >
            <Text style={s.curfewBtnText}>
              {curfewSettings.isActive ? "End Off-Screen Mode" : "Start Off-Screen Mode"}
            </Text>
          </TouchableOpacity>
          {!curfewSettings.isActive && (
            <TouchableOpacity style={s.delayBtn} onPress={handleDelay}>
              <Text style={s.delayText}>Not ready yet? Delay start</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bedtime Target */}
        <View style={s.bedtimeCard}>
          <Text style={s.cardTitle}>Target Bedtime</Text>
          <View style={s.timeRow}>
            <TextInput
              style={s.timeInput}
              value={bedtimeInput}
              onChangeText={setBedtimeInput}
              placeholder="22:00"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numbers-and-punctuation"
              testID="bedtime-input"
            />
            <TouchableOpacity style={s.saveBtn} onPress={handleSaveBedtime} testID="save-bedtime">
              <Text style={s.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.inputHint}>Enter time in 24-hour format, e.g. 22:30 for 10:30 pm</Text>
        </View>

        {/* App Restrictions */}
        <View style={s.appsCard}>
          <Text style={s.cardTitle}>Apps to Avoid</Text>
          <Text style={s.appsSubtitle}>
            When Off-Screen Mode is active, you'll get a reminder if you open these apps — helping you stay mindful of your screen habits.
          </Text>
          <Text style={s.sectionHeader}>Social Media</Text>
          <AppToggle label="Instagram" icon="instagram" enabled={curfewSettings.restrictedApps.instagram} onToggle={(v) => updateAppToggle("instagram", v)} />
          <AppToggle label="TikTok" icon="video" enabled={curfewSettings.restrictedApps.tiktok} onToggle={(v) => updateAppToggle("tiktok", v)} />
          <AppToggle label="Snapchat" icon="camera" enabled={curfewSettings.restrictedApps.snapchat} onToggle={(v) => updateAppToggle("snapchat", v)} />
          <AppToggle label="Twitter / X" icon="twitter" enabled={curfewSettings.restrictedApps.twitter} onToggle={(v) => updateAppToggle("twitter", v)} />
          <AppToggle label="Facebook" icon="facebook" enabled={curfewSettings.restrictedApps.facebook} onToggle={(v) => updateAppToggle("facebook", v)} />
          <Text style={s.sectionHeader}>Work Apps</Text>
          <AppToggle label="Email" icon="mail" enabled={curfewSettings.restrictedApps.email} onToggle={(v) => updateAppToggle("email", v)} />
          <AppToggle label="Slack" icon="slack" enabled={curfewSettings.restrictedApps.slack} onToggle={(v) => updateAppToggle("slack", v)} />
          <AppToggle label="Other Work Apps" icon="briefcase" enabled={curfewSettings.restrictedApps.workApps} onToggle={(v) => updateAppToggle("workApps", v)} />
        </View>
      </ScrollView>

      {/* Delay modal */}
      <Modal visible={showDelayModal} transparent animationType="slide" statusBarTranslucent>
        <View style={s.overlayModal}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Delay by how long?</Text>
            <View style={s.delayOptions}>
              {[15, 30, 45].map((min) => (
                <TouchableOpacity
                  key={min}
                  style={s.delayOption}
                  onPress={async () => {
                    await Haptics.selectionAsync();
                    await updateCurfewSettings({ delayMinutes: min });
                    setShowDelayModal(false);
                  }}
                >
                  <Text style={s.delayOptionText}>Delay {min} minutes</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.cancelDelay} onPress={() => setShowDelayModal(false)}>
              <Text style={s.cancelDelayText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
