import { UploadType } from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import Constants from "expo-constants";

const CURRENT_LAN_IP = "192.168.14.79";

export const getApiUrl = () => {
  const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

  if (Platform.OS === "web") {
    if (configuredApiUrl) {
      return configuredApiUrl;
    }

    if (typeof window !== "undefined" && window.location) {
      return `http://${window.location.hostname}:5000/api`;
    }
    return "http://localhost:5000/api";
  }

  // 1. Auto-detect from Expo host (dynamically matches whatever IP your phone connects to)
  const debuggerHost =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;

  if (debuggerHost) {
    const ip = debuggerHost.split(":")[0];
    if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
      return `http://${ip}:5000/api`;
    }
  }

  // 2. Explicit environment override if set
  if (configuredApiUrl) {
    return configuredApiUrl;
  }

  // 3. Current active machine LAN IP
  return `http://${CURRENT_LAN_IP}:5000/api`;
};

const API_URL = getApiUrl();
console.log("🌸 LittleBloom API configured to:", API_URL);

export const registerUser = async (userData) => {
  try {
    console.log("Sending registration request...");

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Registration API error:", error);

    return {
      success: false,
      message: `Unable to connect to Little Bloom server. ${error.message}`,
    };
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Login API error:", error);

    return {
      success: false,
      message: `Unable to connect to Little Bloom server. ${error.message}`,
    };
  }
};

export const createPregnancyProfile = async (token, profileData) => {
  try {
    const response = await fetch(`${API_URL}/pregnancy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    console.log("Pregnancy profile response:", data);

    return data;
  } catch (error) {
    console.error("Create pregnancy profile error:", error);

    return {
      success: false,
      message: `Unable to connect to Little Bloom server. ${error.message}`,
    };
  }
};

export const getPregnancyProfile = async (token) => {
  try {
    const response = await fetch(`${API_URL}/pregnancy`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    console.log("Pregnancy profile:", data);

    return data;
  } catch (error) {
    console.error("Get pregnancy profile error:", error);

    return {
      success: false,
      message: `Unable to connect to Little Bloom server. ${error.message}`,
    };
  }
};

export const updatePregnancyProfile = async (token, profileData) => {
  try {
    const response = await fetch(`${API_URL}/pregnancy`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    console.log("Updated pregnancy profile:", data);

    return data;
  } catch (error) {
    console.error("Update pregnancy profile error:", error);

    return {
      success: false,
      message: `Unable to connect to Little Bloom server. ${error.message}`,
    };
  }
};

export const createChildProfile = async (token, profileData) => {
  try {
    const response = await fetch(`${API_URL}/child`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Create child profile error:", error);

    return {
      success: false,
      message: `Unable to connect to Little Bloom server. ${error.message}`,
    };
  }
};

export const getChildProfile = async (token) => {
  try {
    const response = await fetch(`${API_URL}/child`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Get child profile error:", error);

    return {
      success: false,
      message: `Unable to connect to Little Bloom server. ${error.message}`,
    };
  }
};

export const updateChildProfile = async (token, profileData) => {
  try {
    const response = await fetch(`${API_URL}/child`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Update child profile error:", error);

    return {
      success: false,
      message: `Unable to connect to Little Bloom server. ${error.message}`,
    };
  }
};

export const createHealthRecord = async (
  token,
  healthData
) => {
  try {
    const response = await fetch(
      `${API_URL}/health`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(healthData),
      }
    );

    const data = await response.json();

    console.log(
      "Health record response:",
      data
    );

    return data;
  } catch (error) {
    console.error(
      "Create health record error:",
      error
    );

    return {
      success: false,
      message: `Unable to connect to Little Bloom server. ${error.message}`,
    };
  }
};

export const getHealthRecords = async (
  token,
  mode
) => {
  try {
    const response = await fetch(
      `${API_URL}/health?mode=${mode}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log(
      "Health records:",
      data
    );

    return data;
  } catch (error) {
    console.error(
      "Get health records error:",
      error
    );

    return {
      success: false,
      message: `Unable to connect to Little Bloom server. ${error.message}`,
    };
  }
};

export const getLatestHealthRecord = async (
  token,
  mode
) => {
  try {
    const response = await fetch(
      `${API_URL}/health/latest?mode=${mode}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log(
      "Latest health record:",
      data
    );

    return data;
  } catch (error) {
    console.error(
      "Get latest health record error:",
      error
    );

    return {
      success: false,
      message: `Unable to connect to Little Bloom server. ${error.message}`,
    };
  }
};

export const deleteHealthRecord = async (
  token,
  id
) => {
  try {
    const response = await fetch(
      `${API_URL}/health/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log(
      "Delete health record response:",
      data
    );

    return data;
  } catch (error) {
    console.error(
      "Delete health record error:",
      error
    );

    return {
      success: false,
      message: `Unable to connect to Little Bloom server. ${error.message}`,
    };
  }
};

export const createAppointment = async (
  token,
  appointmentData
) => {
  try {
    const response = await fetch(
      `${API_URL}/appointments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      }
    );

    const data = await response.json();

    console.log(
      "Appointment response:",
      data
    );

    return data;
  } catch (error) {
    console.error(
      "Create appointment error:",
      error
    );

    return {
      success: false,
      message: `Unable to connect to Little Bloom server. ${error.message}`,
    };
  }
};

export const getAppointments = async (token) => {
  try {
    const response = await fetch(
      `${API_URL}/appointments`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log(
      "Appointments:",
      data
    );

    return data;
  } catch (error) {
    console.error(
      "Get appointments error:",
      error
    );

    return {
      success: false,
      message: `Unable to connect to Little Bloom server. ${error.message}`,
    };
  }
};

export const deleteAppointment = async (
  token,
  id
) => {
  try {
    const response = await fetch(
      `${API_URL}/appointments/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log(
      "Delete appointment response:",
      data
    );

    return data;
  } catch (error) {
    console.error(
      "Delete appointment error:",
      error
    );

    return {
      success: false,
      message: `Unable to connect to Little Bloom server. ${error.message}`,
    };
  }
};


// Add a new medicine
export const createMedicine = async (
  token,
  medicineData
) => {
  try {
    const response = await fetch(
      `${API_URL}/medicines`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(medicineData),
      }
    );

    const data = await response.json();

    console.log("Medicine response:", data);

    return data;
  } catch (error) {
    console.error("Create medicine error:", error);

    return {
      success: false,
      message: `Unable to connect to Little Bloom server. ${error.message}`,
    };
  }
};

// Get all medicines for the logged-in user
export const getMedicines = async (token) => {
  try {
    const response = await fetch(
      `${API_URL}/medicines`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log("Medicines:", data);

    return data;
  } catch (error) {
    console.error("Get medicines error:", error);

    return {
      success: false,
      message: `Unable to connect to Little Bloom server. ${error.message}`,
    };
  }
};

// Delete a medicine
export const deleteMedicine = async (
  token,
  id
) => {
  try {
    const response = await fetch(
      `${API_URL}/medicines/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log("Delete medicine response:", data);

    return data;
  } catch (error) {
    console.error("Delete medicine error:", error);

    return {
      success: false,
      message: `Unable to connect to Little Bloom server. ${error.message}`,
    };
  }
};

const REPORTS_URL = `${API_URL}/reports`;

// Get medical reports belonging to the logged-in user
export const getReports = async (token) => {
  try {
    const response = await fetch(REPORTS_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Unable to load reports.",
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: "Unable to connect to the LittleBloom server.",
    };
  }
};

// Upload a medical report using Expo's native file uploader

export const uploadReport = async (token, report) => {
  try {
    const task = report.file.createUploadTask(REPORTS_URL, {
      httpMethod: "POST",
      uploadType: UploadType.MULTIPART,
      fieldName: "file",
      mimeType: report.mimeType,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      parameters: {
        title: report.title,
        category: report.category,
        reportDate: report.reportDate,
      },
    });

    const result = await task.uploadAsync();

    let data;

    try {
      data = JSON.parse(result.body);
    } catch {
      data = {
        success: false,
        message: "The server returned an invalid response.",
      };
    }

    if (result.status < 200 || result.status >= 300) {
      return {
        success: false,
        message:
          data.message ||
          `Unable to upload report (HTTP ${result.status}).`,
      };
    }

    return data;
  } catch (error) {
    console.error("Report upload network error:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to connect to the LittleBloom server.",
    };
  }
};

// Delete a medical report
export const deleteReport = async (token, id) => {
  try {
    const response = await fetch(`${REPORTS_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Unable to delete report.",
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: "Unable to connect to the LittleBloom server.",
    };
  }
};

// Get the URL for viewing or downloading a report.
// Use this URL with an authenticated request.
export const getReportFileUrl = (id, action = "view") =>
  `${REPORTS_URL}/${id}/${action}`;


/* Vaccination API functions */


export const createVaccination = async (token, vaccinationData) => {
  try {
    const response = await fetch(`${API_URL}/vaccinations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(vaccinationData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Unable to save vaccination.",
      };
    }

    return data;
  } catch (error) {
    console.error("Create vaccination error:", error);
    return {
      success: false,
      message: "Unable to connect to the LittleBloom server.",
    };
  }
};

export const getVaccinations = async (token, mode) => {
  try {
    const url = mode ? `${API_URL}/vaccinations?mode=${encodeURIComponent(mode)}` : `${API_URL}/vaccinations`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Unable to load vaccinations.",
      };
    }

    return data;
  } catch (error) {
    console.error("Get vaccinations error:", error);
    return {
      success: false,
      message: "Unable to connect to the LittleBloom server.",
    };
  }
};

export const updateVaccination = async (token, id, completed) => {
  try {
    const response = await fetch(
      `${API_URL}/vaccinations/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Unable to update vaccination.",
      };
    }

    return data;
  } catch (error) {
    console.error("Update vaccination error:", error);
    return {
      success: false,
      message: "Unable to connect to the LittleBloom server.",
    };
  }
};

export const deleteVaccination = async (token, id) => {
  try {
    const response = await fetch(
      `${API_URL}/vaccinations/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Unable to delete vaccination.",
      };
    }

    return data;
  } catch (error) {
    console.error("Delete vaccination error:", error);
    return {
      success: false,
      message: "Unable to connect to the LittleBloom server.",
    };
  }
};

/* =========================================================
   JOURNAL API FUNCTIONS
========================================================= */

export const getJournals = async (token) => {
  try {
    const response = await fetch(`${API_URL}/journal`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Unable to load journal entries.",
      };
    }

    return data;
  } catch (error) {
    console.error("Get journals error:", error);
    return {
      success: false,
      message: "Unable to connect to the LittleBloom server.",
    };
  }
};

export const createJournal = async (token, journalData) => {
  try {
    const response = await fetch(`${API_URL}/journal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(journalData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Unable to save journal entry.",
      };
    }

    return data;
  } catch (error) {
    console.error("Create journal error:", error);
    return {
      success: false,
      message: "Unable to connect to the LittleBloom server.",
    };
  }
};

export const updateJournal = async (token, id, journalData) => {
  try {
    const response = await fetch(`${API_URL}/journal/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(journalData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Unable to update journal entry.",
      };
    }

    return data;
  } catch (error) {
    console.error("Update journal error:", error);
    return {
      success: false,
      message: "Unable to connect to the LittleBloom server.",
    };
  }
};

export const deleteJournal = async (token, id) => {
  try {
    const response = await fetch(`${API_URL}/journal/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Unable to delete journal entry.",
      };
    }

    return data;
  } catch (error) {
    console.error("Delete journal error:", error);
    return {
      success: false,
      message: "Unable to connect to the LittleBloom server.",
    };
  }
};

/* =========================================================
   AI CHATBOT API FUNCTIONS
========================================================= */

export const sendChatMessage = async (token, message, language = "English", history = []) => {
  try {
    const response = await fetch(`${API_URL}/chatbot/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message, language, history }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        reply: data.reply || data.message || "Sorry, I could not answer that right now.",
      };
    }

    return data;
  } catch (error) {
    console.error("Send chat message error:", error);
    return {
      success: false,
      reply: "🌸 Little Bloom is having trouble connecting to the care server. Please check your network.",
    };
  }
};
