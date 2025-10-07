import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { toaster } from "@/components/ui/toaster";

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
      toaster.create({
        title: "Login Successful",
        description: `Welcome, ${data.user.name}!`,
        type: "success",
        duration: 3000,
      });
      setTimeout(() => navigate("/home"), 1000);
    } else {
      toaster.create({
        title: "Login Failed",
        description: "Could not login with Google",
        type: "error",
        duration: 3000,
      });
    }
  };
  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        if (credentialResponse.credential) {
          handleLogin(credentialResponse.credential);
        }
      }}
      onError={() => {
        console.log("Login Failed");
        toaster.create({
          title: "Login Failed",
          description: "Google login failed. Please try again.",
          type: "error",
          duration: 3000,
        });
      }}
    />
  );
}
