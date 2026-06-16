import TrendingClient from "@/components/TrendingClient";
import { TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-6">
        <TrendingUp className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
        <h1 className="heading-xl" style={{ color: "var(--color-ink)" }}>급상승 동영상</h1>
      </div>
      <TrendingClient />
    </div>
  );
}
