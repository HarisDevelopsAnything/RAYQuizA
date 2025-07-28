import { Container, Heading, Text, type Color } from "@chakra-ui/react";
import React from "react";

interface Props {
  title: string;
  desc: string;
  color: "teal" | "black" | "white" | "orange";
  bgcolor: string;
}

const Interesting = ({ title, desc, color, bgcolor }: Props) => {
  return (
    <>
      <Container
        width="fit-content"
        padding="10px"
        margin="10px"
        backgroundColor={bgcolor}
        color={color}
        borderRadius={"10px"}
        border={"1px solid white"}
        transition="ease 0.3s all"
        _hover={{ transform: "translateY(-5px)" }}
      >
        <Heading>{title}</Heading>
        <Text fontSize={"1xl"}>{desc}</Text>
      </Container>
    </>
  );
};

export default Interesting;
