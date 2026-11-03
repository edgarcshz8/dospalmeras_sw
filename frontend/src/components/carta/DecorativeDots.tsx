import styles from './DecorativeDots.module.css';

export default function DecorativeDots() {
  return (
    <div className={styles.row} aria-hidden="true">
      <span className={styles.dotLg} />
      <span className={styles.dotMd} />
      <span className={styles.dotSm} />
    </div>
  );
}
