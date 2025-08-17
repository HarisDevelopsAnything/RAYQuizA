import { useColorMode } from "@/components/ui/color-mode";
import { Button, ButtonGroup, Card, Center } from "@chakra-ui/react";
import React from "react";

interface Props {
  name: string;
  desc: string;
  duration: string;
  onClickTakeQuiz?: () => void;
  onClickViewDetails?: () => void;
}

const QuizCard = ({
  name,
  desc,
  duration,
  onClickTakeQuiz,
  onClickViewDetails,
}: Props) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Card.Root
      margin={"10px"}
      padding={"5px"}
      border={"none"}
      borderRadius={16}
      backdropFilter={"blur(5px)"}
      backgroundColor={
        colorMode == "light" ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)"
      }
      color={colorMode == "light" ? "black" : "white"}
    >
      <Center>
        <Card.Title>{name}</Card.Title>
      </Center>
      <hr></hr>
      <Card.Body color="fg.subtle">
        {desc}
        <br />
        {duration}
      </Card.Body>
      <Card.Footer marginTop="10px">
        <ButtonGroup width={"100%"} marginTop="10px">
          <Button
            variant={"solid"}
            colorPalette="teal"
            onClick={onClickTakeQuiz}
          >
            Take quiz
          </Button>
          <Button
            variant={"subtle"}
            colorPalette={"teal"}
            onClick={onClickViewDetails}
          >
            View details
          </Button>
        </ButtonGroup>
      </Card.Footer>
    </Card.Root>
  );
};

export default QuizCard;
