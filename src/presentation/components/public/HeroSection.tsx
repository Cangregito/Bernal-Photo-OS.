"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/infrastructure/supabase/client";

const fallbackSlides = [
  { id: '1', image_url: "/hero_wedding.png", title: "Fotógrafo en Ciudad Juárez", subtitle: "Fotografía de Bodas - Bernal Photo" },
  { id: '2', image_url: "/gallery_1.png", title: "Fotógrafo en Ciudad Juárez", subtitle: "Fotografía de Bodas - Bernal Photo" },
  { id: '3', image_url: "/hero_wedding.png", title: "Fotógrafo en Ciudad Juárez", subtitle: "Fotografía de Bodas - Bernal Photo" },
];

interface Slide {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
}

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(fallbackSlides);

  useEffect(() => {
    async function fetchSlides() {
      try {
        const { data } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        if (data && data.length > 0) {
          setSlides(data as Slide[]);
        }
      } catch { /* use fallback */ }
    }
    fetchSlides();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(() => { nextSlide(); }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const currentSlide = slides[currentIndex];
  if (!currentSlide) return null;

  return (
    <section className="relative h-screen min-h-[800px] w-full flex items-center justify-center overflow-hidden bg-black" id="home">
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-60" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${slide.image_url})` }}
        />
      ))}
      <div className="absolute inset-0 bg-black/20" />

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-12 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-20 hidden md:block"
      >
        <ArrowLeft className="w-8 h-8 font-light stroke-1" />
      </button>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 mt-16">
        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-serif text-white tracking-normal drop-shadow-md">
          {currentSlide.title || 'Fotógrafo en Ciudad Juárez'}
        </h1>

        <p className="mt-8 text-xs md:text-sm text-white font-medium tracking-[0.3em] uppercase drop-shadow-md">
          {currentSlide.subtitle || 'Fotografía de Bodas - Bernal Photo'}
        </p>

        <Link
          href="/contact"
          className="mt-12 group relative inline-block px-10 py-4 overflow-hidden border border-white/40 rounded-sm hover:border-white transition-colors"
        >
          <span className="relative z-10 text-xs md:text-sm font-medium tracking-[0.25em] uppercase text-white group-hover:text-black transition-colors duration-500">
            Reservar Sesión
          </span>
          <div className="absolute inset-0 h-full w-full bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
        </Link>
      </div>

      {/* Right Arrow and Pagination */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-12 z-20 hidden md:flex">
        <span className="text-white/70 text-sm font-serif italic">
          {String(currentIndex + 1).padStart(2, '0')}
        </span>
        <button
          onClick={nextSlide}
          className="text-white/50 hover:text-white transition-colors"
        >
          <ArrowRight className="w-8 h-8 font-light stroke-1" />
        </button>
        <span className="text-white/70 text-sm font-serif italic">
          {String(slides.length).padStart(2, '0')}
        </span>
      </div>

    </section>
  );
}
