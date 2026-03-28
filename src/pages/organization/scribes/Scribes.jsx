import ScribesCards from "./ScribesCards";
import ScribesTable from "./ScribesTable";

export default function Scribes() {
  return (
    <div
      className="min-h-screen bg-[#f4f6fa] p-8"
    >
      {/* Page Header */}
      <h1 className="text-[22px] font-bold text-[#2c3a4f] mb-1">Scribes</h1>
      <p className="text-[13px] text-[#8a99b0] mb-6">
        View and manage Notes Writers assigned to your organization
      </p>

      {/* Stat Cards */}
      <ScribesCards />

      {/* Table */}
      <ScribesTable />
    </div>
  );
}