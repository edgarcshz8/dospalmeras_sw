import styles from './WaveHeader.module.css';

interface Props {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  plain?: boolean;
}

export default function WaveHeader({ title, subtitle, imageUrl, plain }: Props) {
  return (
    <div className={`${styles.header}${plain ? ` ${styles.plain}` : ''}`}>
      <svg className={styles.swoosh} viewBox="0 0 600 200" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-50,120 C100,40 300,160 450,80 C550,30 600,100 650,60" stroke="rgba(245,230,211,0.07)" strokeWidth="1.5" fill="none"/>
        <path d="M-50,160 C150,90 350,180 500,110 C580,70 620,140 660,95" stroke="rgba(245,230,211,0.04)" strokeWidth="1" fill="none"/>
        <path d="M-20,80 C80,40 200,100 320,60 C420,30 500,70 560,45" stroke="rgba(227,6,19,0.06)" strokeWidth="1" fill="none"/>
      </svg>

      <div className={styles.textSide}>
        <h2 className={styles.title}>{title}</h2>
        <span className={styles.titleLine} aria-hidden="true" />
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      {imageUrl && (
        <div className={styles.photoSide}>
          <img src={imageUrl} alt="" className={styles.blobImg} aria-hidden="true" />
        </div>
      )}

      <svg className={styles.waveBottom} viewBox="0 0 1200 68" preserveAspectRatio="none" aria-hidden="true">
        <path className={styles.wavePath} d="M0,68 L0,46 C180,14 340,64 520,36 C700,8 860,58 1040,28 C1110,18 1160,36 1200,22 L1200,68 Z" />
      </svg>
    </div>
  );
}
