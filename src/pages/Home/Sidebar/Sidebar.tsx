import { Button, Container, Spacer, VStack } from "@chakra-ui/react";
import React from "react";
import { IoLogOut } from "react-icons/io5";

interface Props {
  setCurrentPage: (page: string) => void;
}

const Sidebar = ({ setCurrentPage }: Props) => {
  return (
    <Container
      bgColor={"bg.subtle"}
      height="100%"
      width="100%"
      padding="0"
      centerContent={true}
      id="sticky-sidebar"
    >
      <VStack
        width="100%"
        height="100%"
        align="stretch"
        padding="0px"
        justifyContent={"space-evenly"}
      >
        <VStack width="100%" align="stretch" padding="0px" margin="0">
          {["Quizzes", "Create Quiz", "Join using code"].map(
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
                  // add navigation here
                  setCurrentPage(label);
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
