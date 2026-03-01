// Composant section avis services - Domelia.fr
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string | Date;
  userId: string;
}

interface ServiceReviewsProps {
  serviceId: string;
  avgRating?: number | null;
  reviewCount: number;
  reviews: Review[];
}

// Composant étoiles cliquables
function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <svg
            className={`w-8 h-8 ${star <= value ? "text-yellow-400" : "text-gray-200"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// Composant étoiles affichage
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ServiceReviews({ serviceId, avgRating, reviewCount, reviews: initialReviews }: ServiceReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/services/${serviceId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi de l'avis");
      }

      setSuccess(true);
      setRating(5);
      setComment("");
      
      // Rafraîchir les avis
      const reviewsResponse = await fetch(`/api/services/${serviceId}/reviews`);
      const reviewsData = await reviewsResponse.json();
      if (reviewsResponse.ok) {
        setReviews(reviewsData.reviews);
      }

      setTimeout(() => {
        setIsDialogOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-luxe p-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B]">Avis clients</h2>
          {avgRating !== null && avgRating !== undefined && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-sm text-[#475569]">
                {avgRating.toFixed(1)}/5 ({reviewCount} avis)
              </span>
            </div>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#10B981] text-white hover:bg-[#059669]">
              Laisser un avis
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Laisser un avis</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {success ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-[#1E293B]">Merci pour votre avis !</p>
                  <p className="text-sm text-[#475569]">Votre avis a été publié avec succès.</p>
                </div>
              ) : (
                <>
                  <div>
                    <Label className="text-sm font-medium text-[#475569] mb-2 block">
                      Votre note *
                    </Label>
                    <StarInput value={rating} onChange={setRating} />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-[#475569] mb-2 block">
                      Commentaire (optionnel)
                    </Label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Partagez votre expérience..."
                      rows={4}
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-[#10B981] text-white hover:bg-[#059669]"
                  >
                    {isSubmitting ? "Envoi en cours..." : "Publier mon avis"}
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des avis */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-[#475569]">Aucun avis pour le moment.</p>
          <p className="text-sm text-[#94A3B8]">Soyez le premier à donner votre avis !</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 bg-[#F8FAFC] rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#EDE9FE] flex items-center justify-center">
                    <span className="text-sm font-medium text-[#560591]">
                      U
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[#1E293B]">
                    Utilisateur
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-[#94A3B8]">
                    {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-[#475569] mt-2">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
