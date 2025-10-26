import NavBar from "@/components/general/NavBar/NavBar";
import Sidebar from "@/pages/Home/Sidebar/Sidebar";
import { Box, Flex, Show, useBreakpointValue, Drawer } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import QuizPopup from "@/components/general/QuizPopup/QuizPopup";
import QuizDetails from "@/components/general/QuizDetails/QuizDetails";
import Quizzes from "./Quizzes";
import JoinCode from "../JoinCode/JoinCode";
import CreateQuiz from "./CreateQuiz/CreateQuiz";
import { toaster } from "@/components/ui/toaster";

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

const Home = () => {
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const [isQuizPopupShowing, setShowingQuizPopup] = useState(false);
  const [isQuizDetailsShowing, setShowingQuizDetails] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("Quizzes");
  const toggleQuizPopup = () => {
    setShowingQuizPopup(!isQuizPopupShowing);
  };
  const toggleQuizDetailsPopup = () => {
    setShowingQuizDetails(!isQuizDetailsShowing);
  };
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
    } else {
      // If no user is found, redirect to login
      navigate("/login", { replace: true });
      return;
    }

    // Prevent back navigation to login after successful authentication
    const preventBackNavigation = () => {
      window.history.pushState(null, "", window.location.href);
    };

    // Add state to history to prevent back navigation
    preventBackNavigation();

    // Listen for back button and prevent navigation to login
    const handlePopState = () => {
      preventBackNavigation();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  const handleLogout = () => {
    // Clear all stored user data
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("token");
    
    // Show success message
    toaster.create({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
      type: "success",
      duration: 3000,
    });
    
    // Navigate to login page
    navigate("/login", { replace: true });
  };

  return (
    <Box>
      <Box position="fixed" top="0" left="0" right="0" zIndex={1000}>
        <NavBar 
          username={user?.name || ""} 
          profilePic={user?.picture || ""} 
          onLogout={handleLogout}
          onMenuClick={toggleMobileMenu}
          showMenuButton={isMobile}
        />
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
            <Sidebar setCurrentPage={setCurrentPage} onLogout={handleLogout} />
          </Box>
        </Show>
        
        {/* Mobile Drawer Menu */}
        <Drawer.Root
          open={isMobileMenuOpen}
          onOpenChange={(e) => setIsMobileMenuOpen(e.open)}
          placement="start"
          size="xs"
        >
          <Drawer.Backdrop />
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Menu</Drawer.Title>
              <Drawer.CloseTrigger />
            </Drawer.Header>
            <Drawer.Body p={0}>
              <Sidebar 
                setCurrentPage={(page) => {
                  setCurrentPage(page);
                  setIsMobileMenuOpen(false);
                }} 
                onLogout={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }} 
              />
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Root>

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
              ? `${selectedQuiz.questions.reduce((total, q) => total + (q.timeLimit || 30), 0)}s`
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
