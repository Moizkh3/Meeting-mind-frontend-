import React from "react";
import { 
  ChevronRight, 
  Search, 
  Sliders, 
  ChevronDown, 
  Reply, 
  Flag, 
  Archive, 
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from "lucide-react";
import Pagination from "../../../components/common/Pagination";

const Feedback = () => {
  const [feedbackItems, setFeedbackItems] = React.useState([]);
  const [totalEntries, setTotalEntries] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = Math.ceil(totalEntries / 10) || 1;

  const sentimentConfig = {
    neutral: {
      stripe: "bg-slate-200",
      label: "Neutral",
      labelColor: "text-slate-500",
    },
    positive: {
      stripe: "bg-green-500/30",
      label: "Positive",
      labelColor: "text-green-600",
    },
    negative: {
      stripe: "bg-red-500/30",
      label: "Negative",
      labelColor: "text-red-500",
    },
  };

  return (
    <div className="min-h-screen bg-sidebar/10">
      <div className="p-4 md:p-8 pb-0 mt-4 lg:mt-0 shadow-sm border-b border-border/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-3">
              <span>Sentiment</span>
              <ChevronRight size={12} className="shrink-0" />
              <span className="text-primary font-bold">Feedback Insights</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight">
              Global Feedback Monitor
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
              Analyze platform-wide sentiment and user feedback trends in
              real-time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search feedback..."
                className="pl-9 pr-4 py-2.5 bg-white border border-border rounded text-sm w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-slate-400 font-medium shadow-sm transition-all focus:bg-white"
              />
            </div>
            <button className="h-10 px-4 flex items-center justify-center gap-2 rounded bg-white border border-border text-slate-500 hover:bg-sidebar transition-all shadow-sm">
              <Sliders size={18} />
              <span className="text-xs font-bold uppercase tracking-widest sm:hidden">Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 pt-6 md:pt-8">
        {/* Filter Bar */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          <button className="whitespace-nowrap px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded bg-charcoal text-white shadow-md">
            All Sentiments
          </button>
          <button className="whitespace-nowrap px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded border border-border text-charcoal bg-white/80 hover:bg-sidebar transition-all">
            Positive
          </button>
          <button className="whitespace-nowrap px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded border border-border text-charcoal bg-white/80 hover:bg-sidebar transition-all">
            Neutral
          </button>
          <button className="whitespace-nowrap px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded border border-border text-charcoal bg-white/80 hover:bg-sidebar transition-all">
            Negative
          </button>
          <div className="w-px h-5 bg-border shrink-0 mx-2" />
          <button className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded border border-border text-charcoal bg-white/80 hover:bg-sidebar transition-all">
            Last 24h
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {feedbackItems.length > 0 ? (
            feedbackItems.map((item) => {
              const config = sentimentConfig[item.sentiment];
              return (
                <div
                  key={item.id}
                  className="group bg-white border border-border rounded-xl flex overflow-hidden hover:shadow-md transition-all duration-300 border-opacity-50"
                >
                  {/* Color Stripe */}
                  <div className={`w-1.5 shrink-0 ${config.stripe}`} />

                  {/* Content */}
                  <div className="flex-1 p-5 md:p-6">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base text-charcoal italic leading-relaxed font-serif">
                          &ldquo;{item.text}&rdquo;
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              User {item.userId}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-300 hidden sm:block">&middot;</span>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                            {item.time}
                          </span>
                          <span className="text-[10px] text-slate-300 hidden sm:block">&middot;</span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${config.stripe} ${config.labelColor}`}
                          >
                            {config.label}
                          </span>
                          {item.badge && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-charcoal text-white uppercase tracking-widest">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hover Actions */}
                      <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-all duration-200 self-end md:self-center shrink-0">
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-sidebar border border-transparent hover:border-border transition-all">
                          <Reply size={18} />
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all">
                          <Flag size={18} />
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-charcoal hover:bg-sidebar border border-transparent hover:border-border transition-all">
                          <Archive size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center bg-white border border-border border-dashed rounded-xl">
              <div className="w-16 h-16 bg-sidebar rounded-full flex items-center justify-center mx-auto mb-4">
                <Archive size={24} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-400 font-medium italic">No feedback entries identified in this session.</p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalResults={totalEntries}
            label="entries"
          />
        </div>
      </div>
    </div>
  );
};

export default Feedback;
