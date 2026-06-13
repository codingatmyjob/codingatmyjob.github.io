import React from 'react'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import ArticlePage from './pages/ArticlePage'
import SidebarPage from './pages/SidebarPage'
import ErrorPage from './pages/ErrorPage'

async function articleLoader({ params }) {
  if (import.meta.env.SSR) {
    const { readFileSync } = await import('fs')
    const { resolve } = await import('path')
    const rawHtml = readFileSync(resolve('public/articles', `${params.slug}.html`), 'utf-8')
    return { rawHtml }
  }
  const base = import.meta.env.BASE_URL || '/'
  const res = await fetch(`${base}articles/${params.slug}.html`)
  const rawHtml = res.ok ? await res.text() : ''
  return { rawHtml }
}

async function sidebarLoader({ params }) {
  if (import.meta.env.SSR) {
    const { readFileSync } = await import('fs')
    const { resolve } = await import('path')
    const rawHtml = readFileSync(resolve('public/sidebar', `${params.page}.html`), 'utf-8')
    return { rawHtml }
  }
  const base = import.meta.env.BASE_URL || '/'
  const res = await fetch(`${base}sidebar/${params.page}.html`)
  const rawHtml = res.ok ? await res.text() : ''
  return { rawHtml }
}

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'articles/:slug', element: <ArticlePage />, loader: articleLoader },
      { path: 'sidebar/:page', element: <SidebarPage />, loader: sidebarLoader },
      { path: '*', element: <ErrorPage /> }
    ]
  }
]

export default routes
