import NavBar from "@/components/general/NavBar/NavBar";
import Sidebar from "@/components/general/Sidebar/Sidebar";
import TopBar from "@/components/general/TopBar/TopBar";
import {
  Button,
  Center,
  Container,
  Grid,
  GridItem,
  Heading,
  Show,
  SimpleGrid,
  Spinner,
  useBreakpointValue,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Landing from "../Landing/Landing";
import QuizCard from "@/components/home/QuizCard/QuizCard";
import "./Home.css";
import QuizPopup from "@/components/general/QuizPopup/QuizPopup";
import QuizDetails from "@/components/general/QuizDetails/QuizDetails";

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
  const toggleQuizPopup = () => {
    setShowingQuizPopup(!isQuizPopupShowing);
  };
  const toggleQuizDetailsPopup = () => {
    setShowingQuizDetails(!isQuizDetailsShowing);
  };
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
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
    <Container left="0px" margin="0" padding="0" height="60vh">
      <Grid
        templateAreas={{
          base: `"nav" "main"`,
          lg: `"nav nav" "aside main"`,
        }}
      >
        <GridItem area="nav" position={"sticky"} top="0px" zIndex={10}>
          <NavBar
            username={user?.name || ""}
            profilePic={user?.picture || ""}
          ></NavBar>
        </GridItem>
        <Show when={!isMobile}>
          <GridItem area="aside" bgColor={"gold"} width={"20vw"}>
            <Sidebar username="Haris"></Sidebar>
          </GridItem>
        </Show>
        <GridItem
          area="main"
          bgColor={"gray.800"}
          backgroundImage={
            "url('https://images.unsplash.com/photo-1677611998429-1baa4371456b?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGFic3RyYWN0JTIwZ3JlZW58ZW58MHx8MHx8fDA%3D')"
          }
          backgroundSize={"fit"}
          width={isMobile ? "100vw" : "80vw"}
        >
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
                  toggleQuizPopup();
                }}
                onClickViewDetails={() => {
                  setSelectedQuiz(quiz);
                  toggleQuizDetailsPopup();
                }}
              ></QuizCard>
            ))}
          </SimpleGrid>
        </GridItem>
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
      </Grid>
    </Container>
  );
};

export default Home;
