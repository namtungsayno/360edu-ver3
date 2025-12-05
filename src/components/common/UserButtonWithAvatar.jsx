// src/components/common/UserButtonWithAvatar.jsx
// Reusable button showing avatar from URL, name, email, and enlarge image on click

import { useState } from "react";
import { Dialog } from "../ui/Dialog.jsx";
import ImageWithFallback from "../ui/ImageWithFallback.jsx";

/**
 * Props:
 * - avatarUrl: string (image URL from DB)
 * - name: string
 * - email: string
 * - onClick: optional handler when button pressed (besides opening image)
 */
export default function UserButtonWithAvatar({ avatarUrl, name, email, onClick }) {
  const [openPreview, setOpenPreview] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          if (onClick) onClick(e);
          setOpenPreview(true);
        }}
        className="w-full flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
          {avatarUrl ? (
            <ImageWithFallback
              src={avatarUrl}
              alt={name || "Avatar"}
              className="w-10 h-10 object-cover"
              fallbackClassName="text-white font-bold"
            />
          ) : (
            <span className="text-white font-bold">
              {name?.[0]?.toUpperCase() || "?"}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-white text-sm font-medium truncate">{name}</p>
          <p className="text-blue-100 text-xs truncate">{email}</p>
        </div>
      </button>

      {/* Large preview dialog */}
      <Dialog open={openPreview} onOpenChange={setOpenPreview}>
        <div className="p-4">
          <div className="w-full max-w-[80vw] max-h-[80vh] mx-auto">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name || "Avatar"}
                className="w-full h-auto max-h-[75vh] object-contain rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto">
                <span className="text-white text-4xl font-bold">
                  {name?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
