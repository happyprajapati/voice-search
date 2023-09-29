"use client";

import "regenerator-runtime/runtime";
import axios from "axios";
import { useState, useEffect} from "react";
import SpeechRecognation, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Typewriter } from "react-simple-typewriter";

import "./App.css";

function App() {
  const [btn, setBtn] = useState(false);
  const [chat, setChat] = useState([
    {
      que: "",
      ans: ""
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

  useEffect(()=>{
    if (transcript != "" && transcript != "clear") {
        axios({
          method: "get",
          url: `https://aimodel-lkbp.onrender.com/${transcript}`,
          headers: {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
          },
        })
          .then((result) => {
              setChat((data)=>[...data,{ que: transcript, ans: result.data }]);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    
  },[listening])


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
            deleteSpeed={50}
            cursorStyle="|"
            cursorColor="green"
          />
        </h1>
        {btn && (
          <button
            onClick={() => {
              resetTranscript();
            }}
          >
            Clear
          </button>
        )}
      </div>

      <div className="terminal">
        {transcript && <p>&gt; &nbsp;{transcript}</p>}
        {chat.map((data, index) => {
          return (
            <div key={index}>
              <Typewriter words={[data.que]} typeSpeed={30} deleteSpeed={50}
                cursorStyle="|"
                cursorColor="green"
              /><br/>
              <Typewriter words={[data.ans]} typeSpeed={30} deleteSpeed={50}
                cursorStyle="|"
                cursorColor="green"
              />
            </div>
          );
         })}
      </div>

      {btn && (
        <button className="lst" onClick={startListning}>
          Start Listning
        </button>
      )}
      {/* {btn && <button className="st" onClick={stopListning}>Stop Listning</button>} */}
    </>
  );
}

export default App;
