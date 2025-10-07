import NavBar from "@/components/general/NavBar/NavBar";
import Sidebar from "@/pages/Home/Sidebar/Sidebar";
import { Box, Flex, Show, useBreakpointValue } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import "./Home.css";
import QuizPopup from "@/components/general/QuizPopup/QuizPopup";
import QuizDetails from "@/components/general/QuizDetails/QuizDetails";
import Quizzes from "./Quizzes";
import JoinCode from "../JoinCode/JoinCode";
import CreateQuiz from "./CreateQuiz/CreateQuiz";

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

const Home = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const [isQuizPopupShowing, setShowingQuizPopup] = useState(false);
  const [isQuizDetailsShowing, setShowingQuizDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState("Quizzes");
  const toggleQuizPopup = () => {
    setShowingQuizPopup(!isQuizPopupShowing);
  };
  const toggleQuizDetailsPopup = () => {
    setShowingQuizDetails(!isQuizDetailsShowing);
  };
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz>({
    _id: "",
    title: "",
    description: "",
    categories: [],
    code: "",
    createdBy: "",
    questions: [],
    createdAt: "",
  });
  const [user, setUser] = useState<{ name: string; picture: string } | null>(
    null
  );

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <Box>
      <Box position="fixed" top="0" left="0" right="0" zIndex={1000}>
        <NavBar username={user?.name || ""} profilePic={user?.picture || ""} />
      </Box>
      <Flex>
        <Show when={!isMobile}>
          <Box
            position="fixed"
            left="0"
            top="0"
            width="20vw"
            height="100vh"
            bgColor="gold"
            zIndex={999}
            pt="60px"
          >
            <Sidebar setCurrentPage={setCurrentPage} />
          </Box>
        </Show>
        <Box
          ml={isMobile ? "0" : "20vw"}
          mt="60px"
          width={isMobile ? "100vw" : "80vw"}
          minHeight="calc(100vh - 60px)"
        >
          {currentPage === "Quizzes" ? (
            <Quizzes
              quizPopup={setShowingQuizPopup}
              quizDetails={setShowingQuizDetails}
              setSelectedQuiz={setSelectedQuiz}
            />
          ) : currentPage === "Create Quiz" ? (
            <CreateQuiz />
          ) : currentPage === "Join using code" ? (
            <JoinCode />
          ) : currentPage === "Shop" ? (
            <div>Shop Page</div>
          ) : null}
        </Box>
      </Flex>
      {isQuizPopupShowing && (
        <QuizPopup
          title={selectedQuiz.title || "No name"}
          description={selectedQuiz.description || "No description"}
          onclose={toggleQuizPopup}
        ></QuizPopup>
      )}
      {isQuizDetailsShowing && (
        <QuizDetails
          title={selectedQuiz.title || "No name"}
          description={selectedQuiz.description || "No description"}
          code={selectedQuiz.code || "No code"}
          author={selectedQuiz.createdBy || "Unknown"}
          duration={
            selectedQuiz.questions && Array.isArray(selectedQuiz.questions)
              ? `${selectedQuiz.questions.reduce(
                  (total, q) => total + (q.timeLimit || 30),
                  0
                )}s`
              : "0s"
          }
          categories={selectedQuiz.categories || []}
          questions={
            selectedQuiz.questions && Array.isArray(selectedQuiz.questions)
              ? selectedQuiz.questions.length
              : 0
          }
          onclose={toggleQuizDetailsPopup}
        ></QuizDetails>
      )}
    </Box>
  );
};

export default Home;
