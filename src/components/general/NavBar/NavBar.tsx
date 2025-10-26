import { Heading, HStack, Spacer, Button, IconButton } from "@chakra-ui/react";
import "./NavBar.css";
import { FaUser } from "react-icons/fa6";
import { IoLogOut } from "react-icons/io5";
import { HiMenu } from "react-icons/hi";
import ThemeSwitch from "@/components/ui/ThemeSwitch";

interface Props {
  username?: string;
  profilePic?: string;
  onLogout?: () => void;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

const NavBar = ({
  username,
  profilePic,
  onLogout,
  onMenuClick,
  showMenuButton = false,
}: Props) => {
  return (
    <HStack
      height={"60px"}
      className={"sticky-topbar"}
      top={0}
      zIndex={20}
      paddingX={4}
      gap={2}
    >
      {showMenuButton && onMenuClick && (
        <IconButton
          aria-label="Menu"
          onClick={onMenuClick}
          variant="ghost"
          size="lg"
        >
          <HiMenu size={24} />
        </IconButton>
      )}
      {profilePic ? (
        <img
          src={profilePic}
          alt={username ? username[0] : "?"}
          className="nav-avatar"
        />
      ) : (
        <FaUser className="nav-avatar" />
      )}
      <Heading
        size={{ base: "sm", md: "lg" }}
        truncate
        maxW={{ base: "150px", md: "none" }}
      >
        {username}
      </Heading>
      <Spacer />
      <ThemeSwitch></ThemeSwitch>
      {onLogout && (
        <Button variant="ghost" size="sm" onClick={onLogout} colorPalette="red">
          <IoLogOut />
        </Button>
      )}
    </HStack>
  );
};

export default NavBar;
