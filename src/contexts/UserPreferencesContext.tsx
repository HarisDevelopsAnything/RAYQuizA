import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

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
  updatePreference: (section: keyof UserPreferences, key: string, value: any) => void;
  savePreferences: () => Promise<boolean>;
  loadPreferences: (userId: string) => Promise<void>;
  resetToDefaults: () => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);

  const updatePreference = (section: keyof UserPreferences, key: string, value: any) => {
    setPreferences(prev => ({
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
      const response = await fetch(`https://rayquiza-backend.onrender.com/api/user-preferences/${userId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Loaded preferences data from server:", data);
        if (data.preferences) {
          setPreferences(prev => ({ ...prev, ...data.preferences }));
          console.log("Preferences loaded and merged successfully from server");
        } else {
          console.log("No preferences found on server, checking localStorage");
          loadFromLocalStorage(userId);
        }
      } else {
        console.log("Failed to load preferences from server, status:", response.status);
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
        setPreferences(prev => ({ ...prev, ...parsedPrefs }));
        console.log("Preferences loaded from localStorage");
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
      const response = await fetch(`https://rayquiza-backend.onrender.com/api/user-preferences/${userData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response error:", response.status, errorText);
        
        // Fallback to localStorage if server fails
        console.log("Falling back to localStorage");
        localStorage.setItem(`userPreferences_${userData._id}`, JSON.stringify(preferences));
        return true;
      }

      console.log("Preferences saved successfully to server");
      // Also save to localStorage as backup
      localStorage.setItem(`userPreferences_${userData._id}`, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error("Error saving preferences to server:", error);
      
      // Fallback to localStorage if network fails
      console.log("Network error, falling back to localStorage");
      try {
        localStorage.setItem(`userPreferences_${userData._id}`, JSON.stringify(preferences));
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

  // Auto-load preferences when user is available
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      if (userData._id) {
        loadPreferences(userData._id);
      }
    }
  }, []);

  // Apply theme preference on load
  useEffect(() => {
    if (preferences.appearance.defaultTheme !== "system") {
      document.documentElement.setAttribute('data-theme', preferences.appearance.defaultTheme);
    }
  }, [preferences.appearance.defaultTheme]);

  // Apply font size preference
  useEffect(() => {
    const fontSize = preferences.appearance.fontSize;
    const rootElement = document.documentElement;
    
    rootElement.classList.remove('font-small', 'font-medium', 'font-large');
    rootElement.classList.add(`font-${fontSize}`);
  }, [preferences.appearance.fontSize]);

  // Apply accessibility preferences
  useEffect(() => {
    const rootElement = document.documentElement;
    
    if (preferences.quizPreferences.highContrastMode) {
      rootElement.classList.add('high-contrast');
    } else {
      rootElement.classList.remove('high-contrast');
    }

    if (preferences.quizPreferences.reducedAnimations) {
      rootElement.classList.add('reduced-motion');
    } else {
      rootElement.classList.remove('reduced-motion');
    }
  }, [preferences.quizPreferences.highContrastMode, preferences.quizPreferences.reducedAnimations]);

  const value: UserPreferencesContextType = {
    preferences,
    loading,
    updatePreference,
    savePreferences,
    loadPreferences,
    resetToDefaults,
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
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};

// Helper hooks for specific sections
export const useProfilePreferences = () => {
  const { preferences, updatePreference } = useUserPreferences();
  return {
    profile: preferences.profile,
    updateProfile: (key: string, value: any) => updatePreference('profile', key, value),
  };
};

export const useAppearancePreferences = () => {
  const { preferences, updatePreference } = useUserPreferences();
  return {
    appearance: preferences.appearance,
    updateAppearance: (key: string, value: any) => updatePreference('appearance', key, value),
  };
};

export const useSecurityPreferences = () => {
  const { preferences, updatePreference } = useUserPreferences();
  return {
    security: preferences.security,
    updateSecurity: (key: string, value: any) => updatePreference('security', key, value),
  };
};

export const useQuizPreferences = () => {
  const { preferences, updatePreference } = useUserPreferences();
  return {
    quizPreferences: preferences.quizPreferences,
    updateQuizPreferences: (key: string, value: any) => updatePreference('quizPreferences', key, value),
  };
};

export const useNotificationPreferences = () => {
  const { preferences, updatePreference } = useUserPreferences();
  return {
    notifications: preferences.notifications,
    updateNotifications: (key: string, value: any) => updatePreference('notifications', key, value),
  };
};