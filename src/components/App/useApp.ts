import type { AppProps } from "./index";
import { useEffect, useState } from "preact/hooks";

import { startOjaman, stopOjaman } from "../../ojaman";

import { OjamanOptions } from "../../types";

export const useApp = ({ ojamanState }: AppProps) => {
  const [isOpenForm, setOpenForm] = useState(false);
  const [isEnabled, setEnabled] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    if (isEnabled) {
      try {
        startOjaman(ojamanState);
      } catch (error) {
        if (error instanceof Error) alert(error.message);
        setTimeout(() => setEnabled(false), 300);
      }
    }

    return () => {
      if (isEnabled) stopOjaman(ojamanState);
    };
  }, [ojamanState, isEnabled]);

  return {
    videoSrc,
    isEnabled,
    isOpenForm,
    options: { ...ojamanState.options },

    setOpenForm,
    setEnabled,
    setVideoSrc,

    updateOptions: (options: Partial<OjamanOptions>) => {
      Object.assign(ojamanState.options, options);
    },

    setVideoElement: (video: HTMLVideoElement | null) => {
      ojamanState.insertVideo = video;
    },

    onChangeVideoSrc: (files: File[]) => {
      const file = files[0];

      if (!file) return;
      if (!file.type.match("video")) return alert("動画ファイルのみ設定できます 😫");

      setVideoSrc(URL.createObjectURL(file));
    },
  };
};
