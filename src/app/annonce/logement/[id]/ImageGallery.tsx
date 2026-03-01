// Composant Galerie d'images - Domelia.fr
"use client";

import { useState, useEffect, useCallback } from "react";

interface ImageGalleryProps {
  photos: string[];
  title: string;
  price: number;
}

export default function ImageGallery({ photos, title, price }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const openModal = useCallback((index: number) => {
    setSelectedIndex(index);
    setShowModal(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    document.body.style.overflow = "";
  }, []);

  const nextImage = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const prevImage = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showModal) return;
      
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal, closeModal, prevImage, nextImage]);

  if (photos.length === 0) return null;

  return (
    <>
      {/* Galerie principale */}
      <div className="grid grid-cols-4 gap-3">
        {/* Image principale */}
        <div 
          className="col-span-4 md:col-span-2 row-span-2 relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-luxe-lg cursor-pointer group"
          onClick={() => openModal(0)}
        >
          <img
            src={photos[0]}
            alt={`${title} - Photo 1`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Prix overlay */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg">
            <span className="text-[#560591] font-bold text-2xl">{price} €</span>
            <span className="text-[#475569] text-sm"> /mois</span>
          </div>
          {/* Indicateur nombre de photos */}
          {photos.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/60 text-white text-sm font-medium px-3 py-1 rounded-full">
              📷 {photos.length} photos
            </div>
          )}
        </div>

        {/* Miniatures */}
        {photos.length > 1 && (
          <>
            {photos.slice(1, 5).map((photo, index) => (
              <div
                key={index + 1}
                className="relative h-32 md:h-44 rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => openModal(index + 1)}
              >
                <img
                  src={photo}
                  alt={`${title} - Photo ${index + 2}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {/* Overlay pour les photos supplémentaires */}
                {index === 3 && photos.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">+{photos.length - 5}</span>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Modal Lightbox */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          {/* Bouton fermer */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white hover:text-white/80 transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation précédent */}
          {photos.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-4 text-white hover:text-white/80 transition-colors z-10 bg-black/30 rounded-full p-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Navigation suivant */}
          {photos.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 text-white hover:text-white/80 transition-colors z-10 bg-black/30 rounded-full p-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image principale */}
          <div className="max-w-5xl max-h-[80vh] w-full h-full flex items-center justify-center">
            <img
              src={photos[selectedIndex]}
              alt={`${title} - Photo ${selectedIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Indicateurs */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <span className="text-white text-sm font-medium">
              {selectedIndex + 1} / {photos.length}
            </span>
          </div>

          {/* Miniatures en bas */}
          {photos.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    index === selectedIndex
                      ? "border-white opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Miniature ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
