import { index, layout, route } from '@react-router/dev/routes'

export default [
  layout('./components/layout/Layout.jsx', [
    index('./pages/Home.jsx'),
    route('articles/:slug', './pages/ArticlePage.jsx'),
    route('sidebar/:page', './pages/SidebarPage.jsx'),
    route('*', './pages/ErrorPage.jsx')
  ])
]
