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
  createdByEmail?: string;
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
  useEffect(() => {
    console.log("🔍 Fetching quizzes from API...");
    
    // Try remote server first, then local server as fallback
    const tryFetch = async () => {
      const endpoints = [
        "https://rayquiza-backend.onrender.com/api/quizzes",
        "http://localhost:5000/api/quizzes" // Local fallback
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
          console.log("📈 Number of quizzes:", Array.isArray(data) ? data.length : 'Not an array');
          
          setQuizzes(Array.isArray(data) ? data : []);
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

  useEffect(() => {
    // Get current user from localStorage
    const savedUser = localStorage.getItem("user");
    const currentUser = savedUser ? JSON.parse(savedUser) : null;

    fetch("https://rayquiza-backend.onrender.com/api/quizzes")
      .then((res) => res.json())
      .then((data) => {
        // Filter quizzes to only show those created by the current user
        if (currentUser && currentUser.email) {
          const userQuizzes = data.filter(
            (quiz: Quiz) => quiz.createdByEmail === currentUser.email
          );
          setQuizzes(userQuizzes);
        } else {
          // If no user is logged in, show no quizzes
          setQuizzes([]);
        }
        setQuizzesLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setQuizzesLoading(false);
      });
  }, []);
  return (
    <>
      <Heading margin="3" size="5xl">
        {quizzesLoading ? "Loading quizzes..." : `All Quizzes (${quizzes.length})`}
      </Heading>
      {quizzesLoading && (
        <Center>
          <Spinner color="teal" size="lg" />
        </Center>
      )}
      {!quizzesLoading && quizzes.length === 0 && (
        <Center>
          <VStack gap={4}>
            <Heading size="md">No quizzes available</Heading>
            <Text color="fg.muted">Check the browser console for API response details</Text>
          </VStack>
          <Heading size="md">You haven't created any quizzes yet</Heading>
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
                // Navigate to quiz page using the quiz code
                if (safeQuiz.code && safeQuiz.code !== "NO_CODE") {
                  navigate(`/quiz/${safeQuiz.code}`);
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
