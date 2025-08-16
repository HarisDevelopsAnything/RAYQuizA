import { Container, Flex, Heading, HStack, Text } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import Typewriter from "typewriter-effect";
import "./Login.css";
import LoginButton from "@/components/LoginButton";
const Login = () => {
  const navigate = useNavigate();
  return (
    <HStack
      width="100vw"
      height="100vh"
      justifyContent="center"
      alignItems="center"
      gap="0"
      padding="0px"
      margin="0px"
    >
      <Container
        backgroundColor={"black"}
        color="white"
        width="50%"
        height="100%"
        margin="0px"
        centerContent={true}
        justifyContent={"center"}
      >
        <Heading fontSize="40px">Login to RAYQuizA!</Heading>
        <Text>A place for</Text>
        <Typewriter
          options={{
            wrapperClassName: "typewriter",
            strings: [
              "Attending quizzes",
              "Creating quizzes",
              "Getting insights",
              "Tracking progress",
              "Competing with friends",
              "Learning new things",
              "Having fun",
            ],
            autoStart: true,
            loop: true,
            cursor: "&bull;",
          }}
        ></Typewriter>
        <LoginButton />
      </Container>
      <Container backgroundColor={"teal"} width="50%" height="100%" margin="0">
        right
      </Container>
    </HStack>
  );
};

export default Login;
