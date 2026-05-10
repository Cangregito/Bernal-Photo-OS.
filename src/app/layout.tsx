import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/presentation/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Bernal Photo",
  description: "Plataforma Integral de Gestión y Fotografía Profesional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased" suppressHydrationWarning>
      <body className="h-full font-sans bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
