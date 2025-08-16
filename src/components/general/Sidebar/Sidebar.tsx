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
      <HStack>
        <FaUser size="20" />
        <Heading>Hello, {username}!</Heading>
      </HStack>

      <VStack width="100%" height="85vh">
        <Button colorScheme="teal" variant="solid" width="100%">
          Dashboard
        </Button>
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
