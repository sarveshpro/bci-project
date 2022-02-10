import React, { ReactElement, useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import Head from "next/head";
import { io } from "socket.io-client";

interface Props { }

export default function Index({ }: Props): ReactElement {

  // const socket = io("http://localhost:8000");

  useEffect(
    () => {
      const socket = io("http://localhost:8000");
      socket.connect();
      socket.on("connect", () => {
        setStatus("waiting");
        console.log(socket.id);
      });
      socket.on("disconnect", () => {
        setStatus("connecting");
        console.log(socket.connected);
      });
      socket.once("scanning", (scanning: any) => {
        if (scanning) setStatus('scanning');
      });

      socket.on("eegData", handleData);
      socket.on("action", handleAction);
      // return () => {
      //   // unbind all event handlers used in this component
      //   socket.off("eegData", handleData);
      //   socket.off("action", handleAction);
      // }; 
      return () => {
        socket.off("eegData", handleData);
        socket.off("action", handleAction);
        socket.disconnect();
        reset();
      }
    },
    []
  )

  const defaultData = {
    eSense: { attention: 0, meditation: 0 },
    eegPower: {
      delta: 0,
      theta: 0,
      lowAlpha: 0,
      highAlpha: 0,
      lowBeta: 0,
      highBeta: 0,
      lowGamma: 0,
      highGamma: 0,
    },
    poorSignalLevel: 0,
  }

  const [data, setData] = useState(defaultData);
  const [prediction, setPrediction] = useState("forward");

  // car props
  const car = useRef(null);
  const [rotation, setRotation] = useState(180);
  var front = "right";

  // control props
  const [play, setPlay] = useState(false);
  const [status, setStatus] = useState("disconnected");
  const [actionStrength, setActionSrength] = useState(0);
  const [move, setMove] = useState(false);
  const [timeElasped, setTimeElasped] = React.useState<number>(0);

  React.useEffect(() => {
    if (play) {
      const time = setInterval(() => {
        let newTimeElasped = timeElasped + 0.1;
        newTimeElasped = Math.round(newTimeElasped * 100) / 100;
        setTimeElasped(newTimeElasped);
      }, 100);
      return () => clearInterval(time);
    }
  }, [play, timeElasped]);

  const handleData = (data: any) => {
    console.log('here');
    
    if (data) {
      setStatus("connected");
      setData(data);
      // if (data.eSense.attention > 80) {
      //   moveForward();
      // }
    }
  }

  const handleAction = (data: any) => {
    if (data) {
      console.log('action', data);
      setMove(data.action);
      setActionSrength(data.value);
    }
  }

  const handlePrediction = (data: any) => {
    if (data) {
      setPrediction(data);
    }
  }

  // React.useEffect(() => {
  //   if (play) {
  //     setStatus("connecting")
  //     socket.on("connect", () => {
  //       setStatus("waiting");
  //       console.log(socket.id);
  //     });

  //     socket.on("disconnect", () => {
  //       setStatus("connecting");
  //       console.log(socket.connected);
  //     });

  //     socket.once("scanning", (scanning: any) => {
  //       if (scanning) setStatus('scanning');
  //     });

  //     socket.on("eegData", handleData);
  //     socket.on("action", handleAction);
  //     return () => {
  //       // unbind all event handlers used in this component
  //       socket.off("eegData", handleData);
  //       socket.off("action", handleAction);
  //     };

  //   } else {
  //     socket.disconnect();
  //     setData(defaultData);
  //     setStatus("disconnected");
  //   }
  // }, [play]);

  const reset = () => {
    setMove(false);
    setTimeElasped(0);
    car.current.style.position = "relative";
    car.current.style.left = "0px";
    car.current.style.top = "140px";
    car.current.style.transform = `rotate(${0}deg)`;
  };

  useEffect(() => {
    if (play && move) {
      const i = setInterval(() => {
        moveForward();
      }, 500);
      return () => clearInterval(i);
    }
  }, [move]);

  useEffect(() => {
    reset();
  }, []);

  function getFrontSide() {
    if (rotation === 0) {
      return "left";
    } else if (rotation === 90) {
      return "top";
    } else if (rotation === 180) {
      return "right";
    } else if (rotation === 270) {
      return "bottom";
    }
  }

  const moveForward = () => {
    front = getFrontSide();
    var direction = "";
    if (front === "left" || front === "right") {
      direction = "left";
    } else {
      direction = "top";
    }
    console.log("front", front);
    if (front === "left" || front === "top") {
      car.current.style[direction] =
        parseInt(car.current.style[direction]) - 10 + "px";
    } else {
      car.current.style[direction] =
        parseInt(car.current.style[direction]) + 10 + "px";
    }
  };

  const moveBackward = () => {
    front = getFrontSide();
    var direction = "";
    if (front === "left" || front === "right") {
      direction = "left";
    } else {
      direction = "top";
    }
    console.log("front", front);
    if (front === "left" || front === "top") {
      car.current.style[direction] =
        parseInt(car.current.style[direction]) + 10 + "px";
    } else {
      car.current.style[direction] =
        parseInt(car.current.style[direction]) - 10 + "px";
    }
  };

  function rotateLeft() {
    if (rotation === 0) {
      setRotation(270);
    } else {
      setRotation(rotation - 90);
    }
    car.current.style.transform = `rotate(${rotation}deg)`;
  }

  function rotateRight() {
    if (rotation === 270) {
      setRotation(0);
    } else {
      setRotation(rotation + 90);
    }
    car.current.style.transform = `rotate(${rotation}deg)`;
  }
  return (
    <div className="page">
      <Head>
        <title>BCI Interface</title>
      </Head>
      <div className="dashboard">
        <div className="readings">
          <div className="title">Readings from EEG headset</div>
          <div className={`status ${status}`}>{status}</div>
          <div className="eeg-data">
            {Object.keys(data.eegPower).map(function (key) {
              return (
                <div key={key} className="cell">
                  <div className="value">{data.eegPower[key]}</div>
                  <div className="label">{key}</div>
                </div>
              );
            })}
          </div>
          <div className="attention-data">
            <div className="cell">
              <div className="value">{data.eSense.attention}</div>
              <div className="label">Attention</div>
            </div>
            <div className="cell">
              <div className="value">{data.eSense.meditation}</div>
              <div className="label">Meditation</div>
            </div>
          </div>
        </div>
        <div className="controls">
          <div className="title">Prediction</div>
          {/* {data.eSense.attention > 80 ?
            <div className="values">
              {prediction === "forward" ?
                <>
                  <div className="value">Forward - {`${data.eSense.attention / 10}${data.eSense.attention === 100 ? '' : Math.floor(Math.random() * 9) + 1}`}</div>
                  <div className="value">Reverse - {`${(data.eSense.meditation - 2) / 10}`}</div>
                </>
                : <>
                  <div className="value">Reverse - {`${data.eSense.attention / 10}${Math.floor(Math.random() * 9) + 1}`}</div>
                  <div className="value">Forward - {`${(data.eSense.meditation + 1) / 10}${Math.floor(Math.random() * 9) + 1}`}</div>
                </>}
             //  <div className="value">Left - 0</div>
          //  <div className="value">Right - 0</div> 
            </div> :
            <div className="values">
              <div className="value">Do nothing</div>
            </div>} */}
          <div className="buttons">
            <div onClick={moveForward} className="accelerator">
              <img src={"/assets/images/fire.png"} alt="accelerator" />
            </div>
            <div onClick={moveBackward} className="brake">
              <img src={"/assets/images/pedal.png"} alt="brake" />
            </div>
          </div>
        </div>
      </div>
      <div className="playground">
        <div className="title">Simulation</div>
        <div className="sim-controls">
          <div onClick={reset} className="reset">
            Reset
          </div>
          <div onClick={() => setPlay(!play)} className="start">
            {play ? "Stop" : "Start"}
          </div>
        </div>
        <div className="sim-timer">{timeElasped}s</div>
        <Draggable axis="x">
          <div ref={car} id="car" className="car">
            <div className="center-axis"></div>
            <div className="perpendicular-axis"></div>
            <div className="left-axis"></div>
            <div className="right-axis"></div>
            <div className="sphere"></div>
          </div>
        </Draggable>
        <div style={{ top: 160 }} className="horizontal-line"></div>
        <div style={{ top: 325 }} className="horizontal-line"></div>
      </div>
    </div>
  );
}
