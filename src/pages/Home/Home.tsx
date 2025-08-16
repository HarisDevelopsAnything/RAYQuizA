import NavBar from "@/components/general/NavBar/NavBar";
import Sidebar from "@/components/general/Sidebar/Sidebar";
import TopBar from "@/components/general/TopBar/TopBar";
import {
  Button,
  Center,
  Container,
  Grid,
  GridItem,
  Show,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Landing from "../Landing/Landing";
import QuizCard from "@/components/home/QuizCard/QuizCard";
import "./Home.css";
import QuizPopup from "@/components/general/QuizPopup/QuizPopup";

type Quiz = {
  name: string;
  desc: string;
  duration: string;
};

const Home = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const [isQuizPopupShowing, setShowingQuizPopup] = useState(true);
  const toggleQuizPopup = () => {
    setShowingQuizPopup(!isQuizPopupShowing);
  };
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/quizzes")
      .then((res) => res.json())
      .then((data) => setQuizzes(data))
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
          <NavBar></NavBar>
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
          <SimpleGrid columns={isMobile ? 1 : 4}>
            {quizzes.map((quiz, index) => (
              <QuizCard
                key={index}
                name={quiz.name}
                desc={quiz.desc}
                duration={quiz.duration}
              ></QuizCard>
            ))}
          </SimpleGrid>
        </GridItem>
        {isQuizPopupShowing && (
          <QuizPopup
            title="Hello world"
            description="Hello jon"
            onclose={toggleQuizPopup}
          ></QuizPopup>
        )}
      </Grid>
    </Container>
  );
};

export default Home;
