import QuizCard from "@/components/home/QuizCard/QuizCard";
import {
  Center,
  Heading,
  SimpleGrid,
  Spinner,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

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
  useEffect(() => {
    fetch("https://rayquiza-backend.onrender.com/api/quizzes")
      .then((res) => res.json())
      .then((data) => {
        setQuizzes(data);
        setQuizzesLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);
  return (
    <>
      <Heading margin="3" size="5xl">
        {quizzesLoading ? "Loading your quizzes..." : "Your Quizzes"}
      </Heading>
      {quizzesLoading && (
        <Center>
          <Spinner color="teal" size="lg" />
        </Center>
      )}
      {!quizzesLoading && quizzes.length === 0 && (
        <Center>
          <Heading size="md">No quizzes available</Heading>
        </Center>
      )}
      <SimpleGrid columns={isMobile ? 1 : 4}>
        {quizzes.map((quiz) => {
          // Safety check and calculate total duration from questions
          const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
          const totalDuration = questions.reduce((total, question) => total + (question.timeLimit || 30), 0);
          const durationText = `${totalDuration}s (${questions.length} questions)`;
          
          // Ensure categories is always an array and code exists
          const safeQuiz = {
            ...quiz,
            categories: Array.isArray(quiz.categories) ? quiz.categories : [],
            code: quiz.code || "NO_CODE"
          };
          
          return (
            <QuizCard
              key={quiz._id}
              name={quiz.title}
              desc={quiz.description || "No description available"}
              duration={durationText}
              onClickTakeQuiz={() => {
                setSelectedQuiz(safeQuiz);
                quizPopup(true);
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
