import styles from './BrushDivider.module.css';

export default function BrushDivider() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg className={styles.svg} viewBox="0 0 480 28" preserveAspectRatio="none">
        <path
          d="M8,14 C80,4 160,22 240,13 C320,4 400,19 472,11"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          className={styles.line1}
        />
        <path
          d="M0,18 C90,9 180,22 270,15 C355,8 420,20 480,14"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          className={styles.line2}
        />
      </svg>
    </div>
  );
}
