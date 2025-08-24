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
  name: string;
  desc: string;
  duration: string;
  code: string;
  categories?: string[];
  author?: string;
  questions?: number;
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
        {quizzes.map((quiz, index) => (
          <QuizCard
            key={index}
            name={quiz.name}
            desc={quiz.desc}
            duration={quiz.duration}
            onClickTakeQuiz={() => {
              setSelectedQuiz(quiz);
              quizPopup(true);
            }}
            onClickViewDetails={() => {
              setSelectedQuiz(quiz);
              quizDetails(true);
            }}
          ></QuizCard>
        ))}
      </SimpleGrid>
    </>
  );
};

export default Quizzes;
