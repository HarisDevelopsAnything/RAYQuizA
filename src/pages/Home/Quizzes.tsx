import QuizCard from "@/components/home/QuizCard/QuizCard";
import {
  Center,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useBreakpointValue,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
  Button,
  DialogTitle,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccentColor } from "@/contexts/UserPreferencesContext";
import { toaster } from "@/components/ui/toaster";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
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

  const handleDeleteClick = (quiz: Quiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return;

    try {
      const userString = localStorage.getItem("user");
      if (!userString) {
        toaster.create({
          title: "Error",
          description: "You must be logged in to delete a quiz",
          type: "error",
        });
        return;
      }

      const user = JSON.parse(userString);
      const userEmail = user.email;

      const baseURL = "https://rayquiza-backend.onrender.com";
      // Provide userEmail in query string as a fallback (some proxies or setups
      // may strip bodies from DELETE requests). We still include the JSON body
      // for servers that expect it.
      const url = `${baseURL}/api/quizzes/${quizToDelete._id}?userEmail=${encodeURIComponent(
        userEmail
      )}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete quiz");
      }

      // Remove the quiz from the local state
      setQuizzes((prev) => prev.filter((q) => q._id !== quizToDelete._id));

      toaster.create({
        title: "Quiz deleted",
        description: `"${quizToDelete.title}" has been deleted successfully`,
        type: "success",
      });

      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toaster.create({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete quiz",
        type: "error",
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setQuizToDelete(null);
  };

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
              onClickPresent={() => {
                // Navigate to presenter mode using quiz code
                navigate(`/quiz/presenter/${quiz.code}`);
              }}
              onClickDelete={() => handleDeleteClick(safeQuiz)}
            />
          );
        })}
      </SimpleGrid>

      {/* Delete Confirmation Dialog */}
      <DialogRoot open={deleteDialogOpen} onOpenChange={(e) => setDeleteDialogOpen(e.open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quiz</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text>
              Are you sure you want to delete "{quizToDelete?.title}"? This action cannot be undone.
            </Text>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline" onClick={handleDeleteCancel}>
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button colorPalette="red" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
};

export default Quizzes;
