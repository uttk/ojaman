import clsx from "clsx";
import { h } from "preact";

import { useApp } from "./useApp";
import { useDrag } from "../../hooks/useDrag";

import { FormInput } from "../FormInput";
import { ToggleButton } from "../ToggleButton";
import { FileUploadField } from "../FileUploadField";

import { OjamanStateValue } from "../../types";

import styles from "./App.module.scss";

/**
 * @description 動画の設定解除ボタンのアイコン
 */
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    width={24}
    height={24}
  >
    <path
      fill-rule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
      clip-rule="evenodd"
    />
  </svg>
);

export interface AppProps {
  ojamanState: OjamanStateValue;
}

export const App = (props: AppProps) => {
  const dragProps = useDrag();
  const {
    options,
    videoSrc,
    isOpenForm,
    isEnabled,
    setOpenForm,
    setEnabled,
    setVideoSrc,
    updateOptions,
    setVideoElement,
    onChangeVideoSrc,
  } = useApp(props);

  return (
    <div className={styles.popup} {...dragProps}>
      <header className={styles.header}>
        <h2 className={styles.header__label}>Ojaman</h2>

        <ToggleButton
          checked={isEnabled}
          onChange={(enabled) => {
            setEnabled(enabled);
            setOpenForm(enabled);
          }}
        />
      </header>

      <form
        className={clsx(styles.ojaman_form, isOpenForm || styles.ojaman_form_hidden)}
        onSubmit={(e) => e.preventDefault()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.video_area}>
          {videoSrc ? (
            <div className={styles.preview_video__wrapper}>
              <video
                controls
                volume={0.3}
                src={videoSrc}
                className={styles.preview_video}
                ref={setVideoElement}
              />

              <button className={styles.clear_btn} onClick={() => setVideoSrc(null)}>
                <CloseIcon />
              </button>
            </div>
          ) : (
            <FileUploadField accept="video/*" onUpload={onChangeVideoSrc} />
          )}
        </div>

        <div className={styles.form_item}>
          <FormInput
            type="number"
            name="canSpeakTime"
            label="話せる時間(秒)"
            value={options.maxSpeakingTime}
            onChange={(e) => updateOptions({ maxSpeakingTime: +e.currentTarget.value || 60 })}
          />
        </div>

        <div className={styles.form_item}>
          <FormInput
            type="number"
            name="breakTime"
            label="猶予時間(秒)"
            value={options.breakTime}
            onChange={(e) => updateOptions({ breakTime: +e.currentTarget.value || 60 })}
          />
        </div>
      </form>

      <button
        className={styles.close_btn}
        onClick={() => setOpenForm(!isOpenForm)}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {isOpenForm ? "フォームを閉じる" : "フォームを開く"}
      </button>
    </div>
  );
};
