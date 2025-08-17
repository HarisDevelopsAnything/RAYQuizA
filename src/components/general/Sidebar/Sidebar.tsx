import {
  Button,
  Container,
  Heading,
  HStack,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { BiLogOut, BiLogOutCircle } from "react-icons/bi";
import {
  BsAndroid,
  BsApple,
  BsGooglePlay,
  BsMinecartLoaded,
  BsNintendoSwitch,
  BsWhatsapp,
} from "react-icons/bs";
import { FaCandyCane, FaEdge, FaEdgeLegacy, FaUser } from "react-icons/fa";
import { GiJellyBeans } from "react-icons/gi";
import { GrEdge } from "react-icons/gr";
import { IoLogOut } from "react-icons/io5";
import { PiAndroidLogo, PiAndroidLogoBold, PiNotionLogo } from "react-icons/pi";
import { RiLockStarFill } from "react-icons/ri";
import {
  SiArchlinux,
  SiNintendo3Ds,
  SiNintendogamecube,
  SiObsidian,
  SiRockstargames,
} from "react-icons/si";
import { TbBrandMinecraft } from "react-icons/tb";

interface Props {
  username: string;
}

const Sidebar = ({ username }: Props) => {
  return (
    <Container
      bgColor={"bg.subtle"}
      height="100vh"
      width="100%"
      position={"relative"}
      left="0px"
      centerContent={true}
    >
      <VStack width="100%" height="85vh">
        <VStack width="100%" align="stretch">
          {["Quizzes", "Create Quiz", "Join using code", "Shop"].map(
            (label, idx) => (
              <Button
                right={0}
                margin="0px"
                key={label}
                width="100%"
                variant="ghost"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  const container = e.currentTarget.parentElement;
                  if (!container) return;
                  const buttons = Array.from(
                    container.querySelectorAll("button")
                  );
                  buttons.forEach((b) => {
                    (b as HTMLButtonElement).style.backgroundColor =
                      "transparent";
                    (b as HTMLButtonElement).style.color = "";
                  });
                  e.currentTarget.style.backgroundColor = "teal";
                  e.currentTarget.style.color = "white";
                }}
                // make first item selected by default
                style={
                  idx === 0
                    ? { backgroundColor: "teal", color: "white" }
                    : { backgroundColor: "transparent" }
                }
              >
                {label}
              </Button>
            )
          )}
        </VStack>
        <Button colorScheme="teal" variant="outline" width="100%">
          Settings
        </Button>
        <Spacer></Spacer>
        <Button colorPalette="red" variant="solid" width="100%">
          Logout <IoLogOut />
        </Button>
      </VStack>
    </Container>
  );
};

export default Sidebar;
