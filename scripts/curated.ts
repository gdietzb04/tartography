import type { EggTartStyle } from "../lib/types";

/**
 * Curated cross-reference list compiled from a web pass over NYC egg tart
 * writeups (stephhlau.substack.com Chinatown taste test, ethnojunkie.com,
 * Yelp and Wanderlog egg tart rankings). Used two ways:
 *  1. Cross-validation: a Places result matching a curated name is kept with
 *     the curated style/flag metadata.
 *  2. Supplement: curated names Places missed are looked up individually.
 */
export interface CuratedShop {
  name: string;
  hint: string; // neighborhood hint appended to the lookup query
  styles: EggTartStyle[];
  dedicated: boolean;
  best: boolean;
}

export const CURATED: CuratedShop[] = [
  { name: "Tao Hong Bakery", hint: "Chinatown Manhattan", styles: ["Hong Kong-style"], dedicated: false, best: true },
  { name: "Luna Cafe and Bakery", hint: "Chinatown Manhattan", styles: ["Hong Kong-style"], dedicated: false, best: false },
  { name: "Tai Pan Bakery", hint: "Chinatown Manhattan", styles: ["Hong Kong-style", "Chinese bakery-style"], dedicated: false, best: true },
  { name: "Tai Pan Bakery", hint: "Flushing", styles: ["Hong Kong-style", "Chinese bakery-style"], dedicated: false, best: false },
  { name: "Mei Lai Wah", hint: "Chinatown Manhattan", styles: ["Chinese bakery-style"], dedicated: false, best: false },
  { name: "Kam Hing Coffee Shop", hint: "Chinatown Manhattan", styles: ["Chinese bakery-style"], dedicated: false, best: false },
  { name: "Fay Da Bakery", hint: "Chinatown Manhattan", styles: ["Chinese bakery-style"], dedicated: false, best: false },
  { name: "Double Crispy Bakery", hint: "Chinatown Manhattan", styles: ["Hong Kong-style"], dedicated: false, best: false },
  { name: "Golden Steamer", hint: "Chinatown Manhattan", styles: ["Chinese bakery-style"], dedicated: false, best: false },
  { name: "Lung Moon Bakery", hint: "Chinatown Manhattan", styles: ["Chinese bakery-style"], dedicated: false, best: false },
  { name: "Xin Fa Bakery", hint: "Sunset Park Brooklyn", styles: ["Hong Kong-style"], dedicated: false, best: true },
  { name: "New Flushing Bakery", hint: "Flushing", styles: ["Hong Kong-style"], dedicated: true, best: true },
  { name: "Sun Mary Bakery", hint: "Flushing", styles: ["Chinese bakery-style"], dedicated: false, best: false },
  { name: "Chiu Hong Bakery", hint: "Chinatown Manhattan", styles: ["Chinese bakery-style"], dedicated: false, best: false },
  { name: "Manna House Bakery", hint: "Chinatown Manhattan", styles: ["Chinese bakery-style"], dedicated: false, best: false },
];
