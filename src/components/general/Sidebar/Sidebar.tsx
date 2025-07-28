import { Container, Heading } from "@chakra-ui/react";
import React from "react";

interface Props {
  username: string;
}

const Sidebar = ({ username }: Props) => {
  return (
    <Container
      bgColor={"bg.subtle"}
      height="100vh"
      width="3/12"
      position={"relative"}
      left="0px"
    >
      <Heading>Hello, {username}!</Heading>
    </Container>
  );
};

export default Sidebar;
