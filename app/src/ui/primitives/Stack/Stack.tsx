import type { ReactNode, CSSProperties } from 'react';
import styles from './Stack.module.css';

type StackGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface StackProps {
  children: ReactNode;
  gap?: StackGap;
  className?: string;
  style?: CSSProperties;
}

export function Stack({ children, gap = 'md', className, style }: StackProps) {
  const classes = [
    styles.stack,
    styles[`gap-${gap}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}
