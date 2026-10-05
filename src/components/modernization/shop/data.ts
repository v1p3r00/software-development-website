import type { Ware } from '../art';

export interface Glaze {
  name: string;
  hex: string;
}
export type ShopCat = 'bogre' | 'tal' | 'vaza' | 'tea';
export interface Item {
  id: string;
  name: string;
  kind: Ware;
  cat: ShopCat;
  price: number;
  was?: number;
  rating: number;
  reviews: number;
  glazes: Glaze[];
  stock: number;
  isNew?: boolean;
  pop: number;
}

const G = {
  terra: { name: 'Terrakotta', hex: '#c4673f' },
  sage: { name: 'Zsálya', hex: '#7d8f7a' },
  cream: { name: 'Krém', hex: '#e8dccb' },
  night: { name: 'Éjkék', hex: '#3f5b73' },
  sand: { name: 'Homok', hex: '#cdb595' },
  rose: { name: 'Púder', hex: '#dba79b' },
  moss: { name: 'Moha', hex: '#6b7a4a' },
};

export const ITEMS: Item[] = [
  { id: 'reggeli', name: 'Reggeli bögre', kind: 'mug', cat: 'bogre', price: 6900, rating: 4.9, reviews: 212, glazes: [G.terra, G.sage, G.cream, G.night], stock: 24, pop: 10 },
  { id: 'csesze', name: 'Csésze aljjal', kind: 'cup', cat: 'bogre', price: 7900, rating: 4.8, reviews: 96, glazes: [G.cream, G.rose, G.sage], stock: 3, pop: 8 },
  { id: 'gomb', name: 'Gömb váza', kind: 'vase', cat: 'vaza', price: 14900, rating: 4.7, reviews: 58, glazes: [G.sage, G.night, G.sand], stock: 9, isNew: true, pop: 7 },
  { id: 'talka', name: 'Kis tálka', kind: 'bowl', cat: 'tal', price: 5900, rating: 4.8, reviews: 140, glazes: [G.cream, G.terra, G.moss], stock: 31, pop: 9 },
  { id: 'tanyer', name: 'Lapos tányér', kind: 'plate', cat: 'tal', price: 8400, rating: 4.6, reviews: 77, glazes: [G.night, G.cream, G.sand], stock: 18, pop: 6 },
  { id: 'kanna', name: 'Teáskanna', kind: 'teapot', cat: 'tea', price: 18900, rating: 4.9, reviews: 41, glazes: [G.sand, G.sage, G.night], stock: 5, isNew: true, pop: 5 },
  { id: 'kaspo', name: 'Növénykaspó', kind: 'planter', cat: 'vaza', price: 11900, was: 13900, rating: 4.7, reviews: 65, glazes: [G.cream, G.terra, G.sand], stock: 12, pop: 7 },
  { id: 'salata', name: 'Salátás tál', kind: 'bowl', cat: 'tal', price: 12900, rating: 4.8, reviews: 33, glazes: [G.sage, G.cream, G.rose], stock: 7, pop: 4 },
  { id: 'duo', name: 'Bögre duó', kind: 'mug', cat: 'bogre', price: 12500, was: 13800, rating: 4.9, reviews: 88, glazes: [G.night, G.rose, G.moss], stock: 15, pop: 8 },
  { id: 'teacsesze', name: 'Teás csésze', kind: 'cup', cat: 'tea', price: 6400, rating: 4.5, reviews: 27, glazes: [G.sand, G.sage], stock: 2, isNew: true, pop: 3 },
  { id: 'magas', name: 'Magas váza', kind: 'vase', cat: 'vaza', price: 16900, rating: 4.6, reviews: 19, glazes: [G.terra, G.cream], stock: 6, pop: 3 },
  { id: 'reggelitanyer', name: 'Reggeliző tányér', kind: 'plate', cat: 'tal', price: 6900, rating: 4.7, reviews: 51, glazes: [G.sage, G.terra, G.cream], stock: 22, pop: 5 },
];

export const CATS: Array<{ id: ShopCat; label: string; kind: Ware; glaze: string }> = [
  { id: 'bogre', label: 'Bögrék és csészék', kind: 'mug', glaze: '#c4673f' },
  { id: 'tal', label: 'Tálak és tányérok', kind: 'bowl', glaze: '#e8dccb' },
  { id: 'vaza', label: 'Vázák és kaspók', kind: 'vase', glaze: '#7d8f7a' },
  { id: 'tea', label: 'Teázás', kind: 'teapot', glaze: '#cdb595' },
];
