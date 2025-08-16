import { GoogleLogin } from "@react-oauth/google";

export default function LoginTest() {
  const handleLogin = async (credential: string) => {
    const res = await fetch("http://localhost:5000/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: credential }),
    });

    const data = await res.json();
    console.log("Server response:", data);
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
