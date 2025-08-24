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
  name: string;
  desc: string;
  duration: string;
  code: string;
  categories?: string[];
  author?: string;
  questions?: number;
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
    name: "",
    desc: "",
    duration: "",
    code: "",
    categories: [],
    author: "",
    questions: 0,
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
          title={selectedQuiz.name || "No name"}
          description={selectedQuiz.desc || "No description"}
          onclose={toggleQuizPopup}
        ></QuizPopup>
      )}
      {isQuizDetailsShowing && (
        <QuizDetails
          title={selectedQuiz.name || "No name"}
          description={selectedQuiz.desc || "No description"}
          code={selectedQuiz.code || "No code"}
          author={selectedQuiz.author || "Unknown"}
          duration={selectedQuiz.duration || "0"}
          categories={selectedQuiz.categories || []}
          questions={selectedQuiz.questions || 0}
          onclose={toggleQuizDetailsPopup}
        ></QuizDetails>
      )}
    </Box>
  );
};

export default Home;
