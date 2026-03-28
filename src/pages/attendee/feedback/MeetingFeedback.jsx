import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Modal from '../../../components/common/Modal'
import { useAuth } from '../../../context/AuthContext'
import axiosInstance from '../../../api/axiosinstance'
import { CheckCircle2, Star, Loader2 } from 'lucide-react'

const MeetingFeedback = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [rating, setRating] = useState(null)
  const [hoverRating, setHoverRating] = useState(null)
  const [comment, setComment] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axiosInstance.get(`/meetings/id/${id}`);
        const meeting = res.data?.data?.meeting;
        
        // Find if this user already submitted (Check by ID or Email)
        const attendee = meeting?.attendees?.find(a => {
          const attUserId = String(a.user?._id || a.user || "");
          const currentUserId = String(user?._id || "");
          return (attUserId === currentUserId) || (!a.isRegistered && a.emailForUnregisteredAttendee === user?.email);
        });

        if (attendee?.feedbackProvided) {
          setAlreadySubmitted(true);
        }
      } catch (err) {
        console.error("Status check failed:", err);
      } finally {
        setCheckingStatus(false);
      }
    };
    if (id && user) checkStatus();
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) {
      setError("Please select a rating before submitting.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await axiosInstance.post('/anonymous/addReview', {
        review: comment.trim() || "No written review provided.",
        rating,
        meetingId: id
      })
      setShowSuccess(true)
    } catch (err) {
      console.error("Failed to submit feedback:", err)
      if (err.response?.status === 400 && err.response?.data?.message?.includes("already provided")) {
        setAlreadySubmitted(true);
      } else {
        setError(err.response?.data?.message || "Failed to submit feedback. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (checkingStatus) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-slate-400 mb-4" size={32} />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verifying Status...</p>
      </div>
    )
  }

  if (alreadySubmitted) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Feedback Already Provided</h2>
          <p className="text-slate-500 mb-8">
            You have already shared your thoughts for this session. Thank you for helping us improve!
          </p>
          <button
            onClick={() => navigate('/attendee/dashboard')}
            className="px-8 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-800 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-3xl flex flex-col items-center">
        {/* HeaderSection */}
        <section className="mb-14 text-center">
          <h1 className="text-[32px] font-extrabold text-[#1a1c1e] tracking-tight">How was the meeting?</h1>
          {error && (
            <p className="mt-4 text-sm font-bold text-rose-500 uppercase tracking-widest animate-pulse">
              {error}
            </p>
          )}
        </section>

        {/* FeedbackForm */}
        <form className="w-full space-y-12 sm:space-y-16" onSubmit={handleSubmit}>
          {/* RatingSystem */}
          <div className="flex flex-col items-center w-full px-2">
            <div className="flex gap-2 min-[400px]:gap-4 sm:gap-6 justify-center w-full">
              {[1, 2, 3, 4, 5].map((value) => (
                <div key={value} className="flex flex-col items-center gap-3 sm:gap-4 flex-1 max-w-[64px]">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(value)}
                    className={`w-12 h-12 min-[400px]:w-14 min-[400px]:h-14 sm:w-16 sm:h-16 flex items-center justify-center border transition-all duration-500 rounded-sm shrink-0 ${
                      rating === value 
                        ? 'bg-amber-50 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.4)] scale-110' 
                        : 'bg-white border-amber-100 hover:border-amber-300 hover:bg-amber-50/50'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Star
                      size={20}
                      strokeWidth={rating >= value || hoverRating >= value ? 2.5 : 1.5}
                      className={`transition-all duration-500 h-5 w-5 sm:w-7 sm:h-7 ${
                        (hoverRating || rating) >= value 
                          ? 'fill-amber-400 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-pulse' 
                          : 'text-amber-400/40 fill-amber-400/5'
                      }`}
                    />
                  </button>
                  <span className={`text-[8px] sm:text-[10px] uppercase font-bold tracking-[0.1em] sm:tracking-[0.2em] transition-all duration-500 text-center w-full ${
                    value === 1 || value === 3 || value === 5 ? ((hoverRating || rating) >= value ? 'text-amber-600' : 'text-slate-400') : 'invisible'
                  }`}>
                    {value === 1 ? 'Poor' : value === 3 ? 'Good' : 'Excellent'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CommentsSection */}
              <label className="sr-only" htmlFor="confidential-comments">
                Confidential Comments
              </label>
              <textarea
                id="confidential-comments"
                disabled={checkingStatus || isSubmitting}
                className="w-full p-6 bg-white border border-slate-200 rounded-sm resize-none text-[15px] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 text-slate-800 transition-all min-h-[200px] disabled:bg-slate-50"
                placeholder="Share your detailed feedback (optional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>

          {/* SubmissionAction */}
          <div className="flex flex-col items-center gap-6 mt-8">
            <button
              disabled={isSubmitting}
              className="bg-black text-white px-14 py-4 text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-slate-800 transition-colors shadow-lg shadow-black/10 disabled:opacity-70 flex items-center gap-2"
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  SUBMITTING...
                </>
              ) : (
                "Submit Feedback"
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center max-w-xs leading-relaxed">
              Your feedback is anonymized and auto-filtered for professional language.
            </p>
          </div>
        </form>
      </main>

      <Modal isOpen={showSuccess} onClose={() => {}} title="Feedback Submitted">
        <div className="flex flex-col items-center text-center py-4">
          <CheckCircle2 className="text-emerald-500 mb-4" size={48} strokeWidth={1.5} />
          <p className="text-sm font-bold text-slate-900 mb-1">Thank you for your feedback!</p>
          <p className="text-xs text-slate-400">Your response has been recorded anonymously.</p>
          <button
            onClick={() => {
              setShowSuccess(false)
              navigate('/attendee/dashboard')
            }}
            className="mt-6 px-8 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-800 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default MeetingFeedback
