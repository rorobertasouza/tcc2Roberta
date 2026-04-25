import React, { useState } from "react";
import Auth from "./components/Auth";
import Register from "./components/Register";
import MainLayout from "./components/MainLayout";

export default function App() {
  const [screen, setScreen] = useState("auth");

  return (
    <>
      {screen === "auth" && (
        <Auth
          onShowRegister={() => setScreen("register")}
          onLoginSuccess={() => setScreen("petapp")}
        />
      )}
      {screen === "register" && (
        <Register onRegisterSuccess={() => setScreen("auth")} />
      )}
      {screen === "petapp" && <MainLayout />}
    </>
  );
}
