import { createRoot } from "react-dom/client";
import { WorkspaceApp } from "./WorkspaceApp";
import "./globals.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

createRoot(root).render(
  <WorkspaceApp
    initialViewer={{
      displayName: "本地使用者",
      email: "local@localhost",
      isPreview: true,
    }}
  />,
);
