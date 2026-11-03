import { useEffect, useRef, useState } from 'react';
import api from '../api/client';
import type { MenuSection, DailyMenu } from '../types';
import styles from './Carta.module.css';
import WaveHeader from '../components/carta/WaveHeader';
import PriceBubble from '../components/carta/PriceBubble';
import DecorativeDots from '../components/carta/DecorativeDots';
import BrushDivider from '../components/carta/BrushDivider';

function formatPrice(price: number | null) {
  if (price == null) return '';
  return '$ ' + price.toLocaleString('es-CL');
}

export default function Carta() {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [dailyMenus, setDailyMenus] = useState<DailyMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    Promise.all([
      api.get<MenuSection[]>('/api/sections/public'),
      api.get<DailyMenu[]>('/api/daily-menu/today'),
    ]).then(([secRes, dmRes]) => {
      setSections(secRes.data);
      setDailyMenus(dmRes.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const container = mainRef.current;
    if (!container) return;

    const items = container.querySelectorAll<Element>('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-reveal', 'visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    items.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ══ COVER ══ */}
      <header className={styles.cover}>
        <div className={styles.coverInner}>
          <h1 className={styles.coverName}>Dos Palmeras</h1>
          <p className={styles.coverTagline}>Carta de menú</p>
        </div>
        <svg className={styles.coverWave} viewBox="0 0 1200 48" preserveAspectRatio="none" aria-hidden="true">
          <path className={styles.coverWavePath} d="M0,0 L1200,0 L1200,14 Q900,52 600,32 Q300,12 0,48 Z" />
        </svg>
      </header>

      <main className={styles.main} ref={mainRef}>

        {/* ══ MENÚ DEL DÍA ══ */}
        {dailyMenus.length > 0 && (
          <section className={styles.section}>
            <WaveHeader title="Menú del Día" subtitle="Fresco y nutritivo" plain />
            <DecorativeDots />
            <div className={styles.sectionBody}>
              <div className={styles.grid}>
                {dailyMenus.map((dm, idx) => (
                  <div
                    key={dm.id}
                    className={styles.item}
                    data-reveal=""
                    style={{ transitionDelay: `${idx * 60}ms` }}
                  >
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>
                        Menú {dm.slot_number}{dm.title ? ` — ${dm.title}` : ''}
                      </p>
                      {dm.description && (
                        <p className={styles.itemDesc}>{dm.description}</p>
                      )}
                    </div>
                    {dm.price != null && (
                      <PriceBubble formatted={formatPrice(dm.price)} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ SECCIONES ══ */}
        {sections.map((section, sectionIdx) => (
          <section key={section.id} className={styles.section}>
            <WaveHeader
              title={section.name}
              subtitle="Sabor y tradición"
              imageUrl={section.image_url}
            />
            <DecorativeDots />
            <div className={styles.sectionBody}>
              {section.items && section.items.length > 0 ? (
                <div className={styles.grid}>
                  {section.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={styles.item}
                      data-reveal=""
                      style={{ transitionDelay: `${idx * 50}ms` }}
                    >
                      <div className={styles.itemInfo}>
                        <p className={styles.itemName}>{item.name}</p>
                        {item.description && (
                          <p className={styles.itemDesc}>{item.description}</p>
                        )}
                      </div>
                      {item.price != null && (
                        <PriceBubble formatted={formatPrice(item.price)} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.empty}>Próximamente</p>
              )}
            </div>
            {sectionIdx < sections.length - 1 && <BrushDivider />}
          </section>
        ))}

      </main>

      <footer className={styles.footer}>
        <p className={styles.footerBrand}>Dos Palmeras</p>
        <p className={styles.footerNote}>Todos los precios incluyen IVA</p>
      </footer>
    </div>
  );
}
