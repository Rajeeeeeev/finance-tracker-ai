import React from "react";
import Sidebar from "./Sidebar";

const PageLayout = ({ children, activePath }) => (
  <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
    <Sidebar activePath={activePath} />
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      minWidth: 0, overflowX: "hidden",
    }}>
      {children}
    </div>
  </div>
);

export default PageLayout;