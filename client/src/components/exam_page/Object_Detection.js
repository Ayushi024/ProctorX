import React from "react";
import swal from "sweetalert";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./Detections.css";

export default class Detection extends React.Component {
  videoRef = React.createRef();
  canvasRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = { count: 0 }; // Tracks consecutive frames without face detection
  }

  componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "user",
            width: 800,
            height: 400,
          },
        })
        .then((stream) => {
          this.videoRef.current.srcObject = stream;
          return new Promise((resolve) => {
            this.videoRef.current.onloadedmetadata = () => resolve();
          });
        });

      const modelPromise = cocoSsd.load();

      Promise.all([modelPromise, webCamPromise])
        .then(([model]) => {
          this.detectFrame(this.videoRef.current, model);
        })
        .catch((error) => console.error("Error loading model or webcam:", error));
    }
  }

  componentWillUnmount() {
    if (this.videoRef.current && this.videoRef.current.srcObject) {
      const tracks = this.videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop()); // Stop video stream
    }
  }

  detectFrame = (video, model) => {
    model.detect(video).then((predictions) => {
      if (this.canvasRef.current) {
        this.renderPredictions(predictions);
        requestAnimationFrame(() => this.detectFrame(video, model));
      }
    });
  };

  renderPredictions = (predictions) => {
    const ctx = this.canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = "16px sans-serif";
    ctx.textBaseline = "top";

    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;

      // Draw bounding box
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Draw label background
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt("16px", 10);
      ctx.fillRect(x, y, textWidth + 8, textHeight + 8);

      // Draw label text
      if (["person", "cell phone", "book", "laptop"].includes(prediction.class)) {
        ctx.fillStyle = "#000000";
        ctx.fillText(prediction.class, x, y);
      }
    });

    this.handlePredictions(predictions);
  };

  handlePredictions = (predictions) => {
    let faces = 0;

    if (predictions.length === 0) {
      this.setState((prevState) => ({
        count: prevState.count + 1,
      }));

      if (this.state.count >= 50) {
        this.setState({ count: 0 });
        swal("Face Not Visible", "Action has been Recorded", "error");
        this.props.FaceNotVisible();
      }
    } else {
      this.setState({ count: 0 });
    }

    predictions.forEach((prediction) => {
      if (prediction.class === "cell phone") {
        this.props.MobilePhone();
        swal("Cell Phone Detected", "Action has been Recorded", "error");
      } else if (["book", "laptop"].includes(prediction.class)) {
        this.props.ProhibitedObject();
        swal("Prohibited Object Detected", "Action has been Recorded", "error");
      } else if (prediction.class === "person") {
        faces += 1;
      }
    });

    if (faces > 1) {
      this.props.MultipleFacesVisible();
      swal(`${faces} people detected`, "Action has been recorded", "error");
    }
  };

  render() {
    return (
      <div>
        <video
          className="size"
          autoPlay
          playsInline
          muted
          ref={this.videoRef}
          width="800"
          height="400"
        />
        <canvas
          className="size"
          ref={this.canvasRef}
          width="800"
          height="400"
        />
      </div>
    );
  }
}
