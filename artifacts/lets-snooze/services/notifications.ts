import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const BEDTIME_REMINDER_IDENTIFIER = "bedtime-reminder";
export const NOTIFICATION_CATEGORY_ID = "BEDTIME_CATEGORY";

export const ACTION_START_CURFEW = "START_CURFEW";
export const ACTION_DELAY_15 = "DELAY_15";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function setupNotificationCategory(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORY_ID, [
    {
      identifier: ACTION_START_CURFEW,
      buttonTitle: "Start Curfew",
      options: { opensAppToForeground: true },
    },
    {
      identifier: ACTION_DELAY_15,
      buttonTitle: "Delay 15 min",
      options: { opensAppToForeground: true },
    },
  ]);
}

export function parseBedtime(bedtime: string): { hour: number; minute: number } | null {
  const parts = bedtime.split(":");
  if (parts.length !== 2) return null;
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  if (isNaN(hour) || isNaN(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export function getReminderTime(bedtime: string): { hour: number; minute: number } | null {
  const parsed = parseBedtime(bedtime);
  if (!parsed) return null;
  const totalMinutes = parsed.hour * 60 + parsed.minute - 60;
  const adjustedHour = ((Math.floor(totalMinutes / 60)) % 24 + 24) % 24;
  const adjustedMinute = ((totalMinutes % 60) + 60) % 60;
  return { hour: adjustedHour, minute: adjustedMinute };
}

export async function scheduleBedtimeReminder(
  bedtime: string,
  screenTimeContext?: string
): Promise<void> {
  if (Platform.OS === "web") return;

  await cancelBedtimeReminder();
  await setupNotificationCategory();

  const reminderTime = getReminderTime(bedtime);
  if (!reminderTime) return;

  const body = screenTimeContext
    ? `Your bedtime is in 1 hour. ${screenTimeContext}`
    : "Your bedtime is in 1 hour. Time to wind down and start your curfew.";

  await Notifications.scheduleNotificationAsync({
    identifier: BEDTIME_REMINDER_IDENTIFIER,
    content: {
      title: "Bedtime Reminder",
      body,
      categoryIdentifier: NOTIFICATION_CATEGORY_ID,
      data: { type: "bedtime_reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: reminderTime.hour,
      minute: reminderTime.minute,
    },
  });
}

export async function cancelBedtimeReminder(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelScheduledNotificationAsync(BEDTIME_REMINDER_IDENTIFIER);
}

export async function scheduleDelayedReminder(delayMinutes: number): Promise<void> {
  if (Platform.OS === "web") return;
  await setupNotificationCategory();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Bedtime Reminder",
      body: `Your bedtime is almost here. Start your curfew when you're ready.`,
      categoryIdentifier: NOTIFICATION_CATEGORY_ID,
      data: { type: "bedtime_reminder_delayed" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delayMinutes * 60,
      repeats: false,
    },
  });
}
