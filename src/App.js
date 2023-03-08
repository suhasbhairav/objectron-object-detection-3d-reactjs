import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as cam from '@mediapipe/camera_utils';
import * as controls from '@mediapipe/control_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import * as objectrons from '@mediapipe/objectron';
function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const connect = window.drawConnectors;
  var camera = null;

  const onResults = async (model) => {
    if(typeof webcamRef.current !== "undefined" && webcamRef.current !== null && webcamRef.current.video.readyState === 4){
      const video = webcamRef.current.video;

      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const ctx = canvasRef.current.getContext("2d");
      ctx.save();

      ctx.clearRect(0,0, videoWidth, videoHeight);
      ctx.drawImage(model.image, 0,0, videoWidth, videoHeight);
      if(model.objectDetections){
        for(const detectedObject of model.objectDetections){
          const landmarks = detectedObject.keypoints.map(x => x.point2d);
          //bounding box
          drawConnectors(ctx, landmarks, objectrons.BOX_CONNECTIONS, {color: "#FF0000"});
          //centroid
          drawLandmarks(ctx, [landmarks[0]], {color: '#FFFFFF'})
        }
      }
      ctx.restore();
    }
  };
  


  useEffect(() => {
    const objectron = new objectrons.Objectron({locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/objectron/${file}`;
    }});

    objectron.setOptions({
      modelName: 'Chair',
      maxNumObjects: 3,
    });

    objectron.onResults(onResults);

    if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame:async () => {
          await objectron.send({image:webcamRef.current.video})
        },
        width: 640,
        height: 480
      });
      camera.start();
    }
  });


  return (
    <div>
      <Webcam
          ref={webcamRef}
          audio={false}
          id="img"
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480
          }}
          id="myCanvas"
        />
    </div>
  );
}

export default App;
