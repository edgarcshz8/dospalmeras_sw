import styles from './BlobImage.module.css';

interface Props {
  src: string;
  alt?: string;
  height?: number;
}

export default function BlobImage({ src, alt = '', height = 178 }: Props) {
  return (
    <div className={styles.wrap}>
      <img src={src} alt={alt} className={styles.img} style={{ height }} />
    </div>
  );
}
