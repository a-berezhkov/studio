
import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; // Correct import names based on convention
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const geistSans = Geist({ // Use correct constructor
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap', // Added for font display strategy
});

const geistMono = Geist_Mono({ // Use correct constructor
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap', // Added for font display strategy
});

export const metadata: Metadata = {
  title: 'Classroom Navigator',
  description: 'Manage laptops and student assignments in a classroom.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> {/* Added suppressHydrationWarning for potential theme mismatches during development */}
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}> {/* Use font-sans as a fallback */}
        {children}
        <Toaster /> {/* Add Toaster here */}
      </body>
    </html>
  );
}
