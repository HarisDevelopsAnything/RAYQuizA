import { Button, Center, Heading, Input } from "@chakra-ui/react";
import React from "react";
import { BiLogIn } from "react-icons/bi";
import { GiJoin } from "react-icons/gi";

const JoinCode = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "92vh",
      }}
    >
      <Heading size="5xl" marginBottom="2rem">
        Join using code
      </Heading>
      <Input
        placeholder="Enter code (example AB123C)"
        width="35%"
        height="50px"
        marginBottom="1rem"
      />
      <Button colorPalette="teal">
        Join <BiLogIn />
      </Button>
    </div>
  );
};

export default JoinCode;
