import React from "react";
import {
  Button,
  Heading,
  Text,
  Container,
  Highlight,
  ButtonGroup,
} from "@chakra-ui/react";
import TopBar from "./components/general/TopBar";
import { FaArrowRight } from "react-icons/fa";

const App = () => {
  return (
    <Container
      fluid
      h="100rem"
      centerContent={true}
      backgroundImage="url('https://cdn.wallpapersafari.com/8/55/drBQil.jpg')"
      backgroundRepeat="no-repeat"
      backgroundSize={"contain"}
    >
      <TopBar></TopBar>
      <Heading size="6xl">
        <Highlight query="Quiz" styles={{ color: "teal.400" }}>
          Welcome to RAYQuizA!
        </Highlight>
      </Heading>

      <Text fontSize="3xl" color="fg.muted" fontWeight={"bold"}>
        Realtime Assessment Yielding Quiz App
      </Text>
      <Button colorPalette={"green"} variant={"subtle"} size="2xl">
        Let's get quizzing! <FaArrowRight />
      </Button>
    </Container>
  );
};

export default App;
