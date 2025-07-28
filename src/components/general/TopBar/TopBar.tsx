import { Button, ButtonGroup, Container, Spacer } from "@chakra-ui/react";
import "./TopBar.css";
import React, { useState } from "react";
import ThemeSwitch from "@/components/ui/ThemeSwitch";

interface Props {
  onClickAbout: () => void;
  darkMode?: "dark" | "light";
}

const TopBar = ({ onClickAbout, darkMode }: Props) => {
  const [isDarkMode, setDarkMode] = useState(true);
  const setMode = () => {
    setDarkMode(!isDarkMode);
  };
  return (
    <Container
      fluid
      margin="0px"
      width="100vw"
      colorPalette="teal"
      backgroundColor="rgba(0,0,0,.5)"
      backdropFilter="blur(30px)"
      padding="10px"
      borderRadius="5px"
      flexDirection="row"
      display="flex"
      position="static"
      id="sticky-topbar"
      className="glass-card"
    >
      <Button onClick={() => onClickAbout()}>Show help</Button>
      <Spacer />
      <ButtonGroup>
        <ThemeSwitch
          darkMode={isDarkMode}
          onClick={() => setMode()}
        ></ThemeSwitch>
        <Button variant="solid" colorPalette={"teal"}>
          Login
        </Button>
        <Button variant="outline">Sign up</Button>
      </ButtonGroup>
    </Container>
  );
};

export default TopBar;
