import { Button, ButtonGroup, Card, Center } from "@chakra-ui/react";
import React from "react";

interface Props {
  name: string;
  desc: string;
  duration: string;
}

const QuizCard = ({ name, desc, duration }: Props) => {
  return (
    <Card.Root
      margin={"10px"}
      padding={"5px"}
      borderRadius={16}
      backdropFilter={"blur(5px)"}
      colorPalette={""}
    >
      <Center>
        <Card.Title color="white">{name}</Card.Title>
      </Center>
      <hr></hr>
      <Card.Body color="fg.subtle">
        {desc}
        <br />
        {duration}
      </Card.Body>
      <Card.Footer>
        <ButtonGroup width={"100%"}>
          <Button variant={"solid"} colorPalette="teal">
            Take quiz
          </Button>
          <Button variant={"subtle"} colorPalette={"teal"}>
            View details
          </Button>
        </ButtonGroup>
      </Card.Footer>
    </Card.Root>
  );
};

export default QuizCard;
