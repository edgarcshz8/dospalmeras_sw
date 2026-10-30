export interface MenuItem {
  id: number;
  section_id: number;
  name: string;
  description: string | null;
  price: number | null;
  display_order: number;
  is_active: boolean;
}

export interface MenuSection {
  id: number;
  name: string;
  display_order: number;
  image_url: string | null;
  is_active: boolean;
  items?: MenuItem[];
}

export interface DailyMenu {
  id: number;
  slot_number: number;
  date: string;
  title: string | null;
  description: string | null;
  price: number | null;
  is_active: boolean;
}

export interface User {
  id: number;
  username: string;
}
