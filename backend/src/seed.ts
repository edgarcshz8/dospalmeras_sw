import bcrypt from 'bcryptjs';
import pool from './db';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const client = await pool.connect();
  try {
    // ── Paso 1: crear tablas si no existen (idempotente, sin transacción) ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_sections (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        display_order INTEGER NOT NULL DEFAULT 0,
        image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        section_id INTEGER NOT NULL REFERENCES menu_sections(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price INTEGER,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_menus (
        id SERIAL PRIMARY KEY,
        slot_number INTEGER NOT NULL CHECK (slot_number BETWEEN 1 AND 5),
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        title VARCHAR(200),
        description TEXT,
        price INTEGER,
        is_active BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(slot_number, date)
      )
    `);
    console.log('✓ Tablas verificadas/creadas en la base de datos configurada');

    await client.query('BEGIN');

    // ── Paso 2: insertar datos solo si la BD está vacía ──
    const check = await client.query('SELECT COUNT(*) FROM menu_items');
    if (parseInt(check.rows[0].count) > 0) {
      console.log('✓ Datos ya existentes, saltando seed de ítems');
      await client.query('COMMIT');
      return;
    }

    const hash = await bcrypt.hash('admin123', 10);
    await client.query(
      `INSERT INTO users (username, password_hash) VALUES ('admin', $1) ON CONFLICT (username) DO NOTHING`,
      [hash]
    );
    console.log('Usuario admin creado (user: admin, pass: admin123)');

    const sections = [
      { name: 'Platos Preparados', order: 1 },
      { name: 'Desayuno', order: 2 },
      { name: 'Sándwich', order: 3 },
      { name: 'Empanadas', order: 4 },
      { name: 'Cafetería', order: 5 },
      { name: 'Bebidas', order: 6 },
      { name: 'Jugos Naturales', order: 7 },
      { name: 'Pastelería', order: 8 },
    ];

    const sectionIds: Record<string, number> = {};

    for (const s of sections) {
      const res = await client.query(
        `INSERT INTO menu_sections (name, display_order) VALUES ($1, $2)
         ON CONFLICT DO NOTHING RETURNING id, name`,
        [s.name, s.order]
      );
      if (res.rows[0]) sectionIds[s.name] = res.rows[0].id;
    }

    const existing = await client.query('SELECT id, name FROM menu_sections');
    existing.rows.forEach(r => { sectionIds[r.name] = r.id; });

    interface SeedItem {
      name: string;
      description?: string;
      price?: number | null;
    }

    const platosItems: SeedItem[] = [
      { name: 'Gohan Pollo', price: 6950 },
      { name: 'Gohan Camarón', price: 6950 },
      { name: 'Ensalada Atún', price: 4490 },
      { name: 'Ensalada Palmitos', price: 4200 },
      { name: 'Consomé' },
      { name: 'Extra Almuerzo' },
    ];

    const desayunoItems: SeedItem[] = [
      { name: 'Paila con 2 Huevos' },
      { name: 'Paila con 3 Huevos' },
      { name: 'Extra Jamón' },
      { name: 'Extra Queso' },
    ];

    const sandwichItems: SeedItem[] = [
      { name: 'Croissant Jamón Queso' },
      { name: 'Croissant Pollo Pimentón' },
      { name: 'Pan con Huevo' },
      { name: 'Pan Jamón Queso' },
      { name: 'Barros Luco' },
      { name: 'Miga Ave Mayo' },
      { name: 'Miga Ave Pimentón' },
      { name: 'Miga Jamón Queso' },
      { name: 'Miga Vegetariano' },
    ];

    const empanadasItems: SeedItem[] = [
      { name: 'Queso Hoja' },
      { name: 'Jamón Queso Hoja' },
    ];

    const cafeteriaItems: SeedItem[] = [
      { name: 'Espresso', description: 'Intenso y concentrado.', price: 2200 },
      { name: 'Macchiato', description: 'Espresso con espuma.', price: 2400 },
      { name: 'Americano', description: 'Espresso con agua caliente.', price: 2800 },
      { name: 'Cappuccino', description: 'Espresso, leche y espuma.', price: 3000 },
      { name: 'Mocaccino', description: 'Espresso, chocolate y leche.', price: 3500 },
      { name: 'Vienes', description: 'Con crema batida.', price: 4000 },
      { name: 'Latte', description: 'Mucha leche, poca espuma.', price: 3400 },
      { name: 'Espresso Doble', description: 'Doble intensidad.', price: 2800 },
      { name: 'Latte Doble', description: 'Versión grande.', price: 3900 },
      { name: 'Cappuccino Doble', description: 'Más placer.', price: 3500 },
      { name: 'Americano Doble', description: 'Formato grande.', price: 3300 },
      { name: 'Mocaccino Doble', description: 'Doble chocolate.', price: 4000 },
      { name: 'Chocolate Caliente', description: 'Cremoso.', price: 3500 },
      { name: 'Coffee Tonic', description: 'Espresso y tónica.', price: 3500 },
      { name: 'Lungo', description: 'Extracción larga.', price: 2200 },
      { name: 'Ristretto', description: 'Extracción corta.', price: 2200 },
      { name: 'Macchiato Doble', description: 'Doble manchado.', price: 2900 },
      { name: 'Marley Espresso' },
      { name: 'Marley Mediano' },
      { name: 'Marley Grande' },
      { name: 'Nescafé Espresso' },
      { name: 'Nescafé Mediano' },
      { name: 'Nescafé Grande' },
    ];

    const bebidasItems: SeedItem[] = [
      { name: '1/2 Litro Variedades' },
      { name: 'Jugo Watts Botella Individual' },
      { name: 'Jugo del Valle Botella Individual' },
      { name: 'Bebida Lata' },
      { name: 'Agua Mineral 1/2 Litro' },
      { name: 'Agua Mineral 1,6 Litros' },
      { name: 'Agua Mineral 330 cc' },
      { name: 'Cachantún Más 1/2 Litro' },
      { name: 'Jumex Sabores 335 cc' },
      { name: 'Guallarauco 500 cc' },
      { name: 'Aloe Sabores', price: 1850 },
      { name: 'Lipton 600 cc' },
      { name: 'Monster' },
      { name: 'Red Bull 250 cc' },
      { name: 'Red Bull 355 cc' },
    ];

    const jugosItems: SeedItem[] = [
      { name: 'Chirimoya' },
      { name: 'Piña' },
      { name: 'Melón Tuna' },
      { name: 'Arándanos' },
      { name: 'Mango' },
      { name: 'Maracuyá' },
      { name: 'Frutilla' },
      { name: 'Limonada' },
    ];

    const allGroups = [
      { sectionName: 'Platos Preparados', items: platosItems },
      { sectionName: 'Desayuno', items: desayunoItems },
      { sectionName: 'Sándwich', items: sandwichItems },
      { sectionName: 'Empanadas', items: empanadasItems },
      { sectionName: 'Cafetería', items: cafeteriaItems },
      { sectionName: 'Bebidas', items: bebidasItems },
      { sectionName: 'Jugos Naturales', items: jugosItems },
    ];

    for (const group of allGroups) {
      const sectionId = sectionIds[group.sectionName];
      if (!sectionId) continue;
      for (let i = 0; i < group.items.length; i++) {
        const item = group.items[i];
        await client.query(
          `INSERT INTO menu_items (section_id, name, description, price, display_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [sectionId, item.name, item.description || null, item.price ?? null, i]
        );
      }
      console.log(`  ✓ ${group.items.length} ítems en "${group.sectionName}"`);
    }

    await client.query('COMMIT');
    console.log('\n✅ Seed completado exitosamente');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error en seed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
