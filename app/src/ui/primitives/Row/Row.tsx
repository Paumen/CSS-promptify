import type { ReactNode, CSSProperties } from 'react';
import styles from './Row.module.css';

type RowGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type RowAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type RowJustify = 'start' | 'center' | 'end' | 'between' | 'around';

interface RowProps {
  children: ReactNode;
  gap?: RowGap;
  align?: RowAlign;
  justify?: RowJustify;
  wrap?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Row({
  children,
  gap = 'sm',
  align = 'center',
  justify = 'start',
  wrap = false,
  className,
  style,
}: RowProps) {
  const classes = [
    styles.row,
    styles[`gap-${gap}`],
    styles[`align-${align}`],
    styles[`justify-${justify}`],
    wrap && styles.wrap,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}
