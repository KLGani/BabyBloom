import * as ExpoSecureStore from "expo-secure-store";
import { Platform } from "react-native";

const getBrowserStorage = () => {
  if (typeof window === "undefined") {
    throw new Error("Browser storage is unavailable.");
  }

  return window.localStorage;
};

export const getItemAsync = async (key: string): Promise<string | null> => {
  if (Platform.OS === "web") {
    return getBrowserStorage().getItem(key);
  }

  return ExpoSecureStore.getItemAsync(key);
};

export const setItemAsync = async (
  key: string,
  value: string
): Promise<void> => {
  if (Platform.OS === "web") {
    getBrowserStorage().setItem(key, value);
    return;
  }

  await ExpoSecureStore.setItemAsync(key, value);
};

export const deleteItemAsync = async (key: string): Promise<void> => {
  if (Platform.OS === "web") {
    getBrowserStorage().removeItem(key);
    return;
  }

  await ExpoSecureStore.deleteItemAsync(key);
};
