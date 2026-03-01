import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Inter pour le corps du texte (lisible et moderne)
const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Domelia.fr - Le logement vient à vous",
  description: "Sur Domelia, publiez votre recherche de logement. Les bons logements vous contactent. Une nouvelle façon de trouver son chez-soi.",
  keywords: ["location", "logement", "appartement", "colocation", "locataire", "propriétaire", "France"],
  authors: [{ name: "Domelia" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Domelia.fr - Le logement vient à vous",
    description: "Publiez votre recherche. Les bons logements vous contactent.",
    url: "https://domelia.fr",
    siteName: "Domelia",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Domelia.fr - Le logement vient à vous",
    description: "Publiez votre recherche. Les bons logements vous contactent.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Script pour éviter le flash de thème au chargement */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  if (theme === 'dark' || (!theme && systemDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Fallback noscript - Landing page fonctionnelle sans JS */}
        <noscript>
          <div style={{ background: "#FAFCFF", padding: "60px 20px", textAlign: "center", fontFamily: "Inter, sans-serif" }}>
            <h1 style={{ color: "#1E293B", marginBottom: "16px", fontSize: "2rem" }}>Domelia.fr</h1>
            <p style={{ color: "#475569", maxWidth: "600px", margin: "0 auto 24px", fontSize: "1.1rem" }}>
              Le logement vient à vous. Publiez votre recherche — les bons logements vous contactent.
            </p>
            <a 
              href="/je-cherche" 
              style={{ 
                background: "#560591", 
                color: "white", 
                padding: "14px 32px", 
                borderRadius: "12px", 
                textDecoration: "none",
                fontWeight: 600,
                display: "inline-block",
                fontSize: "1rem"
              }}
            >
              Créer mon profil gratuit
            </a>
          </div>
        </noscript>
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
