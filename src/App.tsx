import Landing from "./pages/Landing/Landing";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import ServerTest from "./components/servertest";
import Login from "./pages/Login/Login";
import JoinCode from "./pages/JoinCode/JoinCode";
import Profile from "./pages/Profile/Profile";
import QuizPage from "./pages/QuizPage/QuizPage";
import Support from "./pages/Support/Support";
import Settings from "./pages/Settings/Settings";
import { Toaster } from "./components/ui/toaster";

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
          <Route path="/profile" element={<Profile />}></Route>
          <Route path="/support" element={<Support />}></Route>
          <Route path="/settings" element={<Settings />}></Route>
          <Route path="/quiz/:quizId" element={<QuizPage />}></Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
};

export default App;
