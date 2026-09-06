import React from 'react';

export default function FarmerIllustration({ className = "w-28 h-36" }) {
  return (
    <div className={`relative flex items-end justify-center overflow-hidden ${className}`}>
      {/* Background Soft Sunlight & Field Aura */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-200/50 via-amber-100/30 to-transparent rounded-2xl"></div>

      {/* SVG Farmer Artwork */}
      <svg
        viewBox="0 0 160 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain relative z-10 drop-shadow-md"
      >
        {/* Soft Background Hills */}
        <path d="M0 160 Q 40 140, 80 155 T 160 145 L 160 200 L 0 200 Z" fill="#86EFAC" opacity="0.6" />
        <path d="M0 170 Q 50 155, 110 168 T 160 160 L 160 200 L 0 200 Z" fill="#4ADE80" opacity="0.7" />

        {/* Kurta Body / Torso */}
        <path
          d="M 42 135 C 38 120, 52 110, 80 110 C 108 110, 122 120, 118 135 L 132 200 L 28 200 Z"
          fill="#F8FAFC"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />

        {/* Folded Arms */}
        <path
          d="M 32 145 C 30 165, 50 178, 80 178 C 110 178, 130 165, 128 145 C 122 165, 105 174, 80 174 C 55 174, 38 165, 32 145 Z"
          fill="#F1F5F9"
          stroke="#94A3B8"
          strokeWidth="1.5"
        />
        {/* Hands / Wrists */}
        <ellipse cx="80" cy="168" rx="14" ry="7" fill="#C68642" />

        {/* Neck */}
        <path d="M 72 98 L 72 115 C 72 118, 88 118, 88 115 L 88 98 Z" fill="#C68642" />

        {/* Kurta Collar V */}
        <path d="M 72 112 L 80 126 L 88 112" stroke="#94A3B8" strokeWidth="1.5" fill="none" />

        {/* Head / Face */}
        <ellipse cx="80" cy="80" rx="18" ry="22" fill="#D99B5B" />

        {/* Ears */}
        <ellipse cx="61" cy="80" rx="3.5" ry="6" fill="#C68642" />
        <ellipse cx="99" cy="80" rx="3.5" ry="6" fill="#C68642" />

        {/* Eyes */}
        <circle cx="73" cy="77" r="2.2" fill="#1E293B" />
        <circle cx="87" cy="77" r="2.2" fill="#1E293B" />
        <circle cx="74" cy="76" r="0.8" fill="#FFFFFF" />
        <circle cx="88" cy="76" r="0.8" fill="#FFFFFF" />

        {/* Eyebrows */}
        <path d="M 69 72 Q 74 70, 78 72" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 82 72 Q 86 70, 91 72" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />

        {/* Nose */}
        <path d="M 79 78 L 81 85 L 77 86" stroke="#B4793B" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Moustache & Warm Smile */}
        <path
          d="M 72 90 C 75 88, 78 89, 80 91 C 82 89, 85 88, 88 90 C 89 92, 85 94, 80 93 C 75 94, 71 92, 72 90 Z"
          fill="#1E293B"
        />
        <path d="M 76 95 Q 80 98, 84 95" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" fill="none" />

        {/* White / Cream Indian Pagri (Turban) */}
        {/* Base wraps */}
        <ellipse cx="80" cy="62" rx="24" ry="14" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
        <path
          d="M 58 64 C 58 48, 70 42, 80 42 C 92 42, 102 48, 102 64 C 98 70, 62 70, 58 64 Z"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="1.5"
        />
        {/* Turban Folds */}
        <path d="M 62 58 Q 80 50, 98 56" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
        <path d="M 60 66 Q 80 58, 100 64" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
        <path d="M 68 50 Q 80 44, 92 48" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
        {/* Turban Top Knot/Pleat */}
        <path d="M 76 42 Q 80 34, 84 42 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
      </svg>
    </div>
  );
}
