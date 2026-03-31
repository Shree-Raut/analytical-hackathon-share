"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import {
  Database,
  FileSpreadsheet,
  Cloud,
  BarChart3,
  Warehouse,
  Globe,
  Zap,
  ArrowUpRight,
  Star,
  ExternalLink,
  Layers,
  Calculator,
  Users,
  Code2,
  MessageSquare,
  Upload,
  Search,
} from "lucide-react";
import {
  ExchangePreviewModal,
  useExchangeModal,
  type ConnectorDetail,
} from "./exchange-preview-modal";

const PRICING_BADGE_STYLES: Record<string, { label: string; className: string }> = {
  INCLUDED: {
    label: "Included",
    className: "bg-emerald-50 text-emerald-700",
  },
  ADD_ON: {
    label: "Add-on",
    className: "bg-amber-50 text-amber-700",
  },
  PREMIUM: {
    label: "Premium",
    className: "bg-purple-50 text-purple-700",
  },
};

function makeIcon(Icon: typeof Database, bgClass: string, textClass: string, size = 20) {
  return (
    <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center shrink-0`}>
      <Icon size={size} className={textClass} />
    </div>
  );
}

const FEATURED_CONNECTORS: ConnectorDetail[] = [
  {
    name: "Snowflake Data Share",
    provider: "Snowflake",
    icon: makeIcon(Warehouse, "bg-blue-100", "text-blue-600"),
    pricing: "PREMIUM",
    priceLabel: "$200/mo",
    description: "Stream your Entrata data to Snowflake",
    fullDescription:
      "Stream your entire Entrata data warehouse directly to Snowflake via secure data sharing. Zero-copy architecture means your data is always current — no ETL pipelines to maintain. Ideal for organizations running advanced analytics, data science models, or cross-platform data mesh architectures.",
    features: [
      "Zero-copy data sharing — no ETL pipelines",
      "Real-time sync with < 5 min latency",
      "Granular access controls per schema",
      "Pre-built dbt models for common analytics",
    ],
    setupSteps: [
      "Provide your Snowflake account identifier",
      "Configure data sharing permissions in Entrata",
      "Accept the share in your Snowflake console",
      "Query your data — it's live immediately",
    ],
    installs: 847,
    rating: 4.7,
    reviewCount: 124,
  },
  {
    name: "Power BI Connector",
    provider: "Microsoft",
    icon: makeIcon(BarChart3, "bg-yellow-100", "text-yellow-700"),
    pricing: "ADD_ON",
    priceLabel: "$150/mo",
    description: "Direct connection to Microsoft Power BI",
    fullDescription:
      "Connect Entrata directly to Power BI with a certified connector. Supports DirectQuery for real-time dashboards and Import mode for high-performance reports. Includes pre-built Power BI templates for occupancy, revenue, and maintenance analytics.",
    features: [
      "Certified Microsoft Power BI connector",
      "DirectQuery and Import mode support",
      "Pre-built report templates included",
      "Automatic schema refresh on data changes",
    ],
    setupSteps: [
      "Install the Entrata connector from Power BI marketplace",
      "Authenticate with your Entrata API credentials",
      "Select datasets and configure refresh schedule",
      "Start building reports with live Entrata data",
    ],
    installs: 1234,
    rating: 4.5,
    reviewCount: 203,
  },
  {
    name: "Tableau Integration",
    provider: "Salesforce",
    icon: makeIcon(Layers, "bg-indigo-100", "text-indigo-600"),
    pricing: "ADD_ON",
    priceLabel: "$175/mo",
    description: "Live data feeds for Tableau dashboards",
    fullDescription:
      "Enable live data connections from Entrata to Tableau Server or Tableau Cloud. Supports Hyper extracts for large datasets and live connections for real-time operational dashboards. Includes published data sources for common property management metrics.",
    features: [
      "Live connection and Hyper extract support",
      "Published data sources for PM metrics",
      "Row-level security mapped to Entrata roles",
      "Automatic extract refresh scheduling",
    ],
    setupSteps: [
      "Configure Tableau connection in Entrata settings",
      "Install the Entrata Web Data Connector",
      "Map Entrata roles to Tableau row-level security",
      "Publish data sources and build workbooks",
    ],
    installs: 956,
    rating: 4.6,
    reviewCount: 167,
  },
  {
    name: "Google BigQuery Export",
    provider: "Google Cloud",
    icon: makeIcon(Database, "bg-green-100", "text-green-600"),
    pricing: "PREMIUM",
    priceLabel: "$250/mo",
    description: "Automated nightly export to BigQuery",
    fullDescription:
      "Export your Entrata data warehouse to Google BigQuery on a nightly schedule. Supports incremental loads for efficiency and full snapshots for compliance. Integrates with Looker and Vertex AI for advanced analytics and ML workflows.",
    features: [
      "Nightly incremental and full-snapshot exports",
      "Partitioned tables for cost-efficient querying",
      "Native Looker integration with LookML models",
      "Vertex AI-ready datasets for ML pipelines",
    ],
    setupSteps: [
      "Provide your GCP project ID and service account",
      "Configure export schedule and dataset selection",
      "Run initial full export (typically 2-4 hours)",
      "Incremental syncs begin on next cycle",
    ],
    installs: 623,
    rating: 4.4,
    reviewCount: 89,
  },
  {
    name: "Domo Connector",
    provider: "Domo",
    icon: makeIcon(Globe, "bg-pink-100", "text-pink-600"),
    pricing: "ADD_ON",
    priceLabel: "$100/mo",
    description: "Replace Domo Everywhere with native feeds",
    fullDescription:
      "Stream Entrata data directly into Domo with a native connector that replaces Domo Everywhere embedded workflows. Supports real-time data feeds, scheduled refreshes, and pre-built Domo cards for property management KPIs.",
    features: [
      "Native Domo connector — no Domo Everywhere needed",
      "Real-time and scheduled data feeds",
      "Pre-built Domo cards for PM KPIs",
      "Magic ETL-ready data schemas",
    ],
    setupSteps: [
      "Generate API credentials in Entrata",
      "Install the Entrata connector in Domo Appstore",
      "Select datasets and configure refresh cadence",
      "Import pre-built card templates",
    ],
    installs: 2105,
    rating: 4.3,
    reviewCount: 312,
  },
  {
    name: "RealPage GL Import",
    provider: "Entrata",
    icon: makeIcon(FileSpreadsheet, "bg-emerald-100", "text-emerald-600"),
    pricing: "INCLUDED",
    priceLabel: "Free",
    description: "Import financial data from RealPage",
    fullDescription:
      "Import General Ledger data from RealPage OneSite or RealPage Accounting directly into Entrata Analytics. Supports automated monthly imports with intelligent field mapping and validation. Essential for portfolio owners transitioning from or running alongside RealPage.",
    features: [
      "Automated GL import from RealPage OneSite",
      "Intelligent field mapping with validation",
      "Historical data backfill support",
      "Reconciliation reports included",
    ],
    setupSteps: [
      "Export your GL data from RealPage (CSV or API)",
      "Upload to Entrata via Fast Pass or API",
      "Review and confirm field mappings",
      "Schedule recurring imports (monthly recommended)",
    ],
    installs: 3412,
    rating: 4.8,
    reviewCount: 456,
  },
  {
    name: "Yardi Voyager API",
    provider: "Yardi Systems",
    icon: makeIcon(Cloud, "bg-purple-100", "text-purple-600"),
    pricing: "PREMIUM",
    priceLabel: "$300/mo",
    description: "Bidirectional sync with Yardi Voyager",
    fullDescription:
      "Enable bidirectional data sync between Entrata Analytics and Yardi Voyager. Push consolidated analytics back to Yardi or pull operational data into Entrata for cross-platform portfolio views. SOC 2 certified with full audit trail.",
    features: [
      "Bidirectional sync — read and write",
      "SOC 2 certified data pipeline",
      "Full audit trail for compliance",
      "Support for Voyager 7S and 8.x",
    ],
    setupSteps: [
      "Provide Yardi Voyager API credentials",
      "Configure sync direction and field mappings",
      "Run validation against test environment",
      "Enable production sync with monitoring",
    ],
    installs: 1567,
    rating: 4.5,
    reviewCount: 198,
  },
  {
    name: "QuickBooks Integration",
    provider: "Intuit",
    icon: makeIcon(Calculator, "bg-teal-100", "text-teal-600"),
    pricing: "ADD_ON",
    priceLabel: "$75/mo",
    description: "Sync accounting data with QuickBooks",
    fullDescription:
      "Sync your QuickBooks Online or QuickBooks Desktop accounting data with Entrata Analytics. Automatically import chart of accounts, journal entries, and financial statements for unified reporting across your property management portfolio.",
    features: [
      "QuickBooks Online and Desktop support",
      "Automatic chart of accounts sync",
      "Journal entry import with smart mapping",
      "Unified financial reporting across platforms",
    ],
    setupSteps: [
      "Connect your QuickBooks account via OAuth",
      "Map chart of accounts to Entrata categories",
      "Configure sync frequency (daily recommended)",
      "Review first sync and approve mappings",
    ],
    installs: 4230,
    rating: 4.6,
    reviewCount: 534,
  },
];

interface CategoryCard {
  name: string;
  description: string;
  count: string;
  icon: ReactNode;
}

const CATEGORIES: CategoryCard[] = [
  {
    name: "Data Warehouses",
    description: "Stream to Snowflake, BigQuery, Redshift",
    count: "8 connectors",
    icon: <Warehouse size={20} className="text-blue-600" />,
  },
  {
    name: "BI Platforms",
    description: "Power BI, Tableau, Looker, Domo",
    count: "12 connectors",
    icon: <BarChart3 size={20} className="text-indigo-600" />,
  },
  {
    name: "Accounting Systems",
    description: "QuickBooks, Sage, Xero, NetSuite",
    count: "15 connectors",
    icon: <Calculator size={20} className="text-emerald-600" />,
  },
  {
    name: "Property Management",
    description: "Yardi, RealPage, AppFolio imports",
    count: "6 connectors",
    icon: <Database size={20} className="text-purple-600" />,
  },
  {
    name: "CRM & Marketing",
    description: "Salesforce, HubSpot, Mailchimp",
    count: "10 connectors",
    icon: <Users size={20} className="text-pink-600" />,
  },
  {
    name: "Custom & API",
    description: "Build your own with REST and webhook APIs",
    count: "Open",
    icon: <Code2 size={20} className="text-teal-600" />,
  },
];

function FeaturedConnectorCard({
  connector,
  onPreview,
}: {
  connector: ConnectorDetail;
  onPreview: () => void;
}) {
  const badge = PRICING_BADGE_STYLES[connector.pricing];

  return (
    <div className="w-64 shrink-0 snap-start rounded-xl border border-[#e8dfd4] bg-white p-4 flex flex-col gap-3 hover:shadow-md hover:border-[#7d654e]/20 transition-all">
      <div className="flex items-start gap-3">
        {connector.icon}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1a1510] truncate">
            {connector.name}
          </p>
          <p className="text-xs text-[#7d654e]">{connector.provider}</p>
        </div>
      </div>

      <p className="text-xs text-[#7d654e] leading-relaxed line-clamp-2">
        {connector.description}
      </p>

      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}
        >
          {badge.label}
        </span>
        {connector.priceLabel !== "Free" && (
          <span className="text-[10px] font-medium text-[#7d654e]">
            {connector.priceLabel}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#e8dfd4]">
        <div className="flex items-center gap-1">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          <span className="text-[10px] text-[#7d654e]">
            {connector.rating}
          </span>
          <span className="text-[10px] text-[#7d654e]/60 ml-1">
            {connector.installs.toLocaleString()} installs
          </span>
        </div>
      </div>

      <button
        onClick={onPreview}
        className="w-full text-center text-xs font-medium text-[#7d654e] hover:text-[#1a1510] bg-[#faf7f4] hover:bg-[#eddece] py-2 rounded-lg transition-colors"
      >
        Preview in Exchange
      </button>
    </div>
  );
}

function RequestConnectorButton() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <button
      onClick={() => setSubmitted(true)}
      disabled={submitted}
      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#7d654e] bg-white hover:bg-[#faf7f4] rounded-lg transition-colors border border-[#e8dfd4] disabled:opacity-60"
    >
      <MessageSquare size={14} />
      {submitted ? "Request submitted" : "Request a Connector"}
    </button>
  );
}

export function ExchangeDiscovery() {
  const { selectedConnector, openModal, closeModal } = useExchangeModal();

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-[#1a1510]">
              Explore the Exchange
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#eddece] px-2.5 py-0.5 text-[10px] font-semibold text-[#7d654e] uppercase tracking-wider">
              <Zap size={10} />
              Powered by Entrata Exchange
            </span>
          </div>
          <p className="text-sm text-[#7d654e] mt-1">
            Connect to 50+ data sources, BI platforms, and analytics tools
          </p>
        </div>
      </div>

      {/* 2a: Featured Connectors — horizontal scroll */}
      <div>
        <h3 className="text-sm font-semibold text-[#1a1510] mb-3 flex items-center gap-2">
          <Star size={14} className="text-amber-400 fill-amber-400" />
          Featured Connectors
        </h3>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-thin">
            {FEATURED_CONNECTORS.map((c) => (
              <FeaturedConnectorCard
                key={c.name}
                connector={c}
                onPreview={() => openModal(c)}
              />
            ))}
          </div>
          {/* Right edge fade */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-[#faf7f4] to-transparent" />
        </div>
      </div>

      {/* 2b: Browse by Category */}
      <div>
        <h3 className="text-sm font-semibold text-[#1a1510] mb-3 flex items-center gap-2">
          <Search size={14} className="text-[#7d654e]" />
          Browse by Category
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              title="Coming in a future release"
              className="group rounded-xl border border-[#e8dfd4] bg-white p-4 flex items-start gap-3 hover:shadow-md hover:border-[#7d654e]/20 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#faf7f4] flex items-center justify-center shrink-0 group-hover:bg-[#eddece] transition-colors">
                {cat.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#1a1510]">
                    {cat.name}
                  </p>
                  <ArrowUpRight
                    size={12}
                    className="text-[#7d654e] opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <p className="text-xs text-[#7d654e] mt-0.5">
                  {cat.description}
                </p>
                <p className="text-[10px] font-medium text-[#7d654e]/60 mt-1">
                  {cat.count}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2c: Quick Actions Bar */}
      <div className="rounded-xl bg-[#eddece] p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[#1a1510]">
            Need a connector you don&apos;t see?
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <RequestConnectorButton />
            <Link
              href="/data/import"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#7d654e] hover:bg-[#6b5641] rounded-lg transition-colors"
            >
              <Upload size={14} />
              Upload Data
            </Link>
            <button
              title="Coming in a future release"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#7d654e] bg-white hover:bg-[#faf7f4] rounded-lg transition-colors border border-[#e8dfd4]"
            >
              <ExternalLink size={14} />
              Browse Full Exchange
            </button>
          </div>

          <Link
            href="/fast-pass"
            className="text-xs text-[#7d654e] hover:text-[#1a1510] transition-colors flex items-center gap-1"
          >
            Or use Fast Pass to import any Excel or CSV
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>

      {/* Exchange Preview Modal */}
      {selectedConnector && (
        <ExchangePreviewModal
          connector={selectedConnector}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
