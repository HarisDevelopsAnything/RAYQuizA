import { HStack, Spacer } from "@chakra-ui/react";
import React from "react";
import { RiProfileFill } from "react-icons/ri";
import "./NavBar.css";
import { MdPhoneAndroid } from "react-icons/md";
import { FaUser } from "react-icons/fa6";
const NavBar = () => {
  return (
    <HStack height={"60px"} className={"sticky-topbar"} top={0} zIndex={20}>
      <FaUser size="20px" />
      <Spacer />
      <MdPhoneAndroid />
    </HStack>
  );
};

export default NavBar;
