import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Container, Heading, VStack, HStack, Badge, Text, SimpleGrid } from "@chakra-ui/react";
import { IoArrowBack, IoArrowForward, IoPlayCircle } from "react-icons/io5";
import { useAccentColor } from "@/contexts/UserPreferencesContext";
import "./QuizPresenter.css";

interface Question {
  question: string;
  type: "text" | "image";
  answerType: "single" | "multiple";
  options: string[];
  correctOption: number | number[];
  imageUrl?: string;
  points: number;
  negativePoints: number;
  timeLimit: number;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  code: string;
  questions: Question[];
  corporateMode?: boolean;
}

const QuizPresenter = () => {
  const { quizCode } = useParams<{ quizCode: string }>();
  const navigate = useNavigate();
  const accentColor = useAccentColor();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [correctAnswered, setCorrectAnswered] = useState(false);
  const [started, setStarted] = useState(false);
  const [alignmentCheck, setAlignmentCheck] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizCode]);

  const fetchQuiz = async () => {
    try {
      const baseURL = "https://rayquiza-backend.onrender.com";
      const response = await fetch(`${baseURL}/api/quizzes/code/${quizCode}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch quiz");
      }

      const data = await response.json();
      setQuiz(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      setLoading(false);
    }
  };

  const handleOptionClick = (optionIndex: number) => {
    if (correctAnswered) return; // Don't allow clicks after correct answer

    const currentQuestion = quiz?.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const correctOptions = Array.isArray(currentQuestion.correctOption)
      ? currentQuestion.correctOption
      : [currentQuestion.correctOption];

    // Check if this option is correct
    if (correctOptions.includes(optionIndex)) {
      // Correct answer - add to selected and mark as correct
      setSelectedOptions([...selectedOptions, optionIndex]);
      setCorrectAnswered(true);
    } else {
      // Wrong answer - just add to selected to show red
      if (!selectedOptions.includes(optionIndex)) {
        setSelectedOptions([...selectedOptions, optionIndex]);
      }
    }
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptions([]);
      setCorrectAnswered(false);
    } else {
      // Quiz finished - show thank you screen
      setQuizComplete(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOptions([]);
      setCorrectAnswered(false);
    }
  };

  const getOptionState = (optionIndex: number) => {
    const currentQuestion = quiz?.questions[currentQuestionIndex];
    if (!currentQuestion) return "default";

    const correctOptions = Array.isArray(currentQuestion.correctOption)
      ? currentQuestion.correctOption
      : [currentQuestion.correctOption];

    if (selectedOptions.includes(optionIndex)) {
      if (correctOptions.includes(optionIndex)) {
        return "correct";
      }
      return "wrong";
    }

    return "default";
  };

  if (loading) {
    return (
      <Box className="presenter-page">
        <Container maxW="container.xl" py={8}>
          <Text fontSize="2xl" textAlign="center" color="fg">
            Loading quiz...
          </Text>
        </Container>
      </Box>
    );
  }

  if (!quiz) {
    return (
      <Box className="presenter-page">
        <Container maxW="container.xl" py={8}>
          <VStack gap={4}>
            <Text fontSize="2xl" color="fg">
              Quiz not found
            </Text>
            <Button onClick={() => navigate("/home")}>
              <IoArrowBack /> Back to Home
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Alignment Check Screen
  if (!alignmentCheck) {
    return (
      <Box className="presenter-page alignment-check-page">
        <Container maxW="100vw" height="100vh" p={0} centerContent>
          <VStack 
            width="100%" 
            height="100vh" 
            justifyContent="center" 
            gap={8}
            position="relative"
            onClick={() => setAlignmentCheck(true)}
            cursor="pointer"
            border="20px solid"
            borderColor="red.500"
            bg="bg"
          >
            <VStack gap={6} textAlign="center">
              <Heading size="6xl" color="fg">
                Projector Alignment Test
              </Heading>
              <Text fontSize="3xl" color="fg.muted" maxW="800px">
                Check if all four corners and edges are visible on your screen
              </Text>
              <Badge size="lg" colorPalette="red" p={4} fontSize="xl" mt={4}>
                Red border should be fully visible
              </Badge>
              <Text fontSize="2xl" color="fg" mt={8}>
                👆 Click anywhere when ready to continue
              </Text>
            </VStack>
            
            {/* Corner markers */}
            <Box position="absolute" top={4} left={4}>
              <Badge colorPalette="red" size="lg" fontSize="lg">TOP LEFT</Badge>
            </Box>
            <Box position="absolute" top={4} right={4}>
              <Badge colorPalette="red" size="lg" fontSize="lg">TOP RIGHT</Badge>
            </Box>
            <Box position="absolute" bottom={4} left={4}>
              <Badge colorPalette="red" size="lg" fontSize="lg">BOTTOM LEFT</Badge>
            </Box>
            <Box position="absolute" bottom={4} right={4}>
              <Badge colorPalette="red" size="lg" fontSize="lg">BOTTOM RIGHT</Badge>
            </Box>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (!started) {
    return (
      <Box className="presenter-page">
        <Container maxW="container.lg" py={16}>
          <VStack gap={8} textAlign="center">
            <Heading size="4xl" color="fg">
              {quiz.title}
            </Heading>
            <Text fontSize="xl" color="fg.muted" maxW="600px">
              {quiz.description}
            </Text>
            <HStack gap={4}>
              <Badge size="lg" colorPalette={accentColor as any} p={3} fontSize="lg">
                {quiz.questions.length} Questions
              </Badge>
              <Badge size="lg" colorPalette="blue" p={3} fontSize="lg">
                Presenter Mode
              </Badge>
            </HStack>
            <Text fontSize="md" color="fg.muted" maxW="500px">
              Click on options to reveal answers. Wrong answers turn red, correct answers turn green.
              Perfect for live presentations and events!
            </Text>
            <HStack gap={4} mt={8}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/home")}
              >
                <IoArrowBack /> Cancel
              </Button>
              <Button
                size="lg"
                colorPalette={accentColor as any}
                onClick={() => setStarted(true)}
              >
                <IoPlayCircle /> Start Presentation
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Thank You Screen after quiz completion
  if (quizComplete) {
    return (
      <Box className="presenter-page thank-you-page">
        <Container maxW="container.lg" py={16}>
          <VStack gap={10} textAlign="center" minH="80vh" justifyContent="center">
            <Box fontSize="8xl">🎉</Box>
            <Heading size="6xl" color="fg">
              Thank You!
            </Heading>
            <Text fontSize="3xl" color="fg.muted" maxW="700px" lineHeight="1.6">
              Thank you for joining this session. We hope you enjoyed the quiz!
            </Text>
            <HStack gap={4} mt={8}>
              <Badge size="lg" colorPalette="green" p={4} fontSize="xl">
                {quiz.questions.length} Questions Completed
              </Badge>
              <Badge size="lg" colorPalette="purple" p={4} fontSize="xl">
                {quiz.title}
              </Badge>
            </HStack>
            <Text fontSize="2xl" color="fg.muted" mt={4}>
              See you next time! 👋
            </Text>
            <Button
              size="lg"
              colorPalette={accentColor as any}
              onClick={() => navigate("/home")}
              mt={8}
            >
              <IoArrowBack /> Back to Home
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <Box className="presenter-page">
      <Container maxW="container.xl" py={8}>
        <VStack gap={6} align="stretch">
          {/* Header */}
          <HStack justifyContent="space-between" mb={4}>
            <Button
              variant="outline"
              onClick={() => navigate("/home")}
            >
              <IoArrowBack /> Exit
            </Button>
            <HStack gap={4}>
              <Badge size="lg" colorPalette={accentColor as any} p={2}>
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </Badge>
              <Badge size="lg" colorPalette="purple" p={2}>
                {currentQuestion.points} points
              </Badge>
            </HStack>
          </HStack>

          {/* Question */}
          <Box className="presenter-question-box">
            <VStack gap={4}>
              {currentQuestion.type === "image" && currentQuestion.imageUrl && (
                <img
                  className="presenter-image"
                  src={currentQuestion.imageUrl}
                  alt="Question"
                  style={{
                    maxHeight: "300px",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                />
              )}
              <Heading size="3xl" textAlign="center" color="fg">
                {currentQuestion.question}
              </Heading>
              {currentQuestion.answerType === "multiple" && (
                <Badge colorPalette="orange" size="lg">
                  Multiple Answers
                </Badge>
              )}
            </VStack>
          </Box>

          {/* Options */}
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mt={8}>
            {currentQuestion.options.map((option, index) => {
              const state = getOptionState(index);
              return (
                <Button
                  key={index}
                  className={`presenter-option presenter-option-${state}`}
                  onClick={() => handleOptionClick(index)}
                  size="lg"
                  height="auto"
                  py={8}
                  px={6}
                  fontSize="2xl"
                  disabled={correctAnswered && state === "default"}
                  colorPalette={
                    state === "correct"
                      ? "green"
                      : state === "wrong"
                      ? "red"
                      : accentColor as any
                  }
                  variant={state === "default" ? "outline" : "solid"}
                >
                  <HStack gap={4} width="100%">
                    <Badge
                      size="lg"
                      colorPalette={
                        state === "correct"
                          ? "green"
                          : state === "wrong"
                          ? "red"
                          : "gray"
                      }
                      variant="solid"
                    >
                      {String.fromCharCode(65 + index)}
                    </Badge>
                    <Text flex={1} textAlign="left">
                      {option}
                    </Text>
                  </HStack>
                </Button>
              );
            })}
          </SimpleGrid>

          {/* Navigation */}
          <HStack justifyContent="space-between" mt={8}>
            <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              size="lg"
            >
              <IoArrowBack /> Previous
            </Button>
            <Button
              onClick={handleNextQuestion}
              disabled={!correctAnswered}
              colorPalette={isLastQuestion ? "green" : accentColor as any}
              size="lg"
            >
              {isLastQuestion ? "Finish" : "Next"} <IoArrowForward />
            </Button>
          </HStack>

          {correctAnswered && (
            <Box
              className="presenter-success-message"
              textAlign="center"
              py={4}
            >
              <Text fontSize="2xl" color="green.500" fontWeight="bold">
                ✓ Correct! Click Next to continue
              </Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default QuizPresenter;
