import { useColorMode } from "@/components/ui/color-mode";
import { Button, ButtonGroup, Card, Center } from "@chakra-ui/react";
import { useAccentColor } from "@/contexts/UserPreferencesContext";
import { IoTrash } from "react-icons/io5";

interface Props {
  name: string;
  desc: string;
  duration: string;
  onClickTakeQuiz?: () => void;
  onClickViewDetails?: () => void;
  onClickDelete?: () => void;
}

const QuizCard = ({
  name,
  desc,
  duration,
  onClickTakeQuiz,
  onClickViewDetails,
  onClickDelete,
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
            width={onClickDelete ? "33.33%" : "50%"}
            borderRadius="0"
            borderBottomLeftRadius={"10px"}
          >
            Host Quiz
          </Button>
          <Button
            variant={"subtle"}
            colorPalette={accentColor as any}
            onClick={onClickViewDetails}
            margin="0px"
            width={onClickDelete ? "33.33%" : "50%"}
            borderRadius={"0"}
            borderBottomRightRadius={onClickDelete ? "0" : "10px"}
          >
            View details
          </Button>
          {onClickDelete && (
            <Button
              variant={"solid"}
              colorPalette="red"
              onClick={onClickDelete}
              margin="0px"
              width="33.33%"
              borderRadius={"0"}
              borderBottomRightRadius={"10px"}
            >
              <IoTrash /> Delete
            </Button>
          )}
        </ButtonGroup>
      </Card.Footer>
    </Card.Root>
  );
};

export default QuizCard;
