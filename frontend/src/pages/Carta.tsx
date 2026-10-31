import { useEffect, useState } from 'react';
import api from '../api/client';
import type { MenuSection, DailyMenu } from '../types';
import './Carta.css';

function formatPrice(price: number | null) {
  if (price == null) return '';
  return '$' + price.toLocaleString('es-CL');
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
      {/* Hero */}
      <header className="carta-hero">
        <div className="carta-hero-inner">
          <p className="carta-tagline">Bienvenidos a</p>
          <h1 className="carta-title">Dos Palmeras</h1>
          <div className="carta-divider-gold" />
          <p className="carta-subtitle">Carta de menú</p>
        </div>
      </header>

      <main className="carta-main">
        {/* Menú del Día */}
        {dailyMenus.length > 0 && (
          <section className="carta-daily-section">
            <div className="carta-section-header carta-section-header--daily">
              <h2 className="carta-section-title">Menú del Día</h2>
            </div>
            <div className="carta-daily-grid">
              {dailyMenus.map(dm => (
                <div key={dm.id} className="carta-daily-card">
                  <div className="carta-daily-num">Menú {dm.slot_number}</div>
                  {dm.title && <div className="carta-daily-name">{dm.title}</div>}
                  {dm.description && (
                    <div className="carta-daily-desc">{dm.description}</div>
                  )}
                  {dm.price != null && (
                    <div className="carta-daily-price">{formatPrice(dm.price)}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Secciones del menú */}
        {sections.map(section => (
          <section key={section.id} className="carta-section">
            <div
              className="carta-section-header"
              style={
                section.image_url
                  ? { backgroundImage: `url(${section.image_url})` }
                  : undefined
              }
            >
              <div className="carta-section-overlay">
                <h2 className="carta-section-title">{section.name.toUpperCase()}</h2>
              </div>
            </div>

            <div className="carta-items">
              {section.items && section.items.length > 0 ? (
                section.items.map((item, idx) => (
                  <div key={item.id} className={`carta-item ${idx % 2 === 1 ? 'carta-item--alt' : ''}`}>
                    <div className="carta-item-left">
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
        <p>Restaurante Dos Palmeras &mdash; Todos los precios incluyen IVA</p>
      </footer>
    </div>
  );
}
