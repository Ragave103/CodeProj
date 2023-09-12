import React, { useState, useRef, useEffect } from "react";
import { AudioRecorder } from "react-audio-voice-recorder";
import axios from "axios";
import Editor from "@monaco-editor/react";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";
import "./Web.css";
import sendicon from "./sendicon.png";
import AiLoading from "./AiLoading.png";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { auth } from "./firebase";

import compileIcon from "./compileIcon.gif";

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

function LoadingModalCompile({ isCompiling }) {
  if (!isCompiling) return null;
  return (
    <>
      <div className="fixed   inset-0 flex items-center justify-center z-50  ">
        <div className="bg-transparent  justify-center rounded-md shadow-md text-slate-800">
          <img src={compileIcon} className="compile" alt="Compiling" />
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
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [transcription, setTranscription] = useState("");
  const [audioFilePath, setAudioFilePath] = useState(null); // Store the file path
  const [audioBlob, setAudioBlob] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [value, Setvalue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [DecodedOutput, setDecodedOutput] = useState();
  const [languageid, setLanguageid] = useState("63");
  const [isCompiling, setIsCompiling] = useState(false);
  const navigate = useNavigate();

  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        setAuthUser(null);
      }
    });

    return () => {
      listen();
    };
  }, []);

  const userSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("sign out successful");
        navigate("/");
      })
      .catch((error) => console.log(error));
  };

  const addAudioElement = async (blob) => {
    const url = URL.createObjectURL(blob);
    setAudioBlob(blob);
    console.log(blob.size);
    console.log("audio Blob created");
    //const audio = document.createElement("audio");
    //audio.src = url;
    //audio.controls = true;
    //document.body.appendChild(audio);
    //const timestamp = new Date().getTime();
    //const filePath = `audio_${timestamp}.webm`;
    //setAudioFilePath(filePath);
    //const audioFile = new File([audioBlob], filePath, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audioBlob", audioBlob);
    console.log("1. formdata appended successfully");

    try {
      const response = await fetch("http://localhost:5000/api/transcribe", {
        method: "POST",
        body: formData,
        "Content-Type": "multipart/form-data",
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.text);
        setTranscription(data.text);
        setProgram(data.text);
        console.log("Transcription success:", transcription);
        setAudioBlob(null);
      } else {
        console.error("Transcription failed with status:", response.status);
        console.error("Error response:", response.statusText);
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
    }
  };

  const startRecording = () => {
    console.log("Starting record");
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        console.log("setMediaRecorder 1 done..");

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            setAudioChunks((chunks) => [...chunks, e.data]);
            console.log("setAudiochunks 2 done..");
          }
        };

        if (recorder.ondataavailable === null) {
          console.error("MediaRecorder is not supported in this browser.");
          return;
        }

        mediaRecorder.onerror = (e) => {
          console.error("MediaRecorder Error:", e);
        };

        recorder.start();

        setRecording(true);
        console.log("recorder start and set recording 3 done..");
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  };

  const stopRecording = async () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setRecording(false);
      console.log("record stopped");
    }
    const audioBlob = new Blob([...audioChunks], { type: "audio/wav" });
    setAudioBlob(audioBlob);
    console.log("audiochunksize", audioChunks.size);
    console.log("Audiochunk created successfully");
    console.log("audioblob created successfully");
    console.log("Audio Blob Size:", audioBlob.size);
    console.log("Audio Blob Type:", audioBlob.type);

    const formData = new FormData();
    formData.append("audioBlob", audioBlob);
    console.log("1. formdata appended successfully");

    try {
      const response = await fetch("http://localhost:5000/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setTranscription(data.transcription);
        console.log("Transcription success:", data);
      } else {
        console.error("Transcription failed with status:", response.status);
        console.error("Error response:", response.statusText);
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
    }
  };

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
    fontSize: 30,
  };
  const handleCodeChange = (newProg) => {
    setProgram(newProg);
  };

  const handleLanguageChange = (selectElement) => {
    const selectedIndex = selectElement.selectedIndex;
    const selectedOption = selectElement.options[selectedIndex];
    const selectedId = selectedOption.getAttribute("id"); // Get the 'id' attribute of the selected option
    const selectedValue = selectedOption.value;
    // Now you have the 'id' and 'value' of the selected option
    setLanguage(selectedValue);
    setLanguageid(selectedId);
    console.log(+selectedId);
    console.log(selectedValue);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
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

  //HANDLE COMPILE FUNCTION IS USED SEND THE CODE TO JUDGE0 SERVER USING RAPID API HOST AND COMPILE THE CODE .IT STORE THE TOKE RECIVED.
  const handleCompile = async () => {
    setIsCompiling(true);
    const formData = {
      language_id: +languageid,
      // encode source code in base64
      source_code: btoa(codee),
      stdin: btoa(inputValue),
    };

    const options = {
      method: "POST",
      url: "https://judge0-ce.p.rapidapi.com/submissions",
      params: {
        base64_encoded: "true",
        fields: "*",
      },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Key": "a7eae7ceffmsh3e30c7d5004bc78p148c53jsn2de1a7fd3ed3",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      data: formData,
    };

    try {
      const response = await axios.request(options);
      console.log(response.data);
      const Token = response.data.token;
      checkstatus(Token);
    } catch (error) {
      console.error(error);
      if (error.response.status === 422) {
        console.log(error.message);
      }
    }
  };

  // CHECKSTATUS FUNCTION IS USED TO REQUEST API THE RETUR THE EXCEUTED OUT AD STORE IT IN OUTPUTDETAILS VARIABLE.
  const checkstatus = async (Token) => {
    const options = {
      method: "GET",
      url: "https://judge0-ce.p.rapidapi.com/submissions/" + Token,
      params: {
        base64_encoded: "true",
        fields: "*",
      },
      headers: {
        "X-RapidAPI-Key": "a7eae7ceffmsh3e30c7d5004bc78p148c53jsn2de1a7fd3ed3",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);
      console.log(response);
      const statusid = response.data.status_id;
      if (statusid === 2 || statusid === 1) {
        setTimeout(() => {
          checkstatus(Token);
        }, 2000);
      } else {
        const stdoutput = response.data.stdout;
        if (stdoutput == null) setDecodedOutput("Error, Check your code");
        else {
          const trimoutput = stdoutput.replace(/[\n]/gm, "");
          const b = "\n" + atob(trimoutput);
          setDecodedOutput(b);
        }
      }
    } catch (error) {
      console.error(error);
    }
    setIsCompiling(false);
  };

  const handleTextareaClick = () => {
    // Clear the content of the textarea when clicked
    setDecodedOutput("");
    setInputValue("");
  };

  {
    /* FUNCTION TO STORE VALUE(CODE) TYPED IN CODE EDITOR SPACE COCURRENTLY*/
  }
  const OnChange = (value) => {
    setCode(value);
    console.log(codee);
  };
  return (
    <>
      <div className="bg-gray-800">
        <div className="flex">
          <Sidebar />

          <div className="flex-1">
            <Navbar />

            <main className="p-4">
              <div className="flex space-x-6">
                <div className="container  basis-1/3  h-screen">
                  <LoadingModalCompile isCompiling={isCompiling} />

                  <div className="flex flex-col">
                    <div className="flex flex-col h-screen">
                      <div className="bg-cyan-950 input-cmd">
                        <h1 className="bg-cyan-800 text-4xl text-slate-50 text-center p-4">
                          INPUT
                        </h1>
                        <textarea
                          value={inputValue}
                          onChange={handleInputChange}
                          className=" input-text-styles text-slate-50 bg-cyan-950   ml-7  p-5 text-2xl flex-grow focus:outline-none hover:outline-none   p-4 rounded-md"
                        />
                      </div>
                      <div className=" bg-cyan-950 output-cmd">
                        <h1 className="bg-cyan-800  p-5 text-4xl text-slate-50 text-center">
                          OUTPUT
                        </h1>
                        <textarea
                          readOnly={true}
                          value={DecodedOutput}
                          className=" input-text-styles-output text-slate-50 bg-cyan-950   ml-  p-5 text-2xl flex-grow focus:outline-none hover:outline-none   p-4 rounded-md"
                        />
                        <div className="ml-20 flex flex-row gap-20 ">
                          <button
                            className="ml-10 mr-18 gradient-button "
                            onClick={handleCompile}
                          >
                            COMPILE AND RUN
                          </button>
                          <button
                            className="clear ml-15 gradient-button"
                            onClick={handleTextareaClick}
                          >
                            CLEAR
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="container ">
                  <div>
                    <div className="mr-20 mb-4  float-right">
                      <div className="flex flex-row">
                        <select
                          value={language}
                          onChange={(e) => handleLanguageChange(e.target)}
                          className="block   selectstyles border border-gray-300 text-2xl text-slate-900 py-2 px-4 pr-8 rounded focus:outline-none focus:bg-white focus:border-blue-500"
                        >
                          <option
                            id="63"
                            name="JavaScript (Node.js 12.14.0)"
                            label="JavaScript (Node.js 12.14.0)"
                            value="javascript"
                          >
                            JavaScript
                          </option>
                          <option
                            id="71"
                            name="Python (3.8.1)"
                            label="Python (3.8.1)"
                            value="python"
                          >
                            Python
                          </option>
                          <option
                            id="50"
                            name="C (GCC 9.2.0)"
                            label="C (GCC 9.2.0)"
                            value="c"
                          >
                            C
                          </option>
                          <option
                            id="54"
                            name="C++ (GCC 9.2.0)"
                            label="C++ (GCC 9.2.0)"
                            value="cpp"
                          >
                            C++
                          </option>
                          <option
                            id="62"
                            name="Java (OpenJDK 13.0.1)"
                            label="Java (OpenJDK 13.0.1)"
                            value="java"
                          >
                            Java
                          </option>
                        </select>
                        <button
                          onClick={userSignOut}
                          className="ml-10 gradient-button"
                        >
                          LOGOUT
                        </button>
                      </div>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-900">
                        <svg
                          className="fill-current h-4 w-4"
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
                      language={language}
                      options={editorOptions}
                      value={codee}
                      onChange={OnChange}
                    />

                    <div
                      className={` flex flex-col items-centerborder ${
                        isRotated ? "translate-x-full" : "translate-x-0"
                      } border-cyan-300 focus:border-cyan-300 hover:border-cyan-300 rounded px-2 py-1 input-prompt-div fixed bottom-4 right-20 divStyles `}
                    >
                      <div>
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
                      <div className="flex flex-row">
                        <div className="mb-2.5 ml-2 mr-20">
                          <AudioRecorder
                            onRecordingComplete={addAudioElement}
                            audioTrackConstraints={{
                              noiseSuppression: true,
                              echoCancellation: true,
                            }}
                            downloadOnSavePress={false}
                            downloadFileExtension="webm"
                          />
                        </div>
                        <button>
                          <img
                            src={sendicon}
                            onClick={generateCode}
                            className="w-10 float-right mb-2 send-btn"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <LoadingModal isLoading={isLoading} />
      </div>
    </>
  );
};

export default Web;
