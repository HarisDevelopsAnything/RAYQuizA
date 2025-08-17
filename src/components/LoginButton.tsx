import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

export default function LoginTest() {
  const navigate = useNavigate();
  const handleLogin = async (credential: string) => {
    const res = await fetch(
      "https://rayquiza-backend.onrender.com/api/auth/google",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credential }),
      }
    );

    const data = await res.json();
    console.log(data);
    if (data.message === "Login successful") {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); // save user
      navigate("/home");
    }
  };
  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        if (credentialResponse.credential) {
          handleLogin(credentialResponse.credential);
        }
      }}
      onError={() => console.log("Login Failed")}
    />
  );
}
