export const metadata = {
  title: 'Flywheel AI',
  description: 'Enterprise AI Digital Intelligence Platform'
}

import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
