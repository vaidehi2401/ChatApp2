import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Chat from "./pages/Chat"
import { SocketContext } from './context/socket';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path ="/homepage" element={<Chat/>}/>
      </Routes>
    </Router>
  );
};

export default AppRouter;
