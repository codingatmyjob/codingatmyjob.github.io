export function createPageMeta({ title, description, canonical, image, type = 'website', imageAlt }) {
  const descriptors = [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: canonical },
    { property: 'og:type', content: type },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: canonical },
    { property: 'og:image', content: image },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image }
  ]

  if (imageAlt) descriptors.push({ property: 'og:image:alt', content: imageAlt })

  return descriptors
}
