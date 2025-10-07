import "./QuizDetails.css";
import { Button, ButtonGroup, Heading } from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
interface Props {
  title?: string;
  code?: string;
  categories?: string[];
  author?: string;
  questions?: number;
  description?: string;
  duration?: string;
  onclose: () => void;
}
const QuizDetails = ({
  title,
  code,
  author,
  questions,
  description,
  duration,
  categories,
  onclose,
}: Props) => {
  const { colorMode } = useColorMode();
  return (
    <div
      id="popup"
      className="glass-back"
      color={colorMode == "light" ? "black" : "white"}
    >
      <Heading>{title}</Heading>
      <p>{description}</p>
      <p>Duration: {duration} minutes</p>
      <p>Categories: {categories?.join(", ")}</p>
      <p>Author: {author}</p>
      <p>
        Code: <strong>{code}</strong>
      </p>
      <p>Questions: {questions}</p>
      <ButtonGroup width="100%" justifyContent={"center"}>
        <Button
          variant="subtle"
          colorPalette="red"
          width="50%"
          onClick={() => onclose()}
        >
          Close
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default QuizDetails;
