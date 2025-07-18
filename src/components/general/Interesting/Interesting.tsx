import { Container, Heading, Text, type Color } from "@chakra-ui/react";
import React from "react";

interface Props {
  title: string;
  desc: string;
  color: "teal" | "black" | "white" | "orange";
  bgcolor: "teal" | "black" | "white" | "orange";
}

const Interesting = ({ title, desc, color, bgcolor }: Props) => {
  return (
    <>
      <Container
        width="100vw"
        padding="10px"
        margin="10px"
        backgroundColor={bgcolor}
        color={color}
        borderRadius={"10px"}
      >
        <Heading>{title}</Heading>
        <Text color="fg.muted">{desc}</Text>
      </Container>
    </>
  );
};

export default Interesting;
