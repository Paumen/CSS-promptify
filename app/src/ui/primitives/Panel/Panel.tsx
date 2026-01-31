import type { ReactNode } from 'react';
import styles from './Panel.module.css';

interface PanelProps {
  children: ReactNode;
  className?: string;
}

interface PanelHeaderProps {
  children: ReactNode;
  className?: string;
}

interface PanelContentProps {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
}

interface PanelFooterProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className }: PanelProps) {
  return (
    <div className={`${styles.panel} ${className ?? ''}`}>
      {children}
    </div>
  );
}

export function PanelHeader({ children, className }: PanelHeaderProps) {
  return (
    <div className={`${styles.header} ${className ?? ''}`}>
      {children}
    </div>
  );
}

export function PanelContent({ children, className, scrollable }: PanelContentProps) {
  return (
    <div className={`${styles.content} ${scrollable ? styles.scrollable : ''} ${className ?? ''}`}>
      {children}
    </div>
  );
}

export function PanelFooter({ children, className }: PanelFooterProps) {
  return (
    <div className={`${styles.footer} ${className ?? ''}`}>
      {children}
    </div>
  );
}
