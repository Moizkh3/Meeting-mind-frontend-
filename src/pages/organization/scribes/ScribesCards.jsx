export default function ScribesCards() {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white border border-[#e2e7ef] rounded-xl px-5 py-4">
        <p className="text-[10px] font-black tracking-widest text-[#7a8699] uppercase mb-2">Total Scribes</p>
        <p className="text-[28px] font-bold text-[#2c3a4f] leading-none">12</p>
      </div>
      <div className="bg-white border border-[#e2e7ef] rounded-xl px-5 py-4">
        <p className="text-[10px] font-black tracking-widest text-[#7a8699] uppercase mb-2">Active Right Now</p>
        <div className="flex items-center gap-2">
          <p className="text-[28px] font-bold text-[#2c3a4f] leading-none">3</p>
          <span className="w-2.5 h-2.5 rounded-full bg-[#34a85a]" />
        </div>
      </div>
      <div className="bg-white border border-[#e2e7ef] rounded-xl px-5 py-4">
        <p className="text-[10px] font-black tracking-widest text-[#7a8699] uppercase mb-2">Meetings This Month</p>
        <p className="text-[28px] font-bold text-[#2c3a4f] leading-none">28</p>
      </div>
    </div>
  );
}