import { h, JSX } from "preact";
import styles from "./FormInput.module.scss";

interface InputProps extends JSX.HTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const FormInput = ({ name, label, ...props }: InputProps) => {
  return (
    <div className={styles.form_input__wrapper}>
      <label htmlFor={name} className={styles.form_input__label}>
        {label}
      </label>

      <input type="text" name={name} {...props} className={styles.form_input} />
    </div>
  );
};
