import {
  forwardRef,
  ForwardRefRenderFunction,
  HTMLProps,
} from 'react';
import cn from 'classnames';
import { InputPropsBase } from '@components/Inputs';
import styles from './Checkbox.module.scss';

type Props = InputPropsBase & HTMLProps<HTMLInputElement>;

const Checkbox: ForwardRefRenderFunction<HTMLInputElement, Props> = (
  { id, label, error, className, ...props },
  ref
) => {
  return (
    <div
      className={cn(
        styles.inputCheckbox,
        props.disabled && styles.disabled,
        className
      )}
    >
      <div className={styles.inputContainer}>
        <input
          type="checkbox"
          id={id}
          ref={ref}
          className={cn(error && styles.checkboxError)}
          {...props}
        />
        {label && <label htmlFor={id}>{label}</label>}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default forwardRef(Checkbox);
