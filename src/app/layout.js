import './globals.css';

export const metadata = {
  title: 'Cashflow App - Catatan Keuangan PWA Praktis',
  description: 'Aplikasi catatan keuangan harian (Cashflow) berbasis web. Bisa diakses offline, aman, support export PDF, dan backup data.',
  manifest: '/manifest.json',
  keywords: ['catatan keuangan', 'cashflow pwa', 'aplikasi keuangan gratis', 'pembukuan harian'],
  authors: [{ name: 'Developer' }],
  themeColor: '#0f172a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="bg-slate-50 text-slate-900 min-h-screen">{children}</body>
    </html>
  );
}