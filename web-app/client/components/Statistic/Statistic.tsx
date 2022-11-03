import { FC, HTMLProps } from "react";
import styles from "./Statistic.module.scss";
import classNames from "classnames";

type StatisticProps = {
  size?: "compact" | "big";
  header?: string;
} & Omit<HTMLProps<HTMLDivElement>, "size">;

export const Statistic: FC<StatisticProps> = ({
  size,
  className,
  children,
  header,
  ...props
}: StatisticProps) => (
  <article
    className={classNames(className, styles.wrapper, size && styles[size])}
    {...props}
  >
    <span className={styles.header}>{header}</span>
    <span className={styles.inner}>{children}</span>
  </article>
);
