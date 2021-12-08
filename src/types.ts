import { Harker } from "hark";

/**
 * @description Ojamanが対応しているオプション
 */
export interface OjamanOptions {
  /** 判定処理の頻度(ms) */
  checkInterval: number;

  /** タイマー初期化までの猶予時間(ms) */
  breakTime: number;

  /** 喋れる最大時間(ms) */
  maxSpeakingTime: number;
}

/**
 * @description Ojamanの処理に必要なState情報
 */
export interface OjamanStateValue {
  /** デバイスのメディア情報(マイク・カメラ) */
  streams: {
    video: MediaStream | null;
    audio: MediaStream | null;
  };

  /** 音声入力を解析するためのインスタンス */
  speechEvents: Harker | null;

  /** 挿入する動画を描画するためのvideo要素 */
  insertVideo: HTMLVideoElement | null;

  /** タイマーを止めるためのID */
  clearTimerId: number;

  /** タイマーの初期化処理を止めるためのID */
  clearResetStateId: number;

  /** 経過時間 */
  elapsedTime: number;

  /** お邪魔中かのフラグ */
  isBlocking: boolean;

  /** オプション */
  options: OjamanOptions;
}
