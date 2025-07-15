import { Button, ButtonGroup, Container, Spacer } from "@chakra-ui/react";
import React from "react";

const TopBar = () => {
  return (
    <Container
      fluid
      margin="0"
      width="100rem"
      colorPalette="teal"
      backgroundColor="rgba(255,255,255,0.1)"
      backdropFilter="blur(10px)"
      padding="10px"
      borderRadius="5px"
      flexDirection="row"
      display="flex"
      position="static"
    >
      <Button>Call Jonathan</Button>
      <Spacer />
      <ButtonGroup>
        <Button variant="solid" colorPalette={"teal"}>
          Login
        </Button>
        <Button variant="outline">Sign up</Button>
      </ButtonGroup>
    </Container>
  );
};

export default TopBar;
