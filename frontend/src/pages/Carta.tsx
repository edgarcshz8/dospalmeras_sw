import { useEffect, useState } from 'react';
import api from '../api/client';
import type { MenuSection, DailyMenu } from '../types';
import './Carta.css';

function formatPrice(price: number | null) {
  if (price == null) return '';
  return '$ ' + price.toLocaleString('es-CL');
}

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
      <div className="carta-loading">
        <div className="carta-loading-dot" />
      </div>
    );
  }

  return (
    <div className="carta-page">

      {/* ── Hero ── */}
      <header className="carta-hero">
        <div className="carta-hero-inner">
          <p className="carta-tagline">Bienvenidos a</p>
          <h1 className="carta-title">Dos Palmeras</h1>
          <div className="carta-ornament">
            <span className="carta-orn-line" />
            <span className="carta-orn-gem">◆</span>
            <span className="carta-orn-line" />
          </div>
          <p className="carta-subtitle">Carta de menú</p>
        </div>
      </header>

      <main className="carta-main">

        {/* ── Menú del Día ── */}
        {dailyMenus.length > 0 && (
          <section className="carta-block">
            <div className="carta-sec-head carta-sec-head--flat">
              <div className="carta-sec-rule">
                <span className="carta-sec-line" />
                <h2 className="carta-sec-name">Menú del Día</h2>
                <span className="carta-sec-line" />
              </div>
            </div>

            <div className="carta-daily-grid">
              {dailyMenus.map(dm => (
                <article key={dm.id} className="carta-daily-card">
                  <header className="carta-daily-card-head">
                    <span className="carta-daily-label">Menú {dm.slot_number}</span>
                    {dm.price != null && (
                      <span className="carta-daily-price">{formatPrice(dm.price)}</span>
                    )}
                  </header>
                  {dm.title && (
                    <p className="carta-daily-title">{dm.title}</p>
                  )}
                  {dm.description && (
                    <p className="carta-daily-desc">{dm.description}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── Secciones ── */}
        {sections.map(section => (
          <section key={section.id} className="carta-block">

            {section.image_url ? (
              <div
                className="carta-sec-head carta-sec-head--image"
                style={{ backgroundImage: `url(${section.image_url})` }}
              >
                <div className="carta-sec-overlay">
                  <h2 className="carta-sec-name carta-sec-name--over">
                    {section.name.toUpperCase()}
                  </h2>
                </div>
              </div>
            ) : (
              <div className="carta-sec-head carta-sec-head--flat">
                <div className="carta-sec-rule">
                  <span className="carta-sec-line" />
                  <h2 className="carta-sec-name">{section.name.toUpperCase()}</h2>
                  <span className="carta-sec-line" />
                </div>
              </div>
            )}

            <div className="carta-items">
              {section.items && section.items.length > 0 ? (
                section.items.map(item => (
                  <div key={item.id} className="carta-item">
                    <div className="carta-item-body">
                      <span className="carta-item-name">{item.name}</span>
                      {item.description && (
                        <span className="carta-item-desc">{item.description}</span>
                      )}
                    </div>
                    {item.price != null && (
                      <span className="carta-item-price">{formatPrice(item.price)}</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="carta-empty">Próximamente</p>
              )}
            </div>

          </section>
        ))}

      </main>

      <footer className="carta-footer">
        <div className="carta-ornament carta-ornament--sm">
          <span className="carta-orn-line" />
          <span className="carta-orn-gem">◆</span>
          <span className="carta-orn-line" />
        </div>
        <p className="carta-footer-name">Restaurante Dos Palmeras</p>
        <p className="carta-footer-note">Todos los precios incluyen IVA</p>
      </footer>

    </div>
  );
}
