import { Heading, HStack, Spacer } from "@chakra-ui/react";
import React from "react";
import { RiProfileFill } from "react-icons/ri";
import "./NavBar.css";
import { MdPhoneAndroid } from "react-icons/md";
import { FaUser } from "react-icons/fa6";
import ThemeSwitch from "@/components/ui/ThemeSwitch";
import { useState } from "react";

interface Props {
  username?: string;
  profilePic?: string;
}

const NavBar = ({ username, profilePic }: Props) => {
  const [isDarkMode, setDarkMode] = useState(true);
  const setMode = () => {
    setDarkMode(!isDarkMode);
  };
  return (
    <HStack height={"60px"} className={"sticky-topbar"} top={0} zIndex={20}>
      {profilePic ? (
        <img
          src={profilePic}
          alt={username ? username[0] : "?"}
          className="nav-avatar"
        />
      ) : (
        <FaUser className="nav-avatar" />
      )}
      <Heading>{username}</Heading>
      <Spacer />
      <ThemeSwitch
        darkMode={isDarkMode}
        onClick={() => setMode()}
      ></ThemeSwitch>
    </HStack>
  );
};

export default NavBar;
