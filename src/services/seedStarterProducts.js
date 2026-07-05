import { products as legacyProducts } from '../data/products'
import * as categoriesService from './categoriesService'
import * as productsService from './productsService'

// Run once from the Dashboard's "Import starter products" button.
// Maps the old category string (e.g. "kitchen") to the seeded category's id,
// and renames `image` -> `image_url` to match the products table schema.
export async function seedStarterProducts() {
  const categories = await categoriesService.getAll()
  const slugToId = Object.fromEntries(categories.map((c) => [c.slug, c.id]))

  for (const legacy of legacyProducts) {
    const { id, category, image, ...rest } = legacy
    await productsService.create({
      ...rest,
      image_url: image,
      category_id: slugToId[category] || null,
      is_published: true,
    })
  }
}
