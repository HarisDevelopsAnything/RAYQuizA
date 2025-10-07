import {
  Container,
  Heading,
  HStack,
  Text,
  Input,
  Button,
  VStack,
  Link,
} from "@chakra-ui/react";
import Typewriter from "typewriter-effect";
import "./Login.css";
import LoginButton from "@/components/LoginButton";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toaster } from "@/components/ui/toaster";

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "https://rayquiza-backend.onrender.com/api/auth/email-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toaster.create({
          title: "Login Successful",
          description: `Welcome back, ${data.user.name}!`,
          type: "success",
          duration: 3000,
        });
        setTimeout(() => navigate("/home"), 1000);
      } else {
        toaster.create({
          title: "Login Failed",
          description: data.error || "Invalid credentials",
          type: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      toaster.create({
        title: "Error",
        description: "Something went wrong. Please try again.",
        type: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toaster.create({
        title: "Password Mismatch",
        description: "Passwords do not match",
        type: "error",
        duration: 3000,
      });
      return;
    }

    if (password.length < 6) {
      toaster.create({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        type: "error",
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "https://rayquiza-backend.onrender.com/api/auth/email-signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toaster.create({
          title: "Sign Up Successful",
          description: `Welcome, ${data.user.name}!`,
          type: "success",
          duration: 3000,
        });
        setTimeout(() => navigate("/home"), 1000);
      } else {
        if (data.error?.includes("already exists")) {
          toaster.create({
            title: "User Already Exists",
            description:
              "An account with this email already exists. Please login instead.",
            type: "error",
            duration: 3000,
          });
        } else {
          toaster.create({
            title: "Sign Up Failed",
            description: data.error || "Could not create account",
            type: "error",
            duration: 3000,
          });
        }
      }
    } catch (error) {
      toaster.create({
        title: "Error",
        description: "Something went wrong. Please try again.",
        type: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setConfirmPassword("");
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
    >
      <Container
        backgroundColor={"black"}
        color="white"
        width="50%"
        height="100%"
        margin="0px"
        centerContent={true}
        justifyContent={"center"}
      >
        <Heading fontSize="40px">Login to RAYQuizA!</Heading>
        <Text>A place for</Text>
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
        <LoginButton />
      </Container>
      <Container
        backgroundColor={"teal"}
        width="50%"
        height="100%"
        margin="0"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack
          backgroundColor="white"
          padding="40px"
          borderRadius="12px"
          width="80%"
          maxWidth="400px"
          boxShadow="xl"
        >
          <Heading fontSize="28px" color="black" marginBottom="20px">
            {isSignUp ? "Sign Up" : "Sign In"}
          </Heading>

          <form
            onSubmit={isSignUp ? handleEmailSignUp : handleEmailLogin}
            style={{ width: "100%" }}
          >
            <VStack gap="16px" width="100%">
              {isSignUp && (
                <Input
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  size="lg"
                  backgroundColor="gray.50"
                />
              )}

              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="lg"
                backgroundColor="gray.50"
              />

              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="lg"
                backgroundColor="gray.50"
              />

              {isSignUp && (
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  size="lg"
                  backgroundColor="gray.50"
                />
              )}

              <Button
                type="submit"
                colorScheme="teal"
                width="100%"
                size="lg"
                marginTop="10px"
                loading={loading}
              >
                {isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </VStack>
          </form>

          <Text marginTop="20px" color="gray.600">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <Link
              color="teal.600"
              fontWeight="bold"
              cursor="pointer"
              onClick={() => {
                setIsSignUp(!isSignUp);
                resetForm();
              }}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </Link>
          </Text>
        </VStack>
      </Container>
    </HStack>
  );
};

export default Login;
