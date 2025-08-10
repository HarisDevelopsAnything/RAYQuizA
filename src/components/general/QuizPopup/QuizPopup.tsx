import React from "react";
import "./QuizPopup.css";
import { Button, ButtonGroup, Heading } from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
interface Props {
  title?: string;
  description?: string;
  duration?: string;
  onclose: () => void;
}
const QuizPopup = ({ title, description, duration, onclose }: Props) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <div
      id="popup"
      className="glass-back"
      color={colorMode == "light" ? "black" : "white"}
    >
      <Heading>{title}</Heading>
      <p>{description}</p>
      <p>
        You cannot quit the quiz once started. <strong>Are you sure?</strong>
      </p>
      <ButtonGroup width="100%" justifyContent={"center"}>
        <Button variant="solid" colorPalette="teal" width="50%">
          Take Quiz
        </Button>
        <Button
          variant="subtle"
          colorPalette="red"
          width="50%"
          onClick={() => onclose()}
        >
          Cancel
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default QuizPopup;
