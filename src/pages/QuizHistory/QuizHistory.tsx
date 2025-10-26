import { useEffect, useState } from "react";
import { Box, Button, Container, Heading, VStack, HStack, Text, Badge, Tabs, Card, Spinner } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useAccentColor } from "@/contexts/UserPreferencesContext";
import "./QuizHistory.css";

interface Participant {
  userId: string;
  name: string;
  email: string | null;
  score: number;
}

interface QuizHistoryEntry {
  _id: string;
  quizCode: string;
  quizTitle: string;
  quizId: string | null;
  creatorEmail: string;
  hostEmail: string;
  participants: Participant[];
  completedAt: string;
  totalParticipants: number;
}

const QuizHistory = () => {
  const navigate = useNavigate();
  const accentColor = useAccentColor();
  const [createdHistory, setCreatedHistory] = useState<QuizHistoryEntry[]>([]);
  const [participatedHistory, setParticipatedHistory] = useState<QuizHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const fetchQuizHistory = async () => {
    try {
      setLoading(true);
      const userString = localStorage.getItem("user");
      
      if (!userString) {
        console.error("No user found in localStorage");
        setLoading(false);
        return;
      }

      const user = JSON.parse(userString);
      const userEmail = user.email;

      if (!userEmail) {
        console.error("No email found for user");
        setLoading(false);
        return;
      }

      console.log("Fetching quiz history for email:", userEmail);

      // Use the same backend URL pattern as other components
      const baseURL = "https://rayquiza-backend.onrender.com";

      // Fetch created quizzes
      const createdResponse = await fetch(
        `${baseURL}/api/quiz-history/created/${encodeURIComponent(userEmail)}`
      );
      
      if (!createdResponse.ok) {
        throw new Error(`Failed to fetch created history: ${createdResponse.status}`);
      }
      
      const createdData = await createdResponse.json();
      console.log("Created quiz history:", createdData);
      setCreatedHistory(createdData.history || []);

      // Fetch participated quizzes
      const participatedResponse = await fetch(
        `${baseURL}/api/quiz-history/participated/${encodeURIComponent(userEmail)}`
      );
      
      if (!participatedResponse.ok) {
        throw new Error(`Failed to fetch participated history: ${participatedResponse.status}`);
      }
      
      const participatedData = await participatedResponse.json();
      console.log("Participated quiz history:", participatedData);
      setParticipatedHistory(participatedData.history || []);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderHistoryCard = (entry: QuizHistoryEntry) => {
    const sortedParticipants = [...entry.participants].sort((a, b) => b.score - a.score);
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const userEmail = user?.email;
    const userScore = entry.participants.find(p => p.email === userEmail)?.score;

    return (
      <Card.Root key={entry._id} width="100%" p={4} mb={4}>
        <Card.Body>
          <HStack justifyContent="space-between" mb={2}>
            <Heading size="md">{entry.quizTitle}</Heading>
            <Badge colorPalette={accentColor as any} variant="solid">
              Code: {entry.quizCode}
            </Badge>
          </HStack>
          
          <Text fontSize="sm" color="gray.500" mb={3}>
            Completed: {formatDate(entry.completedAt)}
          </Text>

          <Text fontWeight="bold" mb={2}>
            Participants ({entry.totalParticipants}):
          </Text>

          <VStack align="stretch" gap={2} maxH="200px" overflowY="auto">
            {sortedParticipants.map((participant, index) => (
              <HStack
                key={participant.userId}
                justifyContent="space-between"
                p={2}
                bg={participant.email === userEmail ? `${accentColor}.100` : "gray.50"}
                borderRadius="md"
              >
                <HStack>
                  <Badge colorPalette={index === 0 ? "yellow" : index === 1 ? "gray" : index === 2 ? "orange" : "blue"}>
                    #{index + 1}
                  </Badge>
                  <Text fontWeight={participant.email === userEmail ? "bold" : "normal"}>
                    {participant.name}
                    {participant.email === userEmail && " (You)"}
                    {!participant.email && " (Guest)"}
                  </Text>
                </HStack>
                <Badge colorPalette="green" fontSize="md">
                  {participant.score} pts
                </Badge>
              </HStack>
            ))}
          </VStack>

          {userScore !== undefined && (
            <Box mt={3} p={2} bg={`${accentColor}.50`} borderRadius="md">
              <Text fontWeight="bold" textAlign="center">
                Your Score: {userScore} points
              </Text>
            </Box>
          )}
        </Card.Body>
      </Card.Root>
    );
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack align="stretch" gap={6}>
        <HStack justifyContent="space-between">
          <Heading size="xl">Quiz History</Heading>
          <Button
            onClick={() => navigate("/home")}
            variant="outline"
          >
            <IoArrowBack /> Back to Home
          </Button>
        </HStack>

        <Tabs.Root
          defaultValue="created"
        >
          <Tabs.List>
            <Tabs.Trigger value="created">
              Quizzes I Created ({createdHistory.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="participated">
              Quizzes I Participated In ({participatedHistory.length})
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="created" pt={4}>
            {loading ? (
              <Box textAlign="center" py={8}>
                <Spinner size="xl" color={accentColor} />
              </Box>
            ) : createdHistory.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Text fontSize="lg" color="gray.500">
                  No quiz history found. Create and conduct a quiz to see results here!
                </Text>
              </Box>
            ) : (
              <VStack align="stretch" gap={4}>
                {createdHistory.map(renderHistoryCard)}
              </VStack>
            )}
          </Tabs.Content>

          <Tabs.Content value="participated" pt={4}>
            {loading ? (
              <Box textAlign="center" py={8}>
                <Spinner size="xl" color={accentColor} />
              </Box>
            ) : participatedHistory.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Text fontSize="lg" color="gray.500">
                  No quiz history found. Participate in a quiz to see your results here!
                </Text>
              </Box>
            ) : (
              <VStack align="stretch" gap={4}>
                {participatedHistory.map(renderHistoryCard)}
              </VStack>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </Container>
  );
};

export default QuizHistory;
