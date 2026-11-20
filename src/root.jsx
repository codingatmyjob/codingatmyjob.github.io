import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import '../style.css'

const BASE_URL = import.meta.env.BASE_URL

export function Layout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="google-site-verification" content="S7P-3avzu3M7DU8ym41_KkBhDdxsG7npKpoRa-2v400" />
        <link rel="icon" type="image/x-icon" href={`${BASE_URL}favicon/favicon.ico`} />
        <link rel="icon" type="image/png" sizes="16x16" href={`${BASE_URL}favicon/favicon-16x16.png`} />
        <link rel="icon" type="image/png" sizes="32x32" href={`${BASE_URL}favicon/favicon-32x32.png`} />
        <link rel="apple-touch-icon" sizes="180x180" href={`${BASE_URL}favicon/apple-touch-icon.png`} />
        <link rel="icon" type="image/png" sizes="192x192" href={`${BASE_URL}favicon/android-chrome-192x192.png`} />
        <link rel="icon" type="image/png" sizes="512x512" href={`${BASE_URL}favicon/android-chrome-512x512.png`} />
        <link rel="manifest" href={`${BASE_URL}favicon/site.webmanifest`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function () {
              try {
                var saved = localStorage.getItem('theme')
                var systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
                var theme = saved || (systemPrefersDark ? 'dark' : 'light')
                document.documentElement.setAttribute('data-theme', theme)
              } catch (e) {
                document.documentElement.setAttribute('data-theme', 'light')
              }
            })()`
          }}
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function Root() {
  return <Outlet />
}
