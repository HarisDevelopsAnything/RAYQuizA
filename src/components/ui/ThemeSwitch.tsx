"use client";
import { IconButton } from "@chakra-ui/react";
import { FaMoon, FaSun } from "react-icons/fa";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface Props {
  darkMode: true | false;
  onClick: () => void;
}

const ThemeToggle = ({ darkMode, onClick }: Props) => {
  const { toggleTheme } = useUserPreferences();

  return (
    <IconButton
      variant="ghost"
      background="none"
      aria-label="Toggle theme"
      onClick={() => {
        toggleTheme();
        onClick();
      }}
      style={{
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
      _hover={{
        transform: "scale(1.5)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "20px",
          height: "20px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: darkMode ? 0 : 1,
            filter: darkMode ? "blur(8px)" : "blur(0px)",
            transitionDelay: darkMode ? "0s" : "0.2s",
          }}
        >
          <FaSun
            style={{
              color: "#ffa500",
              fontSize: "18px",
              transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: darkMode
                ? "scale(0.1) rotate(180deg)"
                : "scale(1) rotate(0deg)",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: darkMode ? 1 : 0,
            filter: darkMode ? "blur(0px)" : "blur(8px)",
            transitionDelay: darkMode ? "0.2s" : "0s",
          }}
        >
          <FaMoon
            style={{
              color: "#e2e8f0",
              fontSize: "18px",
              transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: darkMode
                ? "scale(1) rotate(0deg)"
                : "scale(0.1) rotate(-180deg)",
            }}
          />
        </div>
      </div>
    </IconButton>
  );
};

export default ThemeToggle;
