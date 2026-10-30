import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import type { DailyMenu, MenuSection, MenuItem } from '../types';
import './Admin.css';

function formatPrice(p: number | null) {
  if (p == null) return '';
  return '$' + p.toLocaleString('es-CL');
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// ── Daily Menu Slot ──────────────────────────────────────────────────────────

interface SlotProps {
  slotNum: number;
  date: string;
  existing: DailyMenu | undefined;
  onSaved: (dm: DailyMenu) => void;
  onDeleted: (id: number) => void;
}

function DailySlot({ slotNum, date, existing, onSaved, onDeleted }: SlotProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [desc, setDesc] = useState(existing?.description ?? '');
  const [price, setPrice] = useState(existing?.price?.toString() ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(existing?.title ?? '');
    setDesc(existing?.description ?? '');
    setPrice(existing?.price?.toString() ?? '');
    setEditing(false);
  }, [existing, date]);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await api.post<DailyMenu>('/api/daily-menu', {
        slot_number: slotNum,
        date,
        title: title.trim(),
        description: desc.trim() || null,
        price: price ? parseInt(price.replace(/\D/g, '')) : null,
      });
      onSaved(res.data);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!existing || !confirm('¿Eliminar este menú?')) return;
    await api.delete(`/api/daily-menu/${existing.id}`);
    onDeleted(existing.id);
    setTitle(''); setDesc(''); setPrice('');
  };

  if (!editing && !existing) {
    return (
      <button className="slot-add" onClick={() => setEditing(true)}>
        <span className="slot-add-num">Menú {slotNum}</span>
        <span className="slot-add-icon">+</span>
        <span className="slot-add-label">Agregar</span>
      </button>
    );
  }

  if (editing || !existing) {
    return (
      <div className="slot-form">
        <div className="slot-form-header">Menú {slotNum}</div>
        <input
          className="slot-input"
          placeholder="Nombre del menú *"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
        <textarea
          className="slot-textarea"
          placeholder="Descripción (opcional)"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={2}
        />
        <input
          className="slot-input"
          placeholder="Precio (ej: 4500)"
          value={price}
          onChange={e => setPrice(e.target.value)}
        />
        <div className="slot-form-actions">
          <button className="btn-save" onClick={save} disabled={saving || !title.trim()}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
          <button className="btn-cancel" onClick={() => setEditing(false)}>Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="slot-card">
      <div className="slot-card-num">Menú {slotNum}</div>
      <div className="slot-card-title">{existing.title}</div>
      {existing.description && (
        <div className="slot-card-desc">{existing.description}</div>
      )}
      {existing.price != null && (
        <div className="slot-card-price">{formatPrice(existing.price)}</div>
      )}
      <div className="slot-card-actions">
        <button className="btn-edit-sm" onClick={() => setEditing(true)}>Editar</button>
        <button className="btn-del-sm" onClick={del}>Eliminar</button>
      </div>
    </div>
  );
}

// ── Item Row ─────────────────────────────────────────────────────────────────

interface ItemRowProps {
  item: MenuItem;
  onUpdated: (item: MenuItem) => void;
  onDeleted: (id: number) => void;
}

function ItemRow({ item, onUpdated, onDeleted }: ItemRowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [desc, setDesc] = useState(item.description ?? '');
  const [price, setPrice] = useState(item.price?.toString() ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put<MenuItem>(`/api/items/${item.id}`, {
        name: name.trim(),
        description: desc.trim() || null,
        price: price ? parseInt(price.replace(/\D/g, '')) : null,
      });
      onUpdated(res.data);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!confirm(`¿Eliminar "${item.name}"?`)) return;
    await api.delete(`/api/items/${item.id}`);
    onDeleted(item.id);
  };

  if (editing) {
    return (
      <div className="item-edit-row">
        <input
          className="item-input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nombre *"
          autoFocus
        />
        <input
          className="item-input"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Descripción"
        />
        <input
          className="item-input item-input--price"
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="Precio"
        />
        <div className="item-edit-actions">
          <button className="btn-save-sm" onClick={save} disabled={saving || !name.trim()}>
            {saving ? '…' : '✓'}
          </button>
          <button className="btn-cancel-sm" onClick={() => { setEditing(false); setName(item.name); setDesc(item.description ?? ''); setPrice(item.price?.toString() ?? ''); }}>✕</button>
        </div>
      </div>
    );
  }

  return (
    <div className="item-row">
      <div className="item-row-info">
        <span className="item-row-name">{item.name}</span>
        {item.description && <span className="item-row-desc">{item.description}</span>}
      </div>
      <div className="item-row-right">
        {item.price != null && <span className="item-row-price">{formatPrice(item.price)}</span>}
        <button className="btn-icon" onClick={() => setEditing(true)} title="Editar">✏️</button>
        <button className="btn-icon btn-icon--del" onClick={del} title="Eliminar">🗑️</button>
      </div>
    </div>
  );
}

// ── Add Item Form ─────────────────────────────────────────────────────────────

interface AddItemFormProps {
  sectionId: number;
  onAdded: (item: MenuItem) => void;
}

function AddItemForm({ sectionId, onAdded }: AddItemFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await api.post<MenuItem>('/api/items', {
        section_id: sectionId,
        name: name.trim(),
        description: desc.trim() || null,
        price: price ? parseInt(price.replace(/\D/g, '')) : null,
      });
      onAdded(res.data);
      setName(''); setDesc(''); setPrice('');
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button className="btn-add-item" onClick={() => setOpen(true)}>+ Agregar ítem</button>
    );
  }

  return (
    <div className="add-item-form">
      <input className="item-input" placeholder="Nombre *" value={name} onChange={e => setName(e.target.value)} autoFocus />
      <input className="item-input" placeholder="Descripción" value={desc} onChange={e => setDesc(e.target.value)} />
      <input className="item-input item-input--price" placeholder="Precio (ej: 3500)" value={price} onChange={e => setPrice(e.target.value)} />
      <div className="item-edit-actions">
        <button className="btn-save" onClick={save} disabled={saving || !name.trim()}>{saving ? 'Guardando…' : 'Agregar'}</button>
        <button className="btn-cancel" onClick={() => setOpen(false)}>Cancelar</button>
      </div>
    </div>
  );
}

// ── Section Accordion ─────────────────────────────────────────────────────────

interface SectionAccordionProps {
  section: MenuSection;
  onUpdated: (s: MenuSection) => void;
  onDeleted: (id: number) => void;
}

function SectionAccordion({ section, onUpdated, onDeleted }: SectionAccordionProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loadedItems, setLoadedItems] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(section.name);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadItems = async () => {
    if (loadedItems) return;
    const res = await api.get<MenuItem[]>(`/api/items?sectionId=${section.id}`);
    setItems(res.data);
    setLoadedItems(true);
  };

  const toggle = async () => {
    if (!open) await loadItems();
    setOpen(p => !p);
  };

  const saveName = async () => {
    if (!newName.trim()) return;
    const res = await api.put<MenuSection>(`/api/sections/${section.id}`, { name: newName.trim() });
    onUpdated(res.data);
    setEditingName(false);
  };

  const delSection = async () => {
    if (!confirm(`¿Eliminar sección "${section.name}" y todos sus ítems?`)) return;
    await api.delete(`/api/sections/${section.id}`);
    onDeleted(section.id);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await api.post<{ image_url: string; section: MenuSection }>(
        `/api/upload/section/${section.id}`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      onUpdated(res.data.section);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`section-accordion ${open ? 'section-accordion--open' : ''}`}>
      <div className="section-accordion-header">
        <button className="section-toggle" onClick={toggle}>
          <span className="section-toggle-arrow">{open ? '▼' : '▶'}</span>
          {editingName ? (
            <input
              className="section-name-input"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onClick={e => e.stopPropagation()}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
              autoFocus
            />
          ) : (
            <span className="section-name">{section.name}</span>
          )}
        </button>
        <div className="section-header-actions">
          {section.image_url && (
            <img src={section.image_url} alt="" className="section-thumb" />
          )}
          <button
            className="btn-icon"
            title={uploading ? 'Subiendo…' : 'Subir imagen de sección'}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? '⏳' : '🖼️'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }}
          />
          {editingName ? (
            <>
              <button className="btn-save-sm" onClick={saveName}>✓</button>
              <button className="btn-cancel-sm" onClick={() => { setEditingName(false); setNewName(section.name); }}>✕</button>
            </>
          ) : (
            <button className="btn-icon" onClick={() => setEditingName(true)} title="Renombrar">✏️</button>
          )}
          <button className="btn-icon btn-icon--del" onClick={delSection} title="Eliminar sección">🗑️</button>
        </div>
      </div>

      {open && (
        <div className="section-accordion-body">
          {items.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              onUpdated={updated => setItems(prev => prev.map(i => i.id === updated.id ? updated : i))}
              onDeleted={id => setItems(prev => prev.filter(i => i.id !== id))}
            />
          ))}
          <AddItemForm sectionId={section.id} onAdded={item => setItems(prev => [...prev, item])} />
        </div>
      )}
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState(todayISO());
  const [dailyMenus, setDailyMenus] = useState<DailyMenu[]>([]);
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [newSectionName, setNewSectionName] = useState('');
  const [addingSection, setAddingSection] = useState(false);

  useEffect(() => {
    api.get<MenuSection[]>('/api/sections').then(r => setSections(r.data));
  }, []);

  useEffect(() => {
    api.get<DailyMenu[]>(`/api/daily-menu?date=${date}`).then(r => setDailyMenus(r.data));
  }, [date]);

  const doLogout = () => { logout(); navigate('/login'); };

  const addSection = async () => {
    if (!newSectionName.trim()) return;
    const maxOrder = sections.reduce((m, s) => Math.max(m, s.display_order), 0);
    const res = await api.post<MenuSection>('/api/sections', {
      name: newSectionName.trim(),
      display_order: maxOrder + 1,
    });
    setSections(prev => [...prev, res.data]);
    setNewSectionName('');
    setAddingSection(false);
  };

  const handleDailyMenuSaved = (dm: DailyMenu) => {
    setDailyMenus(prev => {
      const exists = prev.find(d => d.id === dm.id);
      if (exists) return prev.map(d => d.id === dm.id ? dm : d);
      return [...prev, dm];
    });
  };

  const handleDailyMenuDeleted = (id: number) => {
    setDailyMenus(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <span className="admin-logo">Don Hernán</span>
          <span className="admin-header-sep">|</span>
          <span className="admin-header-title">Panel de Administración</span>
        </div>
        <div className="admin-header-right">
          <a href="/" target="_blank" className="btn-view-carta">Ver Carta ↗</a>
          <span className="admin-user">👤 {user?.username}</span>
          <button className="btn-logout" onClick={doLogout}>Salir</button>
        </div>
      </header>

      <div className="admin-body">
        {/* Daily Menu */}
        <section className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">🗓 Menú del Día</h2>
            <div className="daily-date-picker">
              <label htmlFor="menu-date">Fecha:</label>
              <input
                id="menu-date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
              <button className="btn-today" onClick={() => setDate(todayISO())}>Hoy</button>
            </div>
          </div>
          <p className="admin-hint">Agrega hasta 5 menús del día. Solo los que completes aparecen en la carta.</p>
          <div className="daily-slots">
            {[1, 2, 3, 4, 5].map(n => (
              <DailySlot
                key={n}
                slotNum={n}
                date={date}
                existing={dailyMenus.find(d => d.slot_number === n)}
                onSaved={handleDailyMenuSaved}
                onDeleted={handleDailyMenuDeleted}
              />
            ))}
          </div>
        </section>

        {/* Sections */}
        <section className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">📋 Secciones del Menú</h2>
            <button className="btn-add-section" onClick={() => setAddingSection(p => !p)}>
              {addingSection ? 'Cancelar' : '+ Nueva Sección'}
            </button>
          </div>

          {addingSection && (
            <div className="add-section-form">
              <input
                className="section-name-input-main"
                placeholder="Nombre de la sección"
                value={newSectionName}
                onChange={e => setNewSectionName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addSection(); }}
                autoFocus
              />
              <button className="btn-save" onClick={addSection} disabled={!newSectionName.trim()}>
                Crear Sección
              </button>
            </div>
          )}

          <div className="sections-list">
            {sections.map(section => (
              <SectionAccordion
                key={section.id}
                section={section}
                onUpdated={updated => setSections(prev => prev.map(s => s.id === updated.id ? updated : s))}
                onDeleted={id => setSections(prev => prev.filter(s => s.id !== id))}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
