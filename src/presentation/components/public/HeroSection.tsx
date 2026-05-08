"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const sliderImages = [
  "/hero_wedding.png",
  "/gallery_1.png", // using fallback images that we know exist
  "/hero_wedding.png"
];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? sliderImages.length - 1 : prev - 1));
  };

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen min-h-[800px] w-full flex items-center justify-center overflow-hidden bg-black" id="home">
      {/* Background Images */}
      {sliderImages.map((src, index) => (
        <div 
          key={index}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-60" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
      <div className="absolute inset-0 bg-black/20" /> {/* Softer overlay for the new style */}

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
          Fotógrafo en Ciudad Juárez
        </h1>
        
        <p className="mt-8 text-xs md:text-sm text-white font-medium tracking-[0.3em] uppercase drop-shadow-md">
          Fotografía de Bodas - Bernal Photo
        </p>
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
          {String(sliderImages.length).padStart(2, '0')}
        </span>
      </div>

    </section>
  );
}
