import { Box, Button, Heading, Spacer } from '@chakra-ui/react'
import React, { useState } from 'react'
import './Profile.css'
import { CgProfile } from 'react-icons/cg'
import { GrUpdate } from 'react-icons/gr'
import { BiExit, BiTrophy } from 'react-icons/bi'

const Profile = () => {
  const [currPage, setCurrPage] = useState(0);

  return (
    <div id="profile-root">
        <Box width="20%" backgroundColor="bg.emphasized" height="100%" display="flex" flexDirection={"column"}>
            <Button className="sidebar-btn" variant="ghost" onClick={(e)=>{setCurrPage(0); e.currentTarget.style.backgroundColor="teal"}}><CgProfile/>Overview</Button>
            <Button className="sidebar-btn" variant="ghost" onClick={()=>setCurrPage(1)}><GrUpdate/>Update profile</Button>
            <Button className="sidebar-btn" variant="ghost" onClick={()=>setCurrPage(2)}><BiTrophy/>Achievements</Button>
            <Spacer/>
            <Button variant="solid" colorPalette="teal"><BiExit/>Back to home</Button>
        </Box>
        <Box width="80%" backgroundColor="bg.panel" height="100%">
            {currPage === 0 ? <MyProfile/> : currPage === 1 ? <UpProfile/> : currPage === 2 ? <MyAchievements/> : "none"}
        </Box>
    </div>
  )
}



const MyProfile = () => {
  return (
    <div></div>
  )
}

const UpProfile = () => {
  return (
    <div>Profile update</div>
  )
}
const MyAchievements = () => {
  return (
    <div>Achievements Profile</div>
  )
}
export default Profile