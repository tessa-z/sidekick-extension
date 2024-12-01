import React from "react";
import ChatScreen from "./ChatScreen";

function App() {

  const appStyle: React.CSSProperties = {
    color: "white",
    textAlign: "center",
  };

  const containerStyle: React.CSSProperties = {
    width: "15rem",
    height: "15rem",
    backgroundColor: "green",
    margin: "0 auto", // Optional centering
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={appStyle}>
      <div style={containerStyle}>
        <ChatScreen />
      </div>
    </div>
  );
}

export default App;
