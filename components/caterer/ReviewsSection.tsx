"use client";

import { Star } from "lucide-react";

type Review = {
  id: number;
  name: string;
  initials: string;
  rating: number;
  event: string;
  date: string;
  text: string;
};

type ReviewsSectionProps = {
  rating: number;
  reviewsCount: number;
  reviews: Review[];
};

export default function ReviewsSection({ rating, reviewsCount, reviews }: ReviewsSectionProps) {
  const dist = [
    { stars: 5, width: "70%", count: 70 },
    { stars: 4, width: "20%", count: 20 },
    { stars: 3, width: "7%", count: 7 },
    { stars: 2, width: "2%", count: 2 },
    { stars: 1, width: "1%", count: 1 },
  ];

  return (
    <section className="px-4 py-5">
      <div className="mb-5 flex items-center gap-5 rounded-xl border border-[#E6E6E6] bg-[#FFFFFF] p-5">
        <div>
          <p className="leading-none text-[52px] font-bold text-[#1C1C1C]">{rating}</p>
          <div className="mt-1 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => {
              const filled = i < Math.round(rating);
              return (
                <Star
                  key={i}
                  className={
                    "h-[14px] w-[14px] " +
                    (filled ? "fill-[#DE903E] text-[#DE903E]" : "text-[#E8D5B7]")
                  }
                />
              );
            })}
          </div>
          <p className="mt-1 text-[12px] text-[#666666]">{reviewsCount} reviews</p>
        </div>

        <div className="flex-1 space-y-2">
          {dist.map((d) => (
            <div key={d.stars} className="flex items-center gap-2">
              <span className="w-5 text-[11px] text-[#666666]">{d.stars}★</span>
              <div className="h-1.5 flex-1 rounded-full bg-[#F1F1F1]">
                <div className="h-full rounded-full bg-[#DE903E]" style={{ width: d.width }} />
              </div>
              <span className="w-4 text-[11px] text-[#666666]">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {reviews.map((review) => (
        <article key={review.id} className="mb-3 rounded-xl border border-[#E6E6E6] bg-[#FFFFFF] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1C1C1C] text-[13px] font-bold text-[#FFFFFF]">
              {review.initials}
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-[#1C1C1C]">{review.name}</p>
              <span className="mt-0.5 inline-block rounded-md bg-[#F9F9F9] px-2 py-0.5 text-[10px] font-semibold text-[#333333]">
                {review.event}
              </span>
            </div>
            <p className="ml-auto text-[12px] text-[#666666]">{review.date}</p>
          </div>
          <div className="mt-2 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={
                  "h-3 w-3 " +
                  (i < review.rating ? "fill-[#DE903E] text-[#DE903E]" : "text-[#E8D5B7]")
                }
              />
            ))}
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-[#333333]">{review.text}</p>
        </article>
      ))}
    </section>
  );
}
