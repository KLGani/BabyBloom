import { router } from "expo-router";

type FallbackRoute = "/" | "/dashboard" | "/mode-selection";

export const goBackOrReplace = (
  fallbackRoute: FallbackRoute = "/dashboard"
) => {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallbackRoute);
};
