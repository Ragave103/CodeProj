import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";
import "./Web.css";
import sendicon from "./sendicon.png";
import AiLoading from "./AiLoading.png";

function LoadingModal({ isLoading }) {
  if (!isLoading) return null;
  return (
    <>
      <div className="fixed  inset-0 flex items-center justify-center z-50 bg-blur">
        <div className="bg-white w-70 p-20 flex items-center justify-center rounded-md shadow-md text-slate-800">
          <h2 className="text-[30px] font-semibold">
            Please wait while AI is generating code...
          </h2>
          <img src={AiLoading} alt="Loading" className="w-1/4 " />
        </div>
      </div>
    </>
  );
}

const Web = () => {
  const [program, setProgram] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [codee, setCode] = useState("");
  const [isRotated, setRotated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRotation = () => {
    setRotated(!isRotated);
  };

  const generateCode = async () => {
    setIsLoading(true);
    const data = { choice: language, program: program };
    setCode("");
    console.log(language);
    console.log(program);
    if (program != "") {
      try {
        const response = await fetch("http://localhost:5000/api/code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(language);
          console.log(program);
          console.log(data);
          const myList = data.code;
          const convertedList = myList.join("\n");
          setCode(convertedList);
          console.log(codee);

          setProgram("");
        } else {
          console.error("Failed to convert speech to code.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      alert("You haven't described any program");
    }
    setIsLoading(false);
  };

  const editorOptions = {
    fontSize: 30, // Set the desired font size here
  };
  const handleCodeChange = (newProg) => {
    setProgram(newProg);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };
  /*
  const sendCode = () => {
    console.log(language);
    console.log(program);
    setProgram("");
  };

  const textareaStyles = {
    width: "400px", // Adjust the width as needed
    height: "400px",
    backgroundColor: "#282425", // Background color
    color: "#45DEDE", // Text color
    padding: "8px", // Padding
    resize: "none",
  };
*/
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
                  <div class="mr-20 mb-4  float-right">
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="block appearance-none float-right selectstyles border border-gray-300 text-2xl text-slate-900 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="c">C</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-900">
                      <svg
                        class="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="black"
                      >
                        <path d="M10.293 15.293a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414L10 12.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-3 3z" />
                      </svg>
                    </div>
                  </div>
                  <Editor
                    height="81vh"
                    theme="vs-dark"
                    defaultLanguage="python"
                    options={editorOptions}
                    value={codee}
                  />

                  <div
                    className={` flex flex-col items-centerborder ${
                      isRotated ? "translate-x-full" : "translate-x-0"
                    } border-cyan-300 focus:border-cyan-300 hover:border-cyan-300 rounded px-2 py-1 input-prompt-div fixed bottom-4 right-20 divStyles `}
                  >
                    <div>
                      <div className="float-right top-2 left-2 z-10">
                        <button>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="35"
                            height="42"
                            viewBox="0 0 35 42"
                            fill="none"
                          >
                            <g filter="url(#filter0_d_15_27)">
                              <path
                                d="M27.7083 16.5C27.7083 22.299 23.1379 27 17.5 27M17.5 27C11.8621 27 7.29167 22.299 7.29167 16.5M17.5 27V33M17.5 33H11.6667M17.5 33H23.3333M17.5 21C15.0838 21 13.125 18.9853 13.125 16.5V7.5C13.125 5.01472 15.0838 3 17.5 3C19.9163 3 21.875 5.01472 21.875 7.5V16.5C21.875 18.9853 19.9163 21 17.5 21Z"
                                stroke="#45DEDE"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </g>
                            <defs>
                              <filter
                                id="filter0_d_15_27"
                                x="-4"
                                y="0"
                                width="43"
                                height="44"
                                filterUnits="userSpaceOnUse"
                                color-interpolation-filters="sRGB"
                              >
                                <feFlood
                                  flood-opacity="0"
                                  result="BackgroundImageFix"
                                />
                                <feColorMatrix
                                  in="SourceAlpha"
                                  type="matrix"
                                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                  result="hardAlpha"
                                />
                                <feOffset dy="4" />
                                <feGaussianBlur stdDeviation="2" />
                                <feComposite in2="hardAlpha" operator="out" />
                                <feColorMatrix
                                  type="matrix"
                                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                                />
                                <feBlend
                                  mode="normal"
                                  in2="BackgroundImageFix"
                                  result="effect1_dropShadow_15_27"
                                />
                                <feBlend
                                  mode="normal"
                                  in="SourceGraphic"
                                  in2="effect1_dropShadow_15_27"
                                  result="shape"
                                />
                              </filter>
                            </defs>
                          </svg>
                        </button>
                      </div>
                      <div className="float-left  top-2 right-12 z-10">
                        <button onClick={handleRotation}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="35"
                            height="36"
                            className={`transform transition-transform ${
                              isRotated ? "rotate-[180deg]" : ""
                            }  `}
                            viewBox="0 0 35 36"
                            fill="none"
                          >
                            <path
                              d="M18.9583 7.5L29.1667 18L18.9583 28.5M7.29166 7.5L17.5 18L7.29166 28.5"
                              stroke="#45DEDE"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <textarea
                      className="textStyles text-2xl flex-grow textStyle focus:outline-none hover:outline-none   p-2 rounded-md"
                      placeholder="Describe the program.."
                      styles="textStyles"
                      value={program}
                      onChange={(e) => handleCodeChange(e.target.value)}
                    />
                    <button>
                      <img
                        src={sendicon}
                        onClick={generateCode}
                        className="w-10 float-right"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <LoadingModal isLoading={isLoading} />
    </>
  );
};

export default Web;
