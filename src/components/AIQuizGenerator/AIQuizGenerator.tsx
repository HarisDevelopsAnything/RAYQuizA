import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  Portal,
  Spinner,
  NativeSelectRoot,
  NativeSelectField,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
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

interface AIModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
}

interface AIGeneratorFormData {
  title: string;
  numQuestions: number;
  genre: string;
  targetAge: string;
  difficulty: "easy" | "medium" | "hard";
  additionalInstructions: string;
  model: string;
}

const AIQuizGenerator: React.FC<AIQuizGeneratorProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const accentColor = useAccentColor();
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AIGeneratorFormData>({
    title: "",
    numQuestions: 5,
    genre: "",
    targetAge: "",
    difficulty: "medium",
    additionalInstructions: "",
    model: "",
  });

  // Fetch available models when component opens
  useEffect(() => {
    if (isOpen && availableModels.length === 0) {
      fetchAvailableModels();
    }
  }, [isOpen]);

  const fetchAvailableModels = async () => {
    setIsLoadingModels(true);
    setModelsError(null);
    
    try {
      const apiUrl = import.meta.env.DEV
        ? "/api/available-models"
        : "https://rayquiza-backend.onrender.com/api/available-models";

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error("Failed to fetch available models");
      }

      const data = await response.json();
      setAvailableModels(data.models || []);
      
      // Auto-select first model if available
      if (data.models && data.models.length > 0 && !formData.model) {
        setFormData((prev) => ({ ...prev, model: data.models[0].id }));
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      setModelsError(
        error instanceof Error ? error.message : "Failed to load models"
      );
    } finally {
      setIsLoadingModels(false);
    }
  };

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

    if (!formData.model) {
      alert("Please select an AI model");
      return;
    }

    setIsGenerating(true);

    try {
      const apiUrl = import.meta.env.DEV
        ? "/api/generate-quiz"
        : "https://rayquiza-backend.onrender.com/api/generate-quiz";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "Failed to generate quiz"
        );
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
        model: availableModels[0]?.id || "",
      });
    } catch (error) {
      console.error("Error generating quiz:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(
        `Failed to generate quiz:\n\n${errorMessage}\n\nPlease check:\n1. Your API key is valid\n2. Your OpenRouter account has credits\n3. The selected model is available\n4. Server console for detailed logs`
      );
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
              <Heading size="lg" mb={1}>
                ✨ Generate Quiz with AI
              </Heading>
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
              {/* Model Selection */}
              <Box>
                <Text mb={2} fontWeight="bold">
                  AI Model *
                </Text>
                {isLoadingModels ? (
                  <HStack p={3} borderWidth={1} borderRadius="md">
                    <Spinner size="sm" />
                    <Text fontSize="sm">Loading available models...</Text>
                  </HStack>
                ) : modelsError ? (
                  <Box>
                    <Text color="red.500" fontSize="sm" mb={2}>
                      {modelsError}
                    </Text>
                    <Button size="sm" onClick={fetchAvailableModels}>
                      Retry
                    </Button>
                  </Box>
                ) : availableModels.length === 0 ? (
                  <Box>
                    <Text color="orange.500" fontSize="sm" mb={2}>
                      No free models available. Please check your API key.
                    </Text>
                    <Button size="sm" onClick={fetchAvailableModels}>
                      Retry
                    </Button>
                  </Box>
                ) : (
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={formData.model}
                      onChange={(e) =>
                        handleInputChange("model", e.target.value)
                      }
                      placeholder="Select an AI model"
                    >
                      <option value="" disabled>
                        Select an AI model
                      </option>
                      {availableModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                )}
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {availableModels.length > 0
                    ? `${availableModels.length} free model(s) available`
                    : "Fetching models..."}
                </Text>
              </Box>

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
                    handleInputChange(
                      "numQuestions",
                      parseInt(e.target.value) || 5
                    )
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
                  onChange={(e) =>
                    handleInputChange("targetAge", e.target.value)
                  }
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
                    variant={
                      formData.difficulty === "easy" ? "solid" : "outline"
                    }
                    colorPalette={accentColor as any}
                    onClick={() => handleInputChange("difficulty", "easy")}
                  >
                    Easy
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      formData.difficulty === "medium" ? "solid" : "outline"
                    }
                    colorPalette={accentColor as any}
                    onClick={() => handleInputChange("difficulty", "medium")}
                  >
                    Medium
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      formData.difficulty === "hard" ? "solid" : "outline"
                    }
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
                  placeholder="e.g., change time limit, make it more challenging"
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
