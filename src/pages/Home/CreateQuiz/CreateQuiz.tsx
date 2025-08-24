import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  HStack,
} from "@chakra-ui/react";
import React from "react";
import { CgAdd } from "react-icons/cg";
import { MdDelete } from "react-icons/md";

interface QuestionType {
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

const CreateQuiz = () => {
  const [quizTitle, setQuizTitle] = React.useState("");
  const [questions, setQuestions] = React.useState<QuestionType[]>([
    {
      question: "",
      type: "text",
      answerType: "single",
      options: ["", "", "", ""],
      correctOption: 0,
      imageUrl: "",
      points: 1,
      negativePoints: 0,
      timeLimit: 30,
    },
  ]);

  const handleQuizTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuizTitle(e.target.value);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleCorrectOptionChange = (
    questionIndex: number,
    optionIndex: number
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correctOption = optionIndex;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        type: "text",
        answerType: "single",
        options: ["", "", "", ""],
        correctOption: 0,
        imageUrl: "",
        points: 1,
        negativePoints: 0,
        timeLimit: 30,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async () => {
    try {
      // Validate quiz data
      if (!quizTitle.trim()) {
        alert('Please enter a quiz title');
        return;
      }

      const invalidQuestions = questions.filter(q => 
        !q.question.trim() || 
        q.options.some(opt => !opt.trim()) ||
        (q.answerType === 'single' && typeof q.correctOption !== 'number') ||
        (q.answerType === 'multiple' && (!Array.isArray(q.correctOption) || q.correctOption.length === 0))
      );

      if (invalidQuestions.length > 0) {
        alert('Please fill in all questions, options, and select correct answers');
        return;
      }

      const quizData = {
        title: quizTitle,
        questions: questions
      };

      const response = await fetch('https://rayquiza-backend.onrender.com/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Quiz created successfully:', result);
        alert('Quiz created successfully!');
        
        // Reset form
        setQuizTitle('');
        setQuestions([{
          question: "",
          type: "text",
          answerType: "single",
          options: ["", "", "", ""],
          correctOption: 0,
          imageUrl: "",
          points: 1,
          negativePoints: 0,
          timeLimit: 30,
        }]);
      } else {
        const error = await response.json();
        console.error('Failed to create quiz:', error);
        alert('Failed to create quiz: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Error creating quiz. Please try again.');
    }
  };

  const handleQuestionTypeChange = (index: number, type: "text" | "image") => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].type = type;
    setQuestions(updatedQuestions);
  };

  const handleAnswerTypeChange = (
    index: number,
    answerType: "single" | "multiple"
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].answerType = answerType;
    updatedQuestions[index].correctOption = answerType === "single" ? 0 : [];
    setQuestions(updatedQuestions);
  };

  const handleImageUrlChange = (index: number, url: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].imageUrl = url;
    setQuestions(updatedQuestions);
  };

  const handlePointsChange = (index: number, points: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].points = points;
    setQuestions(updatedQuestions);
  };

  const handleNegativePointsChange = (index: number, negativePoints: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].negativePoints = negativePoints;
    setQuestions(updatedQuestions);
  };

  const handleTimeLimitChange = (index: number, timeLimit: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].timeLimit = timeLimit;
    setQuestions(updatedQuestions);
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>
        Create Quiz
      </Heading>
      <Box
        maxW="800px"
        mx="auto"
        p={4}
        boxShadow="md"
        borderRadius="md"
        bg="bg.panel"
      >
        <Box mb={6}>
          <Text mb={2} fontWeight="bold">
            Quiz Title
          </Text>
          <Input
            value={quizTitle}
            onChange={handleQuizTitleChange}
            placeholder="Enter quiz title"
          />
        </Box>

        {questions.map((question, qIndex) => (
          <Box
            key={qIndex}
            mb={8}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            position="relative"
            bg="bg.subtle"
            borderColor="border.default"
          >
            <Flex justifyContent="space-between" mb={4}>
              <Heading size="md">Question {qIndex + 1}</Heading>
              {questions.length > 1 && (
                <Button
                  size="sm"
                  colorPalette="red"
                  onClick={() => removeQuestion(qIndex)}
                >
                  <MdDelete />
                </Button>
              )}
            </Flex>

            <Box mb={4}>
              <Text mb={2} fontWeight="bold">
                Question Text
              </Text>
              <Input
                value={question.question}
                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                placeholder="Enter your question"
              />
            </Box>

            <Box mb={4}>
              <Text mb={2} fontWeight="bold">
                Question Type
              </Text>
              <HStack>
                <Button
                  size="sm"
                  variant={question.type === "text" ? "solid" : "outline"}
                  onClick={() => handleQuestionTypeChange(qIndex, "text")}
                >
                  Text Only
                </Button>
                <Button
                  size="sm"
                  variant={question.type === "image" ? "solid" : "outline"}
                  onClick={() => handleQuestionTypeChange(qIndex, "image")}
                >
                  With Image
                </Button>
              </HStack>
            </Box>

            {question.type === "image" && (
              <Box mb={4}>
                <Text mb={2} fontWeight="bold">
                  Image URL
                </Text>
                <Input
                  value={question.imageUrl}
                  onChange={(e) => handleImageUrlChange(qIndex, e.target.value)}
                  placeholder="Enter image URL"
                />
                {question.imageUrl && (
                  <Box mt={2} p={2} borderRadius="md" bg="bg.muted">
                    <img
                      src={question.imageUrl}
                      style={{
                        maxHeight: "200px",
                        width: "auto",
                        borderRadius: "6px",
                      }}
                      alt="Question image"
                    />
                  </Box>
                )}
              </Box>
            )}

            <Box mb={4}>
              <Text mb={2} fontWeight="bold">
                Answer Type
              </Text>
              <HStack>
                <Button
                  size="sm"
                  variant={
                    question.answerType === "single" ? "solid" : "outline"
                  }
                  onClick={() => handleAnswerTypeChange(qIndex, "single")}
                >
                  Single Choice
                </Button>
                <Button
                  size="sm"
                  variant={
                    question.answerType === "multiple" ? "solid" : "outline"
                  }
                  onClick={() => handleAnswerTypeChange(qIndex, "multiple")}
                >
                  Multiple Choice
                </Button>
              </HStack>
            </Box>

            <Box mb={4}>
              <Heading size="md">Points for this question</Heading>
              <Input 
                type="number" 
                placeholder="Points for this question" 
                min="0" 
                max="10" 
                width="fit-content" 
                value={question.points}
                onChange={(e) => handlePointsChange(qIndex, parseInt(e.target.value) || 1)}
              />
              <Heading size="md">Negative points for this question</Heading>
              <Input 
                type="number" 
                placeholder="Negative points for this question" 
                min="0" 
                max="10" 
                width="fit-content" 
                value={question.negativePoints}
                onChange={(e) => handleNegativePointsChange(qIndex, parseInt(e.target.value) || 0)}
              />
              <Heading size="md">Time limit for this question</Heading>
              <Input 
                type="number" 
                placeholder="Time limit (seconds)" 
                min="0" 
                width="fit-content" 
                value={question.timeLimit}
                onChange={(e) => handleTimeLimitChange(qIndex, parseInt(e.target.value) || 30)}
              /> seconds
              <Text mb={2} fontWeight="bold">
                Options
              </Text>
              {question.options.map((option, oIndex) => (
                <Flex key={oIndex} mb={2} alignItems="center">
                  {question.answerType === "single" ? (
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      checked={question.correctOption === oIndex}
                      onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                      style={{
                        marginRight: "8px",
                        accentColor: "var(--chakra-colors-blue-500)",
                      }}
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={
                        Array.isArray(question.correctOption) &&
                        question.correctOption.includes(oIndex)
                      }
                      onChange={() => {
                        const updatedQuestions = [...questions];
                        const correctOptions = Array.isArray(
                          updatedQuestions[qIndex].correctOption
                        )
                          ? [
                              ...(updatedQuestions[qIndex]
                                .correctOption as number[]),
                            ]
                          : [];

                        if (correctOptions.includes(oIndex)) {
                          updatedQuestions[qIndex].correctOption =
                            correctOptions.filter((idx) => idx !== oIndex);
                        } else {
                          correctOptions.push(oIndex);
                          updatedQuestions[qIndex].correctOption =
                            correctOptions;
                        }
                        setQuestions(updatedQuestions);
                      }}
                      style={{
                        marginRight: "8px",
                        accentColor: "var(--chakra-colors-blue-500)",
                      }}
                    />
                  )}
                  <Input
                    value={option}
                    onChange={(e) =>
                      handleOptionChange(qIndex, oIndex, e.target.value)
                    }
                    placeholder={`Option ${oIndex + 1}`}
                  />
                </Flex>
              ))}
            </Box>
          </Box>
        ))}
        <Flex justifyContent="space-between" mt={6}>
          <Button colorPalette="blue" variant="outline" onClick={addQuestion}>
            <CgAdd style={{ marginRight: "8px" }} />
            Add Question
          </Button>
          <Button colorPalette="green" onClick={handleSubmit}>
            Create Quiz
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default CreateQuiz;
