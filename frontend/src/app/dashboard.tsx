import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "../utils/storage";

import {
  getPregnancyProfile,
  getChildProfile,
} from "../../services/api";
import { useLanguage, AVAILABLE_LANGUAGES } from "../context/LanguageContext";
import { LanguageSelectorModal } from "../components/LanguageSelectorModal";
import { OnboardingPermissionsModal } from "../components/OnboardingPermissionsModal";
import { SupportedLanguage, TranslationKeys } from "../i18n/translations";

type User = {
  name?: string;
  email?: string;
  mode?: "pregnancy" | "child";
  pregnancyWeek?: number | null;
};

type PregnancyProfile = {
  pregnancyWeek?: number | null;
  dueDate?: string | null;
  bloodGroup?: string;
  height?: number | null;
  prePregnancyWeight?: number | null;
  currentWeight?: number | null;
  notes?: string;
};

type ChildProfile = {
  childName?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  height?: number | null;
  weight?: number | null;
  notes?: string;
};

export default function Dashboard() {
  const { t, language, hasCompletedOnboarding } = useLanguage();
  const [user, setUser] = useState<User | null>(null);

  const [pregnancyProfile, setPregnancyProfile] =
    useState<PregnancyProfile | null>(null);

  const [childProfile, setChildProfile] =
    useState<ChildProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync("user");
      const token = await SecureStore.getItemAsync("authToken");
      const onboarded = await SecureStore.getItemAsync("hasCompletedOnboarding");

      if (!storedUser || !token) {
        router.replace("/");
        return;
      }

      if (onboarded !== "true") {
        setShowOnboarding(true);
      }

      const parsedUser: User = JSON.parse(storedUser);

      setUser(parsedUser);

      if (parsedUser.mode === "child") {
        const result = await getChildProfile(token);

        if (result.success) {
          setChildProfile(result.profile);
        } else {
          console.log(
            "Child profile could not be loaded:",
            result.message
          );
        }
      } else {
        const result = await getPregnancyProfile(token);

        if (result.success) {
          setPregnancyProfile(result.profile);
        } else {
          console.log(
            "Pregnancy profile could not be loaded:",
            result.message
          );
        }
      }
    } catch (error) {
      console.log("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync("user");

    router.replace("/");
  };

  if (loading) {
    return (
      <SafeAreaView style={pregnancyStyles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#C47A91"
        />

        <Text style={pregnancyStyles.loadingText}>
          {t.loading || "Loading Little Bloom..."}
        </Text>
      </SafeAreaView>
    );
  }

  const mode = user?.mode || "pregnancy";

  return (
    <>
      {mode === "child" ? (
        <ChildDashboard
          user={user}
          profile={childProfile}
          onLogout={logout}
          t={t}
          language={language}
          onOpenLanguageModal={() => setLanguageModalVisible(true)}
        />
      ) : (
        <PregnancyDashboard
          user={user}
          profile={pregnancyProfile}
          onLogout={logout}
          t={t}
          language={language}
          onOpenLanguageModal={() => setLanguageModalVisible(true)}
        />
      )}

      {/* Prominent Language Selector Modal */}
      <LanguageSelectorModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />

      {/* First-time login onboarding permissions modal */}
      <OnboardingPermissionsModal
        visible={showOnboarding || !hasCompletedOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </>
  );
}

/* =========================================================
   PREGNANCY DASHBOARD
========================================================= */

function PregnancyDashboard({
  user,
  profile,
  onLogout,
  t,
  language,
  onOpenLanguageModal,
}: {
  user: User | null;
  profile: PregnancyProfile | null;
  onLogout: () => void;
  t: TranslationKeys;
  language: SupportedLanguage;
  onOpenLanguageModal: () => void;
}) {
  const pregnancyWeek =
    profile?.pregnancyWeek ||
    user?.pregnancyWeek ||
    1;

  const currentNativeLabel =
    AVAILABLE_LANGUAGES.find((l) => l.id === language)?.nativeLabel || language;

  return (
    <SafeAreaView style={pregnancyStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={pregnancyStyles.scrollContent}
      >
        {/* Header */}

        <View style={pregnancyStyles.header}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={pregnancyStyles.smallGreeting}>
              🌷 {t.welcomeMama}
            </Text>

            <Text style={pregnancyStyles.greeting} numberOfLines={1}>
              {user?.name || "Mama"}!
            </Text>
          </View>

          {/* Prominent Language Toggle Pill */}
          <TouchableOpacity
            style={pregnancyStyles.langTogglePill}
            onPress={onOpenLanguageModal}
            activeOpacity={0.8}
          >
            <Text style={pregnancyStyles.langToggleIcon}>🌐</Text>
            <Text style={pregnancyStyles.langToggleText}>
              {currentNativeLabel} ▾
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={pregnancyStyles.profileButton}
            onPress={() => router.push("/edit-profile")}
          >
            <Text style={pregnancyStyles.profileIcon}>
              👩
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pregnancy Journey */}

        <View style={pregnancyStyles.journeyCard}>
          <View style={pregnancyStyles.journeyTop}>
            <View>
              <Text style={pregnancyStyles.journeyLabel}>
                {t.pregnancyJourney.toUpperCase()}
              </Text>

              <Text style={pregnancyStyles.weekText}>
                {t.currentWeek} {pregnancyWeek}
              </Text>

              <Text style={pregnancyStyles.trimesterText}>
                {pregnancyWeek <= 13
                  ? t.firstTrimester
                  : pregnancyWeek <= 27
                  ? t.secondTrimester
                  : t.thirdTrimester}
              </Text>
            </View>

            <View
              style={pregnancyStyles.motherIconCircle}
            >
              <Text style={pregnancyStyles.motherIcon}>
                🤰
              </Text>
            </View>
          </View>

          <View
            style={pregnancyStyles.progressBackground}
          >
            <View
              style={[
                pregnancyStyles.progressFill,
                {
                  width: `${Math.min(
                    (pregnancyWeek / 40) * 100,
                    100
                  )}%`,
                },
              ]}
            />
          </View>

          <View style={pregnancyStyles.progressRow}>
            <Text style={pregnancyStyles.progressText}>
              {pregnancyWeek} / 40 {t.currentWeek}s
            </Text>

            <Text style={pregnancyStyles.progressText}>
              {Math.max(40 - pregnancyWeek, 0)} {t.currentWeek}s to go
            </Text>
          </View>
        </View>

        {/* Mother's Health */}

        <View style={pregnancyStyles.sectionHeader}>
          <Text style={pregnancyStyles.sectionTitle}>
            {t.health}
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/health")}
          >
            <Text style={pregnancyStyles.seeAll}>
              {t.edit || "View"} →
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={pregnancyStyles.healthCard}
          onPress={() => router.push("/health")}
          activeOpacity={0.85}
        >
          <View style={pregnancyStyles.healthScoreCircle}>
            <Text style={pregnancyStyles.healthScore}>
              85
            </Text>

            <Text style={pregnancyStyles.scoreSmall}>
              /100
            </Text>
          </View>

          <View style={pregnancyStyles.healthInfo}>
            <Text style={pregnancyStyles.healthTitle}>
              {t.health}
            </Text>

            <Text style={pregnancyStyles.healthDescription}>
              {profile?.currentWeight
                ? `Current weight: ${profile.currentWeight} kg`
                : "Keep taking care of yourself and your little one."}
            </Text>

            <View style={pregnancyStyles.healthStatus}>
              <Text
                style={pregnancyStyles.healthStatusText}
              >
                ● Looking good today
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Pregnancy Care */}

        <Text style={pregnancyStyles.sectionTitle}>
          {t.quickActions}
        </Text>

        <View style={pregnancyStyles.featureGrid}>
          <PregnancyFeature
            icon="❤️"
            title={t.health}
            subtitle="Monitor health"
            onPress={() => router.push("/health")}
          />

          <PregnancyFeature
            icon="🥗"
            title={t.foodguide}
            subtitle="Food & diet safety"
            onPress={() => router.push("/foodguide")}
          />

          <PregnancyFeature
            icon="💊"
            title={t.medicines}
            subtitle="Stay on schedule"
            onPress={() => router.push("/medicines")}
          />

          <PregnancyFeature
            icon="💉"
            title={t.vaccination}
            subtitle="Influenza & Tdap"
            onPress={() => router.push("/vaccination")}
          />

          <PregnancyFeature
            icon="📅"
            title={t.appointments}
            subtitle="Doctor visits"
            onPress={() =>
              router.push("/appointments")
            }
          />

          <PregnancyFeature
            icon="📄"
            title={t.reports}
            subtitle="Medical records"
            onPress={() => router.push("/reports")}
          />
        </View>

        {/* Baby Development */}

        <View style={pregnancyStyles.babyCard}>
          <View
            style={pregnancyStyles.babyEmojiCircle}
          >
            <Text style={pregnancyStyles.babyEmoji}>
              🤰
            </Text>
          </View>

          <View style={pregnancyStyles.babyInfo}>
            <Text style={pregnancyStyles.babyTitle}>
              {t.weeklySelfCare}
            </Text>

            <Text
              style={pregnancyStyles.babyDescription}
            >
              {t.weeklyGuidanceDesc}
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/pregnancy")}
            >
              <Text style={pregnancyStyles.learnMore}>
                {t.currentWeek} {pregnancyWeek} →
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Tip */}

        <View style={pregnancyStyles.tipCard}>
          <Text style={pregnancyStyles.tipLabel}>
            🌼 TODAY'S PREGNANCY TIP
          </Text>

          <Text style={pregnancyStyles.tipText}>
            Stay hydrated throughout the day and include
            nutrient-rich foods in your meals.
          </Text>
        </View>

        {/* AI Assistant */}

        <TouchableOpacity
          style={pregnancyStyles.aiCard}
          onPress={() => router.push("/chatbot")}
          activeOpacity={0.85}
        >
          <View
            style={pregnancyStyles.aiIconCircle}
          >
            <Text style={pregnancyStyles.aiIcon}>
              🤖
            </Text>
          </View>

          <View style={pregnancyStyles.aiInfo}>
            <Text style={pregnancyStyles.aiTitle}>
              {t.askAiBannerTitle}
            </Text>

            <Text style={pregnancyStyles.aiText}>
              {t.askAiBannerDesc}
            </Text>
          </View>

          <Text style={pregnancyStyles.arrow}>
            ›
          </Text>
        </TouchableOpacity>

        {/* Bottom Actions */}

        <View style={pregnancyStyles.bottomActions}>
          <TouchableOpacity
            style={pregnancyStyles.bottomButton}
            onPress={() => router.push("/journal")}
          >
            <Text style={pregnancyStyles.bottomIcon}>
              📝
            </Text>

            <Text style={pregnancyStyles.bottomText}>
              {t.journal}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={pregnancyStyles.bottomButton}
            onPress={() =>
              router.push("/notifications")
            }
          >
            <Text style={pregnancyStyles.bottomIcon}>
              🔔
            </Text>

            <Text style={pregnancyStyles.bottomText}>
              {t.notifications}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={pregnancyStyles.bottomButton}
            onPress={onLogout}
          >
            <Text style={pregnancyStyles.bottomIcon}>
              🚪
            </Text>

            <Text style={pregnancyStyles.bottomText}>
              {t.logout}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   CHILD DASHBOARD
========================================================= */

function ChildDashboard({
  user,
  profile,
  onLogout,
  t,
  language,
  onOpenLanguageModal,
}: {
  user: User | null;
  profile: ChildProfile | null;
  onLogout: () => void;
  t: TranslationKeys;
  language: SupportedLanguage;
  onOpenLanguageModal: () => void;
}) {
  const currentNativeLabel =
    AVAILABLE_LANGUAGES.find((l) => l.id === language)?.nativeLabel || language;

  return (
    <SafeAreaView style={childStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={childStyles.scrollContent}
      >
        {/* Header */}

        <View style={childStyles.header}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={childStyles.smallGreeting}>
              🌈 {t.welcomeParent}
            </Text>

            <Text style={childStyles.greeting} numberOfLines={1}>
              {profile?.childName || "Little One"} ⭐
            </Text>
          </View>

          {/* Prominent Language Toggle Pill */}
          <TouchableOpacity
            style={childStyles.langTogglePill}
            onPress={onOpenLanguageModal}
            activeOpacity={0.8}
          >
            <Text style={childStyles.langToggleIcon}>🌐</Text>
            <Text style={childStyles.langToggleText}>
              {currentNativeLabel} ▾
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={childStyles.profileButton}
            onPress={() => router.push("/edit-profile")}
          >
            <Text style={childStyles.profileIcon}>
              👨‍👩‍👧
            </Text>
          </TouchableOpacity>
        </View>

        {/* Child Profile Card */}

        <View style={childStyles.childCard}>
          <View style={childStyles.childAvatar}>
            <Text style={childStyles.childAvatarEmoji}>
              👶
            </Text>
          </View>

          <View style={childStyles.childDetails}>
            <Text style={childStyles.childName}>
              {profile?.childName || "My Little Star"} ⭐
            </Text>

            <Text style={childStyles.childAge}>
              {profile?.dateOfBirth
                ? formatChildAge(profile.dateOfBirth)
                : t.childJourney}
            </Text>

            <View style={childStyles.growthBadge}>
              <Text
                style={childStyles.growthBadgeText}
              >
                🌱 Growing beautifully
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/growth")}
          >
            <Text style={childStyles.arrow}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* Growth Overview */}

        <Text style={childStyles.sectionTitle}>
          {t.growthMetrics}
        </Text>
        <Text style={childStyles.sectionDescription}>Latest measurements from the child profile</Text>

        <View style={childStyles.growthGrid}>
          <View style={childStyles.growthBox}>
            <Text style={childStyles.growthIcon}>
              ⚖️
            </Text>

            <Text style={childStyles.growthValue}>
              {profile?.weight
                ? `${profile.weight} kg`
                : "--"}
            </Text>

            <Text style={childStyles.growthLabel}>
              {t.weight}
            </Text>
          </View>

          <View style={childStyles.growthBox}>
            <Text style={childStyles.growthIcon}>
              📏
            </Text>

            <Text style={childStyles.growthValue}>
              {profile?.height
                ? `${profile.height} cm`
                : "--"}
            </Text>

            <Text style={childStyles.growthLabel}>
              {t.height}
            </Text>
          </View>

          <View style={childStyles.growthBox}>
            <Text style={childStyles.growthIcon}>
              🩸
            </Text>

            <Text style={childStyles.growthValue}>
              {profile?.bloodGroup || "--"}
            </Text>

            <Text style={childStyles.growthLabel}>
              {t.bloodGroup}
            </Text>
          </View>
        </View>

        {/* Child Care Features */}

        <Text style={childStyles.sectionTitle}>
          {t.quickActions}
        </Text>
        <Text style={childStyles.sectionDescription}>Choose an area to care for, track, or remember</Text>

        <View style={childStyles.featureGrid}>
          <ChildFeature
            icon="📈"
            title={t.growthMetrics}
            subtitle="Record height and weight"
            onPress={() => router.push("/growth")}
          />

          <ChildFeature
            icon="💉"
            title={t.vaccination}
            subtitle="Vaccine reminder & schedule"
            onPress={() =>
              router.push("/vaccination")
            }
          />

          <ChildFeature
            icon="🧸"
            title={t.childJourney}
            subtitle="Celebrate milestones"
            onPress={() => router.push("/child")}
          />

          <ChildFeature
            icon="❤️"
            title={t.health}
            subtitle="Log sleep, symptoms, and more"
            onPress={() => router.push("/health")}
          />

          <ChildFeature
            icon="📅"
            title={t.pediatricAppointments}
            subtitle="Keep visits organized"
            onPress={() =>
              router.push("/appointments")
            }
            isWide={true}
          />
        </View>

        {/* Vaccination Reminder */}

        <TouchableOpacity
          style={childStyles.vaccineCard}
          onPress={() =>
            router.push("/vaccination")
          }
          activeOpacity={0.85}
        >
          <View
            style={childStyles.vaccineIconCircle}
          >
            <Text style={childStyles.vaccineIcon}>
              💉
            </Text>
          </View>

          <View style={childStyles.vaccineInfo}>
            <Text style={childStyles.vaccineTitle}>
              {t.vaccination}
            </Text>

            <Text style={childStyles.vaccineText}>
              Keep your little one's vaccinations up
              to date.
            </Text>

            <Text style={childStyles.vaccineLink}>
              View vaccination schedule →
            </Text>
          </View>
        </TouchableOpacity>

        {/* Parenting Tip */}

        <View style={childStyles.tipCard}>
          <Text style={childStyles.tipLabel}>
            🌈 TODAY'S PARENTING TIP
          </Text>

          <Text style={childStyles.tipText}>
            Talk, sing and play with your child every
            day. These simple moments support early
            development.
          </Text>
        </View>

        {/* Child AI Assistant */}

        <TouchableOpacity
          style={childStyles.aiCard}
          onPress={() => router.push("/chatbot")}
          activeOpacity={0.85}
        >
          <View style={childStyles.aiIconCircle}>
            <Text style={childStyles.aiIcon}>
              🤖
            </Text>
          </View>

          <View style={childStyles.aiInfo}>
            <Text style={childStyles.aiTitle}>
              {t.askAiBannerTitle}
            </Text>

            <Text style={childStyles.aiText}>
              {t.askAiBannerDesc}
            </Text>
          </View>

          <Text style={childStyles.arrow}>
            ›
          </Text>
        </TouchableOpacity>

        {/* Bottom Actions */}

        <View style={childStyles.bottomActions}>
          <TouchableOpacity
            style={childStyles.bottomButton}
            onPress={() => router.push("/journal")}
          >
            <Text style={childStyles.bottomIcon}>
              📝
            </Text>

            <Text style={childStyles.bottomText}>
              {t.journal}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={childStyles.bottomButton}
            onPress={() => router.push("/notifications")}
          >
            <Text style={childStyles.bottomIcon}>
              🔔
            </Text>

            <Text style={childStyles.bottomText}>
              {t.notifications}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={childStyles.bottomButton}
            onPress={onLogout}
          >
            <Text style={childStyles.bottomIcon}>
              🚪
            </Text>

            <Text style={childStyles.bottomText}>
              {t.logout}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatChildAge(dateOfBirth: string) {
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return "Growing, learning & exploring every day";
  const now = new Date();
  let months = (now.getFullYear() - birthDate.getFullYear()) * 12 + now.getMonth() - birthDate.getMonth();
  if (now.getDate() < birthDate.getDate()) months -= 1;
  if (months < 0) return "Growing, learning & exploring every day";
  if (months < 24) return `${months} ${months === 1 ? "month" : "months"} old`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths ? `${years} ${years === 1 ? "year" : "years"}, ${remainingMonths} mo` : `${years} ${years === 1 ? "year" : "years"} old`;
}

/* =========================================================
   PREGNANCY FEATURE COMPONENT
========================================================= */

function PregnancyFeature({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={pregnancyStyles.featureCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={pregnancyStyles.featureIcon}>
        <Text style={pregnancyStyles.featureEmoji}>
          {icon}
        </Text>
      </View>

      <Text style={pregnancyStyles.featureTitle}>
        {title}
      </Text>

      <Text
        style={pregnancyStyles.featureSubtitle}
      >
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

/* =========================================================
   CHILD FEATURE COMPONENT
========================================================= */

function ChildFeature({
  icon,
  title,
  subtitle,
  onPress,
  isWide = false,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  isWide?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        childStyles.featureCard,
        isWide && childStyles.featureCardWide,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[childStyles.featureIcon, isWide && childStyles.featureIconWide]}>
        <Text style={childStyles.featureEmoji}>
          {icon}
        </Text>
      </View>

      <View style={isWide ? childStyles.featureCopyWide : undefined}>
        <Text
          style={[childStyles.featureTitle, isWide && childStyles.featureTitleWide]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          style={[childStyles.featureSubtitle, isWide && childStyles.featureSubtitleWide]}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* =========================================================
   PREGNANCY STYLES
========================================================= */

const pregnancyStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F9",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  langTogglePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E6B8C7",
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  langToggleIcon: {
    fontSize: 15,
    marginRight: 5,
  },

  langToggleText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#8B475D",
  },

  smallGreeting: {
    fontSize: 14,
    color: "#9B7180",
    marginBottom: 4,
  },

  greeting: {
    fontSize: 25,
    fontWeight: "800",
    color: "#54313D",
  },

  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F8DCE5",
    justifyContent: "center",
    alignItems: "center",
  },

  profileIcon: {
    fontSize: 24,
  },

  journeyCard: {
    backgroundColor: "#EFD6DF",
    borderRadius: 28,
    padding: 22,
    marginBottom: 24,
  },

  journeyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  journeyLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#895568",
    letterSpacing: 1,
  },

  weekText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#54313D",
    marginTop: 5,
  },

  trimesterText: {
    fontSize: 14,
    color: "#7E5262",
    marginTop: 3,
  },

  motherIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFF7F9",
    justifyContent: "center",
    alignItems: "center",
  },

  motherIcon: {
    fontSize: 40,
  },

  progressBackground: {
    height: 9,
    backgroundColor: "#F7E8ED",
    borderRadius: 10,
    marginTop: 22,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#B96D85",
    borderRadius: 10,
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 9,
  },

  progressText: {
    fontSize: 11,
    color: "#805666",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#54313D",
    marginBottom: 12,
  },

  seeAll: {
    fontSize: 13,
    color: "#B15E78",
    fontWeight: "700",
  },

  healthCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
    elevation: 2,
  },

  healthScoreCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#F4DDE5",
    justifyContent: "center",
    alignItems: "center",
  },

  healthScore: {
    fontSize: 27,
    fontWeight: "900",
    color: "#A95772",
  },

  scoreSmall: {
    fontSize: 11,
    color: "#A95772",
  },

  healthInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },

  healthTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#54313D",
  },

  healthDescription: {
    fontSize: 12,
    color: "#8B6B75",
    marginTop: 5,
    lineHeight: 18,
  },

  healthStatus: {
    marginTop: 7,
  },

  healthStatusText: {
    color: "#70916E",
    fontSize: 12,
    fontWeight: "700",
  },

  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  featureCard: {
    width: "31.5%",
    minHeight: 125,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },

  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F9E6EC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  featureEmoji: {
    fontSize: 24,
  },

  featureTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#54313D",
    textAlign: "center",
  },

  featureSubtitle: {
    fontSize: 9,
    color: "#94747E",
    textAlign: "center",
    marginTop: 3,
  },

  babyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4E8F5",
    borderRadius: 23,
    padding: 18,
    marginBottom: 16,
  },

  babyEmojiCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  babyEmoji: {
    fontSize: 30,
  },

  babyInfo: {
    flex: 1,
    marginLeft: 14,
  },

  babyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#563B61",
  },

  babyDescription: {
    fontSize: 12,
    color: "#806A88",
    marginTop: 4,
    lineHeight: 17,
  },

  learnMore: {
    color: "#9B5CA8",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6,
  },

  tipCard: {
    backgroundColor: "#FFF1D9",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },

  tipLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#A86E35",
    letterSpacing: 0.5,
  },

  tipText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#715638",
    marginTop: 8,
  },

  aiCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DDE9F7",
    borderRadius: 22,
    padding: 17,
    marginBottom: 20,
  },

  aiIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  aiIcon: {
    fontSize: 27,
  },

  aiInfo: {
    flex: 1,
    marginLeft: 13,
  },

  aiTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#385271",
  },

  aiText: {
    fontSize: 12,
    color: "#60728A",
    marginTop: 3,
    lineHeight: 17,
  },

  arrow: {
    fontSize: 28,
    color: "#7B8DA5",
    marginLeft: 5,
  },

  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },

  bottomButton: {
    width: "31%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: "center",
  },

  bottomIcon: {
    fontSize: 20,
  },

  bottomText: {
    fontSize: 10,
    color: "#765A64",
    fontWeight: "700",
    marginTop: 4,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFF7F9",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#805666",
    fontSize: 14,
  },
});

/* =========================================================
   CHILD STYLES
========================================================= */

const childStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FBFA",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  langTogglePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#A9D5CB",
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  langToggleIcon: {
    fontSize: 15,
    marginRight: 5,
  },

  langToggleText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2C665C",
  },

  smallGreeting: {
    fontSize: 14,
    color: "#688F8A",
    marginBottom: 4,
  },

  greeting: {
    fontSize: 24,
    fontWeight: "900",
    color: "#294F4A",
  },

  profileButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#D9F0EA",
    justifyContent: "center",
    alignItems: "center",
  },

  profileIcon: {
    fontSize: 23,
  },

  childCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D9F0EA",
    borderRadius: 28,
    padding: 20,
    marginBottom: 24,
  },

  childAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFF6D9",
    justifyContent: "center",
    alignItems: "center",
  },

  childAvatarEmoji: {
    fontSize: 42,
  },

  childDetails: {
    flex: 1,
    marginLeft: 15,
  },

  childName: {
    fontSize: 19,
    fontWeight: "900",
    color: "#294F4A",
  },

  childAge: {
    fontSize: 12,
    color: "#64817D",
    marginTop: 4,
    lineHeight: 17,
  },

  growthBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 8,
  },

  growthBadgeText: {
    fontSize: 10,
    color: "#4E837A",
    fontWeight: "800",
  },

  arrow: {
    fontSize: 28,
    color: "#71918D",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#294F4A",
    marginBottom: 4,
  },

  sectionDescription: {
    fontSize: 12,
    color: "#79938F",
    lineHeight: 18,
    marginBottom: 13,
  },

  growthGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    gap: 8,
  },

  growthBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 102,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },

  growthIcon: {
    fontSize: 22,
    marginBottom: 6,
  },

  growthValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#315D57",
  },

  growthLabel: {
    fontSize: 10.5,
    color: "#79938F",
    marginTop: 3,
    textAlign: "center",
  },

  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  featureCard: {
    width: "48.5%",
    minHeight: 138,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },

  featureCardWide: {
    width: "100%",
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 2,
  },

  featureIcon: {
    width: 49,
    height: 49,
    borderRadius: 25,
    backgroundColor: "#E2F3EF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  featureIconWide: {
    marginBottom: 0,
    marginRight: 14,
  },

  featureCopyWide: {
    flex: 1,
  },

  featureEmoji: {
    fontSize: 24,
  },

  featureTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#315D57",
    textAlign: "center",
  },

  featureTitleWide: {
    textAlign: "left",
  },

  featureSubtitle: {
    fontSize: 9,
    color: "#79938F",
    textAlign: "center",
    marginTop: 3,
  },

  featureSubtitleWide: {
    textAlign: "left",
    fontSize: 11,
  },

  vaccineCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0D2",
    borderRadius: 23,
    padding: 18,
    marginBottom: 16,
  },

  vaccineIconCircle: {
    width: 57,
    height: 57,
    borderRadius: 29,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  vaccineIcon: {
    fontSize: 27,
  },

  vaccineInfo: {
    flex: 1,
    marginLeft: 14,
  },

  vaccineTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#75572A",
  },

  vaccineText: {
    fontSize: 12,
    color: "#8A7045",
    lineHeight: 17,
    marginTop: 4,
  },

  vaccineLink: {
    fontSize: 12,
    color: "#AD7A28",
    fontWeight: "900",
    marginTop: 6,
  },

  tipCard: {
    backgroundColor: "#E7E0F7",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },

  tipLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#70599B",
    letterSpacing: 0.5,
  },

  tipText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#62537E",
    marginTop: 8,
  },

  aiCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCEBF7",
    borderRadius: 22,
    padding: 17,
    marginBottom: 20,
  },

  aiIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  aiIcon: {
    fontSize: 27,
  },

  aiInfo: {
    flex: 1,
    marginLeft: 13,
  },

  aiTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#365B79",
  },

  aiText: {
    fontSize: 12,
    color: "#60788D",
    marginTop: 3,
    lineHeight: 17,
  },

  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 20,
    gap: 10,
  },

  bottomButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  bottomIcon: {
    fontSize: 22,
    marginBottom: 4,
  },

  bottomText: {
    fontSize: 11,
    color: "#597570",
    fontWeight: "800",
    textAlign: "center",
  },
});
