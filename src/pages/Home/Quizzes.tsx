import QuizCard from "@/components/home/QuizCard/QuizCard";
import {
  Center,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccentColor } from "@/contexts/UserPreferencesContext";

interface Props {
  quizPopup: (value: boolean) => void;
  quizDetails: (value: boolean) => void;
  setSelectedQuiz: (quiz: Quiz) => void;
}

type Quiz = {
  _id: string;
  title: string;
  description: string;
  categories: string[];
  code: string;
  createdBy: string;
  questions?: Array<{
    question: string;
    type: "text" | "image";
    answerType: "single" | "multiple";
    options: string[];
    correctOption: number | number[];
    imageUrl?: string;
    points: number;
    negativePoints: number;
    timeLimit: number;
  }>;
  createdAt: string;
};

const Quizzes = ({ quizPopup, quizDetails, setSelectedQuiz }: Props) => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const navigate = useNavigate();
  const accentColor = useAccentColor();
  useEffect(() => {
    console.log("🔍 Fetching quizzes from API...");

    // Get current user's email
    let currentUserEmail = "";
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        currentUserEmail = user.email || "";
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
    }

    // Try remote server first, then local server as fallback
    const tryFetch = async () => {
      const endpoints = [
        "https://rayquiza-backend.onrender.com/api/quizzes",
        "http://localhost:5000/api/quizzes", // Local fallback
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`📡 Trying endpoint: ${endpoint}`);
          const res = await fetch(endpoint);
          console.log("📡 API Response status:", res.status);

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }

          const data = await res.json();
          console.log("📊 Received quiz data:", data);
          console.log(
            "📈 Number of quizzes:",
            Array.isArray(data) ? data.length : "Not an array"
          );

          // Filter quizzes by current user's email
          const filteredQuizzes = Array.isArray(data)
            ? data.filter(
                (quiz: Quiz & { createdByEmail?: string }) =>
                  currentUserEmail && quiz.createdByEmail === currentUserEmail
              )
            : [];

          console.log("📊 Filtered quizzes for user:", filteredQuizzes.length);
          setQuizzes(filteredQuizzes);
          setQuizzesLoading(false);
          return; // Success, exit the loop
        } catch (err) {
          console.error(`❌ Error with ${endpoint}:`, err);
          continue; // Try next endpoint
        }
      }

      // If all endpoints fail
      console.error("❌ All API endpoints failed");
      setQuizzesLoading(false);
    };

    tryFetch();
  }, []);
  return (
    <>
      <Heading margin="3" size="5xl">
        {quizzesLoading
          ? "Loading quizzes..."
          : `My Quizzes (${quizzes.length})`}
      </Heading>
      {quizzesLoading && (
        <Center>
          <Spinner color={accentColor} size="lg" />
        </Center>
      )}
      {!quizzesLoading && quizzes.length === 0 && (
        <Center>
          <VStack gap={4}>
            <Heading size="md">No quizzes created yet</Heading>
            <Text color="fg.muted">Create your first quiz to get started!</Text>
          </VStack>
        </Center>
      )}
      <SimpleGrid columns={isMobile ? 1 : 4}>
        {quizzes.map((quiz) => {
          // Safety check and calculate total duration from questions
          const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
          const totalDuration = questions.reduce(
            (total, question) => total + (question.timeLimit || 30),
            0
          );
          const durationText = `${totalDuration}s (${questions.length} questions)`;

          // Ensure categories is always an array and code exists
          const safeQuiz = {
            ...quiz,
            categories: Array.isArray(quiz.categories) ? quiz.categories : [],
            code: quiz.code || "NO_CODE",
          };

          return (
            <QuizCard
              key={quiz._id}
              name={quiz.title}
              desc={quiz.description || "No description available"}
              duration={durationText}
              onClickTakeQuiz={() => {
                // Navigate to live quiz as host
                if (safeQuiz.code && safeQuiz.code !== "NO_CODE") {
                  navigate(`/quiz/live/${safeQuiz.code}`, {
                    state: { isHost: true },
                  });
                } else {
                  // Fallback: set selected quiz and show popup if no code
                  setSelectedQuiz(safeQuiz);
                  quizPopup(true);
                }
              }}
              onClickViewDetails={() => {
                setSelectedQuiz(safeQuiz);
                quizDetails(true);
              }}
            />
          );
        })}
      </SimpleGrid>
    </>
  );
};

export default Quizzes;
