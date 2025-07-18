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
} from "@chakra-ui/react";
import TopBar from "@/components/general/TopBar/TopBar";
import { FaArrowRight } from "react-icons/fa";
import Interesting from "@/components/general/Interesting/Interesting";

const Landing = () => {
  const [isShowingAbout, setIsShowingAbout] = useState(false);
  const onClickAbout = () => {
    setIsShowingAbout(!isShowingAbout);
  };
  return (
    <Container
      fluid
      h="100vh"
      padding="0"
      centerContent={true}
      //backgroundImage="url('https://cdn.wallpapersafari.com/8/55/drBQil.jpg')"
      backgroundRepeat="no-repeat"
      backgroundSize={"cover"}
    >
      {isShowingAbout ? (
        <Alert.Root
          status="info"
          colorPalette="teal"
          width="-moz-fit-content"
          animation="ease"
          transition={"ease-in"}
        >
          <Alert.Indicator />
          <Alert.Title>
            RAYQuizA is a fun, simple and enjoyable quiz website for educational
            purposes.
          </Alert.Title>
        </Alert.Root>
      ) : null}
      <TopBar onClickAbout={onClickAbout}></TopBar>
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
      or... maybe you want to know more?
      <Interesting
        title="A new beginning"
        desc="is now starting!"
        color="white"
        bgcolor="teal"
      ></Interesting>
    </Container>
  );
};

export default Landing;
