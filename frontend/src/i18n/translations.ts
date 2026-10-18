export type SupportedLanguage = "English" | "Kannada" | "Hindi" | "Tamil" | "Telugu";

export type TranslationKeys = {
  // Common & Branding
  appName: string;
  tagline: string;
  loading: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  back: string;
  close: string;
  confirm: string;
  success: string;
  error: string;

  // Language & Navigation
  language: string;
  switchLanguage: string;
  switchMode: string;
  logout: string;
  dashboard: string;
  pregnancy: string;
  child: string;
  notifications: string;
  appointments: string;
  medicines: string;
  reports: string;
  journal: string;
  chatbot: string;
  health: string;
  nutrition: string;
  foodguide: string;
  vaccination: string;
  profile: string;

  // Dashboard - Pregnancy
  welcomeMama: string;
  pregnancyJourney: string;
  currentWeek: string;
  daysToDue: string;
  trimester: string;
  firstTrimester: string;
  secondTrimester: string;
  thirdTrimester: string;
  weeklySelfCare: string;
  weeklyGuidanceDesc: string;
  quickActions: string;
  upcomingAppointments: string;
  activeMedicines: string;
  recentJournal: string;
  askAiBannerTitle: string;
  askAiBannerDesc: string;
  askAiBtn: string;

  // Dashboard - Child
  welcomeParent: string;
  childJourney: string;
  childAge: string;
  nextVaccine: string;
  growthMetrics: string;
  pediatricAppointments: string;

  // Onboarding & Permissions
  onboardingWelcome: string;
  onboardingSubtitle: string;
  selectLanguageTitle: string;
  selectLanguageDesc: string;
  permissionNotificationsTitle: string;
  permissionNotificationsDesc: string;
  permissionVoiceTitle: string;
  permissionVoiceDesc: string;
  allowBtn: string;
  allowedBtn: string;
  getStartedBtn: string;

  // Chatbot
  chatbotTitle: string;
  chatbotSubtitle: string;
  chatbotPlaceholder: string;
  voiceAssistant: string;
  listenBtn: string;
  stopVoiceBtn: string;
  suggestedQuestions: string;
  disclaimer: string;

  // Mode Selection
  chooseYourMode: string;
  selectJourneyDesc: string;
  pregnancyMode: string;
  pregnancyModeDesc: string;
  childMode: string;
  childModeDesc: string;
  continueBtn: string;

  // Pregnancy Weekly Guide
  pregnancyGuideTitle: string;
  pregnancyGuideSubtitle: string;
  yourBodyThisWeek: string;
  commonSymptoms: string;
  weeklyWellnessTip: string;
  nutrientFocus: string;
  selectWeek: string;

  // Child Milestones
  milestonesTitle: string;
  milestonesSubtitle: string;
  momentsCelebrated: string;
  everydayDiscoveries: string;

  // Appointments
  appointmentsTitle: string;
  appointmentsSubtitle: string;
  addAppointment: string;
  noAppointments: string;
  noAppointmentsDesc: string;
  doctorName: string;
  hospitalClinic: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  notes: string;
  saveAppointment: string;

  // Medicines
  medicinesTitle: string;
  medicinesSubtitle: string;
  addMedicine: string;
  noMedicines: string;
  noMedicinesDesc: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  timings: string;
  startDate: string;
  endDate: string;
  saveMedicine: string;

  // Journal
  journalTitle: string;
  journalSubtitle: string;
  newEntry: string;
  noJournal: string;
  noJournalDesc: string;
  entryTitle: string;
  entryContent: string;
  howAreYouFeeling: string;
  addPhoto: string;
  saveJournal: string;

  // Food Guide & Nutrition
  foodGuideTitle: string;
  foodGuideSubtitle: string;
  recommendedGroups: string;
  nutritionTitle: string;
  nutritionSubtitle: string;

  // Health
  healthTrackerTitle: string;
  healthTrackerSubtitle: string;
  logVitals: string;
  bloodPressure: string;
  bloodSugar: string;
  weight: string;
  height: string;

  // Reports
  reportsTitle: string;
  reportsSubtitle: string;
  uploadReport: string;
  noReports: string;
  noReportsDesc: string;

  // Notifications Screen
  notificationsTitle: string;
  notificationsSubtitle: string;
  noNotifications: string;
  noNotificationsDesc: string;
  clearAll: string;

  // Growth Tracker
  growthTracker: string;
  recordMeasurements: string;
  growthNote: string;
  saveMeasurements: string;
  growthUpdated: string;
  growthSaved: string;
  checkMeasurements: string;
  enterValidMeasurements: string;

  // Profile Setup & Edit
  childProfile: string;
  childProfileSubtitle: string;
  childProfileDesc: string;
  basicInformation: string;
  childName: string;
  dateOfBirth: string;
  gender: string;
  male: string;
  female: string;
  other: string;
  bloodGroup: string;
  healthInformation: string;
  additionalNotes: string;
  childNotesPlaceholder: string;
  privacyNotice: string;
  saveChildProfile: string;
  updateLaterNote: string;

  pregnancyProfile: string;
  pregnancyProfileSubtitle: string;
  pregnancyProfileDesc: string;
  pregnancyInformation: string;
  currentPregnancyWeek: string;
  weekRangeNote: string;
  expectedDueDate: string;
  prePregnancyWeight: string;
  currentWeight: string;
  pregnancyNotesPlaceholder: string;
  savePregnancyProfile: string;

  editProfile: string;
  editProfileSubtitle: string;
  editing: string;
  saveChanges: string;

  // Register
  createAccount: string;
  createAccountSubtitle: string;
  yourDetails: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  createMyAccount: string;
  alreadyHaveAccount: string;
  signIn: string;
  registerTagline: string;
};

export const TRANSLATIONS: Record<SupportedLanguage, TranslationKeys> = {
  English: {
    appName: "Little Bloom",
    tagline: "Your smart companion for mother & child",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    close: "Close",
    confirm: "Confirm",
    success: "Success",
    error: "Error",

    language: "Language",
    switchLanguage: "Change Language",
    switchMode: "Switch Mode",
    logout: "Sign Out",
    dashboard: "Dashboard",
    pregnancy: "Pregnancy",
    child: "Child",
    notifications: "Notifications",
    appointments: "Appointments",
    medicines: "Medicines",
    reports: "Medical Reports",
    journal: "Journal",
    chatbot: "AI Assistant",
    health: "Health Tracker",
    nutrition: "Nutrition",
    foodguide: "Food Safety",
    vaccination: "Vaccinations",
    profile: "Profile",

    welcomeMama: "Welcome Back, Mama 💕",
    pregnancyJourney: "Your Pregnancy Journey 🌸",
    currentWeek: "Week",
    daysToDue: "Days to Due Date",
    trimester: "Trimester",
    firstTrimester: "1st Trimester",
    secondTrimester: "2nd Trimester",
    thirdTrimester: "3rd Trimester",
    weeklySelfCare: "Mother's Weekly Self-Care 🌸",
    weeklyGuidanceDesc: "Gentle guidance for bodily changes, symptoms, and wellbeing.",
    quickActions: "Quick Health Actions",
    upcomingAppointments: "Upcoming Doctor Visits",
    activeMedicines: "Active Prescriptions",
    recentJournal: "Recent Memories",
    askAiBannerTitle: "Ask Little Bloom AI 🤖",
    askAiBannerDesc: "AI healthcare assistant available in your language 24/7.",
    askAiBtn: "Chat Now →",

    welcomeParent: "Welcome, Parent 🧸",
    childJourney: "Child Growth Journey 👶",
    childAge: "Age",
    nextVaccine: "Upcoming Vaccine",
    growthMetrics: "Growth Tracker",
    pediatricAppointments: "Pediatric Visits",

    onboardingWelcome: "Welcome to Little Bloom 🌸",
    onboardingSubtitle: "Let's set up your personalized maternal care experience",
    selectLanguageTitle: "Choose Your Language",
    selectLanguageDesc: "Select your preferred language for the app and AI chatbot.",
    permissionNotificationsTitle: "Enable Reminders & Alerts 🔔",
    permissionNotificationsDesc: "Get on-time alerts for pregnancy medicines, child vaccines, and appointments.",
    permissionVoiceTitle: "AI Healthcare Assistant 🌸",
    permissionVoiceDesc: "Get expert answers on maternal and childcare health in your language.",
    allowBtn: "Allow",
    allowedBtn: "Allowed ✓",
    getStartedBtn: "Get Started 🌸",

    chatbotTitle: "Little Bloom AI 🤖",
    chatbotSubtitle: "Maternal & Childcare AI Chatbot",
    chatbotPlaceholder: "Ask any pregnancy or childcare question...",
    voiceAssistant: "AI Assistant",
    listenBtn: "Read",
    stopVoiceBtn: "Stop",
    suggestedQuestions: "Suggested questions for you:",
    disclaimer: "ℹ️ AI answers are for informational guidance and do not replace professional medical advice.",

    chooseYourMode: "Choose Your Mode",
    selectJourneyDesc: "Select the care journey you want to continue with.",
    pregnancyMode: "Pregnancy Mode",
    pregnancyModeDesc: "Track pregnancy health, nutrition, appointments, reports and more.",
    childMode: "Child Mode",
    childModeDesc: "Track baby's milestones, growth records, vaccinations and health.",
    continueBtn: "Continue",

    pregnancyGuideTitle: "Mother's Weekly Guide",
    pregnancyGuideSubtitle: "Explore changes in your body, weekly wellness tips, and trimester care.",
    yourBodyThisWeek: "Your Body This Week",
    commonSymptoms: "Common Sensations & Symptoms",
    weeklyWellnessTip: "Weekly Wellness Tip",
    nutrientFocus: "Recommended Nutrient Focus",
    selectWeek: "Select Week",

    milestonesTitle: "Little Milestones",
    milestonesSubtitle: "The small moments make a big story. Save the things you want to remember.",
    momentsCelebrated: "moments celebrated",
    everydayDiscoveries: "Everyday discoveries",

    appointmentsTitle: "Doctor Visits 📅",
    appointmentsSubtitle: "Keep visits organized & set timely reminders",
    addAppointment: "+ Schedule Visit",
    noAppointments: "No upcoming visits yet",
    noAppointmentsDesc: "Add scheduled check-ups or scans to get reminders on time.",
    doctorName: "Doctor's Name",
    hospitalClinic: "Hospital or Clinic",
    appointmentDate: "Visit Date",
    appointmentTime: "Visit Time",
    appointmentType: "Visit Purpose / Type",
    notes: "Notes & Instructions",
    saveAppointment: "Save Appointment",

    medicinesTitle: "Medicine Tracker 💊",
    medicinesSubtitle: "Stay safely on schedule with reminder alerts",
    addMedicine: "+ Add Prescription",
    noMedicines: "No active prescriptions",
    noMedicinesDesc: "Add prescribed prenatal vitamins or medicines for reminder alerts.",
    medicineName: "Medicine Name",
    dosage: "Dosage (e.g. 500mg, 1 tablet)",
    frequency: "Frequency",
    timings: "Timings (e.g. 09:00 AM)",
    startDate: "Start Date",
    endDate: "End Date",
    saveMedicine: "Save Medicine",

    journalTitle: "Daily Journal 📝",
    journalSubtitle: "Cherish memories, mood, and photos along your journey",
    newEntry: "+ New Journal Entry",
    noJournal: "No memories recorded yet",
    noJournalDesc: "Capture how you feel today and attach photo memories.",
    entryTitle: "Entry Title",
    entryContent: "What is on your mind today?",
    howAreYouFeeling: "How are you feeling today?",
    addPhoto: "📷 Add Photo Memory",
    saveJournal: "Save Memory",

    foodGuideTitle: "Food & Safety Guide 🥗",
    foodGuideSubtitle: "Nourishing food groups supporting mother & child wellbeing",
    recommendedGroups: "Recommended Food Groups",
    nutritionTitle: "Nutrition & Diet Plan 🍎",
    nutritionSubtitle: "Personalized meal and hydration guidance",

    healthTrackerTitle: "Health Vitals Tracker ❤️",
    healthTrackerSubtitle: "Monitor blood pressure, weight, and health logs",
    logVitals: "+ Log Health Vitals",
    bloodPressure: "Blood Pressure",
    bloodSugar: "Blood Sugar",
    weight: "Current Weight (kg)",
    height: "Height (cm)",

    reportsTitle: "Medical Records 📄",
    reportsSubtitle: "Safely store ultrasounds, lab tests, and prescriptions",
    uploadReport: "+ Upload Record",
    noReports: "No records uploaded yet",
    noReportsDesc: "Keep your medical files easily accessible in one secure spot.",

    notificationsTitle: "Reminders & Alerts 🔔",
    notificationsSubtitle: "Your upcoming alarms for medicines, vaccines, and visits",
    noNotifications: "No new notifications",
    noNotificationsDesc: "You are completely up to date with your care schedule!",
    clearAll: "Clear All",

    growthTracker: "Growth Tracker",
    recordMeasurements: "Record your child’s latest measurements.",
    growthNote: "Measurements are stored on your child’s profile and shown on the dashboard.",
    saveMeasurements: "Save measurements",
    growthUpdated: "Growth updated",
    growthSaved: "Your child's latest measurements have been saved.",
    checkMeasurements: "Check measurements",
    enterValidMeasurements: "Enter a height and weight greater than zero.",

    childProfile: "Child Profile",
    childProfileSubtitle: "Tell us about your little one",
    childProfileDesc: "Add your child's details so Little Bloom can personalize their growth and care journey.",
    basicInformation: "Basic Information",
    childName: "Child's Name",
    dateOfBirth: "Date of Birth",
    gender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    bloodGroup: "Blood Group",
    healthInformation: "Health Information",
    additionalNotes: "Additional Notes",
    childNotesPlaceholder: "Add any child-related notes...",
    privacyNotice: "Your information is stored securely and is used to personalize your Little Bloom care experience.",
    saveChildProfile: "Save Child Profile",
    updateLaterNote: "You can update these details later from your profile.",

    pregnancyProfile: "Pregnancy Profile",
    pregnancyProfileSubtitle: "Let's get to know you",
    pregnancyProfileDesc: "Add your pregnancy details so Little Bloom can personalize your health journey.",
    pregnancyInformation: "Pregnancy Information",
    currentPregnancyWeek: "Current Pregnancy Week",
    weekRangeNote: "Enter a value between 1 and 42 weeks.",
    expectedDueDate: "Expected Due Date",
    prePregnancyWeight: "Pre-Pregnancy Weight (kg)",
    currentWeight: "Current Weight (kg)",
    pregnancyNotesPlaceholder: "Add any pregnancy-related notes...",
    savePregnancyProfile: "Save Pregnancy Profile",

    editProfile: "Edit Profile",
    editProfileSubtitle: "Update your saved information",
    editing: "EDITING",
    saveChanges: "Save Changes",

    createAccount: "Create Account",
    createAccountSubtitle: "Begin your beautiful Little Bloom journey 💕",
    yourDetails: "Your Details",
    fullName: "Full Name",
    email: "Email",
    phoneNumber: "Phone Number",
    password: "Password",
    confirmPassword: "Confirm Password",
    createMyAccount: "Create My Account",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign In",
    registerTagline: "🌿 Your journey. Your health. Your little bloom.",
  },

  Kannada: {
    appName: "ಲಿಟಲ್ ಬ್ಲೂಮ್",
    tagline: "ತಾಯಿ ಮತ್ತು ಮಗುವಿನ ಸ್ಮಾರ್ಟ್ ಆರೈಕೆ ಸಂಗಾತಿ",
    loading: "ತೆರೆಯಲಾಗುತ್ತಿದೆ...",
    save: "ಉಳಿಸಿ",
    cancel: "ರದ್ದುಮಾಡಿ",
    delete: "ಅಳಿಸಿ",
    edit: "ತಿದ್ದುಪಡಿ",
    back: "ಹಿಂದಕ್ಕೆ",
    close: "ಮುಚ್ಚಿ",
    confirm: "ದೃಢೀಕರಿಸಿ",
    success: "ಯಶಸ್ವಿ",
    error: "ದೋಷ",

    language: "ಭಾಷೆ",
    switchLanguage: "ಭಾಷೆ ಬದಲಾಯಿಸಿ",
    switchMode: "ಮೋಡ್ ಬದಲಾಯಿಸಿ",
    logout: "ಹೊರಹೋಗಿ",
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    pregnancy: "ಗರ್ಭಾವಸ್ಥೆ",
    child: "ಮಗುವಿನ ಆರೈಕೆ",
    notifications: "ಸೂಚನೆಗಳು",
    appointments: "ವೈದ್ಯರ ಭೇಟಿ",
    medicines: "ಔಷಧಿಗಳು",
    reports: "ವರದಿಗಳು",
    journal: "ದಿನಚರಿ",
    chatbot: "ಎಐ ಸಹಾಯಕ",
    health: "ಆರೋಗ್ಯ",
    nutrition: "ಪೌಷ್ಟಿಕಾಂಶ",
    foodguide: "ಆಹಾರ ಸುರಕ್ಷತೆ",
    vaccination: "ಲಸಿಕೆಗಳು",
    profile: "ಪ್ರೊಫೈಲ್",

    welcomeMama: "ಸುಸ್ವಾಗತ, ಅಮ್ಮಾ 💕",
    pregnancyJourney: "ನಿಮ್ಮ ಗರ್ಭಾವಸ್ಥೆಯ ಪಯಣ 🌸",
    currentWeek: "ವಾರ",
    daysToDue: "ಹೆರಿಗೆ ದಿನಕ್ಕೆ ಬಾಕಿ ದಿನಗಳು",
    trimester: "ತ್ರೈಮಾಸಿಕ",
    firstTrimester: "1ನೇ ತ್ರೈಮಾಸಿಕ",
    secondTrimester: "2ನೇ ತ್ರೈಮಾಸಿಕ",
    thirdTrimester: "3ನೇ ತ್ರೈಮಾಸಿಕ",
    weeklySelfCare: "ತಾಯಿಯ ಸಾಪ್ತಾಹಿಕ ಆರೈಕೆ 🌸",
    weeklyGuidanceDesc: "ದೇಹದ ಬದಲಾವಣೆಗಳು, ಲಕ್ಷಣಗಳು ಮತ್ತು ಆರೋಗ್ಯಕ್ಕೆ ಮಾರ್ಗದರ್ಶನ.",
    quickActions: "ತ್ವರಿತ ಸೇವೆಗಳು",
    upcomingAppointments: "ಮುಂದಿನ ವೈದ್ಯರ ಭೇಟಿಗಳು",
    activeMedicines: "ಸಕ್ರಿಯ ಔಷಧಿಗಳು",
    recentJournal: "ಇತ್ತೀಚಿನ ನೆನಪುಗಳು",
    askAiBannerTitle: "ಲಿಟಲ್ ಬ್ಲೂಮ್ ಎಐ ಕೇಳಿ 🤖",
    askAiBannerDesc: "ಕನ್ನಡದಲ್ಲೇ 24/7 ಧ್ವನಿ ಮತ್ತು ಪಠ್ಯ ಸಹಾಯ ಲಭ್ಯವಿದೆ.",
    askAiBtn: "ಈಗಲೇ ಚಾಟ್ ಮಾಡಿ →",

    welcomeParent: "ಸುಸ್ವಾಗತ 🧸",
    childJourney: "ಮಗುವಿನ ಬೆಳವಣಿಗೆಯ ಪಯಣ 👶",
    childAge: "ವಯಸ್ಸು",
    nextVaccine: "ಮುಂದಿನ ಲಸಿಕೆ",
    growthMetrics: "ಬೆಳವಣಿಗೆಯ ಟ್ರ್ಯಾಕರ್",
    pediatricAppointments: "ಮಕ್ಕಳ ವೈದ್ಯರ ಭೇಟಿ",

    onboardingWelcome: "ಲಿಟಲ್ ಬ್ಲೂಮ್‌ಗೆ ಸುಸ್ವಾಗತ 🌸",
    onboardingSubtitle: "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಆರೋಗ್ಯ ಅನುಭವವನ್ನು ಸಿದ್ಧಪಡಿಸೋಣ",
    selectLanguageTitle: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    selectLanguageDesc: "ಅಪ್ಲಿಕೇಶನ್ ಮತ್ತು ಎಐ ಚಾಟ್‌ಬಾಟ್‌ಗಾಗಿ ನಿಮ್ಮ ಮೆಚ್ಚಿನ ಭಾಷೆ ಆರಿಸಿ.",
    permissionNotificationsTitle: "ಸೂಚನೆಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ 🔔",
    permissionNotificationsDesc: "ಔಷಧಿ, ಲಸಿಕೆ ಮತ್ತು ವೈದ್ಯರ ಭೇಟಿಗೆ ಸರಿಯಾದ ಸಮಯಕ್ಕೆ ಎಚ್ಚರಿಕೆ ಪಡೆಯಿರಿ.",
    permissionVoiceTitle: "ಎಐ ಆರೋಗ್ಯ ಸಹಾಯಕ 🌸",
    permissionVoiceDesc: "ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲೇ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ನಿಖರ ಉತ್ತರ ಪಡೆಯಿರಿ.",
    allowBtn: "ಅನುಮತಿಸಿ",
    allowedBtn: "ಅನುಮತಿಸಲಾಗಿದೆ ✓",
    getStartedBtn: "ಪ್ರಾರಂಭಿಸಿ 🌸",

    chatbotTitle: "ಲಿಟಲ್ ಬ್ಲೂಮ್ ಎಐ 🤖",
    chatbotSubtitle: "ಕನ್ನಡ ಮಾತೃ ಆರೈಕೆ ಎಐ ಚಾಟ್‌ಬಾಟ್",
    chatbotPlaceholder: "ಗರ್ಭಾವಸ್ಥೆಯ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ...",
    voiceAssistant: "ಎಐ ಸಹಾಯಕ",
    listenBtn: "ಓದಿ",
    stopVoiceBtn: "ನಿಲ್ಲಿಸಿ",
    suggestedQuestions: "ನಿಮಗಾಗಿ ಸಲಹೆ ಪ್ರಶ್ನೆಗಳು:",
    disclaimer: "ℹ️ ಎಐ ಉತ್ತರಗಳು ಮಾಹಿತಿಗಾಗಿ ಮಾತ್ರ, ವೈದ್ಯರ ಸಲಹೆಗೆ ಪರ್ಯಾಯವಲ್ಲ.",

    chooseYourMode: "ನಿಮ್ಮ ಮೋಡ್ ಆಯ್ಕೆಮಾಡಿ",
    selectJourneyDesc: "ನೀವು ಮುಂದುವರಿಸಲು ಬಯಸುವ ಆರೈಕೆಯ ಪಯಣವನ್ನು ಆರಿಸಿ.",
    pregnancyMode: "ಗರ್ಭಾವಸ್ಥೆಯ ಮೋಡ್",
    pregnancyModeDesc: "ಗರ್ಭಾವಸ್ಥೆಯ ಆರೋಗ್ಯ, ಆಹಾರ, ವೈದ್ಯರ ಭೇಟಿ ಮತ್ತು ವರದಿಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.",
    childMode: "ಮಗುವಿನ ಮೋಡ್",
    childModeDesc: "ಮಗುವಿನ ಬೆಳವಣಿಗೆ, ಲಸಿಕೆಗಳು, ಮೈಲಿಗಲ್ಲುಗಳು ಮತ್ತು ಆರೋಗ್ಯವನ್ನು ದಾಖಲಿಸಿ.",
    continueBtn: "ಮುಂದುವರಿಯಿರಿ",

    pregnancyGuideTitle: "ತಾಯಿಯ ಸಾಪ್ತಾಹಿಕ ಮಾರ್ಗದರ್ಶಿ",
    pregnancyGuideSubtitle: "ನಿಮ್ಮ ದೇಹದ ಬದಲಾವಣೆಗಳು, ಸಾಪ್ತಾಹಿಕ ಆರೋಗ್ಯ ಸಲಹೆಗಳು ಮತ್ತು ತ್ರೈಮಾಸಿಕದ ಕಾಳಜಿ.",
    yourBodyThisWeek: "ಈ ವಾರ ನಿಮ್ಮ ದೇಹ",
    commonSymptoms: "ಸಾಮಾನ್ಯ ಲಕ್ಷಣಗಳು",
    weeklyWellnessTip: "ಸಾಪ್ತಾಹಿಕ ಆರೋಗ್ಯ ಸಲಹೆ",
    nutrientFocus: "ಪೌಷ್ಟಿಕಾಂಶದ ಗಮನ",
    selectWeek: "ವಾರ ಆಯ್ಕೆಮಾಡಿ",

    milestonesTitle: "ಮಗುವಿನ ಮೈಲಿಗಲ್ಲುಗಳು",
    milestonesSubtitle: "ಪುಟ್ಟ ನೆನಪುಗಳು ದೊಡ್ಡ ಕಥೆಯಾಗುತ್ತವೆ. ನೀವು ನೆನಪಿಟ್ಟುಕೊಳ್ಳಲು ಬಯಸುವ ಕ್ಷಣಗಳನ್ನು ಉಳಿಸಿ.",
    momentsCelebrated: "ಕ್ಷಣಗಳನ್ನು ಸಂಭ್ರಮಿಸಲಾಗಿದೆ",
    everydayDiscoveries: "ದೈನಂದಿನ ಆವಿಷ್ಕಾರಗಳು",

    appointmentsTitle: "ವೈದ್ಯರ ಭೇಟಿಗಳು 📅",
    appointmentsSubtitle: "ಭೇಟಿಗಳನ್ನು ಸರಿಯಾಗಿ ನಿಗದಿಪಡಿಸಿ ಮತ್ತು ಸಮಯಕ್ಕೆ ಎಚ್ಚರಿಕೆ ಪಡೆಯಿರಿ",
    addAppointment: "+ ಹೊಸ ಭೇಟಿ ಸೇರಿಸಿ",
    noAppointments: "ಯಾವುದೇ ಮುಂಬರುವ ಭೇಟಿಗಳಿಲ್ಲ",
    noAppointmentsDesc: "ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಎಚ್ಚರಿಕೆ ಪಡೆಯಲು ವೈದ್ಯರ ತಪಾಸಣೆಯನ್ನು ಸೇರಿಸಿ.",
    doctorName: "ವೈದ್ಯರ ಹೆಸರು",
    hospitalClinic: "ಆಸ್ಪತ್ರೆ ಅಥವಾ ಕ್ಲಿನಿಕ್",
    appointmentDate: "ಭೇಟಿಯ ದಿನಾಂಕ",
    appointmentTime: "ಭೇಟಿಯ ಸಮಯ",
    appointmentType: "ಭೇಟಿಯ ಉದ್ದೇಶ / ವಿಧ",
    notes: "ಟಿಪ್ಪಣಿಗಳು ಮತ್ತು ಸೂಚನೆಗಳು",
    saveAppointment: "ಭೇಟಿಯನ್ನು ಉಳಿಸಿ",

    medicinesTitle: "ಔಷಧಿಗಳ ಟ್ರ್ಯಾಕರ್ 💊",
    medicinesSubtitle: "ಸರಿಯಾದ ಸಮಯಕ್ಕೆ ಔಷಧಿಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲು ಎಚ್ಚರಿಕೆಗಳು",
    addMedicine: "+ ಹೊಸ ಔಷಧಿ ಸೇರಿಸಿ",
    noMedicines: "ಯಾವುದೇ ಸಕ್ರಿಯ ಔಷಧಿಗಳಿಲ್ಲ",
    noMedicinesDesc: "ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ನೆನಪಿಸಲು ವೈದ್ಯರು ನೀಡಿದ ಮಾತ್ರೆಗಳನ್ನು ಸೇರಿಸಿ.",
    medicineName: "ಔಷಧಿಯ ಹೆಸರು",
    dosage: "ಪ್ರಮಾಣ (ಉದಾ: 500mg, 1 ಮಾತ್ರೆ)",
    frequency: "ಆವರ್ತನ",
    timings: "ಸಮಯ (ಉದಾ: 09:00 AM)",
    startDate: "ಪ್ರಾರಂಭ ದಿನಾಂಕ",
    endDate: "ಮುಕ್ತಾಯ ದಿನಾಂಕ",
    saveMedicine: "ಔಷಧಿಯನ್ನು ಉಳಿಸಿ",

    journalTitle: "ದೈನಂದಿನ ದಿನಚರಿ 📝",
    journalSubtitle: "ನಿಮ್ಮ ಪಯಣದ ನೆನಪುಗಳು, ಭಾವನೆಗಳು ಮತ್ತು ಫೋಟೋಗಳನ್ನು ದಾಖಲಿಸಿ",
    newEntry: "+ ಹೊಸ ನೆನಪು ಬರೆಯಿರಿ",
    noJournal: "ಇನ್ನೂ ಯಾವುದೇ ನೆನಪುಗಳನ್ನು ಬರೆದಿಲ್ಲ",
    noJournalDesc: "ಇಂದು ನಿಮ್ಮ ಅನುಭವ ಹೇಗಿತ್ತು ಎಂಬುದನ್ನು ಬರೆಯಿರಿ ಮತ್ತು ಫೋಟೋ ಸೇರಿಸಿ.",
    entryTitle: "ಶೀರ್ಷಿಕೆ",
    entryContent: "ಇಂದು ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಏನಿದೆ?",
    howAreYouFeeling: "ಇಂದು ನಿಮ್ಮ ಭಾವನೆ ಹೇಗಿದೆ?",
    addPhoto: "📷 ಫೋಟೋ ಸೇರಿಸಿ",
    saveJournal: "ನೆನಪನ್ನು ಉಳಿಸಿ",

    foodGuideTitle: "ಆಹಾರ ಮತ್ತು ಸುರಕ್ಷತಾ ಮಾರ್ಗದರ್ಶಿ 🥗",
    foodGuideSubtitle: "ತಾಯಿ ಮತ್ತು ಮಗುವಿನ ಆರೋಗ್ಯವನ್ನು ಬೆಂಬಲಿಸುವ ಪೌಷ್ಟಿಕ ಆಹಾರ ಗುಂಪುಗಳು",
    recommendedGroups: "ಶಿಫಾರಸು ಮಾಡಿದ ಆಹಾರಗಳು",
    nutritionTitle: "ಪೌಷ್ಟಿಕಾಂಶ ಮತ್ತು ಆಹಾರ ಯೋಜನೆ 🍎",
    nutritionSubtitle: "ವೈಯಕ್ತಿಕ ಊಟ ಮತ್ತು ನೀರಿನ ಸೇವನೆಯ ಮಾರ್ಗದರ್ಶನ",

    healthTrackerTitle: "ಆರೋಗ್ಯ ಟ್ರ್ಯಾಕರ್ ❤️",
    healthTrackerSubtitle: "ರಕ್ತದೊತ್ತಡ, ತೂಕ ಮತ್ತು ಆರೋಗ್ಯದ ವಿವರಗಳನ್ನು ದಾಖಲಿಸಿ",
    logVitals: "+ ಆರೋಗ್ಯ ವಿವರ ಸೇರಿಸಿ",
    bloodPressure: "ರಕ್ತದೊತ್ತಡ (BP)",
    bloodSugar: "ರಕ್ತದ ಸಕ್ಕರೆ (Sugar)",
    weight: "ಪ್ರಸ್ತುತ ತೂಕ (kg)",
    height: "ಎತ್ತರ (cm)",

    reportsTitle: "ವೈದ್ಯಕೀಯ ವರದಿಗಳು 📄",
    reportsSubtitle: "ಸ್ಕ್ಯಾನ್ ಮತ್ತು ರಕ್ತ ಪರೀಕ್ಷೆಯ ವರದಿಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಇರಿಸಿ",
    uploadReport: "+ ವರದಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    noReports: "ಯಾವುದೇ ವರದಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿಲ್ಲ",
    noReportsDesc: "ನಿಮ್ಮ ಎಲ್ಲಾ ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿರಿಸಿ.",

    notificationsTitle: "ಸೂಚನೆಗಳು ಮತ್ತು ನೆನಪಿಸುವಿಕೆಗಳು 🔔",
    notificationsSubtitle: "ಔಷಧಿಗಳು, ಲಸಿಕೆಗಳು ಮತ್ತು ವೈದ್ಯರ ಭೇಟಿಯ ಅಲಾರಾಂಗಳು",
    noNotifications: "ಯಾವುದೇ ಹೊಸ ಸೂಚನೆಗಳಿಲ್ಲ",
    noNotificationsDesc: "ನಿಮ್ಮ ಎಲ್ಲಾ ಆರೋಗ್ಯ ಕಾರ್ಯಗಳು ಸಂಪೂರ್ಣವಾಗಿ ನವೀಕೃತವಾಗಿವೆ!",
    clearAll: "ಎಲ್ಲವನ್ನೂ ಅಳಿಸಿ",

    growthTracker: "ಬೆಳವಣಿಗೆಯ ಟ್ರ್ಯಾಕರ್",
    recordMeasurements: "ನಿಮ್ಮ ಮಗುವಿನ ಇತ್ತೀಚಿನ ಅಳತೆಗಳನ್ನು ದಾಖಲಿಸಿ.",
    growthNote: "ಅಳತೆಗಳನ್ನು ಮಗುವಿನ ಪ್ರೊಫೈಲ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ತೋರಿಸಲಾಗುತ್ತದೆ.",
    saveMeasurements: "ಅಳತೆಗಳನ್ನು ಉಳಿಸಿ",
    growthUpdated: "ಬೆಳವಣಿಗೆ ನವೀಕರಿಸಲಾಗಿದೆ",
    growthSaved: "ನಿಮ್ಮ ಮಗುವಿನ ಇತ್ತೀಚಿನ ಅಳತೆಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.",
    checkMeasurements: "ಅಳತೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
    enterValidMeasurements: "ದಯವಿಟ್ಟು ಸೊನ್ನೆಗಿಂತ ಹೆಚ್ಚಿನ ಎತ್ತರ ಮತ್ತು ತೂಕವನ್ನು ನಮೂದಿಸಿ.",

    childProfile: "ಮಗುವಿನ ಪ್ರೊಫೈಲ್",
    childProfileSubtitle: "ನಿಮ್ಮ ಮುದ್ದು ಕಂದಮ್ಮನ ಬಗ್ಗೆ ತಿಳಿಸಿ",
    childProfileDesc: "ನಿಮ್ಮ ಮಗುವಿನ ವಿವರಗಳನ್ನು ಸೇರಿಸಿ, ಇದರಿಂದ ಲಿಟಲ್ ಬ್ಲೂಮ್ ಅವರ ಬೆಳವಣಿಗೆಯನ್ನು ವೈಯಕ್ತೀಕರಿಸಬಹುದು.",
    basicInformation: "ಮೂಲ ಮಾಹಿತಿ",
    childName: "ಮಗುವಿನ ಹೆಸರು",
    dateOfBirth: "ಹುಟ್ಟಿದ ದಿನಾಂಕ",
    gender: "ಲಿಂಗ",
    male: "ಗಂಡು",
    female: "ಹೆಣ್ಣು",
    other: "ಇತರೆ",
    bloodGroup: "ರಕ್ತದ ಗುಂಪು",
    healthInformation: "ಆರೋಗ್ಯ ಮಾಹಿತಿ",
    additionalNotes: "ಹೆಚ್ಚುವರಿ ಟಿಪ್ಪಣಿಗಳು",
    childNotesPlaceholder: "ಮಗುವಿಗೆ ಸಂಬಂಧಿಸಿದ ಟಿಪ್ಪಣಿಗಳನ್ನು ಸೇರಿಸಿ...",
    privacyNotice: "ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ ಮತ್ತು ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಆರೈಕೆಗಾಗಿ ಮಾತ್ರ ಬಳಸಲಾಗುತ್ತದೆ.",
    saveChildProfile: "ಮಗುವಿನ ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ",
    updateLaterNote: "ನೀವು ಈ ವಿವರಗಳನ್ನು ನಂತರ ಪ್ರೊಫೈಲ್‌ನಿಂದ ನವೀಕರಿಸಬಹುದು.",

    pregnancyProfile: "ಗರ್ಭಧಾರಣೆಯ ಪ್ರೊಫೈಲ್",
    pregnancyProfileSubtitle: "ನಿಮ್ಮನ್ನು ಪರಿಚಯಿಸಿಕೊಳ್ಳಿ",
    pregnancyProfileDesc: "ನಿಮ್ಮ ಗರ್ಭಧಾರಣೆಯ ವಿವರಗಳನ್ನು ಸೇರಿಸಿ, ಇದರಿಂದ ಲಿಟಲ್ ಬ್ಲೂಮ್ ನಿಮ್ಮ ಆರೈಕೆಯನ್ನು ವೈಯಕ್ತೀಕರಿಸಬಹುದು.",
    pregnancyInformation: "ಗರ್ಭಧಾರಣೆಯ ಮಾಹಿತಿ",
    currentPregnancyWeek: "ಪ್ರಸ್ತುತ ಗರ್ಭಧಾರಣೆಯ ವಾರ",
    weekRangeNote: "1 ರಿಂದ 42 ರ ನಡುವಿನ ವಾರವನ್ನು ನಮೂದಿಸಿ.",
    expectedDueDate: "ಹೆರಿಗೆಯ ಅಂದಾಜು ದಿನಾಂಕ",
    prePregnancyWeight: "ಗರ್ಭಧಾರಣೆಯ ಪೂರ್ವ ತೂಕ (ಕೆಜಿ)",
    currentWeight: "ಪ್ರಸ್ತುತ ತೂಕ (ಕೆಜಿ)",
    pregnancyNotesPlaceholder: "ಗರ್ಭಧಾರಣೆಗೆ ಸಂಬಂಧಿಸಿದ ಟಿಪ್ಪಣಿಗಳನ್ನು ಸೇರಿಸಿ...",
    savePregnancyProfile: "ಗರ್ಭಧಾರಣೆಯ ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ",

    editProfile: "ಪ್ರೊಫೈಲ್ ತಿದ್ದುಪಡಿ",
    editProfileSubtitle: "ಉಳಿಸಿದ ಮಾಹಿತಿಯನ್ನು ನವೀಕರಿಸಿ",
    editing: "ತಿದ್ದುಪಡಿ ಮಾಡಲಾಗುತ್ತಿದೆ",
    saveChanges: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ",

    createAccount: "ಖಾತೆ ತೆರೆಯಿರಿ",
    createAccountSubtitle: "ನಿಮ್ಮ ಸುಂದರವಾದ ಲಿಟಲ್ ಬ್ಲೂಮ್ ಪಯಣವನ್ನು ಪ್ರಾರಂಭಿಸಿ 💕",
    yourDetails: "ನಿಮ್ಮ ವಿವರಗಳು",
    fullName: "ಪೂರ್ಣ ಹೆಸರು",
    email: "ಇಮೇಲ್",
    phoneNumber: "ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
    password: "ಪಾಸ್‌ವರ್ಡ್",
    confirmPassword: "ಪಾಸ್‌ವರ್ಡ್ ಖಚಿತಪಡಿಸಿ",
    createMyAccount: "ನನ್ನ ಖಾತೆ ತೆರೆಯಿರಿ",
    alreadyHaveAccount: "ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?",
    signIn: "ಸೈನ್ ಇನ್",
    registerTagline: "🌿 ನಿಮ್ಮ ಪಯಣ. ನಿಮ್ಮ ಆರೋಗ್ಯ. ನಿಮ್ಮ ಲಿಟಲ್ ಬ್ಲೂಮ್.",
  },

  Hindi: {
    appName: "लिटिल ब्लूम",
    tagline: "मां और बच्चे का स्मार्ट स्वास्थ्य साथी",
    loading: "लोड हो रहा है...",
    save: "सहेजें",
    cancel: "रद्द करें",
    delete: "हटाएं",
    edit: "संपादित करें",
    back: "वापस",
    close: "बंद करें",
    confirm: "पुष्टि करें",
    success: "सफल",
    error: "त्रुटि",

    language: "भाषा",
    switchLanguage: "भाषा बदलें",
    switchMode: "मोड बदलें",
    logout: "लॉग आउट",
    dashboard: "डैशबोर्ड",
    pregnancy: "गर्भावस्था",
    child: "शिशु देखभाल",
    notifications: "सूचनाएं",
    appointments: "डॉक्टर विजिट",
    medicines: "दवाइयां",
    reports: "मेडिकल रिपोर्ट्स",
    journal: "डायरी",
    chatbot: "एआई सहायक",
    health: "स्वास्थ्य",
    nutrition: "पोषण",
    foodguide: "आहार सुरक्षा",
    vaccination: "टीकाकरण",
    profile: "प्रोफाइल",

    welcomeMama: "सुस्वागतम, मां 💕",
    pregnancyJourney: "आपकी गर्भावस्था यात्रा 🌸",
    currentWeek: "सप्ताह",
    daysToDue: "डिलीवरी के दिन शेष",
    trimester: "तिमाही",
    firstTrimester: "पहली तिमाही",
    secondTrimester: "दूसरी तिमाही",
    thirdTrimester: "तीसरी तिमाही",
    weeklySelfCare: "मां की साप्ताहिक देखभाल 🌸",
    weeklyGuidanceDesc: "शारीरिक बदलाव, लक्षण और स्वास्थ्य के लिए सहज मार्गदर्शन।",
    quickActions: "त्वरित स्वास्थ्य सेवाएं",
    upcomingAppointments: "आगामी डॉक्टर विजिट्स",
    activeMedicines: "सक्रिय दवाइयां",
    recentJournal: "हाल की यादें",
    askAiBannerTitle: "लिटिल ब्लूम एआई से पूछें 🤖",
    askAiBannerDesc: "हिंदी में 24/7 आवाज और चैट सहायता उपलब्ध है।",
    askAiBtn: "अभी चैट करें →",

    welcomeParent: "स्वागत है 🧸",
    childJourney: "शिशु विकास यात्रा 👶",
    childAge: "उम्र",
    nextVaccine: "अगला टीका",
    growthMetrics: "विकास ट्रैकर",
    pediatricAppointments: "शिशु रोग विशेषज्ञ विजिट",

    onboardingWelcome: "लिटिल ब्लूम में आपका स्वागत है 🌸",
    onboardingSubtitle: "आइए आपकी व्यक्तिगत मातृत्व देखभाल का अनुभव शुरू करें",
    selectLanguageTitle: "अपनी भाषा चुनें",
    selectLanguageDesc: "ऐप और एआई चैटबॉट के लिए अपनी पसंदीदा भाषा चुनें।",
    permissionNotificationsTitle: "रिमाइंडर और सूचनाएं चालू करें 🔔",
    permissionNotificationsDesc: "दवाइयों, टीकों और डॉक्टर विजिट के लिए समय पर अलर्ट पाएं।",
    permissionVoiceTitle: "एआई स्वास्थ्य सहायिका 🌸",
    permissionVoiceDesc: "अपनी भाषा में मातृत्व और शिशु स्वास्थ्य से जुड़े सवालों के जवाब पाएं।",
    allowBtn: "अनुमति दें",
    allowedBtn: "अनुमति दी गई ✓",
    getStartedBtn: "शुरू करें 🌸",

    chatbotTitle: "लिटिल ब्लूम एआई 🤖",
    chatbotSubtitle: "मातृत्व एवं शिशु स्वास्थ्य एआई चैटबॉट",
    chatbotPlaceholder: "गर्भावस्था के बारे में कोई भी सवाल पूछें...",
    voiceAssistant: "एआई सहायिका",
    listenBtn: "पढ़ें",
    stopVoiceBtn: "रोकें",
    suggestedQuestions: "आपके लिए सुझाए गए प्रश्न:",
    disclaimer: "ℹ️ एआई उत्तर केवल जानकारी के लिए हैं, डॉक्टर की सलाह का विकल्प नहीं।",

    chooseYourMode: "अपना मोड चुनें",
    selectJourneyDesc: "वह स्वास्थ्य यात्रा चुनें जिसे आप जारी रखना चाहती हैं।",
    pregnancyMode: "गर्भावस्था मोड",
    pregnancyModeDesc: "गर्भावस्था का स्वास्थ्य, खान-पान, अपॉइंटमेंट्स और रिपोर्ट्स ट्रैक करें।",
    childMode: "शिशु मोड",
    childModeDesc: "बच्चे के माइलस्टोन्स, विकास रिकॉर्ड, टीके और स्वास्थ्य ट्रैक करें।",
    continueBtn: "जारी रखें",

    pregnancyGuideTitle: "मां की साप्ताहिक गाइड",
    pregnancyGuideSubtitle: "शरीर में बदलाव, साप्ताहिक स्वास्थ्य सलाह और तिमाही के अनुसार देखभाल।",
    yourBodyThisWeek: "इस हफ्ते आपका शरीर",
    commonSymptoms: "सामान्य लक्षण",
    weeklyWellnessTip: "साप्ताहिक स्वास्थ्य टिप",
    nutrientFocus: "पोषण का मुख्य ध्यान",
    selectWeek: "सप्ताह चुनें",

    milestonesTitle: "शिशु के माइलस्टोन्स",
    milestonesSubtitle: "छोटे पल बड़ी कहानी बनाते हैं। उन यादों को सहेजें जिन्हें आप याद रखना चाहते हैं।",
    momentsCelebrated: "पल मनाए गए",
    everydayDiscoveries: "दैनिक खोजें",

    appointmentsTitle: "डॉक्टर विजिट्स 📅",
    appointmentsSubtitle: "विजिट्स को व्यवस्थित रखें और समय पर रिमाइंडर पाएं",
    addAppointment: "+ नई विजिट जोड़ें",
    noAppointments: "कोई आगामी विजिट नहीं है",
    noAppointmentsDesc: "समय पर रिमाइंडर पाने के लिए डॉक्टर चेकअप जोड़ें।",
    doctorName: "डॉक्टर का नाम",
    hospitalClinic: "अस्पताल या क्लिनिक",
    appointmentDate: "विजिट की तारीख",
    appointmentTime: "विजिट का समय",
    appointmentType: "विजिट का उद्देश्य",
    notes: "नोट्स और निर्देश",
    saveAppointment: "विजिट सहेजें",

    medicinesTitle: "दवाइयां ट्रैकर 💊",
    medicinesSubtitle: "समय पर दवाइयां लेने के लिए रिमाइंडर अलर्ट",
    addMedicine: "+ नई दवा जोड़ें",
    noMedicines: "कोई सक्रिय दवा नहीं है",
    noMedicinesDesc: "समय पर याद दिलाने के लिए डॉक्टर द्वारा दी गई दवाइयां जोड़ें।",
    medicineName: "दवा का नाम",
    dosage: "खुराक (जैसे 500mg, 1 गोली)",
    frequency: "फ्रीक्वेंसी",
    timings: "समय (जैसे 09:00 AM)",
    startDate: "शुरू करने की तारीख",
    endDate: "समाप्ति तारीख",
    saveMedicine: "दवा सहेजें",

    journalTitle: "दैनिक डायरी 📝",
    journalSubtitle: "अपनी यात्रा की यादें, मनोदशा और तस्वीरें संजोएं",
    newEntry: "+ नई याद लिखें",
    noJournal: "अभी तक कोई याद नहीं लिखी गई",
    noJournalDesc: "आज आप कैसा महसूस कर रही हैं लिखें और तस्वीर जोड़ें।",
    entryTitle: "शीर्षक",
    entryContent: "आज आपके मन में क्या है?",
    howAreYouFeeling: "आज आप कैसा महसूस कर रही हैं?",
    addPhoto: "📷 तस्वीर जोड़ें",
    saveJournal: "याद सहेजें",

    foodGuideTitle: "आहार एवं सुरक्षा गाइड 🥗",
    foodGuideSubtitle: "मां और बच्चे के स्वास्थ्य के लिए पौष्टिक खाद्य समूह",
    recommendedGroups: "सुझाए गए खाद्य समूह",
    nutritionTitle: "पोषण और आहार योजना 🍎",
    nutritionSubtitle: "व्यक्तिगत भोजन और पानी की गाइड",

    healthTrackerTitle: "स्वास्थ्य ट्रैकर ❤️",
    healthTrackerSubtitle: "ब्लड प्रेशर, वजन और स्वास्थ्य रिकॉर्ड्स ट्रैक करें",
    logVitals: "+ वाइटल्स जोड़ें",
    bloodPressure: "ब्लड प्रेशर (BP)",
    bloodSugar: "ब्लड शुगर",
    weight: "वर्तमान वजन (kg)",
    height: "लंबाई (cm)",

    reportsTitle: "मेडिकल रिपोर्ट्स 📄",
    reportsSubtitle: "सोनोग्राफी और ब्लड टेस्ट रिपोर्ट्स सुरक्षित रखें",
    uploadReport: "+ रिपोर्ट अपलोड करें",
    noReports: "कोई रिपोर्ट अपलोड नहीं की गई",
    noReportsDesc: "अपनी सभी मेडिकल फाइल्स को एक सुरक्षित जगह पर रखें।",

    notificationsTitle: "रिमाइंडर और सूचनाएं 🔔",
    notificationsSubtitle: "दवाइयों, टीकों और विजिट्स के आगामी अलार्म",
    noNotifications: "कोई नई सूचना नहीं है",
    noNotificationsDesc: "आपका स्वास्थ्य शेड्यूल पूरी तरह अपडेट है!",
    clearAll: "सभी हटाएं",

    growthTracker: "विकास ट्रैकर",
    recordMeasurements: "अपने बच्चे के नवीनतम माप दर्ज करें।",
    growthNote: "माप बच्चे के प्रोफाइल में सहेजे जाते हैं और डैशबोर्ड पर दिखाए जाते हैं।",
    saveMeasurements: "माप सहेजें",
    growthUpdated: "विकास अपडेट हुआ",
    growthSaved: "आपके बच्चे के नवीनतम माप सफलतापूर्वक सहेज लिए गए हैं।",
    checkMeasurements: "माप जांचें",
    enterValidMeasurements: "कृपया शून्य से अधिक ऊंचाई और वजन दर्ज करें।",

    childProfile: "बच्चे की प्रोफाइल",
    childProfileSubtitle: "अपने नन्हे-मुन्ने के बारे में बताएं",
    childProfileDesc: "अपने बच्चे का विवरण जोड़ें ताकि लिटिल ब्लूम उनकी देखभाल यात्रा को निजीकृत कर सके।",
    basicInformation: "बुनियादी जानकारी",
    childName: "बच्चे का नाम",
    dateOfBirth: "जन्म तिथि",
    gender: "लिंग",
    male: "लड़का",
    female: "लड़की",
    other: "अन्य",
    bloodGroup: "रक्त समूह",
    healthInformation: "स्वास्थ्य जानकारी",
    additionalNotes: "अतिरिक्त नोट्स",
    childNotesPlaceholder: "बच्चे से जुड़े कोई नोट्स जोड़ें...",
    privacyNotice: "आपकी जानकारी सुरक्षित रूप से संग्रहीत है और देखभाल को निजीकृत करने के लिए उपयोग की जाती है।",
    saveChildProfile: "बच्चे की प्रोफाइल सहेजें",
    updateLaterNote: "आप इन विवरणों को बाद में अपनी प्रोफाइल से अपडेट कर सकते हैं।",

    pregnancyProfile: "गर्भावस्था प्रोफाइल",
    pregnancyProfileSubtitle: "आइए आपके बारे में जानें",
    pregnancyProfileDesc: "अपनी गर्भावस्था का विवरण जोड़ें ताकि लिटिल ब्लूम आपकी स्वास्थ्य यात्रा को निजीकृत कर सके।",
    pregnancyInformation: "गर्भावस्था जानकारी",
    currentPregnancyWeek: "वर्तमान गर्भावस्था सप्ताह",
    weekRangeNote: "1 से 42 के बीच का सप्ताह दर्ज करें।",
    expectedDueDate: "संभावित प्रसव तिथि",
    prePregnancyWeight: "गर्भावस्था पूर्व वजन (किग्रा)",
    currentWeight: "वर्तमान वजन (किग्रा)",
    pregnancyNotesPlaceholder: "गर्भावस्था संबंधी कोई नोट्स जोड़ें...",
    savePregnancyProfile: "गर्भावस्था प्रोफाइल सहेजें",

    editProfile: "प्रोफाइल संपादित करें",
    editProfileSubtitle: "अपनी सहेजी गई जानकारी को अपडेट करें",
    editing: "संपादन जारी",
    saveChanges: "परिवर्तन सहेजें",

    createAccount: "खाता बनाएं",
    createAccountSubtitle: "अपनी सुंदर लिटिल ब्लूम यात्रा शुरू करें 💕",
    yourDetails: "आपका विवरण",
    fullName: "पूरा नाम",
    email: "ईमेल",
    phoneNumber: "फोन नंबर",
    password: "पासवर्ड",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    createMyAccount: "मेरा खाता बनाएं",
    alreadyHaveAccount: "क्या पहले से एक खाता है?",
    signIn: "साइन इन करें",
    registerTagline: "🌿 आपकी यात्रा। आपका स्वास्थ्य। आपका लिटिल ब्लूम।",
  },

  Tamil: {
    appName: "லிட்டில் ப்ளூம்",
    tagline: "தாய் மற்றும் குழந்தையின் ஸ்மார்ட் பராமரிப்பு தோழன்",
    loading: "ஏற்றப்படுகிறது...",
    save: "சேமி",
    cancel: "ரத்து செய்",
    delete: "நீக்கு",
    edit: "திருத்து",
    back: "பின்செல்",
    close: "மூடு",
    confirm: "உறுதிப்படுத்து",
    success: "வெற்றி",
    error: "பிழை",

    language: "மொழி",
    switchLanguage: "மொழியை மாற்றவும்",
    switchMode: "முறையை மாற்றவும்",
    logout: "வெளியேறு",
    dashboard: "முகப்பு",
    pregnancy: "கர்ப்ப காலம்",
    child: "குழந்தை நலம்",
    notifications: "அறிவிப்புகள்",
    appointments: "மருத்துவர் சந்திப்பு",
    medicines: "மருந்துகள்",
    reports: "மருத்துவ அறிக்கைகள்",
    journal: "டைரி",
    chatbot: "ஏஐ உதவியாளர்",
    health: "ஆரோக்கியம்",
    nutrition: "ஊட்டச்சத்து",
    foodguide: "உணவுப் பாதுகாப்பு",
    vaccination: "தடுப்பூசிகள்",
    profile: "சுயவிவரம்",

    welcomeMama: "நல்வரவு, அம்மா 💕",
    pregnancyJourney: "உங்கள் கர்ப்பப் பயணம் 🌸",
    currentWeek: "வாரம்",
    daysToDue: "பிரசவத்திற்கு மீதமுள்ள நாட்கள்",
    trimester: "முப்பருவம்",
    firstTrimester: "1வது முப்பருவம்",
    secondTrimester: "2வது முப்பருவம்",
    thirdTrimester: "3வது முப்பருவம்",
    weeklySelfCare: "தாயின் வாராந்திர சுயபராமரிப்பு 🌸",
    weeklyGuidanceDesc: "உடல் மாற்றங்கள், அறிகுறிகள் மற்றும் நல்வாழ்விற்கான மென்மையான வழிகாட்டுதல்.",
    quickActions: "விரைவு சேவைகள்",
    upcomingAppointments: "அடுத்த மருத்துவர் சந்திப்புகள்",
    activeMedicines: "தற்போதைய மருந்துகள்",
    recentJournal: "சமீபத்திய நினைவுகள்",
    askAiBannerTitle: "லிட்டில் ப்ளூம் ஏஐயிடம் கேளுங்கள் 🤖",
    askAiBannerDesc: "தமிழில் 24/7 குரல் மற்றும் உரை உதவி கிடைக்கும்.",
    askAiBtn: "இப்போதே பேசுங்கள் →",

    welcomeParent: "வணக்கம் 🧸",
    childJourney: "குழந்தை வளர்ச்சிப் பயணம் 👶",
    childAge: "வயது",
    nextVaccine: "அடுத்த தடுப்பூசி",
    growthMetrics: "வளர்ச்சி கண்காணிப்பு",
    pediatricAppointments: "குழந்தை நல மருத்துவர் சந்திப்பு",

    onboardingWelcome: "லிட்டில் ப்ளூமிற்கு நல்வரவு 🌸",
    onboardingSubtitle: "உங்கள் தனிப்பயனாக்கப்பட்ட அனுபவத்தைத் தொடங்குவோம்",
    selectLanguageTitle: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    selectLanguageDesc: "செயலி மற்றும் ஏஐ சேட்பாட்டுக்கான விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்.",
    permissionNotificationsTitle: "அறிவிப்புகளை இயக்கவும் 🔔",
    permissionNotificationsDesc: "மருந்துகள், தடுப்பூசிகள் மற்றும் சந்திப்புகளுக்கு சரியான நேர நினைவூட்டல்களைப் பெறுங்கள்.",
    permissionVoiceTitle: "ஏஐ தாய்மை நல உதவியாளர் 🌸",
    permissionVoiceDesc: "உங்கள் தாய்மொழியில் தாய்மை மற்றும் குழந்தை நல கேள்விகளுக்கு விடை பெறுங்கள்.",
    allowBtn: "அனுமதி",
    allowedBtn: "அனுமதிக்கப்பட்டது ✓",
    getStartedBtn: "தொடங்குங்கள் 🌸",

    chatbotTitle: "லிட்டில் ப்ளூம் ஏஐ 🤖",
    chatbotSubtitle: "தாய்மை நல ஏஐ சேட்பாட்",
    chatbotPlaceholder: "கர்ப்பம் தொடர்பான எந்த கேள்வியையும் கேளுங்கள்...",
    voiceAssistant: "AI உதவியாளர்",
    listenBtn: "படி",
    stopVoiceBtn: "நிறுத்து",
    suggestedQuestions: "பரிந்துரைக்கப்பட்ட கேள்விகள்:",
    disclaimer: "ℹ️ ஏஐ பதில்கள் தகவல் நோக்கங்களுக்காக மட்டுமே, மருத்துவ ஆலோசனைக்கு ஈடாகாது.",

    chooseYourMode: "உங்கள் பயன்முறையைத் தேர்ந்தெடுக்கவும்",
    selectJourneyDesc: "நீங்கள் தொடர விரும்பும் பராமரிப்புப் பயணத்தைத் தேர்ந்தெடுக்கவும்.",
    pregnancyMode: "கர்ப்ப கால பயன்முறை",
    pregnancyModeDesc: "கர்ப்ப ஆரோக்கியம், உணவு முறை, மருத்துவர் சந்திப்புகள் மற்றும் அறிக்கைகளைக் கண்காணிக்கவும்.",
    childMode: "குழந்தை பயன்முறை",
    childModeDesc: "குழந்தையின் மைல்கற்கள், வளர்ச்சி, தடுப்பூசிகள் மற்றும் ஆரோக்கியத்தைப் பதிவு செய்யவும்.",
    continueBtn: "தொடரவும்",

    pregnancyGuideTitle: "தாயின் வாராந்திர வழிகாட்டி",
    pregnancyGuideSubtitle: "உடல் மாற்றங்கள், வாராந்திர ஆரோக்கிய குறிப்புகள் மற்றும் பராமரிப்பு.",
    yourBodyThisWeek: "இந்த வாரம் உங்கள் உடல்",
    commonSymptoms: "பொதுவான அறிகுறிகள்",
    weeklyWellnessTip: "வாராந்திர ஆரோக்கிய குறிப்பு",
    nutrientFocus: "ஊட்டச்சத்து கவனம்",
    selectWeek: "வாரத்தைத் தேர்ந்தெடுக்கவும்",

    milestonesTitle: "குழந்தையின் மைல்கற்கள்",
    milestonesSubtitle: "சிறு தருணங்கள் பெரிய கதையாகின்றன. நீங்கள் நினைவில் கொள்ள விரும்பும் தருணங்களை சேமிக்கவும்.",
    momentsCelebrated: "தருணங்கள் கொண்டாடப்பட்டன",
    everydayDiscoveries: "தினசரி கண்டுபிடிப்புகள்",

    appointmentsTitle: "மருத்துவர் சந்திப்புகள் 📅",
    appointmentsSubtitle: "சந்திப்புகளை ஒழுங்கமைத்து சரியான நேரத்தில் நினைவூட்டல்களைப் பெறுங்கள்",
    addAppointment: "+ புதிய சந்திப்பு சேர்க்க",
    noAppointments: "வரவிருக்கும் சந்திப்புகள் எதுவும் இல்லை",
    noAppointmentsDesc: "நினைவூட்டல்களைப் பெற மருத்துவர் சந்திப்புகளைச் சேர்க்கவும்.",
    doctorName: "மருத்துவர் பெயர்",
    hospitalClinic: "மருத்துவமனை அல்லது கிளினிக்",
    appointmentDate: "சந்திப்பு தேதி",
    appointmentTime: "சந்திப்பு நேரம்",
    appointmentType: "சந்திப்பு வகை",
    notes: "குறிப்புகள் மற்றும் வழிமுறைகள்",
    saveAppointment: "சந்திப்பைச் சேமிக்கவும்",

    medicinesTitle: "மருந்துகள் கண்காணிப்பாளர் 💊",
    medicinesSubtitle: "நேரத்திற்கு மருந்துகளை உட்கொள்ள நினைவூட்டல்கள்",
    addMedicine: "+ புதிய மருந்து சேர்க்க",
    noMedicines: "செயலில் உள்ள மருந்துகள் எதுவும் இல்லை",
    noMedicinesDesc: "சரியான நேர நினைவூட்டல்களுக்கு பரிந்துரைக்கப்பட்ட மருந்துகளைச் சேர்க்கவும்.",
    medicineName: "மருந்தின் பெயர்",
    dosage: "அளவு (எ.கா: 500mg, 1 மாத்திரை)",
    frequency: "அதிர்வெண்",
    timings: "நேரம் (எ.கா: 09:00 AM)",
    startDate: "தொடக்க தேதி",
    endDate: "முடிவு தேதி",
    saveMedicine: "மருந்தைச் சேமிக்கவும்",

    journalTitle: "தினசரி டைரி 📝",
    journalSubtitle: "உங்கள் பயணத்தின் நினைவுகள், உணர்வுகள் மற்றும் புகைப்படங்களைப் பதிவு செய்யுங்கள்",
    newEntry: "+ புதிய பதிவு எழுதவும்",
    noJournal: "இன்னும் பதிவுகள் எதுவும் இல்லை",
    noJournalDesc: "இன்று நீங்கள் எப்படி உணர்கிறீர்கள் என்பதை எழுதி புகைப்படங்களைச் சேர்க்கவும்.",
    entryTitle: "தலைப்பு",
    entryContent: "இன்று உங்கள் மனதில் என்ன இருக்கிறது?",
    howAreYouFeeling: "இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?",
    addPhoto: "📷 புகைப்படம் சேர்க்க",
    saveJournal: "நினைவைச் சேமிக்கவும்",

    foodGuideTitle: "உணவு வழிகாட்டி 🥗",
    foodGuideSubtitle: "தாய் மற்றும் குழந்தையின் ஆரோக்கியத்தை மேம்படுத்தும் ஊட்டச்சத்து உணவுகள்",
    recommendedGroups: "பரிந்துரைக்கப்பட்ட உணவுகள்",
    nutritionTitle: "ஊட்டச்சத்து மற்றும் உணவுத் திட்டம் 🍎",
    nutritionSubtitle: "தனிப்பயனாக்கப்பட்ட உணவு மற்றும் நீர் வழிகாட்டுதல்",

    healthTrackerTitle: "ஆரோக்கிய கண்காணிப்பாளர் ❤️",
    healthTrackerSubtitle: "ரத்த அழுத்தம், எடை மற்றும் உடல்நிலை பதிவுகள்",
    logVitals: "+ ஆரோக்கிய விவரம் சேர்க்க",
    bloodPressure: "ரத்த அழுத்தம் (BP)",
    bloodSugar: "ரத்த சர்க்கரை",
    weight: "தற்போதைய எடை (kg)",
    height: "உயரம் (cm)",

    reportsTitle: "மருத்துவ அறிக்கைகள் 📄",
    reportsSubtitle: "ஸ்கேன் மற்றும் ரத்த பரிசோதனை அறிக்கைகளைப் பாதுகாக்கவும்",
    uploadReport: "+ அறிக்கை பதிவேற்றவும்",
    noReports: "அறிக்கைகள் எதுவும் பதிவேற்றப்படவில்லை",
    noReportsDesc: "உங்கள் அனைத்து மருத்துவ கோப்புகளையும் ஒரே பாதுகாப்பான இடத்தில் வைக்கவும்.",

    notificationsTitle: "நினைவூட்டல்கள் மற்றும் அறிவிப்புகள் 🔔",
    notificationsSubtitle: "மருந்துகள், தடுப்பூசிகள் மற்றும் சந்திப்புகளுக்கான அலாரங்கள்",
    noNotifications: "புதிய அறிவிப்புகள் இல்லை",
    noNotificationsDesc: "உங்கள் அனைத்து அட்டவணைகளும் புதுப்பிக்கப்பட்டுள்ளன!",
    clearAll: "அனைத்தையும் நீக்கு",

    growthTracker: "வளர்ச்சி கண்காணிப்பு",
    recordMeasurements: "உங்கள் குழந்தையின் சமீபத்திய அளவீடுகளைப் பதிவு செய்யுங்கள்.",
    growthNote: "அளவீடுகள் குழந்தையின் சுயவிவரத்தில் சேமிக்கப்பட்டு டாஷ்போர்டில் காண்பிக்கப்படும்.",
    saveMeasurements: "அளவீடுகளைச் சேமிக்கவும்",
    growthUpdated: "வளர்ச்சி புதுப்பிக்கப்பட்டது",
    growthSaved: "உங்கள் குழந்தையின் சமீபத்திய அளவீடுகள் வெற்றிகரமாகச் சேமிக்கப்பட்டன.",
    checkMeasurements: "அளவீடுகளைச் சரிபார்க்கவும்",
    enterValidMeasurements: "பூஜ்ஜியத்தை விட அதிகமான உயரம் மற்றும் எடையை உள்ளிடவும்.",

    childProfile: "குழந்தையின் சுயவிவரம்",
    childProfileSubtitle: "உங்கள் செல்லக் குழந்தையைப் பற்றி கூறுங்கள்",
    childProfileDesc: "லிட்டில் ப்ளூம் அவர்களின் பராமரிப்பைத் தனிப்பயனாக்க குழந்தையின் விவரங்களைச் சேர்க்கவும்.",
    basicInformation: "அடிப்படை தகவல்",
    childName: "குழந்தையின் பெயர்",
    dateOfBirth: "பிறந்த தேதி",
    gender: "பாலினம்",
    male: "ஆண்",
    female: "பெண்",
    other: "மற்றவை",
    bloodGroup: "இரத்த பிரிவு",
    healthInformation: "சுகாதார தகவல்",
    additionalNotes: "கூடுதல் குறிப்புகள்",
    childNotesPlaceholder: "குழந்தை தொடர்பான ஏதேனும் குறிப்புகளைச் சேர்க்கவும்...",
    privacyNotice: "உங்கள் தகவல் பாதுகாப்பாக வைக்கப்பட்டு தனிப்பயனாக்கப்பட்ட பராமரிப்பிற்கு மட்டுமே பயன்படுத்தப்படுகிறது.",
    saveChildProfile: "குழந்தை சுயவிவரத்தைச் சேமி",
    updateLaterNote: "இந்த விவரங்களை நீங்கள் பின்னர் உங்கள் சுயவிவரத்திலிருந்து புதுப்பிக்கலாம்.",

    pregnancyProfile: "கர்ப்ப சுயவிவரம்",
    pregnancyProfileSubtitle: "உங்களைப் பற்றி தெரிந்து கொள்வோம்",
    pregnancyProfileDesc: "லிட்டில் ப்ளூம் உங்கள் சுகாதார பயணத்தைத் தனிப்பயனாக்க உங்கள் கர்ப்ப விவரங்களைச் சேர்க்கவும்.",
    pregnancyInformation: "கர்ப்ப தகவல்",
    currentPregnancyWeek: "தற்போதைய கர்ப்ப வாரம்",
    weekRangeNote: "1 முதல் 42 வாரங்களுக்குள் உள்ள வாரத்தை உள்ளிடவும்.",
    expectedDueDate: "எதிர்பார்க்கப்படும் பிரசவ தேதி",
    prePregnancyWeight: "கர்ப்பத்திற்கு முந்தைய எடை (கிலோ)",
    currentWeight: "தற்போதைய எடை (கிலோ)",
    pregnancyNotesPlaceholder: "கர்ப்பம் தொடர்பான குறிப்புகளைச் சேர்க்கவும்...",
    savePregnancyProfile: "கர்ப்ப சுயவிவரத்தைச் சேமி",

    editProfile: "சுயவிவரத்தைத் திருத்தவும்",
    editProfileSubtitle: "உங்கள் சேமிக்கப்பட்ட தகவலைப் புதுப்பிக்கவும்",
    editing: "திருத்துகிறது",
    saveChanges: "மாற்றங்களைச் சேமி",

    createAccount: "கணக்கை உருவாக்கவும்",
    createAccountSubtitle: "உங்கள் அழகான லிட்டில் ப்ளூம் பயணத்தைத் தொடங்குங்கள் 💕",
    yourDetails: "உங்கள் விவரங்கள்",
    fullName: "முழு பெயர்",
    email: "மின்னஞ்சல்",
    phoneNumber: "தொலைபேசி எண்",
    password: "கடவுச்சொல்",
    confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    createMyAccount: "என் கணக்கை உருவாக்கவும்",
    alreadyHaveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
    signIn: "உள்நுழைக",
    registerTagline: "🌿 உங்கள் பயணம். உங்கள் ஆரோக்கியம். உங்கள் லிட்டில் ப்ளூம்.",
  },

  Telugu: {
    appName: "లిటిల్ బ్లూమ్",
    tagline: "తల్లీ బిడ్డల స్మార్ట్ సంరక్షణ తోడు",
    loading: "లోడ్ అవుతోంది...",
    save: "సేవ్ చేయండి",
    cancel: "రద్దు చేయండి",
    delete: "తొలగించండి",
    edit: "సవరించండి",
    back: "వెనుకకు",
    close: "మూసివేయండి",
    confirm: "ధృవీకరించండి",
    success: "విజయవంతం",
    error: "లోపం",

    language: "భాష",
    switchLanguage: "భాష మార్చండి",
    switchMode: "మోడ్ మార్చండి",
    logout: "లాగ్ అవుట్",
    dashboard: "డాష్‌బోర్డ్",
    pregnancy: "గర్భధారణ",
    child: "శిశు సంరక్షణ",
    notifications: "నోటిఫికేషన్లు",
    appointments: "డాక్టర్ అపాయింట్‌మెంట్లు",
    medicines: "మందులు",
    reports: "మెడికల్ రిపోర్టులు",
    journal: "డైరీ",
    chatbot: "ఏఐ సహాయకురాలు",
    health: "ఆరోగ్యం",
    nutrition: "పోషకాహారం",
    foodguide: "ఆహార భద్రత",
    vaccination: "టీకాలు",
    profile: "ప్రొఫైల్",

    welcomeMama: "సుస్వాగతం అమ్మా 💕",
    pregnancyJourney: "మీ గర్భధారణ ప్రయాణం 🌸",
    currentWeek: "వారం",
    daysToDue: "డెలివరీకి మిగిలిన రోజులు",
    trimester: "త్రైమాసికం",
    firstTrimester: "1వ త్రైమాసికం",
    secondTrimester: "2వ త్రైమాసికం",
    thirdTrimester: "3వ త్రైమాసికం",
    weeklySelfCare: "తల్లి వారపు సంరక్షణ 🌸",
    weeklyGuidanceDesc: "శరీర మార్పులు, లక్షణాలు మరియు శ్రేయస్సు కొరకు మార్గదర్శకత్వం.",
    quickActions: "త్వరిత సేవలు",
    upcomingAppointments: "రాబోయే డాక్టర్ విజిట్లు",
    activeMedicines: "ప్రస్తుత మందులు",
    recentJournal: "ఇటీవలి జ్ఞాపకాలు",
    askAiBannerTitle: "లిటిల్ బ్లూమ్ ఏఐని అడగండి 🤖",
    askAiBannerDesc: "తెలుగులో 24/7 వాయిస్ మరియు టెక్స్ట్ సహాయం అందుబాటులో ఉంది.",
    askAiBtn: "ఇప్పుడే మాట్లాడండి →",

    welcomeParent: "స్వాగతం 🧸",
    childJourney: "శిశు ఎదుగుదల ప్రయాణం 👶",
    childAge: "వయస్సు",
    nextVaccine: "తదుపరి టీకా",
    growthMetrics: "ఎదుగుదల ట్రాకర్",
    pediatricAppointments: "పీడియాట్రిక్ విజిట్లు",

    onboardingWelcome: "లిటిల్ బ్లూమ్‌కు స్వాగతం 🌸",
    onboardingSubtitle: "మీ వ్యక్తిగత ఆరోగ్య అనుభవాన్ని ప్రారంభిద్దాం",
    selectLanguageTitle: "మీ భాషను ఎంచుకోండి",
    selectLanguageDesc: "యాప్ మరియు ఏఐ చాట్‌బాట్ కోసం మీ ప్రాధాన్యత భాషను ఎంచుకోండి.",
    permissionNotificationsTitle: "రిమైండర్లను ప్రారంభించండి 🔔",
    permissionNotificationsDesc: "మందులు, టీకాలు మరియు అపాయింట్‌మెంట్ల కోసం సమయానికి హెచ్చరికలను పొందండి.",
    permissionVoiceTitle: "ఏఐ ఆరోగ్య సహాయకురాలు 🌸",
    permissionVoiceDesc: "మీ మాతృభాషలోనే గర్భధారణ మరియు శిశు సంరక్షణ ప్రశ్నలకు సమాధానాలు పొందండి.",
    allowBtn: "అనుమతించు",
    allowedBtn: "అనుమతించబడింది ✓",
    getStartedBtn: "ప్రారంభించండి 🌸",

    chatbotTitle: "లిటిల్ బ్లూమ్ ఏఐ 🤖",
    chatbotSubtitle: "మాతృ మరియు శిశు సంరక్షణ ఏఐ చాట్‌బాట్",
    chatbotPlaceholder: "గర్భధారణ గురించి ఏదైనా ప్రశ్న అడగండి...",
    voiceAssistant: "AI సహాయకురాలు",
    listenBtn: "చదవండి",
    stopVoiceBtn: "ఆపండి",
    suggestedQuestions: "మీ కోసం సూచించిన ప్రశ్నలు:",
    disclaimer: "ℹ️ ఏఐ సమాధానాలు సమాచారం కొరకు మాత్రమే, వైద్యుల సలహాకు ప్రత్యామ్నాయం కాదు.",

    chooseYourMode: "మీ మోడ్‌ను ఎంచుకోండి",
    selectJourneyDesc: "మీరు కొనసాగించాలనుకుంటున్న సంరక్షణ ప్రయాణాన్ని ఎంచుకోండి.",
    pregnancyMode: "గర్భధారణ మోడ్",
    pregnancyModeDesc: "గర్భధారణ ఆరోగ్యం, ఆహారం, అపాయింట్‌మెంట్లు మరియు రిపోర్టులను ట్రాక్ చేయండి.",
    childMode: "శిశు మోడ్",
    childModeDesc: "బిడ్డ మైలురాళ్ళు, ఎదుగుదల రికార్డులు, టీకాలు మరియు ఆరోగ్యాన్ని నమోదు చేయండి.",
    continueBtn: "కొనసాగించండి",

    pregnancyGuideTitle: "తల్లి వారపు గైడ్",
    pregnancyGuideSubtitle: "శరీర మార్పులు, వారపు ఆరోగ్య సూచనలు మరియు త్రైమాసిక సంరక్షణ.",
    yourBodyThisWeek: "ఈ వారం మీ శరీరం",
    commonSymptoms: "సాధారణ లక్షణాలు",
    weeklyWellnessTip: "వారపు ఆరోగ్య చిట్కా",
    nutrientFocus: "పోషకాల శ్రద్ధ",
    selectWeek: "వారం ఎంచుకోండి",

    milestonesTitle: "చిన్నారి మైలురాళ్ళు",
    milestonesSubtitle: "చిన్న క్షణాలు పెద్ద కథలుగా మారతాయి. మీరు గుర్తుంచుకోవాలనుకునే జ్ఞాపకాలను భద్రపరుచుకోండి.",
    momentsCelebrated: "సందర్భాలు జరుపుకున్నారు",
    everydayDiscoveries: "రోజువారీ ఆవిష్కరణలు",

    appointmentsTitle: "డాక్టర్ విజిట్లు 📅",
    appointmentsSubtitle: "విజిట్లను నిర్వహించుకోండి మరియు సమయానికి రిమైండర్లను పొందండి",
    addAppointment: "+ కొత్త విజిట్ చేర్చండి",
    noAppointments: "రాబోయే విజిట్లు ఏవీ లేవు",
    noAppointmentsDesc: "సమయానికి హెచ్చరికలను పొందడానికి డాక్టర్ చెకప్‌లను జోడించండి.",
    doctorName: "వైద్యుడి పేరు",
    hospitalClinic: "హాస్పిటల్ లేదా క్లినిక్",
    appointmentDate: "విజిట్ తేదీ",
    appointmentTime: "విజిట్ సమయం",
    appointmentType: "విజిట్ రకం / ఉద్దేశం",
    notes: "సూచనలు మరియు నోట్స్",
    saveAppointment: "విజిట్‌ను సేవ్ చేయండి",

    medicinesTitle: "మందుల ట్రాకర్ 💊",
    medicinesSubtitle: "సమయానికి మందులు వేసుకోవడానికి రిమైండర్ హెచ్చరికలు",
    addMedicine: "+ కొత్త మందు చేర్చండి",
    noMedicines: "ప్రస్తుత మందులు ఏవీ లేవు",
    noMedicinesDesc: "సమయానికి గుర్తు చేయడానికి డాక్టర్ సూచించిన మందులను జోడించండి.",
    medicineName: "మందు పేరు",
    dosage: "మోతాదు (ఉదా: 500mg, 1 మాత్ర)",
    frequency: "ఫ్రీక్వెన్సీ",
    timings: "సమయం (ఉదా: 09:00 AM)",
    startDate: "ప్రారంభ తేదీ",
    endDate: "ముగింపు తేదీ",
    saveMedicine: "మందును సేవ్ చేయండి",

    journalTitle: "రోజువారీ డైరీ 📝",
    journalSubtitle: "మీ ప్రయాణంలోని జ్ఞాపకాలు, మనోభావాలు మరియు ఫోటోలను భద్రపరచండి",
    newEntry: "+ కొత్త జ్ఞాపకం రాయండి",
    noJournal: "ఇంకా ఎలాంటి జ్ఞాపకాలు రాయలేదు",
    noJournalDesc: "ఈ రోజు మీరు ఎలా భావిస్తున్నారో రాసి ఫోటోలను జతచేయండి.",
    entryTitle: "శీర్షిక",
    entryContent: "ఈ రోజు మీ మనస్సులో ఏముంది?",
    howAreYouFeeling: "ఈ రోజు మీరు ఎలా భావిస్తున్నారు?",
    addPhoto: "📷 ఫోటో జతచేయండి",
    saveJournal: "జ్ఞాపకాన్ని సేవ్ చేయండి",

    foodGuideTitle: "ఆహార మార్గదర్శి 🥗",
    foodGuideSubtitle: "తల్లీ బిడ్డల శ్రేయస్సుకు తోడ్పడే పోషకాహార గుంపులు",
    recommendedGroups: "సిఫార్సు చేయబడిన ఆహారాలు",
    nutritionTitle: "పోషకాహారం & డైట్ ప్లాన్ 🍎",
    nutritionSubtitle: "వ్యక్తిగత భోజనం మరియు నీటి వినియోగ మార్గదర్శకత్వం",

    healthTrackerTitle: "ఆరోగ్య ట్రాకర్ ❤️",
    healthTrackerSubtitle: "బ్లడ్ ప్రెజర్, బరువు మరియు ఆరోగ్య వివరాలను నమోదు చేయండి",
    logVitals: "+ ఆరోగ్య వివరాలు చేర్చండి",
    bloodPressure: "రక్తపోటు (BP)",
    bloodSugar: "రక్తంలో చక్కెర (Sugar)",
    weight: "ప్రస్తుత బరువు (kg)",
    height: "ఎత్తు (cm)",

    reportsTitle: "మెడికల్ రిపోర్టులు 📄",
    reportsSubtitle: "స్కాన్ మరియు రక్త పరీక్ష నివేదికలను భద్రంగా ఉంచండి",
    uploadReport: "+ రిపోర్ట్ అప్‌లోడ్ చేయండి",
    noReports: "ఇంకా రిపోర్టులేవీ అప్‌లోడ్ చేయలేదు",
    noReportsDesc: "మీ అన్ని మెడికల్ ఫైళ్ళను ఒకే సురక్షిత ప్రదేశంలో ఉంచండి.",

    notificationsTitle: "రిమైండర్లు & నోటిఫికేషన్లు 🔔",
    notificationsSubtitle: "మందులు, టీకాలు మరియు డాక్టర్ విజిట్ల కోసం అలారాలు",
    noNotifications: "కొత్త నోటిఫికేషన్లేవీ లేవు",
    noNotificationsDesc: "మీ ఆరోగ్య షెడ్యూల్ పూర్తిగా నవీకరించబడింది!",
    clearAll: "అన్నీ తొలగించండి",

    growthTracker: "ఎదుగుదల ట్రాకర్",
    recordMeasurements: "మీ బిడ్డ తాజా కొలతలను నమోదు చేయండి.",
    growthNote: "కొలతలు బిడ్డ ప్రొఫైల్‌లో సేవ్ చేయబడి డ్యాష్‌బోర్డ్‌లో చూపించబడతాయి.",
    saveMeasurements: "కొలతలను సేవ్ చేయండి",
    growthUpdated: "ఎదుగుదల నవీకరించబడింది",
    growthSaved: "మీ బిడ్డ తాజా కొలతలు విజయవంతంగా సేవ్ చేయబడ్డాయి.",
    checkMeasurements: "కొలతలను తనిఖీ చేయండి",
    enterValidMeasurements: "దయచేసి సున్నా కంటే ఎక్కువ ఎత్తు మరియు బరువును నమోదు చేయండి.",

    childProfile: "పిల్లల ప్రొఫైల్",
    childProfileSubtitle: "మీ చిన్నారుల గురించి తెలియజేయండి",
    childProfileDesc: "లిటిల్ బ్లూమ్ వారి సంరక్షణను వ్యక్తిగతీకరించడానికి మీ బిడ్డ వివరాలను జోడించండి.",
    basicInformation: "ప్రాథమిక సమాచారం",
    childName: "పిల్లల పేరు",
    dateOfBirth: "పుట్టిన తేదీ",
    gender: "లింగం",
    male: "మగ",
    female: "ఆడ",
    other: "ఇతర",
    bloodGroup: "రక్త వర్గం",
    healthInformation: "ఆరోగ్య సమాచారం",
    additionalNotes: "అదనపు గమనికలు",
    childNotesPlaceholder: "పిల్లలకు సంబంధించిన గమనికలను జోడించండి...",
    privacyNotice: "మీ సమాచారం సురక్షితంగా నిల్వ చేయబడుతుంది మరియు సంరక్షణను వ్యక్తిగతీకరించడానికి మాత్రమే ఉపయోగించబడుతుంది.",
    saveChildProfile: "పిల్లల ప్రొఫైల్‌ను సేవ్ చేయండి",
    updateLaterNote: "మీరు ఈ వివరాలను తర్వాత మీ ప్రొఫైల్ నుండి అప్‌డేట్ చేయవచ్చు.",

    pregnancyProfile: "గర్భధారణ ప్రొఫైల్",
    pregnancyProfileSubtitle: "మీ గురించి తెలుసుకుందాం",
    pregnancyProfileDesc: "లిటిల్ బ్లూమ్ మీ సంరక్షణను వ్యక్తిగతీకరించడానికి మీ గర్భధారణ వివరాలను జోడించండి.",
    pregnancyInformation: "గర్భధారణ సమాచారం",
    currentPregnancyWeek: "ప్రస్తుత గర్భధారణ వారం",
    weekRangeNote: "1 నుండి 42 మధ్య వారాన్ని నమోదు చేయండి.",
    expectedDueDate: "కాన్పు అంచనా తేదీ",
    prePregnancyWeight: "గర్భధారణకు ముందు బరువు (కేజీలు)",
    currentWeight: "ప్రస్తుత బరువు (కేజీలు)",
    pregnancyNotesPlaceholder: "గర్భధారణకు సంబంధించిన గమనికలను జోడించండి...",
    savePregnancyProfile: "గర్భధారణ ప్రొఫైల్‌ను సేవ్ చేయండి",

    editProfile: "ప్రొఫైల్ సవరణ",
    editProfileSubtitle: "మీ సేవ్ చేసిన సమాచారాన్ని అప్‌డేట్ చేయండి",
    editing: "సవరించబడుతోంది",
    saveChanges: "మార్పులను సేవ్ చేయండి",

    createAccount: "ఖాతా సృష్టించండి",
    createAccountSubtitle: "మీ అందమైన లిటిల్ బ్లూమ్ ప్రయాణాన్ని ప్రారంభించండి 💕",
    yourDetails: "మీ వివరాలు",
    fullName: "పూర్తి పేరు",
    email: "ఈమెయిల్",
    phoneNumber: "ఫోన్ నంబర్",
    password: "పాస్‌వర్డ్",
    confirmPassword: "పాస్‌వర్డ్‌ను నిర్ధారించండి",
    createMyAccount: "నా ఖాతాను సృష్టించండి",
    alreadyHaveAccount: "ఇప్పటికే ఖాతా ఉందా?",
    signIn: "సైన్ ఇన్",
    registerTagline: "🌿 మీ ప్రయాణం. మీ ఆరోగ్యం. మీ లిటిల్ బ్లూమ్.",
  },
};
