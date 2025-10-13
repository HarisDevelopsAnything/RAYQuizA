import { Box, Button, Spacer } from "@chakra-ui/react";
import { useState } from "react";
import "./Profile.css";
import { CgProfile } from "react-icons/cg";
import { GrUpdate } from "react-icons/gr";
import { BiExit, BiTrophy } from "react-icons/bi";
import { useAccentColor } from "@/contexts/UserPreferencesContext";

const Profile = () => {
  const [currPage, setCurrPage] = useState(0);
  const accentColor = useAccentColor();

  return (
    <div id="profile-root">
      <Box
        width="20%"
        backgroundColor="bg.emphasized"
        height="100%"
        display="flex"
        flexDirection={"column"}
      >
        <Button
          className="sidebar-btn"
          variant="ghost"
          onClick={(e) => {
            setCurrPage(0);
            e.currentTarget.style.backgroundColor = accentColor;
          }}
        >
          <CgProfile />
          Overview
        </Button>
        <Button
          className="sidebar-btn"
          variant="ghost"
          onClick={() => setCurrPage(1)}
        >
          <GrUpdate />
          Update profile
        </Button>
        <Button
          className="sidebar-btn"
          variant="ghost"
          onClick={() => setCurrPage(2)}
        >
          <BiTrophy />
          Achievements
        </Button>
        <Spacer />
        <Button variant="solid" colorPalette={accentColor as any}>
          <BiExit />
          Back to home
        </Button>
      </Box>
      <Box width="80%" backgroundColor="bg.panel" height="100%">
        {currPage === 0 ? (
          <MyProfile />
        ) : currPage === 1 ? (
          <UpProfile />
        ) : currPage === 2 ? (
          <MyAchievements />
        ) : (
          "none"
        )}
      </Box>
    </div>
  );
};

const MyProfile = () => {
  return <div></div>;
};

const UpProfile = () => {
  return <div>Profile update</div>;
};
const MyAchievements = () => {
  return <div>Achievements Profile</div>;
};
export default Profile;
