import styles from './PriceBubble.module.css';

interface Props {
  formatted: string;
}

export default function PriceBubble({ formatted }: Props) {
  return <span className={styles.bubble}>{formatted}</span>;
}
