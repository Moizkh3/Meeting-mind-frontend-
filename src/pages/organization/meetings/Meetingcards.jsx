import { Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MeetingCards() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {/* Create Meeting */}
      <div className="bg-white border border-[#e2e7ef] rounded-xl p-6 flex flex-col">
        <Calendar size={28} className="text-[#2c3a4f] mb-3" />
        <h3 className="text-[16px] font-bold text-[#2c3a4f] mb-1">Create Meeting</h3>
        <p className="text-[13px] text-[#8a99b0] mb-5 flex-1">
          Schedule a new single or recurring meeting for your organization.
        </p>
        <button
          onClick={() => navigate("/organization/create-meeting")}
          className="w-fit px-5 py-2.5 bg-[#2c3a4f] text-white text-[13px] font-bold rounded-lg hover:bg-[#3d4f66] transition-colors"
        >
          Create Meeting
        </button>
      </div>

      {/* View Past Meetings */}
      <div className="bg-white border border-[#e2e7ef] rounded-xl p-6 flex flex-col">
        <Clock size={28} className="text-[#2c3a4f] mb-3" />
        <h3 className="text-[16px] font-bold text-[#2c3a4f] mb-1">View Past Meetings</h3>
        <p className="text-[13px] text-[#8a99b0] mb-5 flex-1">
          Browse completed meeting records, transcripts, and attendee reports.
        </p>
        <button
          onClick={() => navigate("/organization/meetings/history")}
          className="w-fit px-5 py-2.5 border border-[#d0d7e2] text-[#2c3a4f] text-[13px] font-bold rounded-lg hover:bg-[#f4f6fa] transition-colors"
        >
          View History
        </button>
      </div>
    </div>
  );
}