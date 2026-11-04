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

// ── Daily Menu Card ───────────────────────────────────────────────────────────

interface DailyMenuCardProps {
  menu: DailyMenu;
  onUpdated: (m: DailyMenu) => void;
  onDeleted: (id: number) => void;
}

function DailyMenuCard({ menu, onUpdated, onDeleted }: DailyMenuCardProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(menu.title ?? '');
  const [desc, setDesc] = useState(menu.description ?? '');
  const [price, setPrice] = useState(menu.price?.toString() ?? '');
  const [toggling, setToggling] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(menu.title ?? '');
    setDesc(menu.description ?? '');
    setPrice(menu.price?.toString() ?? '');
    setEditing(false);
  }, [menu.id]);

  const toggle = async () => {
    setToggling(true);
    try {
      const res = await api.patch<DailyMenu>(`/api/daily-menu/${menu.id}`, {
        is_active: !menu.is_active,
      });
      onUpdated(res.data);
    } catch {
      // 401 handled by interceptor
    } finally {
      setToggling(false);
    }
  };

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await api.put<DailyMenu>(`/api/daily-menu/${menu.id}`, {
        title: title.trim(),
        description: desc.trim() || null,
        price: price ? parseInt(price.replace(/\D/g, '')) : null,
      });
      onUpdated(res.data);
      setEditing(false);
    } catch {
      // 401 handled by interceptor
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!confirm(`¿Eliminar "${menu.title}"?`)) return;
    try {
      await api.delete(`/api/daily-menu/${menu.id}`);
      onDeleted(menu.id);
    } catch {}
  };

  if (editing) {
    return (
      <div className="dm-card dm-card--editing">
        <input
          className="dm-input"
          placeholder="Nombre del menú *"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
        <textarea
          className="dm-textarea"
          placeholder="Descripción (opcional)"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={2}
        />
        <input
          className="dm-input dm-input--price"
          placeholder="Precio (ej: 4500)"
          value={price}
          onChange={e => setPrice(e.target.value)}
        />
        <div className="dm-form-actions">
          <button className="btn-save" onClick={save} disabled={saving || !title.trim()}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
          <button className="btn-cancel" onClick={() => setEditing(false)}>Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`dm-card ${menu.is_active ? 'dm-card--on' : 'dm-card--off'}`}>
      <button
        className="dm-toggle"
        onClick={toggle}
        disabled={toggling}
        title={menu.is_active ? 'Desactivar' : 'Activar'}
      >
        <span className={`dm-toggle-track ${menu.is_active ? 'dm-toggle-track--on' : ''}`}>
          <span className="dm-toggle-thumb" />
        </span>
        <span className="dm-toggle-label">
          {menu.is_active ? 'Activo' : 'Inactivo'}
        </span>
      </button>

      <div className="dm-card-info">
        <span className="dm-card-title">{menu.title ?? `Menú ${menu.slot_number}`}</span>
        {menu.description && <span className="dm-card-desc">{menu.description}</span>}
        {menu.price != null && <span className="dm-card-price">{formatPrice(menu.price)}</span>}
      </div>

      <div className="dm-card-actions">
        <button className="btn-icon" onClick={() => setEditing(true)} title="Editar">✏️</button>
        <button className="btn-icon btn-icon--del" onClick={del} title="Eliminar">🗑️</button>
      </div>
    </div>
  );
}

// ── Add Daily Menu Form ───────────────────────────────────────────────────────

interface AddDailyMenuFormProps {
  onAdded: (m: DailyMenu) => void;
  onClose: () => void;
}

function AddDailyMenuForm({ onAdded, onClose }: AddDailyMenuFormProps) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await api.post<DailyMenu>('/api/daily-menu', {
        title: title.trim(),
        description: desc.trim() || null,
        price: price ? parseInt(price.replace(/\D/g, '')) : null,
      });
      onAdded(res.data);
    } catch {
      // 401 handled by interceptor
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dm-add-form">
      <input
        className="dm-input"
        placeholder="Nombre del menú *"
        value={title}
        onChange={e => setTitle(e.target.value)}
        autoFocus
      />
      <textarea
        className="dm-textarea"
        placeholder="Descripción (opcional)"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        rows={2}
      />
      <input
        className="dm-input dm-input--price"
        placeholder="Precio (ej: 4500)"
        value={price}
        onChange={e => setPrice(e.target.value)}
      />
      <div className="dm-form-actions">
        <button className="btn-save" onClick={save} disabled={saving || !title.trim()}>
          {saving ? 'Guardando…' : 'Crear Menú'}
        </button>
        <button className="btn-cancel" onClick={onClose}>Cancelar</button>
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
    } catch {
      // 401 handled by response interceptor
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!confirm(`¿Eliminar "${item.name}"?`)) return;
    try {
      await api.delete(`/api/items/${item.id}`);
      onDeleted(item.id);
    } catch {}
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
    } catch {
      // 401 handled by response interceptor
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
    try {
      const res = await api.get<MenuItem[]>(`/api/items?sectionId=${section.id}`);
      setItems(res.data);
      setLoadedItems(true);
    } catch {}
  };

  const toggle = async () => {
    if (!open) await loadItems();
    setOpen(p => !p);
  };

  const saveName = async () => {
    if (!newName.trim()) return;
    try {
      const res = await api.put<MenuSection>(`/api/sections/${section.id}`, { name: newName.trim() });
      onUpdated(res.data);
      setEditingName(false);
    } catch {}
  };

  const delSection = async () => {
    if (!confirm(`¿Eliminar sección "${section.name}" y todos sus ítems?`)) return;
    try {
      await api.delete(`/api/sections/${section.id}`);
      onDeleted(section.id);
    } catch {}
  };

  const uploadImage = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const validType = allowedTypes.includes(file.type);
    const validExt  = allowedExts.includes(ext);
    if (!validType && !validExt) {
      alert('Formato no compatible. Solo se permiten imágenes JPG, PNG, GIF o WEBP.');
      return;
    }
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
    } catch {
      // 401 handled by response interceptor
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
            accept=".jpg,.jpeg,.png,.gif,.webp"
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
  const [dailyMenus, setDailyMenus] = useState<DailyMenu[]>([]);
  const [addingMenu, setAddingMenu] = useState(false);
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [newSectionName, setNewSectionName] = useState('');
  const [addingSection, setAddingSection] = useState(false);

  useEffect(() => {
    api.get<MenuSection[]>('/api/sections').then(r => setSections(r.data)).catch(() => {});
    api.get<DailyMenu[]>('/api/daily-menu').then(r => setDailyMenus(r.data)).catch(() => {});
  }, []);

  const doLogout = () => { logout(); navigate('/login'); };

  const addSection = async () => {
    if (!newSectionName.trim()) return;
    const maxOrder = sections.reduce((m, s) => Math.max(m, s.display_order), 0);
    try {
      const res = await api.post<MenuSection>('/api/sections', {
        name: newSectionName.trim(),
        display_order: maxOrder + 1,
      });
      setSections(prev => [...prev, res.data]);
      setNewSectionName('');
      setAddingSection(false);
    } catch {}
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <span className="admin-logo">Dos Palmeras</span>
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

        {/* Menú del Día */}
        <section className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">🗓 Menú del Día</h2>
            <button className="btn-add-section" onClick={() => setAddingMenu(p => !p)}>
              {addingMenu ? 'Cancelar' : '+ Nuevo Menú'}
            </button>
          </div>
          <p className="admin-hint">
            Activa o desactiva cada menú para controlar qué aparece hoy en la carta.
            Los menús creados aquí son permanentes y puedes reutilizarlos cualquier día.
          </p>

          {addingMenu && (
            <AddDailyMenuForm
              onAdded={dm => { setDailyMenus(prev => [...prev, dm]); setAddingMenu(false); }}
              onClose={() => setAddingMenu(false)}
            />
          )}

          <div className="dm-list">
            {dailyMenus.length === 0 && !addingMenu && (
              <p className="dm-empty">No hay menús creados aún. Agrega el primero con el botón de arriba.</p>
            )}
            {dailyMenus.map(dm => (
              <DailyMenuCard
                key={dm.id}
                menu={dm}
                onUpdated={updated => setDailyMenus(prev => prev.map(d => d.id === updated.id ? updated : d))}
                onDeleted={id => setDailyMenus(prev => prev.filter(d => d.id !== id))}
              />
            ))}
          </div>
        </section>

        {/* Secciones */}
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
