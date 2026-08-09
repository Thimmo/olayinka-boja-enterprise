export type Product = {
  id: string
  code: string
  name: string
  price: number | null
  category: string | null
  image_path: string
  in_stock: boolean
  created_at: string
}

export type NewProduct = Pick<
  Product,
  'name' | 'price' | 'category' | 'image_path' | 'in_stock'
>

/**
 * Fabric types she sells, offered as suggestions in the upload form. The list
 * is only a shortcut — the field accepts anything she types, and the filter
 * chips on the storefront are built from what is actually in the catalogue.
 */
export const FABRIC_SUGGESTIONS = [
  'Lace',
  'Ankara',
  'Aso Oke',
  'Adire',
  'George',
  'Guinea Brocade',
  'Damask',
  'Chiffon',
  'Silk',
  'Atiku',
  'Cashmere',
  'Senator',
  'Velvet',
  'Organza',
] as const
