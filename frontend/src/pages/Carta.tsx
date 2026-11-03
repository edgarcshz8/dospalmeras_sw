import { useEffect, useState } from 'react';
import api from '../api/client';
import type { MenuSection, DailyMenu } from '../types';
import './Carta.css';

function formatPrice(price: number | null) {
  if (price == null) return '';
  return '$ ' + price.toLocaleString('es-CL');
}

const WAVE = (
  <svg className="mp-wave" viewBox="0 0 1200 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,0 L1200,0 L1200,14 Q900,52 600,32 Q300,12 0,48 Z" fill="#1e1e1e" />
  </svg>
);

/* Onda inferior orgánica multi-peak del header */
const SEC_WAVE_BOTTOM = (
  <svg className="mp-sec-wave-btm" viewBox="0 0 1200 68" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,68 L0,46 C180,14 340,64 520,36 C700,8 860,58 1040,28 C1110,18 1160,36 1200,22 L1200,68 Z" fill="#f2f0eb" />
  </svg>
);

const DOTS = (
  <div className="mp-dots">
    {[0,1,2,3,4].map(i => <span key={i} className="mp-dot" />)}
  </div>
);

export default function Carta() {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [dailyMenus, setDailyMenus] = useState<DailyMenu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<MenuSection[]>('/api/sections/public'),
      api.get<DailyMenu[]>('/api/daily-menu/today'),
    ]).then(([secRes, dmRes]) => {
      setSections(secRes.data);
      setDailyMenus(dmRes.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mp-loading">
        <div className="mp-spinner" />
      </div>
    );
  }

  return (
    <div className="mp-page">
      {/* ══ COVER ══ */}
      <header className="mp-cover">
        <div className="mp-cover-inner">
          <h1 className="mp-cover-name">Dos Palmeras</h1>
          <p className="mp-cover-tagline">Carta de menú</p>
        </div>
        {WAVE}
      </header>

      <main className="mp-main">

        {/* ══ MENÚ DEL DÍA ══ */}
        {dailyMenus.length > 0 && (
          <div className="mp-section">
            <div className="mp-sec-header mp-sec-header--plain">
              <div className="mp-sec-text">
                <h2 className="mp-sec-title">Menú del Día</h2>
                <p className="mp-sec-sub">Fresco y nutritivo</p>
              </div>
              {SEC_WAVE_BOTTOM}
            </div>
            {DOTS}
            <div className="mp-sec-body">
              <div className="mp-grid">
                {dailyMenus.map(dm => (
                  <div key={dm.id} className="mp-item">
                    <div className="mp-item-info">
                      <p className="mp-item-name">
                        Menú {dm.slot_number}{dm.title ? ` — ${dm.title}` : ''}
                      </p>
                      {dm.description && (
                        <p className="mp-item-desc">{dm.description}</p>
                      )}
                    </div>
                    {dm.price != null && (
                      <span className="mp-badge">{formatPrice(dm.price)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ SECCIONES ══ */}
        {sections.map(section => (
          <div key={section.id} className="mp-section">
            <div className={`mp-sec-header${section.image_url ? '' : ' mp-sec-header--plain'}`}>
              <div className="mp-sec-text">
                <h2 className="mp-sec-title">{section.name.toUpperCase()}</h2>
                <p className="mp-sec-sub">Sabor y tradición</p>
              </div>
              {section.image_url && (
                <div className="mp-sec-photo">
                  <img src={section.image_url} alt={section.name} />
                </div>
              )}
              {SEC_WAVE_BOTTOM}
            </div>
            {DOTS}
            <div className="mp-sec-body">
              {section.items && section.items.length > 0 ? (
                <div className="mp-grid">
                  {section.items.map(item => (
                    <div key={item.id} className="mp-item">
                      <div className="mp-item-info">
                        <p className="mp-item-name">{item.name}</p>
                        {item.description && (
                          <p className="mp-item-desc">{item.description}</p>
                        )}
                      </div>
                      {item.price != null && (
                        <span className="mp-badge">{formatPrice(item.price)}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mp-empty">Próximamente</p>
              )}
            </div>
          </div>
        ))}

      </main>

      <footer className="mp-footer">
        <p className="mp-footer-brand">Dos Palmeras</p>
        <p className="mp-footer-note">Todos los precios incluyen IVA</p>
      </footer>

    </div>
  );
}
