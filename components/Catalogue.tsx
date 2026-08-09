'use client'

import { useMemo, useState } from 'react'
import { ProductCard } from '@/components/ProductCard'
import type { Product } from '@/lib/types'

const PAGE = 48

export function Catalogue({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [shown, setShown] = useState(PAGE)

  const categories = useMemo(() => {
    const seen = new Set<string>()
    for (const product of products) {
      if (product.category) seen.add(product.category)
    }
    return [...seen].sort((a, b) => a.localeCompare(b))
  }, [products])

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return products.filter((product) => {
      if (category && product.category !== category) return false
      if (!needle) return true
      return (
        product.name.toLowerCase().includes(needle) ||
        product.code.toLowerCase().includes(needle) ||
        (product.category ?? '').toLowerCase().includes(needle)
      )
    })
  }, [products, query, category])

  // The whole catalogue is already in memory, so filtering is instant and
  // costs no extra data. Only the number of cards on screen is capped, which
  // keeps scrolling smooth on an inexpensive phone.
  const visible = matches.slice(0, shown)

  function changeFilter(next: () => void) {
    next()
    setShown(PAGE)
  }

  return (
    <>
      <div className="controls">
        <div className="search">
          <input
            type="search"
            value={query}
            onChange={(event) =>
              changeFilter(() => setQuery(event.target.value))
            }
            placeholder="Search fabric name or item code"
            aria-label="Search fabrics"
          />
          {query ? (
            <button
              type="button"
              className="search-clear"
              onClick={() => changeFilter(() => setQuery(''))}
              aria-label="Clear search"
            >
              ✕
            </button>
          ) : null}
        </div>

        {categories.length > 0 ? (
          <div className="chips" role="group" aria-label="Filter by fabric type">
            <button
              type="button"
              className="chip"
              aria-pressed={category === null}
              onClick={() => changeFilter(() => setCategory(null))}
            >
              All
            </button>
            {categories.map((name) => (
              <button
                key={name}
                type="button"
                className="chip"
                aria-pressed={category === name}
                onClick={() =>
                  changeFilter(() =>
                    setCategory((current) => (current === name ? null : name)),
                  )
                }
              >
                {name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p className="count" aria-live="polite">
        {matches.length} {matches.length === 1 ? 'fabric' : 'fabrics'}
      </p>

      <div className="grid">
        {visible.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 4}
          />
        ))}

        {matches.length === 0 ? (
          <div className="empty">
            <h2>Nothing matches that</h2>
            <p>Try a different fabric type, or clear the search to see everything.</p>
          </div>
        ) : null}
      </div>

      {shown < matches.length ? (
        <div className="more">
          <button
            type="button"
            className="more-button"
            onClick={() => setShown((current) => current + PAGE)}
          >
            Show more fabrics
            <span>{matches.length - shown} left</span>
          </button>
        </div>
      ) : null}
    </>
  )
}
