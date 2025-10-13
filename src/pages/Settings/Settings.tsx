import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
  Separator,
  Card,
  Textarea,
  SimpleGrid,
  Spinner,
  NativeSelectRoot,
  NativeSelectField,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Field } from "@/components/ui/field";
import { toaster } from "@/components/ui/toaster";
import {
  FaUser,
  FaPalette,
  FaLock,
  FaGamepad,
  FaBell,
  FaSave,
} from "react-icons/fa";
import NavBar from "@/components/general/NavBar/NavBar";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{
    name: string;
    picture: string;
    _id: string;
  } | null>(null);
  const { preferences, loading, updatePreference, savePreferences, toggleTheme } =
    useUserPreferences();
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    console.log("Starting to save preferences...");
    try {
      const success = await savePreferences();
      if (success) {
        toaster.create({
          title: "Settings saved",
          description: "Your preferences have been updated successfully",
          type: "success",
          duration: 3000,
        });
      } else {
        throw new Error("Failed to save preferences - server returned false");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toaster.create({
        title: "Save failed",
        description: `Failed to save your preferences: ${errorMessage}. Please try again.`,
        type: "error",
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const sections = [
    { id: "profile", title: "Account & Profile", icon: <FaUser /> },
    { id: "appearance", title: "Appearance", icon: <FaPalette /> },
    { id: "security", title: "Security", icon: <FaLock /> },
    { id: "quiz", title: "Quiz Preferences", icon: <FaGamepad /> },
    { id: "notifications", title: "Notifications", icon: <FaBell /> },
  ];

  if (loading) {
    return (
      <Box bg="white" _dark={{ bg: "gray.900" }} minH="100vh">
        <NavBar
          username={user?.name || ""}
          profilePic={user?.picture || ""}
          onLogout={handleLogout}
        />
        <Container maxW="6xl" py={8} mt="60px">
          <VStack gap={4}>
            <Spinner size="lg" color={preferences.appearance.accentColor} />
            <Text color="gray.900" _dark={{ color: "white" }}>
              Loading settings...
            </Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="white" _dark={{ bg: "gray.900" }} minH="100vh">
      <NavBar
        username={user?.name || ""}
        profilePic={user?.picture || ""}
        onLogout={handleLogout}
      />

      <Container maxW="6xl" py={8} mt="60px">
        <VStack gap={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <Heading size="2xl" color="gray.900" _dark={{ color: "white" }}>
              Settings
            </Heading>
            <HStack>
              <Button variant="outline" onClick={() => navigate("/home")}>
                Back to Home
              </Button>
              <Button
                colorPalette={preferences.appearance.accentColor as any}
                onClick={handleSave}
                loading={saving}
                loadingText="Saving..."
              >
                <FaSave /> Save Changes
              </Button>
            </HStack>
          </HStack>

          <SimpleGrid columns={{ base: 1, lg: 4 }} gap={6}>
            {/* Sidebar Navigation */}
            <VStack align="stretch" gap={2}>
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "solid" : "ghost"}
                  colorPalette={
                    activeSection === section.id
                      ? (preferences.appearance.accentColor as any)
                      : undefined
                  }
                  justifyContent="flex-start"
                  onClick={() => setActiveSection(section.id)}
                  h="auto"
                  py={3}
                  bg={activeSection === section.id ? undefined : "transparent"}
                  color={activeSection === section.id ? undefined : "gray.700"}
                  border={
                    activeSection === section.id ? undefined : "1px solid"
                  }
                  borderColor={
                    activeSection === section.id ? undefined : "gray.200"
                  }
                  _dark={{
                    color:
                      activeSection === section.id ? undefined : "gray.200",
                    borderColor:
                      activeSection === section.id ? undefined : "gray.600",
                  }}
                  _hover={{
                    bg: activeSection === section.id ? undefined : "gray.100",
                    _dark: {
                      bg: activeSection === section.id ? undefined : "gray.700",
                    },
                  }}
                >
                  <HStack>
                    <Box
                      color={
                        activeSection === section.id ? undefined : "gray.700"
                      }
                      _dark={{
                        color:
                          activeSection === section.id ? undefined : "gray.200",
                      }}
                    >
                      {section.icon}
                    </Box>
                    <Text
                      color={
                        activeSection === section.id ? undefined : "gray.700"
                      }
                      _dark={{
                        color:
                          activeSection === section.id ? undefined : "gray.200",
                      }}
                    >
                      {section.title}
                    </Text>
                  </HStack>
                </Button>
              ))}
            </VStack>

            {/* Main Content */}
            <Box gridColumn={{ base: "1", lg: "2 / -1" }}>
              {activeSection === "profile" && (
                <Card.Root p={6}>
                  <Card.Header>
                    <Heading
                      size="lg"
                      color="gray.900"
                      _dark={{ color: "white" }}
                    >
                      Account & Profile Settings
                    </Heading>
                    <Text color="gray.600" _dark={{ color: "gray.300" }}>
                      Manage your personal information
                    </Text>
                  </Card.Header>
                  <Card.Body>
                    <VStack gap={4} align="stretch">
                      <Field label="Full Name">
                        <Input
                          value={preferences.profile.name}
                          onChange={(e) =>
                            updatePreference("profile", "name", e.target.value)
                          }
                          placeholder="Enter your full name"
                        />
                      </Field>

                      <Field label="Email Address">
                        <Input
                          value={preferences.profile.email}
                          onChange={(e) =>
                            updatePreference("profile", "email", e.target.value)
                          }
                          placeholder="Enter your email"
                          type="email"
                        />
                      </Field>

                      <Field label="Bio">
                        <Textarea
                          value={preferences.profile.bio}
                          onChange={(e) =>
                            updatePreference("profile", "bio", e.target.value)
                          }
                          placeholder="Tell us about yourself"
                          rows={3}
                        />
                      </Field>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              )}

              {activeSection === "appearance" && (
                <Card.Root p={6}>
                  <Card.Header>
                    <Heading
                      size="lg"
                      color="gray.900"
                      _dark={{ color: "white" }}
                    >
                      Appearance & Theme
                    </Heading>
                    <Text color="gray.600" _dark={{ color: "gray.300" }}>
                      Customize the look and feel of the app
                    </Text>
                  </Card.Header>
                  <Card.Body>
                    <VStack gap={6} align="stretch">
                      <Field label="Default Theme">
                        <NativeSelectRoot>
                          <NativeSelectField
                            value={preferences.appearance.defaultTheme}
                            onChange={(e) =>
                              updatePreference(
                                "appearance",
                                "defaultTheme",
                                e.target.value
                              )
                            }
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="system">System</option>
                          </NativeSelectField>
                        </NativeSelectRoot>
                      </Field>

                      <HStack justify="space-between">
                        <VStack align="start" gap={1}>
                          <Text
                            fontWeight="medium"
                            color="gray.900"
                            _dark={{ color: "white" }}
                          >
                            Theme Toggle
                          </Text>
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            _dark={{ color: "gray.300" }}
                          >
                            Quick theme switcher
                          </Text>
                        </VStack>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleTheme}
                        >
                          {preferences.appearance.defaultTheme === "dark" ? "🌙" : "☀️"}
                        </Button>
                      </HStack>

                      <HStack justify="space-between">
                        <VStack align="start" gap={1}>
                          <Text
                            fontWeight="medium"
                            color="gray.900"
                            _dark={{ color: "white" }}
                          >
                            Auto-switch Theme
                          </Text>
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            _dark={{ color: "gray.300" }}
                          >
                            Switch based on time of day
                          </Text>
                        </VStack>
                        <input
                          type="checkbox"
                          checked={preferences.appearance.autoSwitchTheme}
                          onChange={(e) =>
                            updatePreference(
                              "appearance",
                              "autoSwitchTheme",
                              e.target.checked
                            )
                          }
                        />
                      </HStack>

                      <Field label="Accent Color">
                        <NativeSelectRoot>
                          <NativeSelectField
                            value={preferences.appearance.accentColor}
                            onChange={(e) =>
                              updatePreference(
                                "appearance",
                                "accentColor",
                                e.target.value
                              )
                            }
                          >
                            <option value="teal">Teal</option>
                            <option value="blue">Blue</option>
                            <option value="green">Green</option>
                            <option value="purple">Purple</option>
                            <option value="orange">Orange</option>
                          </NativeSelectField>
                        </NativeSelectRoot>
                      </Field>

                      <Field label="Font Size">
                        <NativeSelectRoot>
                          <NativeSelectField
                            value={preferences.appearance.fontSize}
                            onChange={(e) =>
                              updatePreference(
                                "appearance",
                                "fontSize",
                                e.target.value
                              )
                            }
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </NativeSelectField>
                        </NativeSelectRoot>
                      </Field>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              )}

              {activeSection === "security" && (
                <Card.Root p={6}>
                  <Card.Header>
                    <Heading
                      size="lg"
                      color="gray.900"
                      _dark={{ color: "white" }}
                    >
                      Authentication & Security
                    </Heading>
                    <Text color="gray.600" _dark={{ color: "gray.300" }}>
                      Manage your account security settings
                    </Text>
                  </Card.Header>
                  <Card.Body>
                    <VStack gap={6} align="stretch">
                      <HStack justify="space-between">
                        <VStack align="start" gap={1}>
                          <Text
                            fontWeight="medium"
                            color="gray.900"
                            _dark={{ color: "white" }}
                          >
                            Stay Logged In
                          </Text>
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            _dark={{ color: "gray.300" }}
                          >
                            Remember your login session
                          </Text>
                        </VStack>
                        <input
                          type="checkbox"
                          checked={preferences.security.stayLoggedIn}
                          onChange={(e) =>
                            updatePreference(
                              "security",
                              "stayLoggedIn",
                              e.target.checked
                            )
                          }
                        />
                      </HStack>

                      <Field label="Auto-logout Timer (minutes)">
                        <NativeSelectRoot>
                          <NativeSelectField
                            value={preferences.security.autoLogoutTimer.toString()}
                            onChange={(e) =>
                              updatePreference(
                                "security",
                                "autoLogoutTimer",
                                parseInt(e.target.value)
                              )
                            }
                          >
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="120">2 hours</option>
                            <option value="0">Never</option>
                          </NativeSelectField>
                        </NativeSelectRoot>
                      </Field>

                      <HStack justify="space-between">
                        <VStack align="start" gap={1}>
                          <Text
                            fontWeight="medium"
                            color="gray.900"
                            _dark={{ color: "white" }}
                          >
                            Show Login History
                          </Text>
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            _dark={{ color: "gray.300" }}
                          >
                            Display recent login activities
                          </Text>
                        </VStack>
                        <input
                          type="checkbox"
                          checked={preferences.security.showLoginHistory}
                          onChange={(e) =>
                            updatePreference(
                              "security",
                              "showLoginHistory",
                              e.target.checked
                            )
                          }
                        />
                      </HStack>

                      <Separator />

                      <VStack align="start" gap={3}>
                        <Text
                          fontWeight="medium"
                          color="gray.900"
                          _dark={{ color: "white" }}
                        >
                          Account Actions
                        </Text>
                        <HStack gap={3}>
                          <Button variant="outline" colorPalette="orange">
                            Change Password
                          </Button>
                          <Button variant="outline" colorPalette="red">
                            Delete Account
                          </Button>
                        </HStack>
                      </VStack>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              )}

              {activeSection === "quiz" && (
                <Card.Root p={6}>
                  <Card.Header>
                    <Heading
                      size="lg"
                      color="gray.900"
                      _dark={{ color: "white" }}
                    >
                      Quiz Preferences
                    </Heading>
                    <Text color="gray.600" _dark={{ color: "gray.300" }}>
                      Customize your quiz experience
                    </Text>
                  </Card.Header>
                  <Card.Body>
                    <VStack gap={6} align="stretch">
                      <Text
                        fontWeight="medium"
                        color="teal.600"
                        _dark={{ color: "teal.400" }}
                      >
                        Default Quiz Creation Settings
                      </Text>

                      <SimpleGrid columns={2} gap={4}>
                        <Field label="Default Time Limit (seconds)">
                          <Input
                            type="number"
                            value={preferences.quizPreferences.defaultTimeLimit}
                            onChange={(e) =>
                              updatePreference(
                                "quizPreferences",
                                "defaultTimeLimit",
                                parseInt(e.target.value) || 30
                              )
                            }
                            min={10}
                            max={300}
                          />
                        </Field>

                        <Field label="Default Points">
                          <Input
                            type="number"
                            value={preferences.quizPreferences.defaultPoints}
                            onChange={(e) =>
                              updatePreference(
                                "quizPreferences",
                                "defaultPoints",
                                parseInt(e.target.value) || 1
                              )
                            }
                            min={1}
                            max={10}
                          />
                        </Field>
                      </SimpleGrid>

                      <Field label="Default Negative Points">
                        <Input
                          type="number"
                          value={
                            preferences.quizPreferences.defaultNegativePoints
                          }
                          onChange={(e) =>
                            updatePreference(
                              "quizPreferences",
                              "defaultNegativePoints",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min={0}
                          max={5}
                        />
                      </Field>

                      <Separator />
                      <Text
                        fontWeight="medium"
                        color="teal.600"
                        _dark={{ color: "teal.400" }}
                      >
                        Quiz Taking Preferences
                      </Text>

                      <VStack gap={4} align="stretch">
                        <HStack justify="space-between">
                          <VStack align="start" gap={1}>
                            <Text
                              fontWeight="medium"
                              color="gray.900"
                              _dark={{ color: "white" }}
                            >
                              Show Timer
                            </Text>
                            <Text
                              fontSize="sm"
                              color="gray.600"
                              _dark={{ color: "gray.300" }}
                            >
                              Display countdown timer during quiz
                            </Text>
                          </VStack>
                          <input
                            type="checkbox"
                            checked={preferences.quizPreferences.showTimer}
                            onChange={(e) =>
                              updatePreference(
                                "quizPreferences",
                                "showTimer",
                                e.target.checked
                              )
                            }
                          />
                        </HStack>

                        <HStack justify="space-between">
                          <VStack align="start" gap={1}>
                            <Text
                              fontWeight="medium"
                              color="gray.900"
                              _dark={{ color: "white" }}
                            >
                              Sound Effects
                            </Text>
                            <Text
                              fontSize="sm"
                              color="gray.600"
                              _dark={{ color: "gray.300" }}
                            >
                              Enable audio feedback
                            </Text>
                          </VStack>
                          <input
                            type="checkbox"
                            checked={
                              preferences.quizPreferences.enableSoundEffects
                            }
                            onChange={(e) =>
                              updatePreference(
                                "quizPreferences",
                                "enableSoundEffects",
                                e.target.checked
                              )
                            }
                          />
                        </HStack>

                        <HStack justify="space-between">
                          <VStack align="start" gap={1}>
                            <Text
                              fontWeight="medium"
                              color="gray.900"
                              _dark={{ color: "white" }}
                            >
                              Auto-submit on Timeout
                            </Text>
                            <Text
                              fontSize="sm"
                              color="gray.600"
                              _dark={{ color: "gray.300" }}
                            >
                              Automatically submit when time expires
                            </Text>
                          </VStack>
                          <input
                            type="checkbox"
                            checked={
                              preferences.quizPreferences.autoSubmitOnTimeout
                            }
                            onChange={(e) =>
                              updatePreference(
                                "quizPreferences",
                                "autoSubmitOnTimeout",
                                e.target.checked
                              )
                            }
                          />
                        </HStack>
                      </VStack>

                      <Separator />
                      <Text
                        fontWeight="medium"
                        color="teal.600"
                        _dark={{ color: "teal.400" }}
                      >
                        Accessibility
                      </Text>

                      <VStack gap={4} align="stretch">
                        <HStack justify="space-between">
                          <VStack align="start" gap={1}>
                            <Text
                              fontWeight="medium"
                              color="gray.900"
                              _dark={{ color: "white" }}
                            >
                              High Contrast Mode
                            </Text>
                            <Text
                              fontSize="sm"
                              color="gray.600"
                              _dark={{ color: "gray.300" }}
                            >
                              Improve visibility for better readability
                            </Text>
                          </VStack>
                          <input
                            type="checkbox"
                            checked={
                              preferences.quizPreferences.highContrastMode
                            }
                            onChange={(e) =>
                              updatePreference(
                                "quizPreferences",
                                "highContrastMode",
                                e.target.checked
                              )
                            }
                          />
                        </HStack>

                        <HStack justify="space-between">
                          <VStack align="start" gap={1}>
                            <Text
                              fontWeight="medium"
                              color="gray.900"
                              _dark={{ color: "white" }}
                            >
                              Reduced Animations
                            </Text>
                            <Text
                              fontSize="sm"
                              color="gray.600"
                              _dark={{ color: "gray.300" }}
                            >
                              Minimize motion for sensitivity
                            </Text>
                          </VStack>
                          <input
                            type="checkbox"
                            checked={
                              preferences.quizPreferences.reducedAnimations
                            }
                            onChange={(e) =>
                              updatePreference(
                                "quizPreferences",
                                "reducedAnimations",
                                e.target.checked
                              )
                            }
                          />
                        </HStack>
                      </VStack>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              )}

              {activeSection === "notifications" && (
                <Card.Root p={6}>
                  <Card.Header>
                    <Heading
                      size="lg"
                      color="gray.900"
                      _dark={{ color: "white" }}
                    >
                      Notifications & Alerts
                    </Heading>
                    <Text color="gray.600" _dark={{ color: "gray.300" }}>
                      Control how you receive updates
                    </Text>
                  </Card.Header>
                  <Card.Body>
                    <VStack gap={6} align="stretch">
                      <HStack justify="space-between">
                        <VStack align="start" gap={1}>
                          <Text
                            fontWeight="medium"
                            color="gray.900"
                            _dark={{ color: "white" }}
                          >
                            Browser Notifications
                          </Text>
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            _dark={{ color: "gray.300" }}
                          >
                            Show notifications in your browser
                          </Text>
                        </VStack>
                        <input
                          type="checkbox"
                          checked={
                            preferences.notifications.browserNotifications
                          }
                          onChange={(e) =>
                            updatePreference(
                              "notifications",
                              "browserNotifications",
                              e.target.checked
                            )
                          }
                        />
                      </HStack>

                      <HStack justify="space-between">
                        <VStack align="start" gap={1}>
                          <Text
                            fontWeight="medium"
                            color="gray.900"
                            _dark={{ color: "white" }}
                          >
                            Email Notifications
                          </Text>
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            _dark={{ color: "gray.300" }}
                          >
                            Receive updates via email
                          </Text>
                        </VStack>
                        <input
                          type="checkbox"
                          checked={preferences.notifications.emailNotifications}
                          onChange={(e) =>
                            updatePreference(
                              "notifications",
                              "emailNotifications",
                              e.target.checked
                            )
                          }
                        />
                      </HStack>

                      <HStack justify="space-between">
                        <VStack align="start" gap={1}>
                          <Text
                            fontWeight="medium"
                            color="gray.900"
                            _dark={{ color: "white" }}
                          >
                            Sound Notifications
                          </Text>
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            _dark={{ color: "gray.300" }}
                          >
                            Play sounds for notifications
                          </Text>
                        </VStack>
                        <input
                          type="checkbox"
                          checked={preferences.notifications.soundPreferences}
                          onChange={(e) =>
                            updatePreference(
                              "notifications",
                              "soundPreferences",
                              e.target.checked
                            )
                          }
                        />
                      </HStack>

                      <Field label="Toast Duration (milliseconds)">
                        <NativeSelectRoot>
                          <NativeSelectField
                            value={preferences.notifications.toastDuration.toString()}
                            onChange={(e) =>
                              updatePreference(
                                "notifications",
                                "toastDuration",
                                parseInt(e.target.value)
                              )
                            }
                          >
                            <option value="2000">2 seconds</option>
                            <option value="3000">3 seconds</option>
                            <option value="5000">5 seconds</option>
                            <option value="7000">7 seconds</option>
                          </NativeSelectField>
                        </NativeSelectRoot>
                      </Field>

                      <Box
                        p={4}
                        bg="blue.50"
                        _dark={{ bg: "blue.900" }}
                        borderRadius="md"
                        borderLeft="4px solid"
                        borderColor="blue.500"
                      >
                        <Text
                          fontSize="sm"
                          color="blue.700"
                          _dark={{ color: "blue.300" }}
                        >
                          <strong>Tip:</strong> You can always adjust
                          notification permissions in your browser settings.
                        </Text>
                      </Box>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              )}
            </Box>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default Settings;
