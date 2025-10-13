import { useColorMode } from "@/components/ui/color-mode";
import { Button, ButtonGroup, Card, Center } from "@chakra-ui/react";
import { useAccentColor } from "@/contexts/UserPreferencesContext";

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
  const { colorMode } = useColorMode();
  const accentColor = useAccentColor();
  return (
    <Card.Root
      margin={"10px"}
      padding={"0px"}
      borderRadius={16}
      backdropFilter={"blur(5px)"}
      backgroundColor={
        //colorMode == "light" ? "rgba(80,80,80,0.5)" : "rgba(0,0,0,0.8)"
        "bg.subtle"
      }
      borderColor={colorMode == "light" ? "blackAlpha.300" : "whiteAlpha.300"}
      color={colorMode == "light" ? "black" : "white"}
    >
      <Center>
        <Card.Title>{name}</Card.Title>
      </Center>
      <hr></hr>
      <Card.Body color={colorMode == "light" ? "black" : "white"}>
        {desc}
        <br />
        {duration}
      </Card.Body>
      <Card.Footer marginTop="10px" margin="0px" padding="0">
        <ButtonGroup
          width={"100%"}
          marginTop="10px"
          margin="0px"
          gap="0"
          borderBottomRadius={"5px"}
        >
          <Button
            variant={"solid"}
            colorPalette={accentColor as any}
            onClick={onClickTakeQuiz}
            margin="0px"
            width="50%"
            borderRadius="0"
            borderBottomLeftRadius={"10px"}
          >
            Take quiz
          </Button>
          <Button
            variant={"subtle"}
            colorPalette={accentColor as any}
            onClick={onClickViewDetails}
            margin="0px"
            width="50%"
            borderRadius={"0"}
            borderBottomRightRadius={"10px"}
          >
            View details
          </Button>
        </ButtonGroup>
      </Card.Footer>
    </Card.Root>
  );
};

export default QuizCard;
