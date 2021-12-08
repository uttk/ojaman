import { io, Socket } from "socket.io-client";

type SDP =
  | {
      type: "offer" | "answer";
      data: RTCSessionDescription;
    }
  | {
      type: "candidate";
      data: RTCIceCandidate;
    };

/**
 * @description HTMLMediaElementか判定する
 */
const isMediaElement = (value?: HTMLElement | null): value is HTMLMediaElement => {
  return !!value && "srcObject" in value;
};

/**
 * @description 対応している通信データか判定する
 */
const isSDP = (value: unknown): value is SDP => {
  if (typeof value !== "object") return false;

  const v = { type: "", ...(value || {}) };

  return ["offer", "answer", "candidate"].includes(v.type);
};

/**
 * @description 受け取ったMediaStreamをvideoタグに設定する
 */
const setPreview = (videoId: string, stream: MediaStream) => {
  const ele = document.getElementById(videoId);

  if (!isMediaElement(ele)) return alert("再生出来るメディア要素がありません");

  ele.srcObject = stream;
  ele.volume = 0.5;
  ele.play();
};

/**
 * @description 送信されたTrackを受け取った時の処理
 */
const onTrack = async (event: RTCTrackEvent) => {
  setPreview("answer-preview", event.streams[0]); // 相手の入力を表示
};

/**
 * @description `candidate`イベントを受け取った時の処理
 */
const onIcecandidate = async (socket: Socket, event: RTCPeerConnectionIceEvent) => {
  // 'candidate' でなければ何もしない
  if (!event.candidate) return;

  // ICE candidateをサーバーを経由して相手に送信
  socket.emit("signaling", { type: "candidate", data: event.candidate });
};

/**
 * @description SDPを受け取った時の処理
 */
const onSignaling = async (socket: Socket, rtc: RTCPeerConnection, sdp: unknown) => {
  const value = isSDP(sdp) ? sdp : ({ type: "none", data: null } as const);

  switch (value.type) {
    case "offer": {
      const offerSD = new RTCSessionDescription(value.data);
      await rtc.setRemoteDescription(offerSD);

      const answerSDP = await rtc.createAnswer();
      await rtc.setLocalDescription(answerSDP);

      socket.emit("signaling", { type: "answer", data: answerSDP });

      break;
    }

    case "answer": {
      const answerSDP = new RTCSessionDescription(value.data);

      await rtc.setRemoteDescription(answerSDP);

      break;
    }

    case "candidate": {
      await rtc.addIceCandidate(value.data);

      break;
    }

    default: {
      console.log("Scoket Event (signaling): 対応していない値です", { value });

      break;
    }
  }
};

/**
 * @description 初期化処理
 */
export const initialize = () => {
  const socket = io("/");
  const rtc = new RTCPeerConnection();

  // WebScocketの通信に成功した時の処理
  socket.on("connect", () => console.log("Socket Event : connect"));

  // サーバーからのメッセージ受信に対する処理
  socket.on("signaling", (sdp) => onSignaling(socket, rtc, sdp));

  // `candidate` のイベントを受け取る
  rtc.addEventListener("icecandidate", (event) => onIcecandidate(socket, event));

  // 相手の Track を受け取った時の処理
  rtc.addEventListener("track", onTrack);

  return {
    rtc,
    socket,

    sendOffer: async () => {
      if (!rtc.localDescription) {
        const offer = await rtc.createOffer();

        await rtc.setLocalDescription(offer);
      }

      socket.emit("signaling", { type: "offer", data: rtc.localDescription });
    },

    startLive: async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      if (!stream) return alert("デバイスの取得に失敗しました");

      // 送信するTrackを設定する
      stream.getTracks().forEach((track) => rtc.addTrack(track, stream));

      // 自分の入力を表示
      setPreview("offer-preview", stream);
    },
  };
};
