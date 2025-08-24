import React, { useState } from "react";
import Landing from "./pages/Landing/Landing";
import "./App.css";
import Footer from "./components/general/Footer/Footer";
import TopBar from "./components/general/TopBar/TopBar";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import ServerTest from "./components/servertest";
import LoginButton from "./components/LoginButton";
import Login from "./pages/Login/Login";
import JoinCode from "./pages/JoinCode/JoinCode";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />}></Route>
          <Route path="/home" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/server-test" element={<ServerTest />}></Route>
          <Route path="/join" element={<JoinCode />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
