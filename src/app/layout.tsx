import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Flint Global Talent CRM',
  description: 'Specialized healthcare recruitment CRM',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <Sidebar />
        <main className="ml-64 min-h-screen">
          {children}
        </main>
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#fff',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
          }} 
        />
      </body>
    </html>
  );
}
