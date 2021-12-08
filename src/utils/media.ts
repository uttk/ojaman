// captureStream API が型定義に無いので上書きして追加する
declare global {
  interface HTMLMediaElement {
    captureStream?(): MediaStream;
    mozCaptureStream?(): MediaStream;
  }
}

/**
 * @description video要素からMediaStreamを取得する
 */
export const getMediaStreamFromVideo = (video: HTMLVideoElement): MediaStream => {
  if (video.srcObject instanceof MediaStream) return video.srcObject;
  if (video.captureStream) return video.captureStream();
  if (video.mozCaptureStream) return video.mozCaptureStream();

  throw new Error("サポートしていないブラウザです");
};

/**
 * @description 送信するTracksを置き換える
 */
export const replaceSenderTracks = async (senders: RTCRtpSender[], tracks: MediaStreamTrack[]) => {
  for (const insertTrack of tracks) {
    for (const sender of senders) {
      if (sender.track?.kind === insertTrack.kind) {
        await sender.replaceTrack(insertTrack);
      }
    }
  }
};

/**
 * @description 渡されたMediaStreamと同じTrackを持つMediaStreamを返す
 */
export const getCloneMediaStream = (stream: MediaStream): MediaStream[] => {
  const tracks = stream.getTracks();
  const videos = Array.from(document.getElementsByTagName("video"));

  return videos.flatMap((video) => {
    const stream = video.srcObject;

    if (!(stream instanceof MediaStream)) return [];
    if (!stream.active) return [];

    const isClone = !!stream
      .getTracks()
      .some((t) => tracks.some((track) => track.kind === t.kind && track.label === t.label));

    return isClone ? [stream] : [];
  });
};
