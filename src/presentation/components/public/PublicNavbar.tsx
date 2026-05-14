'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/presentation/components/ui/ThemeToggle';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/portfolio', label: 'Portafolio' },
  { href: '/stories', label: 'Historias' },
  { href: '/pricing', label: 'Inversión' },
  { href: '/contact', label: 'Contacto' },
];

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const textColorClass = 'text-foreground/90 hover:text-foreground';

  return (
    <>
      <nav className="absolute top-0 w-full z-50 px-6 md:px-12 py-6 md:py-8 flex items-center justify-between">
        {/* Left Links (Desktop) */}
        <div className="hidden md:flex flex-1 justify-start space-x-12 items-center">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${textColorClass} transition-colors text-xs font-medium tracking-[0.2em] uppercase`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden text-foreground z-50 p-1"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6 stroke-[1.5]" />
        </button>

        {/* Center Logo */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="Bernal Photo Logo"
              width={140}
              height={50}
              className="dark:invert dark:brightness-200 object-contain transition-all md:w-[160px]"
              priority
            />
          </Link>
        </div>

        {/* Right Links (Desktop) */}
        <div className="hidden md:flex flex-1 justify-end space-x-12 items-center">
          {navLinks.slice(2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${textColorClass} transition-colors text-xs font-medium tracking-[0.2em] uppercase`}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>

        {/* Mobile spacer for alignment */}
        <div className="md:hidden w-7" />
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-sm flex flex-col">
          {/* Close Button */}
          <div className="flex justify-end p-6">
            <button
              onClick={() => setMobileOpen(false)}
              className="text-foreground p-1"
              aria-label="Cerrar menú"
            >
              <X className="w-7 h-7 stroke-[1.5]" />
            </button>
          </div>

          {/* Links */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-10">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-serif font-light text-foreground/80 hover:text-foreground transition-colors tracking-wide"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Bottom — Theme Toggle + Socials */}
          <div className="flex items-center justify-center pb-12 space-x-6">
            <ThemeToggle />
            <span className="text-xs text-foreground/40 tracking-widest uppercase">
              @bernalphoto
            </span>
          </div>
        </div>
      )}
    </>
  );
}
