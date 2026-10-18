
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const STORAGE_KEY = "littlebloomAppointmentVaccinationReminders";

type Reminder = {
  title: string;
  body: string;
  date: Date;
  data: {
    type: string;
    id: string;
  };
};

// Display notifications while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function getSavedReminders(): Promise<Record<string, string>> {
  try {
    const saved = await SecureStore.getItemAsync(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

async function saveReminders(reminders: Record<string, string>) {
  await SecureStore.setItemAsync(
    STORAGE_KEY,
    JSON.stringify(reminders)
  );
}

export async function requestReminderPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "LittleBloom reminders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#E8A1B5",
    });
  }

  const current = await Notifications.getPermissionsAsync();

  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelAppointmentVaccinationReminder(
  key: string
) {
  const reminders = await getSavedReminders();
  const notificationId = reminders[key];

  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(
      notificationId
    );

    delete reminders[key];
    await saveReminders(reminders);
  }
}

async function scheduleReminder(
  key: string,
  reminder: Reminder
) {
  // Cancel the old reminder before scheduling an updated one.
  await cancelAppointmentVaccinationReminder(key);

  if (reminder.date.getTime() <= Date.now()) {
    return null;
  }

  const permitted = await requestReminderPermission();

  if (!permitted) {
    console.warn("Notification permission was not granted.");
    return null;
  }

  const notificationId =
    await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.body,
        data: reminder.data,
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.date,
        ...(Platform.OS === "android"
          ? { channelId: "default" }
          : {}),
      },
    });

  const reminders = await getSavedReminders();
  reminders[key] = notificationId;
  await saveReminders(reminders);

  return notificationId;
}

export async function scheduleAppointmentReminder(
  appointment: {
    _id: string;
    doctorName: string;
    date: string;
    time: string;
  }
) {
  const appointmentDate = parseDate(
    appointment.date,
    appointment.time
  );

  if (!appointmentDate) {
    console.warn("Invalid appointment date or time.");
    return null;
  }

  // Remind one hour before the appointment.
  let reminderDate = new Date(
    appointmentDate.getTime() - 60 * 60 * 1000
  );

  // If that time has passed, remind at appointment time.
  if (reminderDate.getTime() <= Date.now()) {
    reminderDate = appointmentDate;
  }

  return scheduleReminder(
    `appointment:${appointment._id}`,
    {
      title: "Doctor appointment 🩺",
      body: `Your appointment with ${appointment.doctorName} is coming up.`,
      date: reminderDate,
      data: {
        type: "appointment",
        id: appointment._id,
      },
    }
  );
}

export async function scheduleVaccinationReminder(
  vaccination: {
    _id: string;
    name: string;
    date: string;
    completed?: boolean;
  }
) {
  const key = `vaccination:${vaccination._id}`;

  if (vaccination.completed) {
    await cancelAppointmentVaccinationReminder(key);
    return null;
  }

  const dueDate = parseDate(vaccination.date);

  if (!dueDate) {
    console.warn("Invalid vaccination date.");
    return null;
  }

  // Remind at 9 AM one day before the vaccination.
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - 1);

  // If the previous day's reminder time has passed,
  // use 9 AM on the due date instead.
  if (reminderDate.getTime() <= Date.now()) {
    reminderDate.setTime(dueDate.getTime());
  }

  return scheduleReminder(key, {
    title: "Vaccination reminder 💉",
    body: `${vaccination.name} is due soon. Please confirm the timing with your healthcare professional.`,
    date: reminderDate,
    data: {
      type: "vaccination",
      id: vaccination._id,
    },
  });
}

function parseDate(date: string, time?: string): Date | null {
  // Dates must be stored as YYYY-MM-DD.
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  let hours = 9;
  let minutes = 0;

  if (time) {
    const timeMatch = time.trim().match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
    );

    if (!timeMatch) return null;

    hours = Number(timeMatch[1]);
    minutes = Number(timeMatch[2]);

    const period = timeMatch[3]?.toUpperCase();

    if (minutes > 59) return null;

    if (period) {
      if (hours < 1 || hours > 12) return null;

      hours = hours % 12;
      if (period === "PM") hours += 12;
    } else if (hours > 23) {
      return null;
    }
  }

  const result = new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
    0,
    0
  );

  if (
    result.getFullYear() !== year ||
    result.getMonth() !== month - 1 ||
    result.getDate() !== day
  ) {
    return null;
  }

  return result;
}
