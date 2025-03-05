import "regenerator-runtime/runtime";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import SpeechRecognation, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Typewriter } from "react-simple-typewriter";
import { Ticker } from "react-ticker";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { Rings, RotatingLines } from "react-loader-spinner";
import { useSpeechSynthesis } from "react-speech-kit";

import "./App.css";

function App() {
  const [btn, setBtn] = useState(false);
  const [msg, setMsg] = useState(true);
  const [loader, setLoader] = useState(false);
  const [flag, setFlag] = useState(true);
  const [cmdflag, setCmdflag] = useState(false);
  const [typingflag, setTypingflag] = useState(false);
  const [typingbtn, setTypingbtn] = useState(1);
  const [del, setDel] = useState(20);
  const [listenflag, setListenflag] = useState(0);
  const controller = useRef();
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

  const abortReq = () => {
    if (controller.current) {
      controller.current.abort();
    }
    setCmdflag(true);
  };

  const owner = () => {
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
    setTypingflag(false);
    abortReq();
  };

  const commands = [
    {
      command: "clear",
      callback: () => {
        resetTranscript();
        setChat([{ que: "", ans: "" }]);
        setLoader(false);
        setTypingflag(false);
        abortReq();
      },
    },
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
        setTypingflag(false);
        abortReq();
      },
    },
    {
      command: "who is your creator",
      callback: () => {
        owner();
      },
    },
    {
      command: "who is your owner",
      callback: () => {
        owner();
      },
    },
    {
      command: "who creates you",
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
            setTypingflag(false);
          })
          .catch((err) => {
            if (axios.isCancel(err)) {
              console.log("axios request cancelled");
              setLoader(false);
            } else {
              console.log(err);
              setLoader(false);
            }
          });
      }
    }
  }, [listening]);

  useEffect(() => {
    if(typingflag){
      setDel(1);
    }else{
      setDel(20);
    }
  },[typingflag])

  useEffect(() => {
    chat.map((data, index) => {
      setTypingbtn(index);
    })
  },[chat])

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <>
      <div className="prompt">
        <h1>
        <Ticker>
        {() => (
          <div dangerouslySetInnerHTML={{ __html: "React.js, often referred to as just React, is a <strong>JavaScript library for building user interfaces (UIs) or UI components</strong>. It is maintained by Facebook (Meta) and a large community of individual developers and companies.<br><br>Here's a breakdown of what that means:<br><br>   <strong>JavaScript Library:</strong> React is not a full-fledged framework like Angular or Vue.js." }} />
        )}
      </Ticker>
          <Typewriter
            words={["welcome to nobody's terminal"]}
            typeSpeed={50}
            cursorStyle="|"
          />
        </h1>
        {msg && (
          <>
            <h2>
              <Typewriter
                words={["click 'start listning' & ask your question"]}
                typeSpeed={30}
                cursorStyle="|"
              />
            </h2>
            <h2>
              <Typewriter
                words={["for the first answer it may take few more time"]}
                typeSpeed={30}
                cursorStyle="|"
              />
            </h2>
          </>
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

        {
          chat.map((data, index) => {
            return (
              data.que != "" &&
              data.ans != "" && (
                <div className="data" key={index}>
                  Q. &nbsp;
                  <Typewriter
                    words={[data.que]}
                    typeSpeed={20}
                    cursorStyle="|"
                  />
                  {typingbtn == index && (
                    <button
                      className="btn"
                      onClick={() => {
                        setTypingflag(true);
                      }}
                    >
                      Fast Typing
                    </button>
                  )}
                  {!speaking && (
                    <button
                      className="btn"
                      onClick={() => {
                        speak({ text: data.ans });
                        setListenflag(index);
                      }}
                    >
                      Listen
                    </button>
                  )}
                  {speaking && listenflag == index && (
                    <button
                      className="btn"
                      onClick={() => {
                        cancel();
                      }}
                    >
                      Stop Listening
                    </button>
                  )}
                  <br />
                  &gt; &nbsp;
                  (
                    <Typewriter
                      words={[data.ans]}
                      typeSpeed={del}
                      cursorStyle="|"
                    />
                  )
                </div>
              )
            );
          })
        }
      </div>

      <Tooltip id="my-tooltip" />

      {btn && (
        <div className="lst">
          <button
            className="btn-bottom"
            onClick={() => {
              startListning();
              setMsg(false);
              setCmdflag(false);
              setTypingflag(false);
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
