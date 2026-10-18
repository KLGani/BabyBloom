
import * as Notifications from "expo-notifications";

export type MedicineReminder = {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  startDate: string;
  endDate: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function parseTime(value: string): { hour: number; minute: number } | null {
  const match = value.trim().match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
  );

  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3]?.toUpperCase();

  if (minute > 59) return null;

  if (period) {
    if (hour < 1 || hour > 12) return null;
    hour = hour % 12;

    if (period === "PM") hour += 12;
  } else if (hour > 23) {
    return null;
  }

  return { hour, minute };
}

function parseDate(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export async function syncMedicineNotifications(
  medicines: MedicineReminder[]
): Promise<boolean> {
  try {
    const existing =
      await Notifications.getAllScheduledNotificationsAsync();

    // Remove only notifications created by this medicine reminder feature.
    for (const notification of existing) {
      if (notification.content.data?.type === "medicine") {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier
        );
      }
    }

    let permission =
      await Notifications.getPermissionsAsync();

    if (!permission.granted) {
      permission =
        await Notifications.requestPermissionsAsync();
    }

    if (!permission.granted) {
  console.log("MEDICINE REMINDER: Permission not granted");
  return false;
}

console.log("MEDICINE REMINDER: Permission granted");
console.log("MEDICINE REMINDER: Medicines received", medicines.length);

    await Notifications.setNotificationChannelAsync(
      "medicine-reminders",
      {
        name: "Medicine Reminders",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#B86D84",
      }
    );

    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // Schedule the next seven days. Re-sync when the medicine
    // screen is opened again to refresh the upcoming reminders.
    const lastDay = new Date(today);
    lastDay.setDate(lastDay.getDate() + 6);

    for (const medicine of medicines) {
      const start = medicine.startDate
        ? parseDate(medicine.startDate)
        : today;

      const end = medicine.endDate
        ? parseDate(medicine.endDate)
        : lastDay;

      if (!start || !end || end < today || end < start) {
        continue;
      }

      const firstDay = start > today ? start : today;
      const finalDay = end < lastDay ? end : lastDay;

      for (
        const day = new Date(firstDay);
        day <= finalDay;
        day.setDate(day.getDate() + 1)
      ) {
        for (const time of medicine.times) {
          const parsed = parseTime(time);

          if (!parsed) continue;

          const reminderDate = new Date(
            day.getFullYear(),
            day.getMonth(),
            day.getDate(),
            parsed.hour,
            parsed.minute,
            0,
            0
          );

          // Never schedule a reminder in the past.
          if (reminderDate <= now) continue;
        console.log("MEDICINE REMINDER: Scheduling", medicine.name, reminderDate.toString());

          await Notifications.scheduleNotificationAsync({
            content: {
              title: "LittleBloom medicine reminder 💗",
              body: `Time for ${medicine.name} (${medicine.dosage}). Follow your prescribed instructions.`,
              data: {
                type: "medicine",
                medicineId: medicine.id,
              },
              sound: "default",
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: reminderDate,
              channelId: "medicine-reminders",
            },
          });
        }
      }
    }

    return true;
  } catch (error) {
    console.error("MEDICINE REMINDER ERROR:", error);
    return false;
  }
}
