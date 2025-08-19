import { Heading, HStack, Spacer } from "@chakra-ui/react";
import React from "react";
import { RiProfileFill } from "react-icons/ri";
import "./NavBar.css";
import { MdPhoneAndroid } from "react-icons/md";
import { FaUser } from "react-icons/fa6";

interface Props {
  username?: string;
  profilePic?: string;
}

const NavBar = ({ username, profilePic }: Props) => {
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
      <MdPhoneAndroid />
    </HStack>
  );
};

export default NavBar;
