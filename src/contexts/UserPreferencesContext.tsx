import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useTheme } from "next-themes";

export interface UserPreferences {
  // Account & Profile Settings
  profile: {
    name: string;
    email: string;
    bio: string;
  };

  // Appearance & Theme Settings
  appearance: {
    defaultTheme: "light" | "dark" | "system";
    autoSwitchTheme: boolean;
    accentColor: string;
    fontSize: "small" | "medium" | "large";
    showCursorFollower: boolean;
  };

  // Authentication & Security
  security: {
    stayLoggedIn: boolean;
    autoLogoutTimer: number; // minutes
    showLoginHistory: boolean;
  };

  // Quiz Preferences
  quizPreferences: {
    defaultTimeLimit: number; // seconds
    defaultPoints: number;
    defaultNegativePoints: number;
    showTimer: boolean;
    enableSoundEffects: boolean;
    autoSubmitOnTimeout: boolean;
    highContrastMode: boolean;
    reducedAnimations: boolean;
  };

  // Notifications & Alerts
  notifications: {
    browserNotifications: boolean;
    emailNotifications: boolean;
    soundPreferences: boolean;
    toastDuration: number; // milliseconds
  };
}

export const defaultPreferences: UserPreferences = {
  profile: {
    name: "",
    email: "",
    bio: "",
  },
  appearance: {
    defaultTheme: "system",
    autoSwitchTheme: false,
    accentColor: "teal",
    fontSize: "medium",
    showCursorFollower: false,
  },
  security: {
    stayLoggedIn: true,
    autoLogoutTimer: 60,
    showLoginHistory: false,
  },
  quizPreferences: {
    defaultTimeLimit: 30,
    defaultPoints: 1,
    defaultNegativePoints: 0,
    showTimer: true,
    enableSoundEffects: true,
    autoSubmitOnTimeout: true,
    highContrastMode: false,
    reducedAnimations: false,
  },
  notifications: {
    browserNotifications: true,
    emailNotifications: true,
    soundPreferences: true,
    toastDuration: 3000,
  },
};

interface UserPreferencesContextType {
  preferences: UserPreferences;
  loading: boolean;
  updatePreference: (
    section: keyof UserPreferences,
    key: string,
    value: any
  ) => void;
  savePreferences: () => Promise<boolean>;
  loadPreferences: (userId: string) => Promise<void>;
  resetToDefaults: () => void;
  toggleTheme: () => void;
}

const UserPreferencesContext = createContext<
  UserPreferencesContextType | undefined
>(undefined);

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export const UserPreferencesProvider: React.FC<
  UserPreferencesProviderProps
> = ({ children }) => {
  const [preferences, setPreferences] =
    useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);
  const { setTheme } = useTheme();
  const hasInitializedThemeRef = useRef(false);

  const updatePreference = (
    section: keyof UserPreferences,
    key: string,
    value: any
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const loadPreferences = async (userId: string) => {
    setLoading(true);
    console.log("Loading preferences for user:", userId);

    try {
      const response = await fetch(
        `https://rayquiza-backend.onrender.com/api/user-preferences/${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Loaded preferences data from server:", data);
        if (data.preferences) {
          // Deep merge preferences from server with defaults
          const mergedPreferences = {
            profile: {
              ...defaultPreferences.profile,
              ...(data.preferences.profile || {}),
            },
            appearance: {
              ...defaultPreferences.appearance,
              ...(data.preferences.appearance || {}),
            },
            security: {
              ...defaultPreferences.security,
              ...(data.preferences.security || {}),
            },
            quizPreferences: {
              ...defaultPreferences.quizPreferences,
              ...(data.preferences.quizPreferences || {}),
            },
            notifications: {
              ...defaultPreferences.notifications,
              ...(data.preferences.notifications || {}),
            },
          };
          setPreferences(mergedPreferences);
          // Update localStorage with server data to keep them in sync
          localStorage.setItem(
            `userPreferences_${userId}`,
            JSON.stringify(mergedPreferences)
          );
          console.log(
            "Preferences loaded from server and synced to localStorage"
          );
        } else {
          console.log("No preferences found on server, checking localStorage");
          loadFromLocalStorage(userId);
        }
      } else {
        console.log(
          "Failed to load preferences from server, status:",
          response.status
        );
        loadFromLocalStorage(userId);
      }
    } catch (error) {
      console.error("Error loading preferences from server:", error);
      loadFromLocalStorage(userId);
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = (userId: string) => {
    try {
      const localPrefs = localStorage.getItem(`userPreferences_${userId}`);
      if (localPrefs) {
        const parsedPrefs = JSON.parse(localPrefs);
        console.log("Loading from localStorage:", parsedPrefs);
        // Deep merge with defaults to ensure all fields exist
        const mergedPreferences = {
          profile: {
            ...defaultPreferences.profile,
            ...(parsedPrefs.profile || {}),
          },
          appearance: {
            ...defaultPreferences.appearance,
            ...(parsedPrefs.appearance || {}),
          },
          security: {
            ...defaultPreferences.security,
            ...(parsedPrefs.security || {}),
          },
          quizPreferences: {
            ...defaultPreferences.quizPreferences,
            ...(parsedPrefs.quizPreferences || {}),
          },
          notifications: {
            ...defaultPreferences.notifications,
            ...(parsedPrefs.notifications || {}),
          },
        };
        setPreferences(mergedPreferences);
        console.log("Preferences loaded from localStorage and merged");
      } else {
        console.log("No preferences found in localStorage, using defaults");
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  };

  const savePreferences = async (): Promise<boolean> => {
    const user = localStorage.getItem("user");
    if (!user) {
      console.error("No user found in localStorage");
      return false;
    }

    const userData = JSON.parse(user);
    if (!userData._id) {
      console.error("No user ID found in user data");
      return false;
    }

    console.log("Saving preferences for user:", userData._id);
    console.log("Preferences data:", preferences);

    try {
      const response = await fetch(
        `https://rayquiza-backend.onrender.com/api/user-preferences/${userData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ preferences }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response error:", response.status, errorText);

        // Fallback to localStorage if server fails
        console.log("Falling back to localStorage");
        localStorage.setItem(
          `userPreferences_${userData._id}`,
          JSON.stringify(preferences)
        );
        return true;
      }

      console.log("Preferences saved successfully to server");
      // Also save to localStorage as backup
      localStorage.setItem(
        `userPreferences_${userData._id}`,
        JSON.stringify(preferences)
      );
      return true;
    } catch (error) {
      console.error("Error saving preferences to server:", error);

      // Fallback to localStorage if network fails
      console.log("Network error, falling back to localStorage");
      try {
        localStorage.setItem(
          `userPreferences_${userData._id}`,
          JSON.stringify(preferences)
        );
        console.log("Preferences saved to localStorage successfully");
        return true;
      } catch (localError) {
        console.error("Failed to save to localStorage:", localError);
        return false;
      }
    }
  };

  const resetToDefaults = () => {
    setPreferences(defaultPreferences);
  };

  // Toggle theme and update preference
  const toggleTheme = () => {
    setPreferences((prev) => {
      const currentTheme = prev.appearance.defaultTheme;
      let newTheme: "light" | "dark" | "system";

      // If system or light, go to dark; if dark, go to light
      if (currentTheme === "dark") {
        newTheme = "light";
      } else {
        newTheme = "dark";
      }

      console.log("Theme toggled from", currentTheme, "to", newTheme);

      // Directly apply the theme change
      setTheme(newTheme);

      // Return updated preferences
      return {
        ...prev,
        appearance: {
          ...prev.appearance,
          defaultTheme: newTheme,
        },
      };
    });
  };

  // Auto-load preferences when user is available (only on initial mount)
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      if (userData._id) {
        console.log(
          "User found on mount, loading preferences for:",
          userData._id
        );
        // Load preferences from server on mount to get latest data
        loadPreferences(userData._id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Apply theme preference ONLY on initial load, not on every preference change
  useEffect(() => {
    const desired = preferences.appearance.defaultTheme;
    
    // Only apply theme from preferences on first load
    if (!hasInitializedThemeRef.current) {
      console.log("[ThemeEffect] Initial theme setup:", desired);
      setTheme(desired);
      hasInitializedThemeRef.current = true;
    } else {
      console.log("[ThemeEffect] Theme already initialized, skipping automatic sync");
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array - only run once on mount

  // Apply accent color preference
  useEffect(() => {
    const accentColor = preferences.appearance.accentColor;
    const rootElement = document.documentElement;

    // Remove all existing accent color attributes
    rootElement.removeAttribute("data-accent-teal");
    rootElement.removeAttribute("data-accent-blue");
    rootElement.removeAttribute("data-accent-green");
    rootElement.removeAttribute("data-accent-purple");
    rootElement.removeAttribute("data-accent-orange");

    // Set the new accent color attribute
    rootElement.setAttribute(`data-accent-${accentColor}`, "");

    // Also set as a CSS variable for direct access
    rootElement.style.setProperty("--accent-color", accentColor);

    console.log("Applied accent color:", accentColor);
  }, [preferences.appearance.accentColor]);

  // Apply font size preference
  useEffect(() => {
    const fontSize = preferences.appearance.fontSize;
    const rootElement = document.documentElement;

    rootElement.classList.remove("font-small", "font-medium", "font-large");
    rootElement.classList.add(`font-${fontSize}`);
  }, [preferences.appearance.fontSize]);

  // Apply accessibility preferences
  useEffect(() => {
    const rootElement = document.documentElement;

    if (preferences.quizPreferences.highContrastMode) {
      rootElement.classList.add("high-contrast");
    } else {
      rootElement.classList.remove("high-contrast");
    }

    if (preferences.quizPreferences.reducedAnimations) {
      rootElement.classList.add("reduced-motion");
    } else {
      rootElement.classList.remove("reduced-motion");
    }
  }, [
    preferences.quizPreferences.highContrastMode,
    preferences.quizPreferences.reducedAnimations,
  ]);

  // Diagnostic: observe theme-related DOM attribute changes to help debug flicker
  useEffect(() => {
    try {
      const root = document.documentElement;
      console.log(
        "[ThemeObserver] initial root.class:",
        root.className,
        "html attributes:",
        {
          theme: root.getAttribute("data-theme"),
          accented:
            root.getAttribute("data-accent-teal") ||
            root.getAttribute("data-accent-blue") ||
            root.getAttribute("data-accent-green") ||
            root.getAttribute("data-accent-purple") ||
            root.getAttribute("data-accent-orange"),
        }
      );

      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === "attributes") {
            const name = m.attributeName;
            if (!name) continue;
            const value =
              root.getAttribute(name) ||
              (name === "class" ? root.className : null);
            console.log(`[ThemeObserver] attribute changed: ${name} ->`, value);
          }
        }
      });

      observer.observe(root, {
        attributes: true,
        attributeFilter: [
          "class",
          "data-theme",
          "data-accent-teal",
          "data-accent-blue",
          "data-accent-green",
          "data-accent-purple",
          "data-accent-orange",
        ],
      });

      const onStorage = (e: StorageEvent) => {
        if (!e) return;
        if (
          e.key &&
          (e.key.startsWith("userPreferences_") || e.key === "theme")
        ) {
          console.log("[ThemeObserver] storage event:", e.key, e.newValue);
        }
      };

      window.addEventListener("storage", onStorage);

      return () => {
        observer.disconnect();
        window.removeEventListener("storage", onStorage);
      };
    } catch (err) {
      console.warn("[ThemeObserver] failed to attach observer:", err);
    }
  }, []);

  const value: UserPreferencesContextType = {
    preferences,
    loading,
    updatePreference,
    savePreferences,
    loadPreferences,
    resetToDefaults,
    toggleTheme,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = (): UserPreferencesContextType => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error(
      "useUserPreferences must be used within a UserPreferencesProvider"
    );
  }
  return context;
};

// Helper hooks for specific sections
export const useProfilePreferences = () => {
  const { preferences, updatePreference } = useUserPreferences();
  return {
    profile: preferences.profile,
    updateProfile: (key: string, value: any) =>
      updatePreference("profile", key, value),
  };
};

export const useAppearancePreferences = () => {
  const { preferences, updatePreference } = useUserPreferences();
  return {
    appearance: preferences.appearance,
    updateAppearance: (key: string, value: any) =>
      updatePreference("appearance", key, value),
  };
};

export const useSecurityPreferences = () => {
  const { preferences, updatePreference } = useUserPreferences();
  return {
    security: preferences.security,
    updateSecurity: (key: string, value: any) =>
      updatePreference("security", key, value),
  };
};

export const useQuizPreferences = () => {
  const { preferences, updatePreference } = useUserPreferences();
  return {
    quizPreferences: preferences.quizPreferences,
    updateQuizPreferences: (key: string, value: any) =>
      updatePreference("quizPreferences", key, value),
  };
};

export const useNotificationPreferences = () => {
  const { preferences, updatePreference } = useUserPreferences();
  return {
    notifications: preferences.notifications,
    updateNotifications: (key: string, value: any) =>
      updatePreference("notifications", key, value),
  };
};

// Hook to get the current accent color for use in components
export const useAccentColor = () => {
  const { preferences } = useUserPreferences();
  return preferences.appearance.accentColor;
};
