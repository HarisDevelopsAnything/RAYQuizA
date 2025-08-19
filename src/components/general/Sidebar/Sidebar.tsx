import { Button, Container, Spacer, VStack } from "@chakra-ui/react";
import React from "react";
import { IoLogOut } from "react-icons/io5";

const Sidebar = () => {
  return (
    <Container
      bgColor={"bg.subtle"}
      height="92vh"
      width="100%"
      position={"relative"}
      padding="0"
      left="0px"
      centerContent={true}
    >
      <VStack
        width="100%"
        height="85vh"
        align="stretch"
        padding="0px"
        justifyContent={"space-evenly"}
      >
        <VStack width="100%" align="stretch" padding="0px" margin="0">
          {["Quizzes", "Create Quiz", "Join using code", "Shop"].map(
            (label, idx) => (
              <Button
                right={0}
                margin="0px"
                key={label}
                borderRadius="0"
                width="100%"
                variant="ghost"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  const container = e.currentTarget.parentElement;
                  if (!container) return;
                  const buttons = Array.from(
                    container.querySelectorAll("button")
                  );
                  buttons.forEach((b) => {
                    (b as HTMLButtonElement).style.backgroundColor =
                      "transparent";
                    (b as HTMLButtonElement).style.color = "";
                  });
                  e.currentTarget.style.backgroundColor = "teal";
                  e.currentTarget.style.color = "white";
                }}
                // make first item selected by default
                style={
                  idx === 0
                    ? { backgroundColor: "teal", color: "white" }
                    : { backgroundColor: "transparent" }
                }
              >
                {label}
              </Button>
            )
          )}
        </VStack>
        <Button colorScheme="teal" variant="outline" width="100%">
          Settings
        </Button>
        <Spacer></Spacer>
        <Button colorPalette="red" variant="solid" width="100%" bottom="0px">
          Logout <IoLogOut />
        </Button>
      </VStack>
    </Container>
  );
};

export default Sidebar;
