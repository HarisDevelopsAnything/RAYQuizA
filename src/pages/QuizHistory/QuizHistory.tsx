import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Tabs,
  Card,
  Spinner,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoDownload } from "react-icons/io5";
import { useAccentColor } from "@/contexts/UserPreferencesContext";
import { jsPDF } from "jspdf";
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
  status?: "completed" | "interrupted";
  questionsCompleted?: number;
  totalQuestions?: number;
}

const QuizHistory = () => {
  const navigate = useNavigate();
  const accentColor = useAccentColor();
  const [createdHistory, setCreatedHistory] = useState<QuizHistoryEntry[]>([]);
  const [participatedHistory, setParticipatedHistory] = useState<
    QuizHistoryEntry[]
  >([]);
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
        throw new Error(
          `Failed to fetch created history: ${createdResponse.status}`
        );
      }

      const createdData = await createdResponse.json();
      console.log("Created quiz history:", createdData);
      setCreatedHistory(createdData.history || []);

      // Fetch participated quizzes
      const participatedResponse = await fetch(
        `${baseURL}/api/quiz-history/participated/${encodeURIComponent(
          userEmail
        )}`
      );

      if (!participatedResponse.ok) {
        throw new Error(
          `Failed to fetch participated history: ${participatedResponse.status}`
        );
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

  const downloadPDF = (entry: QuizHistoryEntry) => {
    const doc = new jsPDF();
    const sortedParticipants = [...entry.participants].sort(
      (a, b) => b.score - a.score
    );

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Quiz Results Report", 105, 20, { align: "center" });

    // Quiz Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Quiz Title: ${entry.quizTitle}`, 20, 35);
    doc.text(`Quiz Code: ${entry.quizCode}`, 20, 42);
    doc.text(`Date: ${formatDate(entry.completedAt)}`, 20, 49);
    doc.text(`Total Participants: ${entry.totalParticipants}`, 20, 56);

    if (
      entry.status === "interrupted" &&
      entry.questionsCompleted !== undefined
    ) {
      doc.text(
        `Status: Stopped at question ${entry.questionsCompleted} of ${entry.totalQuestions}`,
        20,
        63
      );
    } else {
      doc.text(`Status: Completed`, 20, 63);
    }

    // Participants Header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Participant Rankings:", 20, 75);

    // Table Header
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Rank", 20, 85);
    doc.text("Name", 45, 85);
    doc.text("Email", 110, 85);
    doc.text("Score", 180, 85);

    // Draw line under header
    doc.line(20, 87, 190, 87);

    // Participants List
    doc.setFont("helvetica", "normal");
    let yPosition = 95;

    sortedParticipants.forEach((participant, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      const rank = `#${index + 1}`;
      const name = participant.name + (participant.email ? "" : " (Guest)");
      const email = participant.email || "N/A";
      const score = `${participant.score.toFixed(2)} pts`;

      doc.text(rank, 20, yPosition);
      doc.text(name.substring(0, 30), 45, yPosition);
      doc.text(email.substring(0, 30), 110, yPosition);
      doc.text(score, 180, yPosition);

      yPosition += 7;
    });

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`,
        105,
        290,
        { align: "center" }
      );
    }

    // Save PDF
    const fileName = `${entry.quizTitle.replace(/[^a-z0-9]/gi, "_")}_${
      entry.quizCode
    }_Results.pdf`;
    doc.save(fileName);
  };

  const renderHistoryCard = (entry: QuizHistoryEntry) => {
    const sortedParticipants = [...entry.participants].sort(
      (a, b) => b.score - a.score
    );
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const userEmail = user?.email;
    const userScore = entry.participants.find(
      (p) => p.email === userEmail
    )?.score;

    return (
      <Card.Root
        key={entry._id}
        width="100%"
        p={4}
        mb={4}
        bg="bg.panel"
        borderWidth="1px"
      >
        <Card.Body>
          <HStack justifyContent="space-between" mb={2}>
            <Heading size="md" color="fg">
              {entry.quizTitle}
            </Heading>
            <HStack>
              <Button
                size="sm"
                colorPalette={accentColor as any}
                onClick={() => downloadPDF(entry)}
              >
                <IoDownload /> Download PDF
              </Button>
              {entry.status === "interrupted" && (
                <Badge colorPalette="orange" variant="solid">
                  Stopped
                </Badge>
              )}
              <Badge colorPalette={accentColor as any} variant="solid">
                Code: {entry.quizCode}
              </Badge>
            </HStack>
          </HStack>

          <Text fontSize="sm" color="fg.muted" mb={3}>
            Completed: {formatDate(entry.completedAt)}
            {entry.status === "interrupted" &&
              entry.questionsCompleted !== undefined && (
                <>
                  {" "}
                  • Stopped at question {entry.questionsCompleted} of{" "}
                  {entry.totalQuestions}
                </>
              )}
          </Text>

          <Text fontWeight="bold" mb={2} color="fg">
            Participants ({entry.totalParticipants}):
          </Text>

          <VStack align="stretch" gap={2} maxH="200px" overflowY="auto">
            {sortedParticipants.map((participant, index) => {
              const isCurrentUser = participant.email === userEmail;
              return (
                <HStack
                  key={participant.userId}
                  justifyContent="space-between"
                  p={3}
                  bg={isCurrentUser ? `${accentColor}.500` : "bg.subtle"}
                  borderRadius="md"
                  borderWidth="2px"
                  borderColor={isCurrentUser ? `${accentColor}.600` : "border"}
                >
                  <HStack>
                    <Badge
                      colorPalette={
                        index === 0
                          ? "yellow"
                          : index === 1
                          ? "gray"
                          : index === 2
                          ? "orange"
                          : "blue"
                      }
                      variant="solid"
                    >
                      #{index + 1}
                    </Badge>
                    <Text
                      fontWeight={isCurrentUser ? "bold" : "medium"}
                      color={isCurrentUser ? "white" : "fg"}
                      fontSize="md"
                    >
                      {participant.name}
                      {isCurrentUser && " (You)"}
                      {!participant.email && " (Guest)"}
                    </Text>
                  </HStack>
                  <Badge
                    colorPalette="green"
                    variant="solid"
                    fontSize="md"
                    px={3}
                    py={1}
                  >
                    {participant.score.toFixed(2)} pts
                  </Badge>
                </HStack>
              );
            })}
          </VStack>

          {userScore !== undefined && (
            <Box
              mt={3}
              p={2}
              bg={`${accentColor}.100`}
              borderRadius="md"
              borderWidth="1px"
              borderColor={`${accentColor}.200`}
            >
              <Text fontWeight="bold" textAlign="center" color="fg">
                Your Score: {userScore.toFixed(2)} points
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
          <Button onClick={() => navigate("/home")} variant="outline">
            <IoArrowBack /> Back to Home
          </Button>
        </HStack>

        <Tabs.Root defaultValue="created">
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
                  No quiz history found. Create and conduct a quiz to see
                  results here!
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
                  No quiz history found. Participate in a quiz to see your
                  results here!
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
