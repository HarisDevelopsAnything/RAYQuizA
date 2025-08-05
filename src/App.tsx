import React, { useState } from "react";
import Landing from "./pages/Landing/Landing";
import "./App.css";
import Footer from "./components/general/Footer/Footer";
import TopBar from "./components/general/TopBar/TopBar";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home/Home";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />}></Route>
          <Route path="/home" element={<Home />}></Route>
        </Routes>
        <Footer></Footer>
      </BrowserRouter>
    </>
  );
};

export default App;
