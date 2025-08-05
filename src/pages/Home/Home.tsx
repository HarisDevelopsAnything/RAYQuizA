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
import React from "react";
import Landing from "../Landing/Landing";
import QuizCard from "@/components/home/QuizCard/QuizCard";

const Home = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  return (
    <Container>
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
            <QuizCard name="Mathematics" desc="Ca" duration="60 min"></QuizCard>
          </SimpleGrid>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default Home;
