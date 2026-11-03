import styles from './WaveHeader.module.css';

interface Props {
  title: string;
  subtitle: string;
  imageUrl?: string | null;
  photoSide?: 'left' | 'right';
  plain?: boolean;
}

export default function WaveHeader({
  title,
  subtitle,
  imageUrl,
  photoSide = 'right',
  plain = false,
}: Props) {
  const hasPhoto = !!imageUrl;
  const onLeft = hasPhoto && photoSide === 'left';

  return (
    <div className={`${styles.wrapper} ${onLeft ? styles.onLeft : ''}`}>
      {/* Dark header area */}
      <div className={`${styles.dark} ${plain ? styles.plain : ''}`}>
        {/* Decorative cream swoosh lines */}
        <svg
          className={styles.lines}
          viewBox="0 0 1200 220"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M-80,170 C180,90 500,175 820,112 C1020,72 1120,138 1280,96"
            fill="none"
            stroke="#F6E8D8"
            strokeWidth="2"
            opacity="0.22"
          />
          <path
            d="M-80,192 C240,145 560,192 880,155 C1060,132 1165,162 1280,136"
            fill="none"
            stroke="#F6E8D8"
            strokeWidth="1.2"
            opacity="0.14"
          />
        </svg>

        {/* Text */}
        <div
          className={`${styles.text} ${
            hasPhoto
              ? photoSide === 'right'
                ? styles.textPhotoRight
                : styles.textPhotoLeft
              : ''
          }`}
        >
          <h2 className={styles.title}>{title.toUpperCase()}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {/* Wave bottom — white fill creates organic edge */}
        <svg
          className={styles.wave}
          viewBox="0 0 1200 72"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,72 L0,40 C160,10 320,58 500,30 C680,2 840,52 1010,24 C1080,10 1150,42 1200,20 L1200,72 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      {/* Circular photo — positioned on wrapper, overlaps dark area boundary */}
      {hasPhoto && (
        <div
          className={`${styles.photo} ${photoSide === 'left' ? styles.photoLeft : styles.photoRight}`}
        >
          <img src={imageUrl!} alt="" />
        </div>
      )}
    </div>
  );
}
