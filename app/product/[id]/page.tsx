import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BuyNowButton } from '@/components/BuyNowButton'
import { Footer } from '@/components/Footer'
import { Masthead } from '@/components/Masthead'
import { STORE_NAME } from '@/lib/env'
import { formatPrice, imageUrl } from '@/lib/format'
import { createPublicClient } from '@/lib/supabase/public'
import type { Product } from '@/lib/types'

export const revalidate = 60

type Props = { params: Promise<{ id: string }> }

async function getProduct(id: string): Promise<Product | null> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return (data as Product) ?? null
}

/**
 * These tags are the reason the fabric photo shows up in her chat. WhatsApp
 * reads them from the link in the message and renders a preview card.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return { title: `Fabric not found — ${STORE_NAME}` }

  const price = formatPrice(product.price)
  const description = [product.category, price, product.code]
    .filter(Boolean)
    .join(' · ')

  return {
    title: `${product.name} — ${STORE_NAME}`,
    description,
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      images: [{ url: imageUrl(product.image_path), width: 1200, height: 1500 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: [imageUrl(product.image_path)],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const price = formatPrice(product.price)

  return (
    <>
      <Masthead />
      <main className="detail">
        <Link className="back" href="/">
          ← All fabrics
        </Link>

        <div className="detail-layout">
          <div className="detail-frame">
            <Image
              src={imageUrl(product.image_path)}
              alt={product.name}
              fill
              sizes="(min-width: 768px) 480px, 100vw"
              priority
            />
            {!product.in_stock ? (
              <span className="sold-out">Sold out</span>
            ) : null}
          </div>

          <div>
            <p className="detail-eyebrow">Item {product.code}</p>
            <h1>{product.name}</h1>
            {price ? (
              <p className="detail-price">{price}</p>
            ) : (
              <p className="detail-price ask">Ask for price</p>
            )}

            <BuyNowButton
              product={product}
              label={product.in_stock ? 'Buy now' : 'Ask about this fabric'}
            />
            <p className="detail-note">
              Opens WhatsApp with this fabric and its item code already written
              out. You can add your questions before sending.
            </p>

            <dl className="spec">
              {product.category ? (
                <div>
                  <dt>Fabric</dt>
                  <dd>{product.category}</dd>
                </div>
              ) : null}
              <div>
                <dt>Item code</dt>
                <dd>{product.code}</dd>
              </div>
              <div>
                <dt>Availability</dt>
                <dd>{product.in_stock ? 'In stock' : 'Sold out'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
