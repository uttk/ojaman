/** RTCPeerConnectionインスタンス */
const connections: RTCPeerConnection[] = [];

/**
 * @description コンストラクタを上書きするためのクラス
 */
export class MyRTCPeerConnection extends RTCPeerConnection {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...args: any[]) {
    super(...args);

    // RTCPeerConnectionインスタンスを保存する
    connections.push(this);
  }

  /**
   * @description RTCPeerConnectionインスタンスを返す関数
   */
  static getConnectedConnection(): RTCPeerConnection | null {
    return connections.find((v) => v.connectionState === "connected") || null;
  }
}
