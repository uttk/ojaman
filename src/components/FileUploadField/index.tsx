import { h, JSX } from "preact";
import { useRef } from "preact/hooks";
import styles from "./FileUploadField.module.scss";

/**
 * @description 画像のアイコン
 */
const ImageIcon = (props: JSX.SVGAttributes<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
      clipRule="evenodd"
    />
  </svg>
);

interface FileUploadFieldProps {
  name?: string;
  accept: string;
  onUpload: (files: File[]) => void;
}

export const FileUploadField = ({
  accept,
  name = "drop-files",
  onUpload,
}: FileUploadFieldProps) => {
  const labelRef = useRef<HTMLParagraphElement>(null);

  const onChangeLabel = (text: string) => (e: JSX.TargetedDragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const label = labelRef.current;

    if (label && label.innerText !== text) {
      label.innerText = text;
    }
  };

  const onDrop = (e: JSX.TargetedDragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onUpload(Array.from(e.dataTransfer?.files || []));
  };

  return (
    <div className={styles.upload_field}>
      <label
        htmlFor={name}
        className={styles.upload_body}
        onDrop={onDrop}
        onDragLeave={onChangeLabel("動画ファイルを設定する")}
        onDragOver={onChangeLabel("ここにファイルをドロップ")}
      >
        <ImageIcon width={24} height={24} />
        <p ref={labelRef} className={styles.upload_label}>
          動画を設定する
        </p>
      </label>

      <input
        type="file"
        id={name}
        name={name}
        accept={accept}
        onChange={(e) => onUpload(Array.from(e.currentTarget.files || []))}
      />
    </div>
  );
};
