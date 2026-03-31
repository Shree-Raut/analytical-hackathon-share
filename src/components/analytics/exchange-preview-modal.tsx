"use client";

import { useState, useCallback, type ReactNode } from "react";
import {
  X,
  Star,
  ShieldCheck,
  ExternalLink,
  Check,
  Clock,
} from "lucide-react";

export interface ConnectorDetail {
  name: string;
  provider: string;
  icon: ReactNode;
  pricing: "INCLUDED" | "ADD_ON" | "PREMIUM";
  priceLabel: string;
  description: string;
  fullDescription: string;
  features: string[];
  setupSteps: string[];
  installs: number;
  rating: number;
  reviewCount: number;
}

const PRICING_BADGE: Record<string, { label: string; className: string }> = {
  INCLUDED: {
    label: "Included",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  ADD_ON: {
    label: "Add-on",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PREMIUM: {
    label: "Premium",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={
            i <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-gray-200"
          }
        />
      ))}
    </div>
  );
}

export function ExchangePreviewModal({
  connector,
  onClose,
}: {
  connector: ConnectorDetail;
  onClose: () => void;
}) {
  const badge = PRICING_BADGE[connector.pricing];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8dfd4]">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-[#1a1510]">
              {connector.name}
            </span>
            <span className="text-xs text-[#7d654e]">
              on Entrata Exchange
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f7f3ef] transition-colors text-[#7d654e]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Top row: icon + meta */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#f7f3ef] flex items-center justify-center shrink-0 border border-[#e8dfd4]">
              {connector.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-[#1a1510]">
                {connector.name}
              </h2>
              <p className="text-sm text-[#7d654e] mt-0.5">
                by {connector.provider}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                >
                  {badge.label}
                </span>
                {connector.priceLabel !== "Free" && (
                  <span className="text-sm font-medium text-[#1a1510]">
                    {connector.priceLabel}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1.5">
                <StarRating rating={connector.rating} />
                <span className="text-xs text-[#7d654e]">
                  ({connector.reviewCount})
                </span>
              </div>
              <p className="text-xs text-[#7d654e] mt-1">
                {connector.installs.toLocaleString()} installs
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-[#1a1510] leading-relaxed">
              {connector.fullDescription}
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-xs font-semibold text-[#1a1510] uppercase tracking-wider mb-2">
              Key Features
            </h3>
            <ul className="space-y-1.5">
              {connector.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#1a1510]">
                  <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Setup Steps */}
          <div>
            <h3 className="text-xs font-semibold text-[#1a1510] uppercase tracking-wider mb-2">
              Setup Steps
            </h3>
            <ol className="space-y-1.5">
              {connector.setupSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#1a1510]">
                  <span className="w-5 h-5 rounded-full bg-[#eddece] flex items-center justify-center text-xs font-semibold text-[#7d654e] shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-4 pt-2 border-t border-[#e8dfd4]">
            <div className="flex items-center gap-1.5 text-xs text-[#7d654e]">
              <ShieldCheck size={14} className="text-emerald-500" />
              SOC 2 Verified
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#7d654e]">
              <Clock size={14} />
              Avg. setup: 15 min
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e8dfd4] bg-[#faf7f4]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#7d654e] hover:bg-[#eddece] rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            title="Coming in a future release"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#7d654e] hover:bg-[#6b5641] rounded-lg transition-colors"
          >
            Open in Exchange
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function useExchangeModal() {
  const [selectedConnector, setSelectedConnector] =
    useState<ConnectorDetail | null>(null);

  const openModal = useCallback((connector: ConnectorDetail) => {
    setSelectedConnector(connector);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedConnector(null);
  }, []);

  return { selectedConnector, openModal, closeModal };
}
