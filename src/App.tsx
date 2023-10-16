"use client";

import "regenerator-runtime/runtime";
import axios from "axios";
import { useState, useEffect } from "react";
import SpeechRecognation, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Typewriter } from "react-simple-typewriter";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { Rings, RotatingLines } from "react-loader-spinner";

import "./App.css";

function App() {
  const [btn, setBtn] = useState(false);
  const [msg, setMsg] = useState(true);
  const [loader, setLoader] = useState(false);
  const [flag, setFlag] = useState(true);
  const [chat, setChat] = useState([
    {
      que: "",
      ans: "",
    },
  ]);
  setInterval(() => {
    setBtn(true);
  }, 1900);

  const commands = [
    {
      command: "clear",
      callback: () => {
        resetTranscript();
        setChat([{ que: "", ans: "" }]);
      },
    },
  ];

  const {
    transcript,
    browserSupportsSpeechRecognition,
    resetTranscript,
    listening,
  } = useSpeechRecognition({ commands });

  const startListning = () => {
    SpeechRecognation.startListening({
      language: "en-IN",
    });
  };

  useEffect(() => {
    if (transcript != "" && transcript != "clear") {
      setLoader(true);
      axios({
        method: "get",
        url: `https://aimodel-lkbp.onrender.com/${transcript}`,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
        .then((result) => {
          if(flag){
            setChat([{ que: transcript, ans: result.data }]);
            setFlag(false);
          }else{
            setChat((data) => [...data, { que: transcript, ans: result.data }]);
          }
          setLoader(false);
        })
        .catch((err) => {
          console.log(err);
          setLoader(false);
        });
    }
  }, [listening]);

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <>
      <div className="prompt">
        <h1>
          <Typewriter
            words={["welcome to nobody's terminal"]}
            typeSpeed={50}
            cursorStyle="|"
          />
        </h1>
        {msg && (
          <h2>
            <Typewriter
              words={["click 'start listning' & ask your question"]}
              typeSpeed={30}
              cursorStyle="|"
            />
          </h2>
        )}
      </div>

      <div className="terminal">
        {listening && (
          <Rings
            height="35"
            width="35"
            color="#ffffff"
            radius="6"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
            ariaLabel="rings-loading"
          />
        )}
        {transcript && <p>&gt; &nbsp;{transcript}</p>}
        <br/>
        {loader && (
          <RotatingLines
            strokeColor="white"
            strokeWidth="5"
            animationDuration="0.75"
            width="30"
            visible={true}
          />
        )}
        {chat.map((data, index) => {
          return (
            (data.que != "" && data.ans != "") && (
              <div className="data" key={index}>
                Q. &nbsp;<Typewriter words={[data.que]} typeSpeed={30} cursorStyle="|" />
                <br />
                &gt; &nbsp;<Typewriter words={[data.ans]} typeSpeed={30} cursorStyle="|" />
              </div>)
          );
        })}
      </div>

      <Tooltip id="my-tooltip" />

      {btn && (
        <div className="lst">
          <button
            onClick={() => {
              startListning();
              setMsg(false);
            }}
          >
            Start Listning
          </button>
          <a
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Speaking 'clear' also clear the content"
          >
            <button
              onClick={() => {
                resetTranscript();
                setChat([{ que: "", ans: "" }]);
              }}
            >
              Clear
            </button>
          </a>
        </div>
      )}
    </>
  );
}

export default App;
