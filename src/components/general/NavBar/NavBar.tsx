import { Heading, HStack, Spacer, Button } from "@chakra-ui/react";
import "./NavBar.css";
import { FaUser } from "react-icons/fa6";
import { IoLogOut } from "react-icons/io5";
import ThemeSwitch from "@/components/ui/ThemeSwitch";
import { useState } from "react";

interface Props {
  username?: string;
  profilePic?: string;
  onLogout?: () => void;
}

const NavBar = ({ username, profilePic, onLogout }: Props) => {
  const [isDarkMode, setDarkMode] = useState(true);
  const setMode = () => {
    setDarkMode(!isDarkMode);
  };
  return (
    <HStack height={"60px"} className={"sticky-topbar"} top={0} zIndex={20} paddingX={4}>
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
      {onLogout && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onLogout}
          colorPalette="red"
        >
          <IoLogOut />
        </Button>
      )}
    </HStack>
  );
};

export default NavBar;
