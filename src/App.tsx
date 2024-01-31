// "use client";

import "regenerator-runtime/runtime";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import SpeechRecognation, { useSpeechRecognition } from "react-speech-recognition";
import { Typewriter } from "react-simple-typewriter";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { Rings, RotatingLines } from "react-loader-spinner";
import { useSpeechSynthesis } from 'react-speech-kit';

import "./App.css";
// let flagcmd = false;

function App() {
  const [btn, setBtn] = useState(false);
  const [msg, setMsg] = useState(true);
  const [loader, setLoader] = useState(false);
  const [flag, setFlag] = useState(true);
  // const [clrflag, setClrflag] = useState(true);
  const [cmdflag, setCmdflag] = useState(false);
  const [typingflag, setTypingflag] = useState(false);
  const [listenflag, setListenflag] = useState(false);
  const controller = useRef<AbortController>();
  const { speak, cancel, speaking } = useSpeechSynthesis();
  const [chat, setChat] = useState([
    {
      que: "",
      ans: "",
    },
  ]);
  setInterval(() => {
    setBtn(true);
  }, 1900);

  const abortReq = () =>{
    if(controller.current){
      controller.current.abort();
    }
    setCmdflag(true);
  }

  const owner = () =>{
    setLoader(true);
        if (flag) {
          setChat([{ que: transcript, ans: "I was designed by Happy Prajapati." }]);
          setFlag(false);
        } else {
          setChat((data) => [
            ...data,
            { que: transcript, ans: "I was designed by Happy Prajapati." },
          ]);
        }
        setLoader(false);
        abortReq();
  }

  const commands = [
    {
      command: "clear",
      callback: () => {
        resetTranscript();
        setChat([{ que: "", ans: "" }]);
        setLoader(false);
        abortReq();
      },
    },
    // {
    //   command: "open *",
    //   callback: (website: string) => {
    //     setLoader(true);
    //     window.open("http://" + website.split(" ").join(""));
    //     setLoader(false);
    //     abortReq();
    //   },
    // },
    {
      command: "what is your name",
      callback: () => {
        setLoader(true);
        if (flag) {
          setChat([{ que: transcript, ans: "My name is Nobody's Terminal." }]);
          setFlag(false);
        } else {
          setChat((data) => [
            ...data,
            { que: transcript, ans: "My name is Nobody's Terminal." },
          ]);
        }
        setLoader(false);
        abortReq();
      },
    },
    {
      command: 'who is your creator',
      callback: () => {
        owner();
      },
    },
    {
      command: 'who is your owner',
      callback: () => {
        owner();
      },
    },
    {
      command: 'who creates you',
      callback: () => {
        owner();
      },
    },
  ];

  const {
    transcript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    resetTranscript,
    listening,
  } = useSpeechRecognition({ commands });

  const startListning = () => {
    SpeechRecognation.startListening({
      language: "en-IN",
    });
    if (!isMicrophoneAvailable) {
      setChat([{ que: "Microphone doesn't found.", ans: "" }]);
    }
  };

  useEffect(() => {
    controller.current = new AbortController();
    const signal = controller.current.signal;
    if (transcript != "") {
        commands.map((command) => {
          if (command.command == transcript) {
            // setCmdflag(true);
            // console.log(cmdflag);
            command.callback();
          }
        });
      if (cmdflag === false) {
        setLoader(true);
        axios({
          method: "get",
          url: `https://aimodel-lkbp.onrender.com/${transcript}`,
          signal,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        })
          .then((result) => {
            if (flag) {
              setChat([{ que: transcript, ans: result.data }]);
              setFlag(false);
            } else {
              setChat((data) => [
                ...data,
                { que: transcript, ans: result.data },
              ]);
            }
            setLoader(false);
          })
          .catch((err) => {
            if (axios.isCancel(err)){
              console.log("axios request cancelled");
              setLoader(false);
             }else{
               console.log(err);
               setLoader(false);
             }
          });
      }
    }
  }, [listening]);

  // console.log(commands.map((command) => command.command == transcript) == null);
  // if(commands.filter((command)=>command.command==transcript)[0].command == null)

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
        {/* <p>{commands.map((command) => command.command)}:</p> */}
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
        <br />
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
            data.que != "" &&
            data.ans != "" && (
              <div className="data" key={index}>
                Q. &nbsp;
                <Typewriter words={[data.que]} typeSpeed={20} cursorStyle="|" />
                <button className="btn" onClick={()=>{setTypingflag(true)}}>Skip Typing</button>
                {!speaking && <button className="btn" onClick={()=>{setListenflag(true); speak({ text: data.ans })}}>Listen</button>}
                {speaking && <button className="btn" onClick={()=>{setListenflag(false); cancel()}}>Stop Listening</button>}
                <br />
                &gt; &nbsp;
                {!typingflag && <Typewriter words={[data.ans]} typeSpeed={20} cursorStyle="|" />}
                {typingflag && data.ans}
              </div>
            )
          );
        })}
      </div>

      <Tooltip id="my-tooltip" />

      {btn && (
        <div className="lst">
          <button
            className="btn-bottom"
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
              className="btn-bottom"
              onClick={() => {
                resetTranscript();
                setChat([{ que: "", ans: "" }]);
                setLoader(false);
                abortReq();
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
