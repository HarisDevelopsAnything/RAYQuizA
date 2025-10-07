import { useState } from "react";
import "@/index.css";
import {
  Button,
  Heading,
  Text,
  Container,
  Highlight,
  SimpleGrid,
} from "@chakra-ui/react";
import { FaArrowRight } from "react-icons/fa";
import Interesting from "@/components/general/Interesting/Interesting";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/general/TopBar/TopBar";
import Footer from "@/components/general/Footer/Footer";
import { BiHelpCircle } from "react-icons/bi";
import { MdDifference } from "react-icons/md";
import { BsGithub } from "react-icons/bs";
import { IoBusiness } from "react-icons/io5";
import { CgPokemon } from "react-icons/cg";
import { SiMongodb } from "react-icons/si";

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
            desc="The site was named after Rayquaza, the legendary Pokemon. Reason? Because we love Pokemon! And it was a catchy name."
            color="white"
            bgcolor="teal"
            icon={<CgPokemon size="30px" />}
          ></Interesting>
          <Interesting
            title="What's different?"
            desc="RAYQuizA is a quiz platform built by the students, for the students. We understand the pain of boring quizzes, so we made it fun!"
            color="white"
            bgcolor="green.600"
            icon={<MdDifference size="30px" />}
          ></Interesting>
          <Interesting
            title="How to create quizzes?"
            desc="Create quizzes from the 'Create' page — supports multiple choice, timed questions, images, and instant scoring. Join quizzes using a code."
            color="white"
            bgcolor="purple.600"
            icon={<BiHelpCircle size="30px" />}
          ></Interesting>
          <Interesting
            title="Privacy & Data"
            desc="Student responses and quiz results are stored securely in a MongoDB Atlas database."
            color="white"
            bgcolor="blue.600"
            icon={<SiMongodb size="30px" />}
          ></Interesting>
          <Interesting
            title="Contributors"
            desc="Can you offer help? RAYQuizA is completely open source and built by three engineers.Visit our GitHub page to know more!"
            color="white"
            bgcolor="orange.600"
            icon={<BsGithub size="30px" />}
          ></Interesting>
          <Interesting
            title="Corporate?"
            desc="There is a mode for that. No powerups or funny stuff, just pure business."
            color="white"
            bgcolor="gray.600"
            icon={<IoBusiness size="30px" />}
          ></Interesting>
        </SimpleGrid>
      </Container>
      <Footer />
    </>
  );
};

export default Landing;
