import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  Portal,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useAccentColor } from "@/contexts/UserPreferencesContext";
import { MdClose } from "react-icons/md";

interface AIQuizGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (quizData: AIGeneratedQuizData) => void;
}

export interface AIGeneratedQuizData {
  title: string;
  description: string;
  categories: string[];
  questions: Array<{
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
}

interface AIGeneratorFormData {
  title: string;
  numQuestions: number;
  genre: string;
  targetAge: string;
  difficulty: "easy" | "medium" | "hard";
  additionalInstructions: string;
}

const AIQuizGenerator: React.FC<AIQuizGeneratorProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const accentColor = useAccentColor();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<AIGeneratorFormData>({
    title: "",
    numQuestions: 5,
    genre: "",
    targetAge: "",
    difficulty: "medium",
    additionalInstructions: "",
  });

  const handleInputChange = (
    field: keyof AIGeneratorFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.title.trim() || !formData.genre.trim()) {
      alert("Please fill in at least the quiz title and genre/topic");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Failed to generate quiz");
      }

      const generatedQuiz: AIGeneratedQuizData = await response.json();
      onGenerate(generatedQuiz);
      onClose();
      
      // Reset form
      setFormData({
        title: "",
        numQuestions: 5,
        genre: "",
        targetAge: "",
        difficulty: "medium",
        additionalInstructions: "",
      });
    } catch (error) {
      console.error("Error generating quiz:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to generate quiz:\n\n${errorMessage}\n\nPlease check:\n1. Your API key is valid\n2. Your OpenRouter account has credits\n3. The selected model is available\n4. Server console for detailed logs`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {isOpen && (
        <Portal>
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            zIndex={1000}
            onClick={onClose}
          />
          <Box
            position="fixed"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            bg="bg.panel"
            borderRadius="lg"
            boxShadow="2xl"
            p={6}
            maxW="600px"
            width="90%"
            maxH="90vh"
            overflowY="auto"
            zIndex={1001}
          >
            <Box position="relative" mb={4}>
              <Heading size="lg" mb={1}>✨ Generate Quiz with AI</Heading>
              <Button
                position="absolute"
                top={-2}
                right={-2}
                size="sm"
                variant="ghost"
                onClick={onClose}
              >
                <MdClose />
              </Button>
            </Box>

            <VStack gap={4} align="stretch">
              <Box>
                <Text mb={2} fontWeight="bold">
                  Quiz Title *
                </Text>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., World History Quiz"
                />
              </Box>

              <Box>
                <Text mb={2} fontWeight="bold">
                  Number of Questions *
                </Text>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.numQuestions}
                  onChange={(e) =>
                    handleInputChange("numQuestions", parseInt(e.target.value) || 5)
                  }
                  placeholder="5"
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Between 1-20 questions
                </Text>
              </Box>

              <Box>
                <Text mb={2} fontWeight="bold">
                  Genre/Topic *
                </Text>
                <Input
                  value={formData.genre}
                  onChange={(e) => handleInputChange("genre", e.target.value)}
                  placeholder="e.g., Science, History, Pop Culture, Mathematics"
                />
              </Box>

              <Box>
                <Text mb={2} fontWeight="bold">
                  Target Age Group
                </Text>
                <Input
                  value={formData.targetAge}
                  onChange={(e) => handleInputChange("targetAge", e.target.value)}
                  placeholder="e.g., 10-12, Adults, Teens"
                />
              </Box>

              <Box>
                <Text mb={2} fontWeight="bold">
                  Difficulty Level
                </Text>
                <HStack>
                  <Button
                    size="sm"
                    variant={formData.difficulty === "easy" ? "solid" : "outline"}
                    colorPalette={accentColor as any}
                    onClick={() => handleInputChange("difficulty", "easy")}
                  >
                    Easy
                  </Button>
                  <Button
                    size="sm"
                    variant={formData.difficulty === "medium" ? "solid" : "outline"}
                    colorPalette={accentColor as any}
                    onClick={() => handleInputChange("difficulty", "medium")}
                  >
                    Medium
                  </Button>
                  <Button
                    size="sm"
                    variant={formData.difficulty === "hard" ? "solid" : "outline"}
                    colorPalette={accentColor as any}
                    onClick={() => handleInputChange("difficulty", "hard")}
                  >
                    Hard
                  </Button>
                </HStack>
              </Box>

              <Box>
                <Text mb={2} fontWeight="bold">
                  Additional Instructions (Optional)
                </Text>
                <Input
                  value={formData.additionalInstructions}
                  onChange={(e) =>
                    handleInputChange("additionalInstructions", e.target.value)
                  }
                  placeholder="e.g., Focus on 20th century events, Include famous scientists"
                />
              </Box>
            </VStack>

            <HStack justifyContent="flex-end" mt={6} gap={3}>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorPalette={accentColor as any}
                onClick={handleGenerate}
                loading={isGenerating}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Quiz"}
              </Button>
            </HStack>
          </Box>
        </Portal>
      )}
    </>
  );
};

export default AIQuizGenerator;
