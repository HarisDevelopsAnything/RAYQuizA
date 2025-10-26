import Landing from "./pages/Landing/Landing";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import ServerTest from "./components/servertest";
import Login from "./pages/Login/Login";
import JoinCode from "./pages/JoinCode/JoinCode";
import GuestJoin from "./pages/GuestJoin/GuestJoin";
import Profile from "./pages/Profile/Profile";
import QuizPage from "./pages/QuizPage/QuizPage";
import LiveQuiz from "./pages/QuizPage/LiveQuiz";
import Support from "./pages/Support/Support";
import Settings from "./pages/Settings/Settings";
import QuizHistory from "./pages/QuizHistory/QuizHistory";
import { Toaster } from "./components/ui/toaster";
import CursorFollower from "./components/general/CursorFollower/CursorFollower";

const App = () => {
  return (
    <>
      <CursorFollower />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />}></Route>
          <Route path="/home" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/server-test" element={<ServerTest />}></Route>
          <Route path="/join" element={<JoinCode />}></Route>
          <Route path="/guest-join" element={<GuestJoin />}></Route>
          <Route path="/profile" element={<Profile />}></Route>
          <Route path="/support" element={<Support />}></Route>
          <Route path="/settings" element={<Settings />}></Route>
          <Route path="/quiz-history" element={<QuizHistory />}></Route>
          <Route path="/quiz/:quizId" element={<QuizPage />}></Route>
          <Route path="/quiz/live/:quizCode" element={<LiveQuiz />}></Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
};

export default App;
