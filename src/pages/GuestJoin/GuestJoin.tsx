import { Button, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { BiLogIn } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useAccentColor } from "@/contexts/UserPreferencesContext";

const GuestJoin = () => {
  const [code, setCode] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const accentColor = useAccentColor();

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 6);
    setCode(value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestName(e.target.value);
  };

  const handleJoinQuiz = async () => {
    if (!code.trim()) {
      alert("Please enter a quiz code");
      return;
    }

    if (!guestName.trim()) {
      alert("Please enter your name");
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = `https://rayquiza-backend.onrender.com/api/quizzes/code/${code.toUpperCase()}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(30000),
      });

      if (response.ok) {
        const quiz = await response.json();
        console.log("Found quiz:", quiz);

        // Store guest info temporarily for the live quiz
        const guestId = `guest-${Date.now()}`;
        const guestFullName = `Guest-${guestName.trim()}`;

        localStorage.setItem("guestId", guestId);
        localStorage.setItem("guestName", guestFullName);

        navigate(`/quiz/live/${code.toUpperCase()}`, {
          state: {
            isHost: false,
            isGuest: true,
            guestId,
            guestName: guestFullName,
          },
        });
      } else if (response.status === 404) {
        alert("Quiz not found. Please check the code and try again.");
      } else if (response.status >= 500) {
        alert("Server error. Please try again later.");
      } else {
        alert(
          `Error finding quiz (Status: ${response.status}). Please try again.`
        );
      }
    } catch (error) {
      console.error("Error joining quiz:", error);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          alert(
            "Request timed out. Please check your internet connection and try again."
          );
        } else if (
          error.message.includes("NetworkError") ||
          error.message.includes("Failed to fetch")
        ) {
          alert(
            "Network error. Please check your internet connection and try again."
          );
        } else {
          alert("Error joining quiz. Please try again.");
        }
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "92vh",
      }}
    >
      <VStack gap={6} width="100%" maxWidth="500px" padding="2rem">
        <Heading size="5xl" textAlign="center">
          Join a Quiz
        </Heading>

        <Text fontSize="lg" color="fg.muted" textAlign="center">
          Enter the quiz code and your name to get started
        </Text>

        <Input
          placeholder="Enter 6-digit code (e.g., AB123C)"
          width="100%"
          height="50px"
          value={code}
          onChange={handleCodeChange}
          maxLength={6}
          style={{ textTransform: "uppercase" }}
          size="lg"
        />

        <Input
          placeholder="Enter your name"
          width="100%"
          height="50px"
          value={guestName}
          onChange={handleNameChange}
          size="lg"
        />

        <Text fontSize="sm" color="gray.400" textAlign="center">
          Your name will appear as: Guest-{guestName || "YourName"}
        </Text>

        <Button
          colorPalette={accentColor as any}
          onClick={handleJoinQuiz}
          loading={isLoading}
          disabled={code.length !== 6 || !guestName.trim()}
          width="100%"
          size="lg"
        >
          Join Quiz <BiLogIn />
        </Button>

        <Button variant="ghost" onClick={() => navigate("/")} size="sm">
          ← Back to Home
        </Button>
      </VStack>
    </div>
  );
};

export default GuestJoin;
