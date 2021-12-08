import hark from "hark";

import { MyRTCPeerConnection } from "./utils/MyRTCPeerConnection";
import { getMediaStreamFromVideo, getCloneMediaStream, replaceSenderTracks } from "./utils/media";

import { OjamanStateValue, OjamanOptions } from "./types";

/**
 * @description 登録されている処理を停止する
 */
const clearEvents = (state: OjamanStateValue) => {
  clearInterval(state.clearTimerId);
  clearTimeout(state.clearResetStateId);
};

/**
 * @description Stateを初期化する
 */
const initState = (state: OjamanStateValue) => {
  const { streams, insertVideo, options } = state;
  const defaultValue = createOjamanState(state.options);

  // 初期化
  Object.assign(state, defaultValue, { streams, insertVideo, options });
};

/**
 * @description シークしているか判定する
 * @note 一回では上手く判定できないことがあるため、遅延させてもう一度判定するようにする
 */
const isSkeeking = (video: HTMLVideoElement): Promise<boolean> => {
  if (video.seeking) return Promise.resolve(true);
  return new Promise((resolve) => setTimeout(resolve, 50, video.seeking));
};

/**
 * @description 動画Trackのみ置き換える
 */
const replaceVideoTracks = (streams: MediaStream[], replaceTracks: MediaStreamTrack[]) => {
  for (const stream of streams) {
    const videoTracks = stream.getVideoTracks();

    videoTracks.forEach((track) => stream.removeTrack(track));
    replaceTracks.forEach((track) => track.kind.match("video") && stream.addTrack(track));
  }
};

/**
 * @description 動画をStreamに挿入する
 */
const insertVideoToMediaStream = async (state: OjamanStateValue) => {
  const { insertVideo } = state;
  const rtc = MyRTCPeerConnection.getConnectedConnection();
  const { video: videoStream } = state.streams;

  if (!rtc) throw new Error("動画の置き換えに失敗しました");
  if (!insertVideo) throw new Error("置き換える動画が設定されていません");
  if (!videoStream) throw new Error("動画の置き換え先のメディアがありません");

  const senders = rtc.getSenders();
  const previewStreams = getCloneMediaStream(videoStream);
  const insertTracks = getMediaStreamFromVideo(insertVideo).getTracks();
  const rewindTracks = senders.flatMap((sender) => (sender.track ? [sender.track] : []));

  await replaceSenderTracks(senders, insertTracks); // 動画を送信するようにする
  replaceVideoTracks(previewStreams, insertTracks); // プレビュー画面に動画を差し込む

  const rewind = async () => {
    const seeking = await isSkeeking(insertVideo);

    if (seeking) return;
    if (!state.isBlocking) return;

    state.elapsedTime = 0; // 経過時間を初期化する
    state.isBlocking = false; // お邪魔フラグをfalseに変更する

    await replaceSenderTracks(senders, rewindTracks); // 送信しているメディア情報を元に戻す
    replaceVideoTracks(previewStreams, rewindTracks); // プレビュー画面をカメラ情報に戻す
  };

  // 動画が終了した時に元のStream情報に戻す
  insertVideo.onended = rewind;
  insertVideo.onpause = rewind;

  // 動画を再生する
  insertVideo.currentTime = 0;
  insertVideo.play();
};

/**
 * @description タイマー処理
 */
const onCheckSpeakingTime = async (state: OjamanStateValue) => {
  console.log("Timer Event:", { currentTime: state.elapsedTime });

  const { checkInterval, maxSpeakingTime } = state.options;

  // 経過時間を計算
  state.elapsedTime += checkInterval;

  // 喋りすぎてなければ何もしない
  if (state.elapsedTime <= maxSpeakingTime * 1000) return;

  // タイマーを止める
  clearEvents(state);

  await insertVideoToMediaStream(state);

  // 状態を更新
  state.isBlocking = true;
  state.clearTimerId = 0;
  state.clearResetStateId = 0;
};

/**
 * @description OjamanをStateを作成する
 */
export const createOjamanState = (options: Partial<OjamanOptions> = {}): OjamanStateValue => {
  return {
    streams: { video: null, audio: null },
    speechEvents: null,
    insertVideo: null,
    isBlocking: false,
    elapsedTime: 0,
    clearTimerId: 0,
    clearResetStateId: 0,
    options: {
      breakTime: 5,
      maxSpeakingTime: 3,
      checkInterval: 100,
      ...options,
    },
  };
};

/**
 * @description Ojamanを開始する
 */
export const startOjaman = (state: OjamanStateValue) => {
  const options = state.options;
  const audioStream = state.streams.audio;

  if (!audioStream) throw new Error("マイクの取得に失敗しました");

  const speechEvents = hark(audioStream);

  // 話し始めた時のイベントを設定
  speechEvents.on("speaking", () => {
    console.log("Speech Event: 'speaking'");

    // 前回のタイマーがあれば止めておく
    clearEvents(state);

    const onError = (error: Error) => {
      console.error(error); // エラー内容を表示
      clearEvents(state); // 登録しているイベントを解除
      initState(state); // 状態を初期化
    };

    // お邪魔中でなければタイマー開始
    if (!state.isBlocking) {
      const cb = () => onCheckSpeakingTime(state).catch(onError);
      state.clearTimerId = window.setInterval(cb, options.checkInterval);
    }
  });

  // 話しが終わった時のイベントを設定
  speechEvents.on("stopped_speaking", () => {
    console.log("Speech Event: 'stopped_speaking'");

    // タイマーを一時的に止める
    clearEvents(state);

    // お邪魔中でなければ初期化処理を設定しておく
    if (!state.isBlocking) {
      const cb = () => initState(state);
      state.clearResetStateId = window.setTimeout(cb, options.breakTime * 1000);
    }
  });

  // イベントオブジェクトをStateに入れる
  state.speechEvents = speechEvents;
};

/**
 * @description Ojamanを停止する
 */
export const stopOjaman = (state: OjamanStateValue) => {
  state.speechEvents?.stop(); // 会話イベントの監視を終了する
  clearEvents(state); // イベント監視を終了する
  initState(state); // Stateを初期化する
};
