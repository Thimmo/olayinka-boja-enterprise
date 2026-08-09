'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { compressImage, storagePathFor } from '@/lib/compress'
import { formatPrice, imageUrl } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import { FABRIC_SUGGESTIONS, type Product } from '@/lib/types'

type Draft = {
  key: string
  file: File
  preview: string
  name: string
  price: string
  category: string
}

type Status =
  | { kind: 'idle' }
  | { kind: 'preparing'; done: number; total: number }
  | { kind: 'publishing'; done: number; total: number }
  | { kind: 'done'; count: number; unnamed: number }
  | { kind: 'error'; message: string }

export function AdminClient({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const fileInput = useRef<HTMLInputElement>(null)

  const [products, setProducts] = useState(initialProducts)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [bulkCategory, setBulkCategory] = useState('')

  // Object URLs hold memory until revoked, and with hundreds of photos that
  // adds up. A ref tracks the live set so the unmount cleanup sees the current
  // previews rather than the empty array from first render.
  const previews = useRef(new Set<string>())
  useEffect(() => {
    const urls = previews.current
    return () => {
      for (const url of urls) URL.revokeObjectURL(url)
      urls.clear()
    }
  }, [])

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return

    const files = [...fileList].filter((file) => file.type.startsWith('image/'))
    setStatus({ kind: 'preparing', done: 0, total: files.length })

    const prepared: Draft[] = []
    for (const [index, file] of files.entries()) {
      const compressed = await compressImage(file)
      const preview = URL.createObjectURL(compressed)
      previews.current.add(preview)
      prepared.push({
        key: `${Date.now()}-${index}-${file.name}`,
        file: compressed,
        preview,
        name: '',
        price: '',
        category: bulkCategory,
      })
      setStatus({ kind: 'preparing', done: index + 1, total: files.length })
    }

    setDrafts((current) => [...current, ...prepared])
    setStatus({ kind: 'idle' })
    if (fileInput.current) fileInput.current.value = ''
  }

  function updateDraft(key: string, patch: Partial<Draft>) {
    setDrafts((current) =>
      current.map((draft) => (draft.key === key ? { ...draft, ...patch } : draft)),
    )
  }

  function removeDraft(key: string) {
    setDrafts((current) => {
      const target = current.find((draft) => draft.key === key)
      if (target) {
        URL.revokeObjectURL(target.preview)
        previews.current.delete(target.preview)
      }
      return current.filter((draft) => draft.key !== key)
    })
  }

  function applyCategoryToAll(value: string) {
    setBulkCategory(value)
    setDrafts((current) => current.map((draft) => ({ ...draft, category: value })))
  }

  async function publish() {
    const ready = drafts.filter((draft) => draft.name.trim())
    if (ready.length === 0) {
      setStatus({ kind: 'error', message: 'Give each fabric a name before publishing.' })
      return
    }

    setStatus({ kind: 'publishing', done: 0, total: ready.length })
    const published: Product[] = []
    const failed: string[] = []

    for (const [index, draft] of ready.entries()) {
      const path = storagePathFor(draft.file)

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(path, draft.file, { contentType: 'image/jpeg', upsert: false })

      if (uploadError) {
        failed.push(draft.name)
        setStatus({ kind: 'publishing', done: index + 1, total: ready.length })
        continue
      }

      const { data, error: insertError } = await supabase
        .from('products')
        .insert({
          name: draft.name.trim(),
          price: draft.price.trim() ? Number(draft.price) : null,
          category: draft.category.trim() || null,
          image_path: path,
        })
        .select()
        .single()

      if (insertError || !data) {
        // The row failed, so the photo has nothing pointing at it. Remove it
        // rather than leave it filling up storage.
        await supabase.storage.from('products').remove([path])
        failed.push(draft.name)
      } else {
        published.push(data as Product)
        removeDraft(draft.key)
      }

      setStatus({ kind: 'publishing', done: index + 1, total: ready.length })
    }

    setProducts((current) => [...published, ...current])
    router.refresh()

    if (failed.length > 0) {
      setStatus({
        kind: 'error',
        message: `${published.length} published. These did not upload: ${failed.join(', ')}. They are still listed below, so you can try again.`,
      })
      return
    }

    const unnamed = drafts.length - ready.length
    setStatus({ kind: 'done', count: published.length, unnamed })
  }

  async function toggleStock(product: Product) {
    const next = !product.in_stock
    setProducts((current) =>
      current.map((item) =>
        item.id === product.id ? { ...item, in_stock: next } : item,
      ),
    )
    const { error } = await supabase
      .from('products')
      .update({ in_stock: next })
      .eq('id', product.id)

    if (error) {
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, in_stock: !next } : item,
        ),
      )
      setStatus({ kind: 'error', message: 'Could not save that change.' })
    } else {
      router.refresh()
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Remove ${product.name} (${product.code}) from the site? This cannot be undone.`,
    )
    if (!confirmed) return

    const { error } = await supabase.from('products').delete().eq('id', product.id)
    if (error) {
      setStatus({ kind: 'error', message: 'Could not remove that fabric.' })
      return
    }

    await supabase.storage.from('products').remove([product.image_path])
    setProducts((current) => current.filter((item) => item.id !== product.id))
    router.refresh()
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <main className="admin">
      <div className="admin-bar">
        <div>
          <h1>Your fabrics</h1>
          <p className="panel-note">
            {products.length} on the site
          </p>
        </div>
        <div className="admin-bar-actions">
          <a className="ghost-link" href="/" target="_blank" rel="noopener noreferrer">
            View site
          </a>
          <button className="ghost-link" type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>

      <div className="selvedge" aria-hidden="true" />

      <section className="panel">
        <h2>Add fabrics</h2>
        <p className="panel-note">
          Pick as many photos as you like. They are made smaller automatically,
          so they upload quickly on mobile data.
        </p>

        <input
          ref={fileInput}
          id="photos"
          type="file"
          accept="image/*"
          multiple
          className="visually-hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
        <label className="primary as-button" htmlFor="photos">
          Choose photos
        </label>

        {status.kind === 'preparing' ? (
          <p className="progress" role="status">
            Getting photos ready… {status.done} of {status.total}
          </p>
        ) : null}
        {status.kind === 'publishing' ? (
          <p className="progress" role="status">
            Publishing… {status.done} of {status.total}
          </p>
        ) : null}
        {status.kind === 'done' ? (
          <p className="notice" role="status">
            {status.count} {status.count === 1 ? 'fabric is' : 'fabrics are'} now on the site.
            {status.unnamed > 0
              ? ` ${status.unnamed} still ${status.unnamed === 1 ? 'needs a name' : 'need names'} before publishing.`
              : ''}
          </p>
        ) : null}
        {status.kind === 'error' ? (
          <p className="alert" role="alert">
            {status.message}
          </p>
        ) : null}

        {drafts.length > 0 ? (
          <>
            <label className="field bulk">
              <span>Fabric type for all {drafts.length}</span>
              <input
                list="fabric-types"
                value={bulkCategory}
                onChange={(event) => applyCategoryToAll(event.target.value)}
                placeholder="Lace, Ankara, Aso Oke…"
              />
            </label>

            <ul className="drafts">
              {drafts.map((draft) => (
                <li key={draft.key} className="draft">
                  {/* Local blob preview, so next/image would only add overhead. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={draft.preview} alt="" className="draft-thumb" />
                  <div className="draft-fields">
                    <label className="field">
                      <span>Name</span>
                      <input
                        value={draft.name}
                        onChange={(event) =>
                          updateDraft(draft.key, { name: event.target.value })
                        }
                        placeholder="Swiss voile lace"
                      />
                    </label>
                    <div className="field-row">
                      <label className="field">
                        <span>Price (₦)</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          step="100"
                          value={draft.price}
                          onChange={(event) =>
                            updateDraft(draft.key, { price: event.target.value })
                          }
                          placeholder="Leave blank to ask"
                        />
                      </label>
                      <label className="field">
                        <span>Type</span>
                        <input
                          list="fabric-types"
                          value={draft.category}
                          onChange={(event) =>
                            updateDraft(draft.key, { category: event.target.value })
                          }
                        />
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="draft-remove"
                    onClick={() => removeDraft(draft.key)}
                    aria-label={`Remove photo ${draft.name || 'without a name'}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <button
              className="primary"
              type="button"
              onClick={publish}
              disabled={status.kind === 'publishing' || status.kind === 'preparing'}
            >
              Publish {drafts.length} {drafts.length === 1 ? 'fabric' : 'fabrics'}
            </button>
          </>
        ) : null}
      </section>

      <datalist id="fabric-types">
        {FABRIC_SUGGESTIONS.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      <section className="panel">
        <h2>On the site</h2>
        {products.length === 0 ? (
          <p className="panel-note">Nothing published yet.</p>
        ) : (
          <ul className="listing">
            {products.map((product) => (
              <li key={product.id} className="listing-row">
                <Image
                  src={imageUrl(product.image_path)}
                  alt=""
                  width={56}
                  height={70}
                  className="listing-thumb"
                />
                <div className="listing-text">
                  <p className="listing-name">{product.name}</p>
                  <p className="listing-meta">
                    {product.code}
                    {product.category ? ` · ${product.category}` : ''}
                    {product.price !== null ? ` · ${formatPrice(product.price)}` : ' · Ask for price'}
                  </p>
                </div>
                <div className="listing-actions">
                  <button
                    type="button"
                    className="stock"
                    data-sold={!product.in_stock}
                    onClick={() => toggleStock(product)}
                    aria-label={`${product.name} is ${product.in_stock ? 'in stock' : 'sold out'}. Tap to change.`}
                  >
                    {product.in_stock ? 'In stock' : 'Sold out'}
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => deleteProduct(product)}
                    aria-label={`Remove ${product.name}`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
