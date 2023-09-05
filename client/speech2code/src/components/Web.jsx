import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";
import "./Web.css";
const Web = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");

  const editorOptions = {
    fontSize: 30, // Set the desired font size here
  };
  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };
  return (
    <>
      <div className="flex">
        <Sidebar />

        <div className="flex-1">
          <Navbar />

          <main className="p-4">
            <div className="flex space-x-6">
              <div className="container  basis-1/3 bg-cyan-950 h-screen">
                Hello
              </div>
              <div className="container ">
                <div>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                  </select>
                  <Editor
                    height="81vh"
                    theme="vs-dark"
                    defaultLanguage="python"
                    options={editorOptions}
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Web;
