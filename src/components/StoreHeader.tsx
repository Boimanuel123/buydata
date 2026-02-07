"use client";

import Image from "next/image";

interface StoreHeaderProps {
  storeName: string;
  logo?: string;
  description?: string;
  whatsapp?: string;
}

export default function StoreHeader({
  storeName,
  logo,
  description,
  whatsapp,
}: StoreHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex items-start sm:items-center gap-4 sm:gap-6">
          {logo && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex-shrink-0">
              <Image
                src={logo}
                alt={storeName}
                fill
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 line-clamp-2">{storeName}</h1>
            {description && (
              <p className="text-slate-600 text-xs sm:text-sm mt-1 sm:mt-2 line-clamp-2">{description}</p>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-xs sm:text-sm"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.734.732 5.41 2.124 7.738L.929 23.5l8.272-2.668c2.215 1.21 4.715 1.848 7.322 1.848h.003c5.396 0 9.747-4.363 9.747-9.798 0-2.613-.634-5.08-1.845-7.384-1.212-2.304-2.927-4.204-5.039-5.510C15.565 1.365 13.763.75 11.8.75h-.003c-5.395 0-9.746 4.363-9.746 9.798 0 .6.057 1.193.163 1.780z"/>
                </svg>
                <span className="hidden xs:inline">Contact on WhatsApp</span>
                <span className="xs:hidden">WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
