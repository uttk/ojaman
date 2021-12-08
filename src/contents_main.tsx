import { h, render } from "preact";
import { App } from "./components/App";
import { createOjamanState } from "./ojaman";
import { MyRTCPeerConnection } from "./utils/MyRTCPeerConnection";

// createOfferを上書きして、RTCPeerConnectionインスタンスを取得できるようにする
window.RTCPeerConnection = MyRTCPeerConnection;

const ojamanState = createOjamanState();

const media = navigator.mediaDevices;
const _getUserMedia = media.getUserMedia.bind(media);

// getUserMedia()を上書きしてデバイス情報を取得しておく
navigator.mediaDevices.getUserMedia = async function (constraints) {
  const stream = await _getUserMedia(constraints);

  // マイク情報を取得
  if (!constraints || constraints.audio) {
    ojamanState.streams.audio = stream;
  }

  // カメラ情報を取得
  if (!constraints || constraints.video) {
    ojamanState.streams.video = stream;
  }

  return stream;
};

// 操作するためのポップアップを表示する
window.onload = () => {
  render(
    <App ojamanState={ojamanState} />,
    document.body.appendChild(document.createElement("div"))
  );
};

console.log("INSTALLED OJAMAN 🥳");
