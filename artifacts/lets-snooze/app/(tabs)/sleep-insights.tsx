import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";

const CHART_HEIGHT = 160;
const MAX_MINUTES = 600;
const GOAL_MINUTES = 420;
const GOAL_LINE_TOP = CHART_HEIGHT - (GOAL_MINUTES / MAX_MINUTES) * CHART_HEIGHT;

function getBarColor(minutes: number): string {
  if (minutes >= GOAL_MINUTES) return "#7db87d";
  if (minutes >= 360) return "#e8b84b";
  return "#e08080";
}


function WeeklySleepChart() {
  const colors = useColors();
  const { sleepEntries } = useApp();

  const days = useMemo(() => {
    const today = new Date();
    const result: { label: string; minutes: number | null; dateStr: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);
      const entry = sleepEntries.find((e) => e.date === dateStr);
      result.push({ label, minutes: entry ? entry.durationMinutes : null, dateStr });
    }
    return result;
  }, [sleepEntries]);

  const hasData = days.some((d) => d.minutes !== null);

  const s = StyleSheet.create({
    card: {
      backgroundColor: colors.lavender,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: colors.warmBrown,
      marginBottom: 4,
    },
    cardSubtitle: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginBottom: 16,
    },
    chartArea: {
      height: CHART_HEIGHT,
      flexDirection: "row",
      alignItems: "flex-end",
      position: "relative" as const,
    },
    goalLine: {
      position: "absolute" as const,
      left: 0,
      right: 0,
      top: GOAL_LINE_TOP,
      height: 1.5,
      backgroundColor: colors.sage,
    },
    goalLabel: {
      position: "absolute" as const,
      top: GOAL_LINE_TOP - 16,
      right: 0,
      fontSize: 10,
      fontWeight: "600" as const,
      color: colors.sage,
    },
    barCol: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      height: CHART_HEIGHT,
      paddingHorizontal: 3,
    },
    barWrapper: {
      width: "100%",
      justifyContent: "flex-end",
    },
    bar: {
      width: "100%",
      borderRadius: 4,
      minHeight: 4,
    },
    emptyBar: {
      width: "100%",
      height: 4,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    dayLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontWeight: "600" as const,
      marginTop: 6,
    },
    barsRow: {
      flexDirection: "row",
      flex: 1,
    },
    emptyText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontStyle: "italic" as const,
      textAlign: "center" as const,
      paddingVertical: 8,
    },
    legendRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 12,
      justifyContent: "center",
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      fontSize: 11,
      color: colors.mutedForeground,
    },
  });

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Sleep This Week</Text>
      <Text style={s.cardSubtitle}>Nightly duration over the past 7 days</Text>

      {!hasData ? (
        <Text style={s.emptyText}>
          Log your sleep times to see your weekly chart here.
        </Text>
      ) : (
        <>
          <View>
            <View style={s.chartArea}>
              <View style={s.goalLine} />
              <Text style={s.goalLabel}>7h goal</Text>
              {days.map((day) => {
                const barHeight =
                  day.minutes !== null
                    ? Math.min((day.minutes / MAX_MINUTES) * CHART_HEIGHT, CHART_HEIGHT)
                    : 0;
                return (
                  <View key={day.dateStr} style={s.barCol}>
                    {day.minutes !== null ? (
                      <View
                        style={[
                          s.bar,
                          {
                            height: barHeight,
                            backgroundColor: getBarColor(day.minutes),
                          },
                        ]}
                      />
                    ) : (
                      <View style={s.emptyBar} />
                    )}
                  </View>
                );
              })}
            </View>

            <View style={s.barsRow}>
              {days.map((day) => (
                <View key={day.dateStr} style={{ flex: 1, alignItems: "center" }}>
                  <Text style={s.dayLabel}>{day.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.legendRow}>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: "#7db87d" }]} />
              <Text style={s.legendText}>7h+</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: "#e8b84b" }]} />
              <Text style={s.legendText}>6–7h</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: "#e08080" }]} />
              <Text style={s.legendText}>Under 6h</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const EMOJI_LABELS = ["", "Exhausted", "Tired", "Okay", "Good", "Energized"];
const EMOJI_ICONS = ["", "😴", "😔", "😐", "😊", "🌟"];

function ScoreBar({ score, max = 5 }: { score: number; max?: number }) {
  const colors = useColors();
  const fill = (score / max) * 100;
  const barColor =
    score >= 4 ? "#7db87d" : score >= 3 ? colors.sage : "#e08080";
  return (
    <View
      style={{
        height: 8,
        backgroundColor: colors.border,
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${fill}%`,
          backgroundColor: barColor,
          borderRadius: 4,
        }}
      />
    </View>
  );
}

function ChevronPath({ days }: { days: { label: string; score: number }[] }) {
  const colors = useColors();
  if (days.length === 0) return null;

  const s = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
    },
    dayBlock: {
      alignItems: "center",
      flex: 1,
    },
    circle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    emojiText: {
      fontSize: 26,
    },
    dayLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontWeight: "600" as const,
    },
    scoreLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
    },
    arrow: {
      paddingHorizontal: 4,
      paddingBottom: 20,
    },
  });

  function getBgColor(score: number): string {
    if (score >= 4) return "#d4edda";
    if (score >= 3) return colors.lavender;
    return "#fde8e8";
  }

  return (
    <View style={s.container}>
      {days.map((day, i) => (
        <React.Fragment key={day.label}>
          <View style={s.dayBlock}>
            <View style={[s.circle, { backgroundColor: getBgColor(day.score) }]}>
              <Text style={s.emojiText}>{EMOJI_ICONS[day.score] || "—"}</Text>
            </View>
            <Text style={s.dayLabel}>{day.label}</Text>
            <Text style={s.scoreLabel}>{EMOJI_LABELS[day.score] || "—"}</Text>
          </View>
          {i < days.length - 1 && (
            <View style={s.arrow}>
              <Feather name="chevron-right" size={18} color={colors.border} />
            </View>
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

function WeeklySummaryCard() {
  const colors = useColors();
  const { curfewNightDates } = useApp();

  const { thisWeek, lastWeek } = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);

    const thisWeekCount = curfewNightDates.filter((dateStr) => {
      const d = new Date(dateStr + "T00:00:00");
      return d >= weekAgo && d <= today;
    }).length;
    const lastWeekCount = curfewNightDates.filter((dateStr) => {
      const d = new Date(dateStr + "T00:00:00");
      return d >= twoWeeksAgo && d < weekAgo;
    }).length;
    return { thisWeek: thisWeekCount, lastWeek: lastWeekCount };
  }, [curfewNightDates]);

  const diff = thisWeek - lastWeek;

  const s = StyleSheet.create({
    card: {
      backgroundColor: colors.lavender,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: colors.warmBrown,
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginBottom: 4,
    },
    row: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 8,
      marginBottom: 12,
    },
    bigNum: {
      fontSize: 40,
      fontWeight: "800" as const,
      color: colors.warmBrown,
    },
    unit: {
      fontSize: 16,
      color: colors.mutedForeground,
    },
    comparison: {
      fontSize: 13,
      color: diff >= 0 ? "#7db87d" : "#e08080",
      fontWeight: "600" as const,
    },
    emptyText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontStyle: "italic",
    },
  });

  return (
    <View style={s.card}>
      <Text style={s.title}>Screen-Free Nights</Text>
      <Text style={s.subtitle}>Nights you started Off-Screen Mode this week</Text>
      <View style={s.row}>
        <Text style={s.bigNum}>{thisWeek}</Text>
        <Text style={s.unit}>/ 7 nights</Text>
      </View>
      {thisWeek === 0 ? (
        <Text style={s.emptyText}>
          Start Off-Screen Mode in the Sleep Window tab to begin tracking your screen-free nights.
        </Text>
      ) : lastWeek > 0 ? (
        <Text style={s.comparison}>
          {diff >= 0 ? "+" : ""}
          {diff} vs last week {diff >= 0 ? "— keep it up!" : "— let's improve!"}
        </Text>
      ) : null}
    </View>
  );
}

export default function SleepInsightsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    alertnessEntries,
    sleepEntries,
    currentStreak,
    setMorningPulseShown,
    morningPulseShown,
  } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const last3Scores = useMemo(() => {
    const sorted = [...alertnessEntries]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-3);
    if (sorted.length === 0) return [];
    return sorted.map((e, i) => ({
      label: i === sorted.length - 1 ? "Today" : `Day ${i + 1}`,
      score: e.score,
    }));
  }, [alertnessEntries]);

  const avgSleep = useMemo(() => {
    if (sleepEntries.length === 0) return null;
    const recent = sleepEntries.slice(0, 7);
    const avg = recent.reduce((s, e) => s + e.durationMinutes, 0) / recent.length;
    return Math.round(avg);
  }, [sleepEntries]);

  const lastScore =
    alertnessEntries.length > 0 ? alertnessEntries[0].score : null;

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
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: bottomPad + 100,
    },
    card: {
      backgroundColor: colors.lavender,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: colors.warmBrown,
      marginBottom: 4,
    },
    cardSubtitle: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginBottom: 12,
    },
    streakContainer: {
      alignItems: "center",
      paddingVertical: 8,
    },
    streakStar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.peach,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
      shadowColor: colors.sage,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    streakNumber: {
      fontSize: 40,
      fontWeight: "800" as const,
      color: colors.sage,
    },
    streakLabel: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontWeight: "600" as const,
    },
    streakDays: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 4,
    },
    statsRow: {
      flexDirection: "row",
      gap: 12,
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
    pulseBtn: {
      backgroundColor: colors.sage,
      borderRadius: 100,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 8,
    },
    pulseBtnText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700" as const,
    },
    emptyText: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
      paddingVertical: 12,
    },
    scoreCard: {
      backgroundColor: colors.lavender,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
    },
    recentScoreRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 8,
    },
    emojiLarge: {
      fontSize: 36,
    },
    scoreInfo: {
      flex: 1,
    },
    scoreLabel: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.warmBrown,
    },
    scoreDate: {
      fontSize: 13,
      color: colors.mutedForeground,
    },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.subtitle}>Your sleep story</Text>
        <Text style={s.title}>My Sleep Insights</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Current Streak</Text>
          <Text style={s.cardSubtitle}>Consecutive nights logged</Text>
          <View style={s.streakContainer}>
            <View style={s.streakStar}>
              <Text style={s.streakNumber}>{currentStreak}</Text>
            </View>
            <Text style={s.streakLabel}>
              {currentStreak === 1
                ? "1 night"
                : `${currentStreak} nights`}
            </Text>
            <Text style={s.streakDays}>
              {currentStreak === 0
                ? "Start Off-Screen Mode tonight to begin your streak!"
                : currentStreak < 7
                ? `${7 - currentStreak} more screen-free nights to hit your first week goal!`
                : "Amazing consistency!"}
            </Text>
          </View>
        </View>

        {/* Sleep stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statValue}>
              {avgSleep !== null
                ? `${Math.floor(avgSleep / 60)}h${avgSleep % 60 > 0 ? (avgSleep % 60) + "m" : ""}`
                : "—"}
            </Text>
            <Text style={s.statLabel}>avg sleep{"\n"}(7 days)</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{alertnessEntries.length}</Text>
            <Text style={s.statLabel}>readiness{"\n"}scores logged</Text>
          </View>
        </View>

        {/* Weekly sleep chart */}
        <WeeklySleepChart />

        {/* Cognitive trend */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Readiness Trend</Text>
          <Text style={s.cardSubtitle}>
            How your morning alertness has changed
          </Text>
          {last3Scores.length > 0 ? (
            <ChevronPath days={last3Scores} />
          ) : (
            <Text style={s.emptyText}>
              No scores yet. Complete your morning pulse check to see your trend here.
            </Text>
          )}
        </View>

        {/* Morning pulse */}
        <View style={s.scoreCard}>
          <Text style={s.cardTitle}>Morning Pulse</Text>
          <Text style={s.cardSubtitle}>
            How alert and rested do you feel today?
          </Text>

          {lastScore !== null && (
            <View style={s.recentScoreRow}>
              <Text style={s.emojiLarge}>{EMOJI_ICONS[lastScore]}</Text>
              <View style={s.scoreInfo}>
                <Text style={s.scoreLabel}>{EMOJI_LABELS[lastScore]}</Text>
                <Text style={s.scoreDate}>
                  {alertnessEntries[0]
                    ? new Date(alertnessEntries[0].date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })
                    : "Today"}
                </Text>
              </View>
            </View>
          )}

          {morningPulseShown && (
            <TouchableOpacity
              style={s.pulseBtn}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                await setMorningPulseShown(false);
              }}
              testID="show-pulse"
            >
              <Text style={s.pulseBtnText}>
                {lastScore !== null ? "Update Today's Score" : "Log My Readiness"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <WeeklySummaryCard />
      </ScrollView>
    </View>
  );
}
