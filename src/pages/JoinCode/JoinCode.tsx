import { Button, Heading, Input, HStack, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { BiLogIn } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useAccentColor } from "@/contexts/UserPreferencesContext";

const JoinCode = () => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>("");
  const [joinMode, setJoinMode] = useState<"player" | "host">("player");
  const navigate = useNavigate();
  const accentColor = useAccentColor();

  const testServerConnection = async () => {
    try {
      setTestResult("Testing connection...");
      const response = await fetch(
        "https://rayquiza-backend.onrender.com/api/quizzes",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      );

      if (response.ok) {
        setTestResult("✅ Server connection successful!");
      } else {
        setTestResult(`❌ Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Connection test error:", error);
      if (error instanceof Error) {
        setTestResult(`❌ Connection failed: ${error.message}`);
      } else {
        setTestResult("❌ Connection failed: Unknown error");
      }
    }
  };

  const handleJoinQuiz = async () => {
    if (!code.trim()) {
      alert("Please enter a quiz code");
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Attempting to verify quiz code: ${code.toUpperCase()}`);
      const apiUrl = `https://rayquiza-backend.onrender.com/api/quizzes/code/${code.toUpperCase()}`;
      console.log(`API URL: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const quiz = await response.json();
        console.log("Found quiz:", quiz);

        navigate(`/quiz/live/${code.toUpperCase()}`, {
          state: { isHost: joinMode === "host" },
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

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and limit to 6 characters
    const value = e.target.value.toUpperCase().slice(0, 6);
    setCode(value);
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
      <Heading size="5xl" marginBottom="2rem">
        Join using code
      </Heading>
      <Input
        placeholder="Enter 6-digit code (example: AB123C)"
        width="35%"
        height="50px"
        marginBottom="1rem"
        value={code}
        onChange={handleCodeChange}
        maxLength={6}
        style={{ textTransform: "uppercase" }}
      />
      <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <Heading size="md" marginBottom="0.75rem">
          How would you like to join?
        </Heading>
        <HStack gap="1rem" justifyContent="center">
          <Button
            variant={joinMode === "player" ? "solid" : "outline"}
            colorPalette={joinMode === "player" ? (accentColor as any) : "gray"}
            onClick={() => setJoinMode("player")}
          >
            Join as Player
          </Button>
          <Button
            variant={joinMode === "host" ? "solid" : "outline"}
            colorPalette={joinMode === "host" ? (accentColor as any) : "gray"}
            onClick={() => setJoinMode("host")}
          >
            Host Quiz
          </Button>
        </HStack>
        <Text fontSize="sm" color="gray.400" marginTop="0.5rem">
          Hosts control the timer and question flow; players just answer.
        </Text>
      </div>

      <Button
        colorPalette={accentColor as any}
        onClick={handleJoinQuiz}
        loading={isLoading}
        disabled={code.length !== 6}
        style={{ marginTop: "1.5rem" }}
      >
        Join <BiLogIn />
      </Button>

      {/* Debug: Server Connection Test */}
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <Button colorPalette="gray" size="sm" onClick={testServerConnection}>
          Test Server Connection
        </Button>
        {testResult && (
          <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
            {testResult}
          </p>
        )}
      </div>
    </div>
  );
};

export default JoinCode;
