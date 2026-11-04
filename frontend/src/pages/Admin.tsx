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
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(menu.title ?? '');
    setDesc(menu.description ?? '');
    setPrice(menu.price?.toString() ?? '');
    setEditing(false);
  }, [menu.id]);

  const uploadImage = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jfif'];
    const allowedExts = ['.jpg', '.jpeg', '.jfif', '.png', '.gif', '.webp'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      alert('Solo se permiten imágenes JPG, PNG, GIF o WEBP.');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await api.post<{ image_url: string; menu: DailyMenu }>(
        `/api/upload/daily-menu/${menu.id}`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      onUpdated(res.data.menu);
    } catch {
      // 401 handled by interceptor
    } finally {
      setUploading(false);
    }
  };

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

      {menu.image_url
        ? <img src={menu.image_url} alt="" className="dm-thumb" />
        : <div className="dm-thumb dm-thumb--empty" />
      }

      <div className="dm-card-info">
        <span className="dm-card-title">{menu.title ?? `Menú ${menu.slot_number}`}</span>
        {menu.description && <span className="dm-card-desc">{menu.description}</span>}
        {menu.price != null && <span className="dm-card-price">{formatPrice(menu.price)}</span>}
      </div>

      <div className="dm-card-actions">
        <button
          className="btn-icon"
          title={uploading ? 'Subiendo…' : 'Subir foto'}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? '⏳' : '🖼️'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.jfif,.png,.gif,.webp"
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }}
        />
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
  const [newSubtitle, setNewSubtitle] = useState(section.subtitle ?? '');
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
      const res = await api.put<MenuSection>(`/api/sections/${section.id}`, {
        name: newName.trim(),
        subtitle: newSubtitle.trim() || null,
      });
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jfif'];
    const allowedExts = ['.jpg', '.jpeg', '.jfif', '.png', '.gif', '.webp'];
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
            <div className="section-edit-fields" onClick={e => e.stopPropagation()}>
              <input
                className="section-name-input"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                placeholder="Nombre de sección *"
                autoFocus
              />
              <input
                className="section-name-input section-subtitle-input"
                value={newSubtitle}
                onChange={e => setNewSubtitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                placeholder="Subtítulo (opcional)"
              />
            </div>
          ) : (
            <div className="section-name-group">
              <span className="section-name">{section.name}</span>
              {section.subtitle && <span className="section-subtitle-label">{section.subtitle}</span>}
            </div>
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
            accept=".jpg,.jpeg,.jfif,.png,.gif,.webp"
            style={{ display: 'none' }}
            onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }}
          />
          {editingName ? (
            <>
              <button className="btn-save-sm" onClick={saveName}>✓</button>
              <button className="btn-cancel-sm" onClick={() => { setEditingName(false); setNewName(section.name); setNewSubtitle(section.subtitle ?? ''); }}>✕</button>
            </>
          ) : (
            <button className="btn-icon" onClick={() => setEditingName(true)} title="Editar">✏️</button>
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

  const printMenu = async () => {
    let secs: MenuSection[] = [];
    try {
      const res = await api.get<MenuSection[]>('/api/sections/public');
      secs = res.data;
    } catch {
      alert('Error al cargar los datos de la carta.');
      return;
    }

    const origin = window.location.origin;
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const fmt = (p: number) => '$ ' + p.toLocaleString('es-CL');

    const getSub = (name: string): string => {
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
    };

    const linesSvg = '<svg class="lines-svg" viewBox="0 0 1200 220" preserveAspectRatio="none" aria-hidden="true">'
      + '<path d="M-80,170 C180,90 500,175 820,112 C1020,72 1120,138 1280,96" fill="none" stroke="#F6E8D8" stroke-width="2" opacity="0.22"/>'
      + '<path d="M-80,192 C240,145 560,192 880,155 C1060,132 1165,162 1280,136" fill="none" stroke="#F6E8D8" stroke-width="1.2" opacity="0.14"/>'
      + '</svg>';

    const waveSvg = '<svg class="wave-svg" viewBox="0 0 1200 72" preserveAspectRatio="none" aria-hidden="true">'
      + '<path d="M0,72 L0,40 C160,10 320,58 500,30 C680,2 840,52 1010,24 C1080,10 1150,42 1200,20 L1200,72 Z" fill="#FFFFFF"/>'
      + '</svg>';

    const dots = '<div class="dots-row"><span class="dot-lg"></span><span class="dot-md"></span><span class="dot-sm"></span></div>';

    const renderItems = (items: MenuItem[]) => {
      if (!items.length) return '<p class="empty">Próximamente</p>';
      const mid = Math.ceil(items.length / 2);
      const left = items.slice(0, mid);
      const right = items.slice(mid);
      const colHtml = (col: MenuItem[]) => col.map(it =>
        '<div class="item">'
        + '<div class="item-info">'
        + '<span class="item-name">' + esc(it.name) + '</span>'
        + (it.description ? '<span class="item-desc">' + esc(it.description) + '</span>' : '')
        + '</div>'
        + (it.price != null ? '<span class="price-bubble">' + fmt(it.price) + '</span>' : '')
        + '</div>'
      ).join('');
      return right.length
        ? '<div class="cols"><div class="col col-l">' + colHtml(left) + '</div><div class="col col-r">' + colHtml(right) + '</div></div>'
        : '<div class="cols"><div class="col">' + colHtml(left) + '</div></div>';
    };

    const renderDailyItems = (items: DailyMenu[]) => {
      if (!items.length) return '';
      const mid = Math.ceil(items.length / 2);
      const left = items.slice(0, mid);
      const right = items.slice(mid);
      const colHtml = (col: DailyMenu[]) => col.map(dm =>
        '<div class="dm-item">'
        + (dm.image_url ? '<img class="dm-thumb" src="' + dm.image_url + '" alt=""/>' : '')
        + '<div class="item-info">'
        + '<span class="item-name">' + esc(dm.title ?? ('Menú ' + dm.slot_number)) + '</span>'
        + (dm.description ? '<span class="item-desc">' + esc(dm.description) + '</span>' : '')
        + '</div>'
        + (dm.price != null ? '<span class="price-bubble">' + fmt(dm.price) + '</span>' : '')
        + '</div>'
      ).join('');
      return right.length
        ? '<div class="cols"><div class="col col-l">' + colHtml(left) + '</div><div class="col col-r">' + colHtml(right) + '</div></div>'
        : '<div class="cols"><div class="col">' + colHtml(left) + '</div></div>';
    };

    let photoCounter = 0;
    const sectionSides = new Map<number, 'left' | 'right'>();
    for (const s of secs) {
      if (/sugerencia|chef/i.test(s.name)) {
        sectionSides.set(s.id, 'right');
      } else {
        sectionSides.set(s.id, photoCounter % 2 === 0 ? 'right' : 'left');
        photoCounter++;
      }
    }

    const sectionsHtml = secs.map(s => {
      if (/sugerencia|chef/i.test(s.name)) {
        return '<div class="section">'
          + '<div class="chef-band">'
          + '<p class="chef-etiqueta">✦ Sugerencias del Chef ✦</p>'
          + '<h2 class="chef-title">' + esc(s.name.toUpperCase()) + '</h2>'
          + '<p class="chef-sub">Lo mejor de nuestra cocina</p>'
          + '</div>'
          + dots
          + '<div class="sec-body">' + renderItems(s.items ?? []) + '</div>'
          + '</div>';
      }
      const side = sectionSides.get(s.id) ?? 'right';
      const sub = esc(s.subtitle ?? getSub(s.name));
      const hasPhoto = !!s.image_url;
      const photoHtml = hasPhoto
        ? '<div class="photo-circle ' + (side === 'left' ? 'photo-left' : 'photo-right') + '">'
          + '<img src="' + s.image_url! + '" alt=""/>'
          + '</div>'
        : '';
      const textCls = hasPhoto
        ? ('text-block ' + (side === 'right' ? 'text-photo-right' : 'text-photo-left'))
        : 'text-block';
      return '<div class="section">'
        + '<div class="wave-wrapper">'
        + '<div class="dark">'
        + linesSvg
        + '<div class="' + textCls + '">'
        + '<h2 class="sec-title">' + esc(s.name.toUpperCase()) + '</h2>'
        + '<p class="sec-subtitle">' + sub + '</p>'
        + '</div>'
        + waveSvg
        + '</div>'
        + photoHtml
        + '</div>'
        + dots
        + '<div class="sec-body">' + renderItems(s.items ?? []) + '</div>'
        + '</div>';
    }).join('');

    const dailyHtml = dailyMenus.length > 0
      ? '<div class="section">'
        + '<div class="wave-wrapper">'
        + '<div class="dark dark-plain">'
        + linesSvg
        + '<div class="text-block">'
        + '<h2 class="sec-title">MENÚ DEL DÍA</h2>'
        + '<p class="sec-subtitle">Fresco y nutritivo</p>'
        + '</div>'
        + waveSvg
        + '</div>'
        + '</div>'
        + dots
        + '<div class="sec-body">' + renderDailyItems(dailyMenus) + '</div>'
        + '</div>'
      : '';

    const css = [
      '*{box-sizing:border-box;margin:0;padding:0}',
      'body{font-family:\'Poppins\',sans-serif;color:#211B1A;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}',
      '.cover{background:#211B1A;text-align:center;padding:60px 24px 0;overflow:hidden}',
      '.cover-inner{padding-bottom:48px}',
      '.cover-logo{height:130px;width:auto;display:block;margin:0 auto 16px;filter:invert(1);mix-blend-mode:screen}',
      '.cover-tagline{font-size:.65rem;letter-spacing:.42em;text-transform:uppercase;color:rgba(246,232,216,.3);font-weight:300}',
      '.section{margin-top:36px}',
      '.wave-wrapper{position:relative}',
      '.dark{background:#211B1A;min-height:195px;position:relative;overflow:hidden}',
      '.dark-plain{min-height:148px}',
      '.lines-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}',
      '.text-block{padding:26px 40px 76px;position:relative;z-index:2}',
      '.text-photo-right{padding-right:210px}',
      '.text-photo-left{padding-left:210px}',
      '.sec-title{font-family:\'Montserrat\',sans-serif;font-weight:900;font-size:2.3rem;color:#F6E8D8;text-transform:uppercase;line-height:.93;letter-spacing:-.01em;margin:0}',
      '.sec-subtitle{font-family:\'Allura\',cursive;font-size:1.5rem;color:#ED0712;margin-top:8px}',
      '.wave-svg{position:absolute;bottom:0;left:0;width:100%;height:72px;display:block}',
      '.photo-circle{position:absolute;top:12px;width:160px;height:160px;border-radius:50%;border:4px solid #F6E8D8;overflow:hidden;z-index:10;box-shadow:0 6px 24px rgba(0,0,0,.38)}',
      '.photo-right{right:20px}',
      '.photo-left{left:20px}',
      '.photo-circle img{width:100%;height:100%;object-fit:cover;display:block}',
      '.dots-row{display:flex;align-items:center;gap:7px;padding:10px 40px 6px;background:#fff}',
      '.dot-lg{width:11px;height:11px;border-radius:50%;background:#211B1A;opacity:.85;display:block;flex-shrink:0}',
      '.dot-md{width:8px;height:8px;border-radius:50%;background:#211B1A;opacity:.65;display:block;flex-shrink:0}',
      '.dot-sm{width:5px;height:5px;border-radius:50%;background:#211B1A;opacity:.45;display:block;flex-shrink:0}',
      '.sec-body{padding:18px 40px 32px;background:#fff}',
      '.cols{display:flex;gap:0}',
      '.col{flex:1;min-width:0}',
      '.col-l{padding-right:22px;border-right:1.5px solid rgba(237,7,18,.28)}',
      '.col-r{padding-left:22px}',
      '.item{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px dashed rgba(81,75,73,.18)}',
      '.item:last-child{border-bottom:none}',
      '.item-info{flex:1;min-width:0}',
      '.item-name{font-family:\'Montserrat\',sans-serif;font-weight:700;font-size:.87rem;color:#ED0712;display:block;line-height:1.3;margin-bottom:3px}',
      '.item-desc{font-weight:300;font-size:.7rem;color:#514B49;display:block;line-height:1.55}',
      '.price-bubble{flex-shrink:0;display:inline-block;background:#ED0712;color:#fff;font-family:\'Montserrat\',sans-serif;font-weight:700;font-size:.72rem;padding:5px 11px 6px;border-radius:50px;white-space:nowrap;min-width:60px;text-align:center;align-self:flex-start;margin-top:3px}',
      '.dm-item{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px dashed rgba(81,75,73,.18)}',
      '.dm-item:last-child{border-bottom:none}',
      '.dm-thumb{width:50px;height:50px;border-radius:50%;object-fit:cover;border:2px solid #ED0712;flex-shrink:0}',
      '.chef-band{background:#211B1A;text-align:center;padding:34px 40px 30px;overflow:hidden}',
      '.chef-etiqueta{font-family:\'Allura\',cursive;font-size:1.4rem;color:#ED0712;margin:0 0 6px}',
      '.chef-title{font-family:\'Montserrat\',sans-serif;font-weight:900;font-size:2.3rem;color:#F6E8D8;text-transform:uppercase;letter-spacing:-.01em;line-height:.95;margin:0 0 8px}',
      '.chef-sub{font-family:\'Allura\',cursive;font-size:1.2rem;color:#ED0712;opacity:.75;margin:0}',
      '.empty{font-size:.72rem;color:#bbb;font-style:italic;text-align:center;padding:20px 0}',
      '.footer-wrap{background:#211B1A;text-align:center;padding:36px 24px 44px;margin-top:44px}',
      '.footer-logo{height:60px;width:auto;display:block;margin:0 auto 10px;filter:invert(1);mix-blend-mode:screen}',
      '.footer-note{font-size:.6rem;letter-spacing:.28em;text-transform:uppercase;color:rgba(246,232,216,.3)}',
      '@media print{*{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important}@page{size:A4;margin:8mm}.wave-wrapper{page-break-inside:avoid}}',
    ].join('\n');

    const printScript = '<script>'
      + 'document.fonts.ready.then(function(){'
      + '  window.focus();'
      + '  window.print();'
      + '});'
      + '<\/script>';

    const printBtnCss = '.print-btn{'
      + 'position:fixed;top:14px;right:16px;z-index:9999;'
      + 'background:#ED0712;color:#fff;border:none;cursor:pointer;'
      + 'font-family:\'Montserrat\',sans-serif;font-weight:700;font-size:.8rem;'
      + 'padding:9px 20px;border-radius:6px;letter-spacing:.04em;'
      + 'box-shadow:0 2px 8px rgba(0,0,0,.25);}'
      + '.print-btn:hover{background:#c40010}'
      + '@media print{.print-btn{display:none}}';

    const html = '<!DOCTYPE html>\n<html lang="es">\n<head>\n'
      + '<meta charset="UTF-8"/>\n'
      + '<title>Carta del Restaurante</title>\n'
      + '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Poppins:wght@300;400&family=Allura&display=swap" rel="stylesheet"/>\n'
      + '<style>\n' + css + '\n' + printBtnCss + '\n</style>\n'
      + '</head>\n<body>\n'
      + '<button class="print-btn" onclick="window.print()">🖨 Guardar PDF</button>\n'
      + '<div class="cover"><div class="cover-inner">'
      + '<img src="' + origin + '/logo_blanco.webp" alt="Logo" class="cover-logo"/>'
      + '<p class="cover-tagline">Carta de menú</p>'
      + '</div></div>\n'
      + dailyHtml + '\n'
      + sectionsHtml + '\n'
      + '<div class="footer-wrap">'
      + '<img src="' + origin + '/logo_blanco.webp" alt="Logo" class="footer-logo"/>'
      + '<p class="footer-note">Todos los precios incluyen IVA</p>'
      + '</div>\n'
      + printScript + '\n'
      + '</body>\n</html>';

    const win = window.open('', '_blank');
    if (!win) {
      alert('El navegador bloqueó la ventana emergente. Permite ventanas emergentes para esta página e intenta de nuevo.');
      return;
    }
    win.document.write(html);
    win.document.close();
  };

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
          <img src="/logo_blanco.webp" alt="La Casona" className="admin-logo-img" />
          <span className="admin-header-sep">|</span>
          <span className="admin-header-title">Panel de Administración</span>
        </div>
        <div className="admin-header-right">
          <button className="btn-print-carta" onClick={printMenu}>🖨 Imprimir Carta</button>
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
