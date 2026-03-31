import { PageHeader } from "@/components/analytics/page-header";
import { PacketsContent } from "./packets-content";

export default function PacketsPage() {
  return (
    <div className="p-8 max-w-5xl">
      <PageHeader
        title="Packets"
        description="Bundled report sets for owner meetings and scheduled delivery"
      />
      <PacketsContent />
    </div>
  );
}
