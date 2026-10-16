import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  Sparkles,
  Check,
  X,
  ArrowLeft,
  Loader2,
  Mail,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  closeAuthModal,
  setEmail as setStoreEmail,
  setStep as setStoreStep,
  clearError,
  sendOtp,
  verifyOtp,
  submitOnboarding,
  updateUserProfile,
} from "./authSlice"

export default function AuthModal({ isOpen: propsIsOpen, onClose: propsOnClose }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {
    isAuthModalOpen,
    email: storeEmail,
    step,
    cooldownSeconds,
    user,
    loading,
    error,
  } = useSelector((state) => state.auth || {})

  const isOpen = propsIsOpen !== undefined ? propsIsOpen : isAuthModalOpen

  const [localEmail, setLocalEmail] = useState(storeEmail || "")
  // 6 separate digit inputs for OTP (Screenshot 1)
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""])
  const otpRefs = useRef([])

  const [resendTimer, setResendTimer] = useState(38)

  // Step 3 (About You) State (Screenshot 2)
  const [fullName, setFullName] = useState("")
  const [gender, setGender] = useState("Female") // "Female" | "Male" | "Other"

  // Step 4 (Your Birth Details) State (Screenshots 3 & 4)
  const [birthDate, setBirthDate] = useState("2000-01-01")
  const [birthTime, setBirthTime] = useState("12:00")
  const [unknownTime, setUnknownTime] = useState(false)
  const [birthPlace, setBirthPlace] = useState("")

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    let interval = null
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [step, resendTimer])

  // Sync initial user details if available
  useEffect(() => {
    if (user?.name) setFullName(user.name)
    if (user?.gender) setGender(user.gender)
    if (user?.birthDate) setBirthDate(user.birthDate)
    if (user?.birthTime) setBirthTime(user.birthTime)
    if (user?.birthPlace) setBirthPlace(user.birthPlace)
  }, [user])

  const handleClose = (open) => {
    if (!open) {
      if (propsOnClose) {
        propsOnClose(false)
      }
      dispatch(closeAuthModal())
      setOtpDigits(["", "", "", "", "", ""])
    }
  }

  const isValidEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim())
  }

  // STEP 1 SUBMIT: Send OTP
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    const trimmedEmail = localEmail.trim()
    if (!isValidEmail(trimmedEmail)) return

    dispatch(clearError())
    dispatch(setStoreEmail(trimmedEmail))
    const result = await dispatch(sendOtp({ email: trimmedEmail }))
    if (!result.error) {
      setResendTimer(cooldownSeconds || 38)
      setOtpDigits(["", "", "", "", "", ""])
      setTimeout(() => {
        if (otpRefs.current[0]) otpRefs.current[0].focus()
      }, 100)
    }
  }

  // OTP Digit Box Change Handler
  const handleOtpDigitChange = (index, val) => {
    const cleaned = val.replace(/\D/g, "")
    if (!cleaned) {
      const nextDigits = [...otpDigits]
      nextDigits[index] = ""
      setOtpDigits(nextDigits)
      return
    }

    // If pasted multiple digits
    if (cleaned.length > 1) {
      const pasteDigits = cleaned.slice(0, 6).split("")
      const nextDigits = [...otpDigits]
      pasteDigits.forEach((d, i) => {
        if (index + i < 6) nextDigits[index + i] = d
      })
      setOtpDigits(nextDigits)
      const nextIndex = Math.min(5, index + pasteDigits.length)
      if (otpRefs.current[nextIndex]) otpRefs.current[nextIndex].focus()
      return
    }

    const nextDigits = [...otpDigits]
    nextDigits[index] = cleaned[0]
    setOtpDigits(nextDigits)

    // Auto-advance to next box
    if (index < 5 && cleaned[0]) {
      if (otpRefs.current[index + 1]) otpRefs.current[index + 1].focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      if (otpRefs.current[index - 1]) {
        otpRefs.current[index - 1].focus()
      }
    }
  }

  // STEP 2 SUBMIT: Verify OTP
  const fullOtp = otpDigits.join("")
  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    if (fullOtp.length !== 6) return

    dispatch(clearError())
    const emailToVerify = localEmail || storeEmail
    const result = await dispatch(verifyOtp({ email: emailToVerify, otp: fullOtp }))
    if (!result.error) {
      const verifiedUser = result.payload?.user
      const isComplete = Boolean(verifiedUser?.onboardingCompleted)

      if (propsOnClose) propsOnClose(false)
      dispatch(closeAuthModal())
      setOtpDigits(["", "", "", "", "", ""])

      if (isComplete) {
        navigate("/")
      } else {
        navigate("/onboarding")
      }
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0 || loading) return
    dispatch(clearError())
    const emailToTarget = localEmail || storeEmail
    const result = await dispatch(sendOtp({ email: emailToTarget }))
    if (!result.error) {
      setResendTimer(cooldownSeconds || 38)
    }
  }

  const handleBackToEmail = () => {
    dispatch(clearError())
    dispatch(setStoreStep(1))
    setOtpDigits(["", "", "", "", "", ""])
  }

  // STEP 3 SUBMIT: About You -> Advance to Step 4
  const handleAboutYouSubmit = (e) => {
    e.preventDefault()
    if (!fullName.trim()) return
    dispatch(setStoreStep(4))
  }

  // STEP 4 SUBMIT: Birth Details -> Finalize Profile
  const handleBirthDetailsSubmit = async (e) => {
    e.preventDefault()
    if (!birthDate || (!birthPlace.trim() && !birthPlace)) {
      toast.error("Please provide your date and place of birth.")
      return
    }

    const payload = {
      name: fullName.trim(),
      gender: gender.toLowerCase(),
      dob: birthDate,
      tob: unknownTime ? "12:00:00" : birthTime,
      isTimeUnknown: unknownTime,
      location: {
        city: birthPlace.trim(),
        lat: 12.9716,
        lng: 77.5946,
        timezoneOffset: 5.5,
      },
    }

    const result = await dispatch(submitOnboarding(payload))
    if (!result.error) {
      if (propsOnClose) {
        propsOnClose(false)
      }
      navigate("/")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[760px] md:max-w-[820px] w-[95vw] p-0 overflow-hidden border border-white/10 bg-[#161220] text-foreground rounded-2xl sm:rounded-3xl shadow-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 min-h-[460px]">
          {/* ================= LEFT HERO COLUMN ================= */}
          <div className="md:col-span-2 p-6 md:p-8 bg-gradient-to-b from-[#221321] via-[#1a0f1b] to-[#120a15] border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between relative overflow-hidden">
            {/* Subtle celestial radial aura */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#b32b6e]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#b32b6e] flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </span>
                <span className="font-serif font-bold text-xl tracking-tight text-white">
                  AstroTring
                </span>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white leading-tight">
                  This needs your <span className="text-[#e273a7] italic">birth chart</span>
                </h2>
                <div className="inline-block mt-3 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/70">
                  &ldquo;Buy Diamond&rdquo;
                </div>
              </div>

              {/* Checklist */}
              <ul className="space-y-3 pt-2 text-xs text-white/70">
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[3]" />
                  <span>Readings saved to your chart, not a cookie</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[3]" />
                  <span>Vaani remembers every thread</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[3]" />
                  <span>Astropedia stays free</span>
                </li>
              </ul>
            </div>

            <div className="text-[10px] text-white/40 font-mono pt-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Vedic Swiss-Ephemeris Engine</span>
            </div>
          </div>

          {/* ================= RIGHT FORM COLUMN ================= */}
          <div className="md:col-span-3 p-6 sm:p-8 flex flex-col justify-between relative bg-[#130f1b]">
            {/* Top Close Button */}
            <button
              onClick={() => handleClose(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* ---------------- STEP 1: EMAIL ENTRY ---------------- */}
            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-5 pt-1">
                {/* 4-Step Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.2em] mb-2">
                    <span className="text-[#e273a7] font-semibold">YOUR EMAIL</span>
                    <span className="text-white/40">STEP 1 OF 4</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    <div className="h-0.5 rounded-full bg-[#b32b6e]" />
                    <div className="h-0.5 rounded-full bg-white/10" />
                    <div className="h-0.5 rounded-full bg-white/10" />
                    <div className="h-0.5 rounded-full bg-white/10" />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <h3 className="text-2xl sm:text-[28px] font-serif font-normal text-white">
                    What&apos;s your email?
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed font-sans">
                    We&apos;ll text a 6-digit code to verify it. Your chart and readings stay tied to this email.
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                    {error}
                  </div>
                )}

                {/* Email Input */}
                <div className="flex items-center rounded-2xl border border-white/10 bg-[#1a1424] px-4 py-3 focus-within:border-[#b32b6e] transition-all">
                  <Mail className="w-4 h-4 text-white/40 shrink-0 mr-3" />
                  <Input
                    type="email"
                    placeholder="alex.mercer@example.com"
                    value={localEmail}
                    onChange={(e) => setLocalEmail(e.target.value)}
                    className="border-0 bg-transparent text-sm font-sans text-white placeholder:text-white/30 focus-visible:ring-0 shadow-none h-auto p-0"
                    autoFocus
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!isValidEmail(localEmail) || loading}
                  className="w-full bg-gradient-to-r from-[#9b1c5c] to-[#b32b6e] hover:from-[#a82064] hover:to-[#c23277] text-white font-medium py-3.5 rounded-full transition shadow-lg shadow-[#b32b6e]/20 disabled:opacity-40 cursor-pointer text-sm"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Code...
                    </span>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </form>
            )}

            {/* ---------------- STEP 2: OTP VERIFICATION (Screenshot 1) ---------------- */}
            {step === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-5 pt-1">
                {/* 4-Step Progress Bar with Change Email */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.2em] mb-2">
                    <button
                      type="button"
                      onClick={handleBackToEmail}
                      className="text-white/50 hover:text-white inline-flex items-center gap-1 cursor-pointer transition"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>CHANGE EMAIL</span>
                    </button>
                    <span className="text-white/40">STEP 2 OF 4</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    <div className="h-0.5 rounded-full bg-[#b32b6e]" />
                    <div className="h-0.5 rounded-full bg-[#b32b6e]" />
                    <div className="h-0.5 rounded-full bg-white/10" />
                    <div className="h-0.5 rounded-full bg-white/10" />
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <h3 className="text-2xl sm:text-[28px] font-serif font-normal text-white">
                    Enter the code
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed font-sans">
                    Sent to <span className="text-white font-medium">{localEmail || storeEmail}</span>. Enter the 6-digit code.
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                    {error}
                  </div>
                )}

                {/* 6 Individual Digit Boxes (Screenshot 1) */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-14 sm:w-12 sm:h-14 rounded-2xl bg-[#1a1424] border border-white/10 text-center font-mono text-xl sm:text-2xl font-semibold text-white focus:outline-none focus:border-[#b32b6e] focus:ring-1 focus:ring-[#b32b6e] transition-all"
                      />
                    ))}
                  </div>

                  <div className="text-xs text-white/50 pt-1 font-sans">
                    Didn&apos;t get it?{" "}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendTimer > 0 || loading}
                      className="text-[#e273a7] hover:underline disabled:opacity-40 disabled:no-underline font-medium cursor-pointer ml-1"
                    >
                      {resendTimer > 0 ? `Resend code in 0:${resendTimer < 10 ? `0${resendTimer}` : resendTimer}` : "Resend code"}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={fullOtp.length !== 6 || loading}
                  className="w-full bg-gradient-to-r from-[#9b1c5c] to-[#b32b6e] hover:from-[#a82064] hover:to-[#c23277] text-white font-medium py-3.5 rounded-full transition shadow-lg shadow-[#b32b6e]/20 disabled:opacity-40 cursor-pointer text-sm"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </form>
            )}

            {/* ---------------- STEP 3: ABOUT YOU (Screenshot 2) ---------------- */}
            {step === 3 && (
              <form onSubmit={handleAboutYouSubmit} className="space-y-5 pt-1">
                {/* 4-Step Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.2em] mb-2">
                    <span className="text-[#e273a7] font-semibold">ABOUT YOU</span>
                    <span className="text-white/40">STEP 3 OF 4</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    <div className="h-0.5 rounded-full bg-[#b32b6e]" />
                    <div className="h-0.5 rounded-full bg-[#b32b6e]" />
                    <div className="h-0.5 rounded-full bg-[#b32b6e]" />
                    <div className="h-0.5 rounded-full bg-white/10" />
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <h3 className="text-2xl sm:text-[28px] font-serif font-normal text-white">
                    A little about you
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed font-sans">
                    This helps Vaani address you the right way.
                  </p>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 block">
                    NAME
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#1a1424] px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#b32b6e] transition-all"
                    autoFocus
                    required
                  />
                </div>

                {/* Gender Pills Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 block">
                    GENDER
                  </label>
                  <div className="flex items-center gap-2.5">
                    {["Female", "Male", "Other"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setGender(item)}
                        className={`rounded-full px-5 py-2 text-xs sm:text-sm transition-all cursor-pointer ${
                          gender === item
                            ? "border border-[#b32b6e] bg-[#2d152b] text-white font-medium shadow-md shadow-[#b32b6e]/20"
                            : "border border-white/10 bg-[#161220] text-white/70 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!fullName.trim()}
                  className="w-full bg-gradient-to-r from-[#9b1c5c] to-[#b32b6e] hover:from-[#a82064] hover:to-[#c23277] text-white font-medium py-3.5 rounded-full transition shadow-lg shadow-[#b32b6e]/20 disabled:opacity-40 cursor-pointer text-sm"
                >
                  Continue
                </Button>
              </form>
            )}

            {/* ---------------- STEP 4: BIRTH DETAILS (Screenshots 3 & 4) ---------------- */}
            {step === 4 && (
              <form onSubmit={handleBirthDetailsSubmit} className="space-y-4 pt-1">
                {/* 4-Step Progress Bar with Back */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.2em] mb-2">
                    <button
                      type="button"
                      onClick={() => dispatch(setStoreStep(3))}
                      className="text-white/50 hover:text-white inline-flex items-center gap-1 cursor-pointer transition"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>BACK</span>
                    </button>
                    <span className="text-white/40">STEP 4 OF 4</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    <div className="h-0.5 rounded-full bg-[#b32b6e]" />
                    <div className="h-0.5 rounded-full bg-[#b32b6e]" />
                    <div className="h-0.5 rounded-full bg-[#b32b6e]" />
                    <div className="h-0.5 rounded-full bg-[#b32b6e]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-[28px] font-serif font-normal text-white">
                    Your birth details
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed font-sans">
                    Vedic astrology reads your chart from the exact moment and place you were born.
                  </p>
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 block">
                      DATE OF BIRTH
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-[#1a1424] px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#b32b6e] transition-all cursor-pointer"
                        required
                      />
                      <Calendar className="w-4 h-4 text-white/40 absolute right-3 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 block">
                      TIME OF BIRTH
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={birthTime}
                        disabled={unknownTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-[#1a1424] px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#b32b6e] transition-all disabled:opacity-40 cursor-pointer"
                      />
                      <Clock className="w-4 h-4 text-white/40 absolute right-3 top-3.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Don't know time checkbox */}
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white/60 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={unknownTime}
                    onChange={(e) => setUnknownTime(e.target.checked)}
                    className="w-4 h-4 rounded-full border-white/20 accent-[#b32b6e] cursor-pointer"
                  />
                  <span>I don&apos;t know my time of birth</span>
                </label>

                {/* Place of Birth Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 block">
                    PLACE OF BIRTH
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-white/40 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      placeholder="City, State, Country"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#1a1424] pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#b32b6e] transition-all"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-white/40 block">
                    Choose your city from the list so we can place your chart.
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={!birthDate || !birthPlace.trim()}
                  className="w-full bg-gradient-to-r from-[#9b1c5c] to-[#b32b6e] hover:from-[#a82064] hover:to-[#c23277] text-white font-medium py-3.5 rounded-full transition shadow-lg shadow-[#b32b6e]/20 disabled:opacity-40 cursor-pointer text-sm"
                >
                  Continue
                </Button>
              </form>
            )}

            {/* Bottom Footer Note */}
            <div className="text-[10px] text-center font-mono text-white/40 pt-4 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>
                {step === 1 && "WE ONLY USE YOUR EMAIL TO SIGN YOU IN"}
                {step === 2 && "NEVER SHARE THIS CODE WITH ANYONE"}
                {step === 3 && "YOU CAN CHANGE THIS LATER"}
                {step === 4 && "YOU CAN REFINE THESE ANY TIME"}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
