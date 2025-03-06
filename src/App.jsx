import "regenerator-runtime/runtime";
import axios from "axios";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import SpeechRecognation, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Typewriter } from "react-simple-typewriter";
import { TypeAnimation } from "react-type-animation";
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
  const [skipTypingflag, setSkipTypingflag] = useState(false);
  const [showSkipTypingflag, setShowSkipTypingflag] = useState(false);
  const [currentAns, setCurrentAns] = useState(1);
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
    abortReq();
  };

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
            setSkipTypingflag(false);
            setShowSkipTypingflag(true);
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
    chat.map((data, index) => {
      setCurrentAns(index);
    })
  },[chat])
  
  useLayoutEffect(() => {
    const observer = new MutationObserver(() => {
      const bodyHeight = document.body.scrollHeight;
      const windowHeight = window.innerHeight;

      if (bodyHeight > windowHeight) {
        window.scrollTo(0, bodyHeight);
      }
    });

    observer.observe(document.body, {
      childList: true,    
      subtree: true,      
    });

    return () => observer.disconnect();
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <div>
      <div className="prompt">
        <h1>
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

      <div className="listner">
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
        {showSkipTypingflag && (
          <button
            className="btn"
            onClick={() => {
              setSkipTypingflag(true);
              setShowSkipTypingflag(false);
            }}
          >
            Skip Typing
          </button>
        )}
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
      </div>

      <div className="terminal">
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
                  {(currentAns !== index || skipTypingflag) && <pre>&gt; &nbsp;{data.ans}</pre>}
                  { !skipTypingflag && currentAns == index && 
                    <>
                      &gt; &nbsp;
                        <TypeAnimation
                          sequence={[data.ans]}
                          wrapper="span"
                          speed={80}
                          cursor={false}
                          style={{ whiteSpace: "pre-line" }}
                        />
                    </>
                  }
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
              setShowSkipTypingflag(false);
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
    </div>
  );
}

export default App;
