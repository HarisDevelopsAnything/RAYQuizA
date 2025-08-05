import React, { useState } from "react";
import "@/index.css";
import {
  Button,
  Heading,
  Text,
  Container,
  Highlight,
  ButtonGroup,
  Alert,
  Spinner,
  AlertDescription,
  SimpleGrid,
} from "@chakra-ui/react";
import { FaArrowRight } from "react-icons/fa";
import Interesting from "@/components/general/Interesting/Interesting";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/general/TopBar/TopBar";

const Landing = () => {
  const navigate = useNavigate();
  const [isShowingAbout, setIsShowingAbout] = useState(false);
  const onClickAbout = () => {
    setIsShowingAbout(!isShowingAbout);
  };
  return (
    <>
      <TopBar onClickAbout={onClickAbout}></TopBar>
      <Container
        transition="backgrounds 0.3s ease"
        fluid
        h="100vh"
        padding="0"
        centerContent={true}
        //backgroundImage="url('https://cdn.wallpapersafari.com/8/55/drBQil.jpg')"
        backgroundRepeat="no-repeat"
        backgroundSize={"cover"}
      >
        <Heading size="6xl">
          <Highlight query="Quiz" styles={{ color: "teal.400" }}>
            Welcome to RAYQuizA!
          </Highlight>
        </Heading>
        <Text fontSize="3xl" color="fg.muted" fontWeight={"bold"}>
          Realtime Assessment Yielding Quiz App
        </Text>
        <Button
          colorPalette={"green"}
          variant={"subtle"}
          size="2xl"
          transition="0.3s ease all"
          _hover={{ transform: "scale(1.1)" }}
          onClick={() => navigate("/home")}
        >
          Let's get quizzing! <FaArrowRight />
        </Button>
        or... maybe you want to know more?
        <SimpleGrid columns={2} minChildWidth={"sm"}>
          <Interesting
            title="What is with the name?"
            desc="The site was named after Rayquaza, the legendary Pokemon."
            color="white"
            bgcolor="teal"
          ></Interesting>
          <Interesting
            title="What's different?"
            desc="RAYQuizA is a quiz platform built by the students, for the students."
            color="white"
            bgcolor="green.600"
          ></Interesting>
          <Interesting
            title="What's different?"
            desc="RAYQuizA is a quiz platform built by the students, for the students."
            color="white"
            bgcolor="green.600"
          ></Interesting>
          <Interesting
            title="What is with the name?"
            desc="The site was named after Rayquaza, the legendary Pokemon."
            color="white"
            bgcolor="teal"
          ></Interesting>
        </SimpleGrid>
      </Container>
    </>
  );
};

export default Landing;
