import { useEffect, useRef, useState } from 'react';
import api from '../api/client';
import type { MenuSection, DailyMenu, MenuItem } from '../types';
import styles from './Carta.module.css';
import WaveHeader from '../components/carta/WaveHeader';
import PriceBubble from '../components/carta/PriceBubble';
import DecorativeDots from '../components/carta/DecorativeDots';

function formatPrice(price: number | null) {
  if (price == null) return '';
  return '$ ' + price.toLocaleString('es-CL');
}

function getSectionSubtitle(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('entrada')) return 'Para comenzar';
  if (n.includes('sopa') || n.includes('caldo')) return 'Caldos y sopas';
  if (n.includes('fondo') || n.includes('segundo') || n.includes('principal')) return 'Platos principales';
  if (n.includes('pollo') || n.includes('ave')) return 'Aves de corral';
  if (n.includes('carne') || n.includes('res')) return 'Carnes a la brasa';
  if (n.includes('pescado') || n.includes('marisco')) return 'Del mar a tu mesa';
  if (n.includes('arroz')) return 'Arroces especiales';
  if (n.includes('pasta')) return 'Pastas artesanales';
  if (n.includes('ensalada')) return 'Ensaladas frescas';
  if (n.includes('postre') || n.includes('dulce')) return 'Dulces finales';
  if (n.includes('bebida') || n.includes('refresco')) return 'Para refrescarse';
  if (n.includes('menú') || n.includes('menu')) return 'Fresco y nutritivo';
  return 'Sabor y tradición';
}

function splitItems<T>(arr: T[]): [T[], T[]] {
  const mid = Math.ceil(arr.length / 2);
  return [arr.slice(0, mid), arr.slice(mid)];
}

interface ProductProps {
  name: string;
  description: string | null;
  price: number | null;
  revealIndex: number;
}

function Product({ name, description, price, revealIndex }: ProductProps) {
  return (
    <div
      className={styles.product}
      data-reveal=""
      style={{ transitionDelay: `${revealIndex * 50}ms` }}
    >
      <div className={styles.productInfo}>
        <p className={styles.productName}>{name}</p>
        {description && <p className={styles.productDesc}>{description}</p>}
      </div>
      {price != null && <PriceBubble formatted={formatPrice(price)} />}
    </div>
  );
}

function SectionProducts({ items }: { items: MenuItem[] }) {
  if (items.length === 0) return null;
  const [left, right] = splitItems(items);
  const hasTwoColumns = right.length > 0;
  return (
    <div className={styles.columnsWrapper}>
      <div className={hasTwoColumns ? `${styles.column} ${styles.columnLeft}` : styles.column}>
        {left.map((item, i) => (
          <Product
            key={item.id}
            name={item.name}
            description={item.description}
            price={item.price}
            revealIndex={i}
          />
        ))}
      </div>
      {hasTwoColumns && (
        <div className={`${styles.column} ${styles.columnRight}`}>
          {right.map((item, i) => (
            <Product
              key={item.id}
              name={item.name}
              description={item.description}
              price={item.price}
              revealIndex={left.length + i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DailyMenuProducts({ items }: { items: DailyMenu[] }) {
  const [left, right] = splitItems(items);
  const hasTwoColumns = right.length > 0;
  return (
    <div className={styles.columnsWrapper}>
      <div className={hasTwoColumns ? `${styles.column} ${styles.columnLeft}` : styles.column}>
        {left.map((dm, i) => (
          <div
            key={dm.id}
            className={styles.product}
            data-reveal=""
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <div className={styles.productInfo}>
              <p className={styles.productName}>
                Menú {dm.slot_number}{dm.title ? ` — ${dm.title}` : ''}
              </p>
              {dm.description && <p className={styles.productDesc}>{dm.description}</p>}
            </div>
            {dm.price != null && <PriceBubble formatted={formatPrice(dm.price)} />}
          </div>
        ))}
      </div>
      {hasTwoColumns && (
        <div className={`${styles.column} ${styles.columnRight}`}>
          {right.map((dm, i) => (
            <div
              key={dm.id}
              className={styles.product}
              data-reveal=""
              style={{ transitionDelay: `${(left.length + i) * 60}ms` }}
            >
              <div className={styles.productInfo}>
                <p className={styles.productName}>
                  Menú {dm.slot_number}{dm.title ? ` — ${dm.title}` : ''}
                </p>
                {dm.description && <p className={styles.productDesc}>{dm.description}</p>}
              </div>
              {dm.price != null && <PriceBubble formatted={formatPrice(dm.price)} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
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

  // Pre-compute photo sides — chef sections don't count in the alternation
  const sectionSides = new Map<number, 'left' | 'right'>();
  let photoSideCounter = 0;
  for (const section of sections) {
    const isChef = /sugerencia|chef/i.test(section.name);
    if (isChef) {
      sectionSides.set(section.id, 'right');
    } else {
      sectionSides.set(section.id, photoSideCounter % 2 === 0 ? 'right' : 'left');
      photoSideCounter++;
    }
  }

  return (
    <div className={styles.page}>

      {/* ══ COVER ══ */}
      <header className={styles.cover}>
        <div className={styles.coverInner}>
          <h1 className={styles.coverName}>Dos Palmeras</h1>
          <p className={styles.coverTagline}>Carta de menú</p>
        </div>
        <svg
          className={styles.coverWave}
          viewBox="0 0 1200 48"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className={styles.coverWavePath}
            d="M0,0 L1200,0 L1200,14 Q900,52 600,32 Q300,12 0,48 Z"
          />
        </svg>
      </header>

      <main className={styles.main} ref={mainRef}>

        {/* ══ MENÚ DEL DÍA ══ */}
        {dailyMenus.length > 0 && (
          <section className={styles.section}>
            <WaveHeader title="Menú del Día" subtitle="Fresco y nutritivo" plain />
            <DecorativeDots />
            <div className={styles.sectionBody}>
              <DailyMenuProducts items={dailyMenus} />
            </div>
          </section>
        )}

        {/* ══ SECCIONES ══ */}
        {sections.map((section) => {
          const isChef = /sugerencia|chef/i.test(section.name);

          if (isChef) {
            return (
              <section key={section.id} className={`${styles.section} ${styles.chefSection}`}>
                <div className={styles.chefBand}>
                  <p className={styles.chefEtiqueta}>✦ Sugerencias del Chef ✦</p>
                  <h2 className={styles.chefTitle}>{section.name.toUpperCase()}</h2>
                  <p className={styles.chefSub}>Lo mejor de nuestra cocina</p>
                </div>
                <DecorativeDots />
                <div className={styles.sectionBody}>
                  {section.items && section.items.length > 0
                    ? <SectionProducts items={section.items} />
                    : <p className={styles.empty}>Próximamente</p>
                  }
                </div>
              </section>
            );
          }

          return (
            <section key={section.id} className={styles.section}>
              <WaveHeader
                title={section.name}
                subtitle={getSectionSubtitle(section.name)}
                imageUrl={section.image_url}
                photoSide={sectionSides.get(section.id)}
              />
              <DecorativeDots />
              <div className={styles.sectionBody}>
                {section.items && section.items.length > 0
                  ? <SectionProducts items={section.items} />
                  : <p className={styles.empty}>Próximamente</p>
                }
              </div>
            </section>
          );
        })}

      </main>

      <footer className={styles.footer}>
        <p className={styles.footerBrand}>Dos Palmeras</p>
        <p className={styles.footerNote}>Todos los precios incluyen IVA</p>
      </footer>
    </div>
  );
}
