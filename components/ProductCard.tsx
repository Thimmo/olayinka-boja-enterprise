import Image from 'next/image'
import Link from 'next/link'
import { BuyNowButton } from '@/components/BuyNowButton'
import { formatPrice, imageUrl } from '@/lib/format'
import type { Product } from '@/lib/types'

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product
  priority?: boolean
}) {
  const price = formatPrice(product.price)

  return (
    <article className="card">
      <Link
        className="card-frame"
        href={`/product/${product.id}`}
        aria-label={product.name}
      >
        <Image
          src={imageUrl(product.image_path)}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 260px, (min-width: 640px) 33vw, 50vw"
          priority={priority}
        />
        <span className="card-code">{product.code}</span>
        {!product.in_stock ? <span className="sold-out">Sold out</span> : null}
      </Link>

      <div className="card-body">
        <h2 className="card-name">{product.name}</h2>
        {price ? (
          <p className="card-price">{price}</p>
        ) : (
          <p className="card-price ask">Ask for price</p>
        )}
        {product.category ? (
          <p className="card-category">{product.category}</p>
        ) : null}
        <BuyNowButton product={product} />
      </div>
    </article>
  )
}
