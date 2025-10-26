import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
  Spinner,
  Link,
  Separator,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Typewriter from "typewriter-effect";
import "./Login.css";
import LoginButton from "@/components/LoginButton";
import { Field } from "../../components/ui/field";
import { toaster } from "@/components/ui/toaster";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

const Login = () => {
  const navigate = useNavigate();
  const { loadPreferences } = useUserPreferences();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if user is already logged in and redirect to home
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isSignUp) {
      // Name validation for signup
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation for signup
    if (isSignUp && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";
      const body = isSignUp
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }
        : { email: formData.email, password: formData.password };

      const response = await fetch(
        `https://rayquiza-backend.onrender.com${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409 && isSignUp) {
          // Email already exists during signup
          toaster.create({
            title: "Email already exists",
            description:
              "This email is already registered. Please login instead.",
            type: "error",
            duration: 5000,
          });
          return;
        }
        throw new Error(
          data.error || `${isSignUp ? "Signup" : "Login"} failed`
        );
      }

      // Store user data
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user._id);
      localStorage.setItem("userName", data.user.name);

      // Load preferences from server after successful login
      await loadPreferences(data.user._id);

      toaster.create({
        title: isSignUp ? "Account created successfully!" : "Login successful!",
        description: isSignUp
          ? "Welcome to RAYQuizA"
          : `Welcome back, ${data.user.name}`,
        type: "success",
        duration: 3000,
      });

      // Redirect to home and replace history to prevent back navigation
      setTimeout(() => {
        navigate("/home", { replace: true });
      }, 1000);
    } catch (error) {
      console.error(`${isSignUp ? "Signup" : "Login"} error:`, error);
      toaster.create({
        title: `${isSignUp ? "Signup" : "Login"} failed`,
        description:
          error instanceof Error ? error.message : "An error occurred",
        type: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    setErrors({});
  };

  return (
    <HStack
      width="100vw"
      height="100vh"
      justifyContent="center"
      alignItems="center"
      gap="0"
      padding="0px"
      margin="0px"
      flexDirection={{ base: "column", md: "row" }}
    >
      {/* Left Side - Branding */}
      <Container
        backgroundColor={"black"}
        color="white"
        width={{ base: "100%", md: "50%" }}
        height={{ base: "auto", md: "100%" }}
        minH={{ base: "30vh", md: "100%" }}
        margin="0px"
        centerContent={true}
        justifyContent={"center"}
        py={{ base: "8", md: "0" }}
        display={{ base: "none", sm: "flex" }}
      >
        <Heading fontSize={{ base: "2xl", md: "40px" }} textAlign="center" px={4}>Welcome to RAYQuizA!</Heading>
        <Text fontSize={{ base: "md", md: "lg" }}>A place for</Text>
        <Typewriter
          options={{
            wrapperClassName: "typewriter",
            strings: [
              "Attending quizzes",
              "Creating quizzes",
              "Getting insights",
              "Tracking progress",
              "Competing with friends",
              "Learning new things",
              "Having fun",
            ],
            autoStart: true,
            loop: true,
            cursor: "&bull;",
          }}
        ></Typewriter>
        <Box mt={8}>
          <Text fontSize="sm" color="gray.400" textAlign="center" mb={4}>
            Or continue with Google
          </Text>
          <LoginButton />
        </Box>
      </Container>

      {/* Right Side - Sign In/Sign Up Form */}
      <Container
        backgroundColor={"teal.500"}
        width={{ base: "100%", md: "50%" }}
        height={{ base: "100vh", md: "100%" }}
        margin="0"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={{ base: "4", md: "8" }}
      >
        <Box
          bg="white"
          p={{ base: 6, md: 8 }}
          borderRadius="xl"
          boxShadow="2xl"
          width="full"
          maxW="md"
        >
          <VStack gap={6} align="stretch">
            <Box textAlign="center">
              <Heading size="xl" color="teal.600">
                {isSignUp ? "Create Account" : "Sign In"}
              </Heading>
              <Text mt={2} color="gray.600" fontSize="sm">
                {isSignUp
                  ? "Fill in your details to get started"
                  : "Enter your credentials to continue"}
              </Text>
            </Box>

            <form onSubmit={handleSubmit}>
              <VStack gap={4} align="stretch">
                {isSignUp && (
                  <Field
                    label="Full Name"
                    invalid={!!errors.name}
                    errorText={errors.name}
                  >
                    <Input
                      name="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                      size="lg"
                      bg="white"
                      color="gray.800"
                      _placeholder={{ color: "gray.400" }}
                    />
                  </Field>
                )}

                <Field
                  label="Email"
                  invalid={!!errors.email}
                  errorText={errors.email}
                >
                  <Input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    size="lg"
                    bg="white"
                    color="gray.800"
                    _placeholder={{ color: "gray.400" }}
                  />
                </Field>

                <Field
                  label="Password"
                  invalid={!!errors.password}
                  errorText={errors.password}
                >
                  <Input
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    size="lg"
                    bg="white"
                    color="gray.800"
                    _placeholder={{ color: "gray.400" }}
                  />
                </Field>

                {isSignUp && (
                  <Field
                    label="Confirm Password"
                    invalid={!!errors.confirmPassword}
                    errorText={errors.confirmPassword}
                  >
                    <Input
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                      size="lg"
                      bg="white"
                      color="gray.800"
                      _placeholder={{ color: "gray.400" }}
                    />
                  </Field>
                )}

                <Button
                  type="submit"
                  colorPalette="teal"
                  size="lg"
                  width="full"
                  disabled={loading}
                  mt={2}
                >
                  {loading ? (
                    <Spinner size="sm" />
                  ) : isSignUp ? (
                    "Sign Up"
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </VStack>
            </form>

            <Separator />

            {/* Google Login Button for Mobile */}
            <Box display={{ base: "block", sm: "none" }}>
              <Text fontSize="sm" color="gray.600" textAlign="center" mb={4}>
                Or continue with Google
              </Text>
              <LoginButton />
            </Box>

            <Box textAlign="center">
              <Text color="gray.600" fontSize="sm">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <Link
                  color="teal.600"
                  fontWeight="bold"
                  onClick={toggleMode}
                  cursor="pointer"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </Link>
              </Text>
            </Box>
          </VStack>
        </Box>
      </Container>
    </HStack>
  );
};

export default Login;
