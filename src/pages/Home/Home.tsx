import Sidebar from "@/components/general/Sidebar/Sidebar";
import TopBar from "@/components/general/TopBar/TopBar";
import {
  Container,
  Grid,
  GridItem,
  Show,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react";
import React from "react";

const Home = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  return (
    <Grid
      templateAreas={{
        base: `"nav" "main"`,
        lg: `"nav nav" "aside main"`,
      }}
    >
      <GridItem area="nav" bgColor={"blue"}>
        Nav
      </GridItem>
      <Show when={!isMobile}>
        <GridItem area="aside" bgColor={"gold"}>
          <Sidebar username="Haris "></Sidebar>
        </GridItem>
      </Show>
      <GridItem area="main" bgColor={"yellow"}>
        main
      </GridItem>
    </Grid>
  );
};

export default Home;
