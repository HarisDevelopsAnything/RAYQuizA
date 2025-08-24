import { Button, Heading, Input } from "@chakra-ui/react";
import React, { useState } from "react";
import { BiLogIn } from "react-icons/bi";

const JoinCode = () => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinQuiz = async () => {
    if (!code.trim()) {
      alert("Please enter a quiz code");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://rayquiza-backend.onrender.com/api/quizzes/code/${code.toUpperCase()}`);
      
      if (response.ok) {
        const quiz = await response.json();
        console.log("Found quiz:", quiz);
        alert(`Quiz found: ${quiz.title}\nDescription: ${quiz.description}\nCreated by: ${quiz.createdBy}`);
        // Here you can navigate to the quiz taking page or show quiz details
      } else if (response.status === 404) {
        alert("Quiz not found. Please check the code and try again.");
      } else {
        alert("Error finding quiz. Please try again.");
      }
    } catch (error) {
      console.error("Error joining quiz:", error);
      alert("Error joining quiz. Please try again.");
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
      <Button 
        colorPalette="teal" 
        onClick={handleJoinQuiz}
        loading={isLoading}
        disabled={code.length !== 6}
      >
        Join <BiLogIn />
      </Button>
    </div>
  );
};

export default JoinCode;
