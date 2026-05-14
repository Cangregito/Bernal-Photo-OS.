import type { Metadata } from "next";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ThemeProvider } from "@/presentation/providers/ThemeProvider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: 'Bernal Photo — Fotógrafo de Bodas en Ciudad Juárez',
    template: '%s | Bernal Photo',
  },
  description: 'Fotografía profesional de bodas, retratos y eventos en Ciudad Juárez, Chihuahua. Estilo editorial con integridad documental SHA-256.',
  keywords: ['fotógrafo de bodas', 'Ciudad Juárez', 'fotografía profesional', 'Chihuahua', 'boda', 'retrato', 'editorial'],
  authors: [{ name: 'Jassiel Bernal', url: 'https://bernalphoto.com' }],
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'Bernal Photo',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("h-full antialiased", "font-sans", geist.variable)} suppressHydrationWarning>
      <body className="h-full font-sans bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "wq4ujtey0j");
          `}
        </Script>
        <SpeedInsights />
      </body>
    </html>
  );
}
