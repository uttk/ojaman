import { h } from "preact";
import styles from "./ToggleButton.module.scss";

interface ToggleButtonProps {
  checked: boolean;
  onChange: (bool: boolean) => void;
}

export const ToggleButton = ({ checked, onChange }: ToggleButtonProps) => {
  return (
    <div className={styles.toggle}>
      <input
        type="checkbox"
        id="enabled"
        name="enabled"
        checked={checked}
        className={styles.toggle__input}
        onChange={({ currentTarget: { checked } }) => onChange(checked)}
      />

      <label htmlFor="enabled" className={styles.toggle__body} />
    </div>
  );
};
