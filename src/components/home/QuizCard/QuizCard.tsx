import { useColorMode } from "@/components/ui/color-mode";
import { Button, ButtonGroup, Card, Center, VStack } from "@chakra-ui/react";
import { useAccentColor } from "@/contexts/UserPreferencesContext";
import { IoTrash, IoTvOutline } from "react-icons/io5";
import "./QuizCard.css";

interface Props {
  name: string;
  desc: string;
  duration: string;
  onClickTakeQuiz?: () => void;
  onClickViewDetails?: () => void;
  onClickPresent?: () => void;
  onClickDelete?: () => void;
  isDeleting?: boolean;
}

const QuizCard = ({
  name,
  desc,
  duration,
  onClickTakeQuiz,
  onClickViewDetails,
  onClickPresent,
  onClickDelete,
  isDeleting = false,
}: Props) => {
  const { colorMode } = useColorMode();
  const accentColor = useAccentColor();
  return (
    <div className={`quiz-card-wrapper ${isDeleting ? "quiz-card-deleting" : ""}`}>
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
        <VStack width="100%" gap="0">
          {/* Main actions row */}
          <ButtonGroup
            width={"100%"}
            margin="0px"
            gap="0"
          >
            <Button
              variant={"solid"}
              colorPalette={accentColor as any}
              onClick={onClickTakeQuiz}
              margin="0px"
              width="50%"
              borderRadius="0"
              borderBottomLeftRadius={(onClickPresent || onClickDelete) ? "0" : "10px"}
            >
              Host Quiz
            </Button>
            <Button
              variant={"subtle"}
              colorPalette={accentColor as any}
              onClick={onClickViewDetails}
              margin="0px"
              width="50%"
              borderRadius={"0"}
              borderBottomRightRadius={(onClickPresent || onClickDelete) ? "0" : "10px"}
            >
              View details
            </Button>
          </ButtonGroup>

          {/* Secondary actions row */}
          {(onClickPresent || onClickDelete) && (
            <ButtonGroup
              width={"100%"}
              margin="0px"
              gap="0"
            >
              {onClickPresent && (
                <Button
                  variant={"outline"}
                  colorPalette="purple"
                  onClick={onClickPresent}
                  margin="0px"
                  width={onClickDelete ? "50%" : "100%"}
                  borderRadius="0"
                  borderBottomLeftRadius={"10px"}
                  borderTopWidth="0"
                >
                  <IoTvOutline /> Present
                </Button>
              )}
              {onClickDelete && (
                <Button
                  variant={"outline"}
                  colorPalette="red"
                  onClick={onClickDelete}
                  margin="0px"
                  width={onClickPresent ? "50%" : "100%"}
                  borderRadius={"0"}
                  borderBottomRightRadius={"10px"}
                  borderTopWidth="0"
                  borderLeftWidth={onClickPresent ? "1px" : "0"}
                >
                  <IoTrash /> Delete
                </Button>
              )}
            </ButtonGroup>
          )}
        </VStack>
      </Card.Footer>
    </Card.Root>
    </div>
  );
};

export default QuizCard;
