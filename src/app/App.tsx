import { useState, useRef, useEffect } from "react";
import {
  ArrowRight, ChevronLeft, MessageSquare, BookOpen, TrendingUp,
  Phone, MoreVertical, Plus, Send, Shield, ShieldCheck,
  Check, Lock, Lightbulb, Fingerprint, Eye, Copy, Delete, Play, Pause,
  AlertTriangle, Star, Search, FileText, X, Users, Mail, Trophy,
  Volume2, Zap, Brain, Bot
} from "lucide-react";
import horsesImg from "../imports/PracticeVerifiedNewsIdentification/e0a2f546717bee05f0abd22db6645e2b5253caab.png";

// ── Types ─────────────────────────────────────────────────────────────────────

type Screen =
  | "loading" | "intro" | "coach" | "lessons"
  | "2fa-explained" | "password-lesson" | "2fa-practice" | "success"
  | "biometric" | "biometric-practice" | "2fa-complete"
  | "genai-intro" | "genai-practice" | "voice-scam-correct" | "voice-scam-incorrect"
  | "news-practice" | "news-article" | "news-correct" | "news-incorrect"
  | "fairprice-practice" | "genai-complete"
  | "email-setup" | "email-has-account" | "email-already-has" | "email-choose-provider"
  | "email-create-address" | "email-create-password" | "email-password-reminder" | "email-2fa-setup"
  | "email-setup-complete" | "email-remember-details" | "email-safety-bridge"
  | "email-overview" | "email-inbox-lesson" | "email-inbox-search"
  | "email-cpf-view" | "email-check-sender" | "email-attachments-lesson"
  | "email-sister-mary-view" | "email-compose-lesson" | "email-inbox-find-compose"
  | "email-compose" | "email-inbox-sister-mary" | "email-compose-reply" | "email-complete"
  | "false-info-intro" | "sure-breakdown" | "sure-diabetes-practice"
  | "sure-diabetes-feedback" | "sure-terrorism-family" | "sure-terrorism-breakdown"
  | "sure-inappropriate-feedback" | "false-info-summary" | "false-info-complete"
  | "2fa-summary" | "genai-summary" | "email-summary"
  | "topics-summary" | "safety-graduate" | "all-topics-summary"
  | "topic-loading";

type NavTab = "coach" | "lessons" | "progress";
type MessageKind = "text" | "topic-selection";

interface Message {
  id: number;
  kind: MessageKind;
  text: string;
  from: "coach" | "user";
  time: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CORRECT_CODE = "562901";

const TOPICS = [
  { id: "2fa", emoji: "🔐", title: "2-Factor Authentication", description: "Add an extra layer of protection to your important accounts.", category: "Enable 2FA", categoryBg: "#9BF7A9", categoryColor: "#002109", targetScreen: "2fa-explained" as Screen },
  { id: "ai", emoji: "🤖", title: "Generative AI", description: "Explore how AI creates fake voices and learn to spot voice scams.", category: "Emerging Tech", categoryBg: "#DEF0FF", categoryColor: "#3F493F", targetScreen: "genai-intro" as Screen },
  { id: "email", emoji: "📧", title: "Email", description: "Learn how to safely open attachments, organise your inbox and compose emails.", category: "Communication", categoryBg: "#DEF0FF", categoryColor: "#3F493F", targetScreen: "email-setup" as Screen },
  { id: "false-info", emoji: "🚩", title: "False Information & Inappropriate Content", description: "Use the S.U.R.E. method to check if news and messages are real.", category: "Digital Literacy", categoryBg: "#DEF0FF", categoryColor: "#3F493F", targetScreen: "false-info-intro" as Screen },
];

const EMAILS = [
  { id: "tts", sender: "TTS", subject: "Appointment Reminder", preview: "This is a reminder for your upcoming medical appointment at Tan Tock Seng...", time: "8:45 AM", unread: true, icon: "🏥" },
  { id: "dbs", sender: "DBS Bank", subject: "Your Monthly Statement", preview: "Your statement for the month of October is now ready for viewing...", time: "7:42 AM", unread: false, icon: "🏦" },
  { id: "sp", sender: "SP Group", subject: "Your Utility Bill for Oct is ready", preview: "Your latest utility bill for the account ending in 4829...", time: "Yesterday", unread: true, icon: "⚡" },
  { id: "cpf", sender: "CPF Board", subject: "Your CPF Statement is ready", preview: "Your latest CPF statement for the current period is now available...", time: "Yesterday", unread: false, icon: "🏛️" },
  { id: "fairprice", sender: "FairPrice", subject: "Special Voucher for You!", preview: "CONGRATULATIONS! You have won $500 voucher. Click here to claim now!", time: "Thursday", unread: true, icon: "🛒" },
  { id: "singpass", sender: "Singpass", subject: "Security Alert: New Login", preview: "A new login was detected on your account from a Chrome browser...", time: "Tuesday", unread: false, icon: "🔑" },
  { id: "mary", sender: "Sister Mary", subject: "Recipe for Pineapple Tart", preview: "Hi dear, here is the recipe I promised you! Let me know...", time: "Monday", unread: false, icon: "👩" },
  { id: "wei", sender: "Lee Wei Ming", subject: "Dinner this Saturday?", preview: "Are you free for dinner at the usual place on Saturday evening?", time: "Sunday", unread: false, icon: "🍽️" },
];

const SURE_CARDS = [
  { letter: "S", title: "Source", desc: "Who posted it? Is the source official or reliable?", color: "#006D2F" },
  { letter: "U", title: "Understand", desc: "What is it really saying? Is it trying to scare you?", color: "#9D1C52" },
  { letter: "R", title: "Research", desc: "Check dates and compare with official news sources.", color: "#594181" },
  { letter: "E", title: "Evaluate", desc: "Does evidence support it? If unsure, don't share.", color: "#3C4A3D" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPasswordStrength(pwd: string) {
  if (!pwd) return { score: 0, label: "Waiting...", color: "#e5e1e7" };
  let score = 0;
  if (pwd.length >= 8) score += 25;
  if (pwd.length >= 12) score += 25;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 25;
  if (/[0-9]/.test(pwd)) score += 12;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 13;
  score = Math.min(score, 100);
  if (score < 25) return { score, label: "Weak", color: "#ef4444" };
  if (score < 50) return { score, label: "Fair", color: "#f97316" };
  if (score < 75) return { score, label: "Good", color: "#eab308" };
  return { score, label: "Strong", color: "#006D2F" };
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── BOTTOM NAV ────────────────────────────────────────────────────────────────

function BottomNav({ active, onTab }: { active: NavTab; onTab: (t: NavTab) => void }) {
  const tabs: { id: NavTab; Icon: typeof MessageSquare; label: string }[] = [
    { id: "coach", Icon: MessageSquare, label: "Coach" },
    { id: "lessons", Icon: BookOpen, label: "Lessons" },
    { id: "progress", Icon: TrendingUp, label: "Progress" },
  ];
  return (
    <div className="shrink-0 bg-[#FDF8FD] border-t-2 border-[#BBCBB9] flex items-center justify-around h-[76px] z-10">
      {tabs.map(({ id, Icon, label }) => {
        const isActive = active === id;
        return (
          <button key={id} onClick={() => onTab(id)}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${isActive ? "bg-[#25D366]" : ""}`}>
            <Icon size={24} className={isActive ? "text-[#005523]" : "text-[#3C4A3D]"} />
            <span className={`text-[14px] font-semibold ${isActive ? "text-[#005523]" : "text-[#3C4A3D]"}`}
              style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── WHATSAPP HEADER ───────────────────────────────────────────────────────────

function WhatsAppHeader({ onBack }: { onBack?: () => void }) {
  return (
    <div className="bg-[#006D2F] flex items-center justify-between px-4 h-[64px] shrink-0 shadow-md z-10">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="text-white -ml-1">
            <ChevronLeft size={28} />
          </button>
        )}
        <div className="w-11 h-11 bg-white/20 rounded-full border-2 border-white/30 flex items-center justify-center shrink-0">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Safety Coach</div>
          <div className="text-white/80 text-[13px]">Online</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Phone size={20} className="text-white" />
        <MoreVertical size={20} className="text-white" />
      </div>
    </div>
  );
}

// ── LIGHT HEADER (Email App Style) ────────────────────────────────────────────

function LightHeader({ onBack, title = "Safety Coach" }: { onBack?: () => void; title?: string }) {
  return (
    <div className="shrink-0 bg-white border-b border-[#E5E7EB] flex items-center h-[56px] px-4 shadow-sm z-10">
      {onBack && (
        <button onClick={onBack} className="mr-2 text-[#006D2F]">
          <ChevronLeft size={24} />
        </button>
      )}
      <div className="flex items-center gap-2 flex-1">
        <div className="w-8 h-8 bg-[#006D2F] rounded-full flex items-center justify-center">
          <Shield size={14} className="text-white" />
        </div>
        <span className="text-[#005222] font-bold text-[18px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</span>
      </div>
    </div>
  );
}

// ── GROUP CHAT HEADER ─────────────────────────────────────────────────────────

function GroupChatHeader({ onBack }: { onBack?: () => void }) {
  return (
    <div className="bg-[#006D2F] flex items-center justify-between px-4 h-[64px] shrink-0 shadow-md z-10">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="text-white -ml-1"><ChevronLeft size={28} /></button>
        )}
        <div className="w-11 h-11 bg-white/20 rounded-full border-2 border-white/30 flex items-center justify-center shrink-0">
          <Users size={20} className="text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Family Group</div>
          <div className="text-white/80 text-[13px]">Sister, Brother, You</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Phone size={20} className="text-white" />
        <MoreVertical size={20} className="text-white" />
      </div>
    </div>
  );
}

// ── TOPIC CARD ────────────────────────────────────────────────────────────────

function TopicCard({ categoryLabel, categoryBg, categoryTextColor, status, title, description, completed, onClick }: {
  categoryLabel: string; categoryBg: string; categoryTextColor: string;
  status: string; title: string; description: string; completed: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="bg-white w-full text-left rounded-xl border border-[#D1D5DB] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-[13px] font-medium" style={{ backgroundColor: categoryBg, color: categoryTextColor }}>{categoryLabel}</span>
          <span className={`text-[14px] font-semibold ${completed ? "text-[#005222]" : "text-[#3F493F]"}`}>{status}</span>
        </div>
        <h3 className="text-[#091E29] font-bold text-[24px] leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
        <p className="text-[#3F493F] text-[18px] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{description}</p>
        {completed && <div className="h-1.5 bg-[#005222] rounded-full w-full" />}
      </div>
    </button>
  );
}

// ── TOPIC SELECTION CARDS (in-chat) ───────────────────────────────────────────

function TopicSelectionCards({ onSelect }: { onSelect: (id: string, screen: Screen) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-4 w-full">
      {TOPICS.map((t) => (
        <button key={t.id} onClick={() => { setSelected(t.id); onSelect(t.id, t.targetScreen); }}
          className={`w-full text-left rounded-2xl border-2 p-5 flex items-start gap-4 transition-all shadow-sm ${selected === t.id ? "border-[#006D2F] bg-[#E6F4EA]" : "border-[#D1D5DB] bg-white hover:border-[#90EC9F] hover:shadow-md"}`}>
          <span className="text-[32px] shrink-0 mt-0.5">{t.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[#091E29] text-[19px] leading-snug" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>{t.title}</p>
            <p className="text-[#3C4A3D] text-[17px] mt-1.5 leading-relaxed" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>{t.description}</p>
            <span className="inline-block mt-2.5 px-3 py-1 rounded-full text-[13px] font-semibold" style={{ backgroundColor: t.categoryBg, color: t.categoryColor }}>{t.category}</span>
          </div>
          {selected === t.id && (
            <div className="shrink-0 w-6 h-6 bg-[#006D2F] rounded-full flex items-center justify-center mt-1">
              <Check size={13} className="text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

// ── EMAIL ROW ─────────────────────────────────────────────────────────────────

function EmailRow({ email, onClick, highlighted, showStar, starred, onStar }: {
  email: typeof EMAILS[0];
  onClick?: () => void;
  highlighted?: boolean;
  showStar?: boolean;
  starred?: boolean;
  onStar?: (e: React.MouseEvent) => void;
}) {
  return (
    <div onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 border-b border-[#F3F4F6] cursor-pointer transition-colors ${highlighted ? "bg-[#E6F4EA] border-l-4 border-l-[#006D2F]" : "bg-white hover:bg-[#F9FAFB]"}`}>
      <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[18px] shrink-0">
        {email.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
          <span className={`text-[15px] truncate ${email.unread ? "font-bold text-[#091E29]" : "text-[#3F493F]"}`}>{email.sender}</span>
          <span className="text-[12px] text-[#9CA3AF] ml-2 shrink-0">{email.time}</span>
        </div>
        <p className={`text-[13px] truncate ${email.unread ? "font-semibold text-[#1C1B1F]" : "text-[#6B7280]"}`}>{email.subject}</p>
        <p className="text-[12px] text-[#9CA3AF] truncate">{email.preview}</p>
      </div>
      {showStar && (
        <button onClick={onStar} className="p-1 shrink-0">
          <Star size={18} className={starred ? "text-yellow-400 fill-yellow-400" : "text-[#D1D5DB]"} />
        </button>
      )}
    </div>
  );
}

// ── COACH TIP BANNER ─────────────────────────────────────────────────────────

function CoachTip({ text }: { text: string }) {
  return (
    <div className="shrink-0 bg-[#E6F4EA] border-b border-[#BBCBB9] px-4 py-3 flex gap-3 items-start">
      <div className="w-8 h-8 bg-[#006D2F] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <Lightbulb size={14} className="text-[#90EC9F]" />
      </div>
      <div>
        <p className="text-[#005222] font-semibold text-[16px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Coach Tip</p>
        <p className="text-[#3F493F] text-[16px] mt-0.5" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>{text}</p>
      </div>
    </div>
  );
}

// ── LOADING SPLASH ────────────────────────────────────────────────────────────

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("show"), 100);
    const t2 = setTimeout(() => setPhase("exit"), 2800);
    const t3 = setTimeout(() => onDone(), 3300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #004d22 0%, #006D2F 50%, #008a3c 100%)", opacity: phase === "exit" ? 0 : 1, transition: "opacity 0.5s ease" }}>
      <div className="absolute w-80 h-80 bg-[#90EC9F] opacity-10 blur-3xl rounded-full top-[-60px] right-[-60px]"
        style={{ transform: phase === "enter" ? "scale(0.5)" : "scale(1)", transition: "transform 1s ease" }} />
      <div className="absolute w-60 h-60 bg-[#25D366] opacity-10 blur-2xl rounded-full bottom-[-30px] left-[-40px]"
        style={{ transform: phase === "enter" ? "scale(0.5)" : "scale(1)", transition: "transform 1.2s ease 0.2s" }} />
      <div style={{ transform: phase === "enter" ? "scale(0.5) translateY(20px)" : "scale(1) translateY(0)", opacity: phase === "enter" ? 0 : 1, transition: "transform 0.7s cubic-bezier(0.34,1.56,0.64,1), opacity 0.6s ease" }}>
        <div className="relative flex items-center justify-center" style={{ width: 128, height: 128, background: "rgba(255,255,255,0.15)", borderRadius: 32, boxShadow: "0 0 0 1px rgba(255,255,255,0.2), 0 20px 40px rgba(0,0,0,0.3), 0 0 60px rgba(37,211,102,0.3)" }}>
          <Shield size={64} className="text-white" strokeWidth={1.5} />
          <div className="absolute bottom-3 right-3 bg-[#25D366] rounded-full flex items-center justify-center" style={{ width: 30, height: 30 }}>
            <Check size={15} className="text-white" strokeWidth={3} />
          </div>
        </div>
      </div>
      <div className="text-center mt-8" style={{ opacity: phase === "enter" ? 0 : 1, transform: phase === "enter" ? "translateY(16px)" : "translateY(0)", transition: "all 0.7s ease 0.2s" }}>
        <h1 className="text-white font-bold text-[36px] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Safety Coach</h1>
        <p className="text-white/70 text-[18px] mt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your Digital Safety Guide</p>
      </div>
      <div className="flex items-center gap-2 mt-12" style={{ opacity: phase === "enter" ? 0 : 1, transition: "opacity 0.6s ease 0.5s" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2.5 h-2.5 bg-white/60 rounded-full" style={{ animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <div className="absolute bottom-12 text-center px-8" style={{ opacity: phase === "enter" ? 0 : 0.6, transition: "opacity 0.8s ease 0.6s" }}>
        <p className="text-white text-[14px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Part of the <span className="font-bold">Digital For Life</span> initiative</p>
      </div>
      <style>{`@keyframes dotPulse { 0%,80%,100% { transform:scale(0.7); opacity:0.4; } 40% { transform:scale(1.1); opacity:1; } }`}</style>
    </div>
  );
}

// ── CONFETTI ──────────────────────────────────────────────────────────────────

function Confetti() {
  const colors = ["#006D2F", "#7fda8f", "#9bf7a9", "#d0b4fd", "#594181", "#25D366"];
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${(i * 4.2) % 100}vw`,
    color: colors[i % colors.length],
    size: 7 + (i % 5),
    dur: `${2 + (i % 3)}s`,
    delay: `${(i % 4) * 0.3}s`,
  }));
  return (
    <>
      <style>{`
        @keyframes cfFall { 0%{transform:translateY(-60px) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(400deg);opacity:0} }
        .cf { position:fixed; top:0; border-radius:2px; animation:cfFall linear infinite; pointer-events:none; z-index:50; }
      `}</style>
      {pieces.map(p => (
        <div key={p.id} className="cf" style={{ left: p.left, width: p.size, height: p.size, backgroundColor: p.color, animationDuration: p.dur, animationDelay: p.delay }} />
      ))}
    </>
  );
}

// ── VOICE PLAYER ─────────────────────────────────────────────────────────────

function VoicePlayer({ text, gender, timestamp }: {
  text: string;
  gender: "female" | "male";
  timestamp: string;
}) {
  const [state, setState] = useState<"idle" | "playing" | "done">("idle");
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => () => { window.speechSynthesis.cancel(); }, []);

  const toggle = () => {
    if (state === "playing") {
      window.speechSynthesis.cancel();
      setState("idle");
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utterRef.current = utter;
    utter.pitch = gender === "female" ? 1.2 : 0.88;
    utter.rate = 0.84;
    utter.volume = 1;

    const doSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      if (gender === "female") {
        const pick = voices.find(v => /samantha|karen|victoria|moira|fiona|female|zira/i.test(v.name));
        if (pick) utter.voice = pick;
      } else {
        const pick = voices.find(v => /daniel|tom|alex|fred|oliver|male/i.test(v.name) && !/female/i.test(v.name));
        if (pick) utter.voice = pick;
      }
      utter.onend = () => setState("done");
      utter.onerror = () => setState("idle");
      window.speechSynthesis.speak(utter);
      setState("playing");
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      doSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = doSpeak;
    }
  };

  const bars = [4, 10, 6, 16, 8, 12, 5, 18, 9, 14, 6, 11, 7, 15, 8];

  return (
    <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-4 max-w-[300px] shadow-sm border border-[rgba(187,203,185,0.3)]">
      <div className="flex items-center gap-3">
        <button onClick={toggle}
          className="w-11 h-11 bg-[#006D2F] rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-all shadow-md">
          {state === "playing"
            ? <Pause size={16} className="text-white fill-white" />
            : <Play size={18} className="text-white fill-white ml-0.5" />}
        </button>
        <div className="flex-1">
          <div className="flex items-end gap-0.5 h-8">
            {bars.map((h, i) => (
              <div key={i} className="w-1 rounded-full"
                style={{
                  height: `${h}px`,
                  backgroundColor: state === "done" ? "#9CA3AF" : "#006D2F",
                  opacity: state === "done" ? 0.4 : 0.75,
                  ...(state === "playing" ? {
                    animation: `voiceBar 0.5s ease-in-out ${i * 0.04}s infinite alternate`,
                  } : {}),
                }} />
            ))}
          </div>
          <p className="text-[#3F493F] text-[13px] mt-1 font-medium">
            {state === "idle" ? "Tap to play" : state === "playing" ? "Playing..." : "✓ Played"}
          </p>
        </div>
      </div>
      <p className="text-[#3F493F] text-[13px] italic text-right mt-2">{timestamp}</p>
      <style>{`@keyframes voiceBar{from{transform:scaleY(0.4);transform-origin:bottom}to{transform:scaleY(1.8);transform-origin:bottom}}`}</style>
    </div>
  );
}

// ── BIOMETRIC PRACTICE (Interactive) ─────────────────────────────────────────

function BiometricPracticeScreen({ onBack, onDone, onTab }: {
  onBack: () => void;
  onDone: () => void;
  onTab: (t: NavTab) => void;
}) {
  const [facePhase, setFacePhase] = useState<"idle" | "scanning" | "success">("idle");
  const [touchPhase, setTouchPhase] = useState<"idle" | "holding" | "success">("idle");
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (holdTimer.current) clearInterval(holdTimer.current); }, []);

  const startFaceScan = () => {
    if (facePhase !== "idle") return;
    setFacePhase("scanning");
    setTimeout(() => setFacePhase("success"), 2400);
  };

  const startHold = () => {
    if (touchPhase !== "idle") return;
    setTouchPhase("holding");
    let p = 0;
    holdTimer.current = setInterval(() => {
      p += 5;
      setHoldProgress(p);
      if (p >= 100) {
        clearInterval(holdTimer.current!);
        holdTimer.current = null;
        setTouchPhase("success");
      }
    }, 100);
  };

  const cancelHold = () => {
    if (touchPhase === "holding") {
      if (holdTimer.current) { clearInterval(holdTimer.current); holdTimer.current = null; }
      setTouchPhase("idle");
      setHoldProgress(0);
    }
  };

  const bothDone = facePhase === "success" && touchPhase === "success";

  return (
    <div className="h-screen flex flex-col max-w-[680px] mx-auto" style={{ background: "rgb(253,248,253)", animation: "screenFadeIn 0.25s ease-out" }}>
      <WhatsAppHeader onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-6 py-7 space-y-6">
        <div className="text-center">
          <h2 className="text-[#006D2F] text-[28px] font-bold tracking-tight" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Give it a Try!</h2>
          <p className="text-[#3C4A3D] text-[18px] mt-2 leading-relaxed" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Practice unlocking with your Face or Finger. This is a safe test!</p>
        </div>

        {/* Face ID Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#1C1B1F] font-bold text-[22px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Face ID Test</h3>
            {facePhase === "success" && (
              <div className="bg-[#25D366] flex items-center gap-1.5 px-3 py-1 rounded-full">
                <Check size={13} className="text-[#005523]" />
                <span className="text-[#005523] text-[14px] font-semibold">Success!</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-5 py-3">
            {facePhase === "idle" && (
              <>
                <div className="w-24 h-24 bg-[#8CF1E1] rounded-full flex items-center justify-center">
                  <Eye size={44} className="text-[#006F64]" />
                </div>
                <p className="text-[#3C4A3D] text-[17px] font-semibold text-center" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Tap the button to scan your face</p>
                <button onClick={startFaceScan}
                  className="w-full bg-[#006D2F] rounded-xl h-14 flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all">
                  <Eye size={20} className="text-white" />
                  <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Scan Face</span>
                </button>
              </>
            )}
            {facePhase === "scanning" && (
              <>
                <div className="relative w-28 h-28">
                  <div className="w-28 h-28 bg-[#8CF1E1] rounded-full flex items-center justify-center"
                    style={{ animation: "facePulse 0.75s ease-in-out infinite" }}>
                    <Eye size={52} className="text-[#006F64]" />
                  </div>
                  <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    <div className="absolute inset-x-0 h-1.5 bg-[#006D2F]/50 rounded-full"
                      style={{ animation: "scanSweep 0.9s ease-in-out infinite" }} />
                  </div>
                </div>
                <div className="w-full bg-[#E5E1E7] rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-[#006D2F] rounded-full" style={{ animation: "scanFill 2.4s linear forwards" }} />
                </div>
                <p className="text-[#3C4A3D] text-[17px] font-semibold" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Scanning... hold still</p>
              </>
            )}
            {facePhase === "success" && (
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="w-28 h-28 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg"
                  style={{ animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
                  <Check size={56} className="text-white" strokeWidth={3} />
                </div>
                <p className="text-[#006D2F] font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Face Recognised! ✓</p>
              </div>
            )}
          </div>
        </div>

        {/* Touch ID Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#1C1B1F] font-bold text-[22px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Touch ID Test</h3>
            {touchPhase === "success" && (
              <div className="bg-[#25D366] flex items-center gap-1.5 px-3 py-1 rounded-full">
                <Check size={13} className="text-[#005523]" />
                <span className="text-[#005523] text-[14px] font-semibold">Success!</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-4 py-3">
            {touchPhase !== "success" && (
              <>
                <div
                  onPointerDown={startHold}
                  onPointerUp={cancelHold}
                  onPointerLeave={cancelHold}
                  className="w-32 h-32 rounded-full flex items-center justify-center cursor-pointer select-none relative"
                  style={{
                    background: touchPhase === "holding"
                      ? `conic-gradient(#25D366 ${holdProgress * 3.6}deg, #E5E1E7 0deg)`
                      : "#E5E1E7",
                    transition: "background 0.05s",
                  }}>
                  <div className="absolute inset-2.5 rounded-full bg-white flex flex-col items-center justify-center gap-1 shadow-sm">
                    <Fingerprint size={48}
                      className={touchPhase === "holding" ? "text-[#006D2F]" : "text-[#6C7B6B]"}
                      style={touchPhase === "holding" ? { animation: "fingerPulse 0.6s ease-in-out infinite" } : {}} />
                    <span className="text-[12px] font-semibold"
                      style={{ color: touchPhase === "holding" ? "#006D2F" : "#6C7B6B" }}>
                      {touchPhase === "holding" ? "Keep holding..." : "Touch Here"}
                    </span>
                  </div>
                </div>
                <p className="text-[#1C1B1F] text-[17px] font-semibold text-center" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>
                  {touchPhase === "holding" ? "Keep your finger pressed!" : "Hold your finger on the circle for 2 seconds"}
                </p>
              </>
            )}
            {touchPhase === "success" && (
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="w-28 h-28 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg"
                  style={{ animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
                  <Fingerprint size={52} className="text-white" />
                </div>
                <p className="text-[#006D2F] font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Fingerprint Saved! ✓</p>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes facePulse{0%,100%{box-shadow:0 0 0 0 rgba(0,109,47,0.4)}50%{box-shadow:0 0 0 14px rgba(0,109,47,0)}}
          @keyframes scanSweep{0%{top:5%;opacity:1}100%{top:92%;opacity:0.2}}
          @keyframes scanFill{from{width:0%}to{width:100%}}
          @keyframes popIn{from{transform:scale(0.4);opacity:0}to{transform:scale(1);opacity:1}}
          @keyframes fingerPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
        `}</style>
      </div>

      {bothDone && (
        <div className="shrink-0 px-6 pt-4 pb-4 bg-[rgba(253,248,253,0.95)] border-t border-[#BBCBB9]">
          <button onClick={onDone}
            className="w-full bg-[#006D2F] rounded-xl h-14 flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all">
            <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Done with Practice</span>
            <ArrowRight size={18} className="text-white" />
          </button>
        </div>
      )}
      <BottomNav active="lessons" onTab={onTab} />
    </div>
  );
}

// ── TOPIC LOADING SPLASH ──────────────────────────────────────────────────────

function TopicLoadingScreen({ topic, onDone }: { topic: { emoji: string; title: string } | null; onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 300);
    const t2 = setTimeout(() => setPhase("out"), 900);
    const t3 = setTimeout(() => onDone(), 1150);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #004d22 0%, #006D2F 55%, #008a3c 100%)",
        opacity: phase === "out" ? 0 : 1,
        transition: "opacity 0.25s ease",
      }}>
      {/* Ambient glow */}
      <div className="absolute w-72 h-72 bg-[#25D366] opacity-15 blur-3xl rounded-full" />
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center"
        style={{
          opacity: phase === "in" ? 0 : 1,
          transform: phase === "in" ? "scale(0.85) translateY(16px)" : "scale(1) translateY(0)",
          transition: "opacity 0.3s ease, transform 0.35s cubic-bezier(0.34,1.4,0.64,1)",
        }}>
        {/* Emoji badge */}
        <div className="w-28 h-28 bg-white/15 rounded-3xl border border-white/25 flex items-center justify-center shadow-[0_0_40px_rgba(37,211,102,0.3)]">
          <span style={{ fontSize: 60, lineHeight: 1 }}>{topic?.emoji ?? "📚"}</span>
        </div>
        {/* Label */}
        <div>
          <p className="text-white/70 text-[15px] font-medium tracking-widest uppercase mb-2"
            style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>
            Starting Module
          </p>
          <h2 className="text-white font-bold text-[26px] leading-snug"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {topic?.title ?? "Lesson"}
          </h2>
        </div>
        {/* Dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2.5 h-2.5 bg-white/60 rounded-full"
              style={{ animation: `dotPulse 1s ease-in-out ${i * 0.18}s infinite` }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes dotPulse{0%,80%,100%{transform:scale(0.7);opacity:0.4}40%{transform:scale(1.1);opacity:1}}`}</style>
    </div>
  );
}

function renderBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, kind: "text", text: "Hello! I am your Safety Coach.\n\nI am here to help you stay safe and become confident online. Type **Ready** to learn about online safety.", from: "coach", time: "10:42 AM" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState(false);
  // Email setup state
  const [emailProvider, setEmailProvider] = useState<"gmail" | "yahoo" | "outlook" | null>(null);
  const [emailUsername, setEmailUsername] = useState("");
  const [emailSetupPassword, setEmailSetupPassword] = useState("");
  const [showSetupPassword, setShowSetupPassword] = useState(false);
  const [emailTfaPhase, setEmailTfaPhase] = useState<"explain" | "pin">("explain");
  const [emailSetupOtp, setEmailSetupOtp] = useState(["", "", "", "", "", ""]);
  const [emailSetupOtpError, setEmailSetupOtpError] = useState(false);
  // Email module state
  const [emailSearch, setEmailSearch] = useState("");
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [emailBody, setEmailBody] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [senderChoice, setSenderChoice] = useState<"correct" | "wrong" | null>(null);
  // SURE module state
  const [diabetesChoice, setDiabetesChoice] = useState<"try" | "sure" | null>(null);
  const [falseInfoLinkClicked, setFalseInfoLinkClicked] = useState(false);
  const [terrorismChoice, setTerrorismChoice] = useState<"alert" | "sure" | null>(null);
  const [inappChoice, setInappChoice] = useState<"tap" | "sure" | null>(null);
  const [inappLinkClicked, setInappLinkClicked] = useState(false);
  // GenAI practice state
  const [showVoiceTranscripts, setShowVoiceTranscripts] = useState(false);
  const [voiceScamChoice, setVoiceScamChoice] = useState<"real" | "ai" | "unsure" | null>(null);
  const [newsChoice, setNewsChoice] = useState<"real" | "suspicious" | "cant-check" | null>(null);
  const [fairPriceLinkClicked, setFairPriceLinkClicked] = useState(false);
  // Topic loading state
  const [pendingScreen, setPendingScreen] = useState<Screen>("coach");
  const [pendingTopic, setPendingTopic] = useState<{ emoji: string; title: string } | null>(null);
  // 2FA complete progress animation
  const [tfaBarPct, setTfaBarPct] = useState(80);

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `@keyframes screenFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`;
    document.head.appendChild(s);
    return () => { document.head.removeChild(s); };
  }, []);

  useEffect(() => {
    if (screen === "2fa-complete") {
      setTfaBarPct(80);
      const t = setTimeout(() => setTfaBarPct(100), 120);
      return () => clearTimeout(t);
    }
  }, [screen]);

  const FADE: React.CSSProperties = { animation: "screenFadeIn 0.25s ease-out" };

  const go = (s: Screen) => setScreen(s);

  const COACH_SCREENS: Screen[] = [
    "coach", "topic-loading", "genai-intro", "genai-practice", "voice-scam-correct", "voice-scam-incorrect",
    "news-practice", "news-article", "news-correct", "news-incorrect", "fairprice-practice", "genai-complete",
    "email-setup", "email-has-account", "email-already-has", "email-choose-provider", "email-create-address",
    "email-create-password", "email-password-reminder", "email-2fa-setup", "email-setup-complete", "email-remember-details", "email-safety-bridge",
    "email-overview", "email-check-sender", "email-attachments-lesson", "email-compose-lesson",
    "false-info-intro", "sure-breakdown", "sure-diabetes-practice", "sure-diabetes-feedback",
    "sure-terrorism-family", "sure-terrorism-breakdown", "sure-inappropriate-feedback",
    "false-info-summary", "2fa-summary", "genai-summary", "email-summary",
  ];
  const PROGRESS_SCREENS: Screen[] = ["topics-summary", "safety-graduate", "all-topics-summary"];

  const activeTab: NavTab =
    PROGRESS_SCREENS.includes(screen) ? "progress" :
    COACH_SCREENS.includes(screen) ? "coach" : "lessons";

  const switchTab = (t: NavTab) => {
    if (t === "coach") go("coach");
    else if (t === "lessons") go("lessons");
    else if (t === "progress") go("topics-summary");
  };

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: Date.now(), kind: "text", text, from: "user", time: nowTime() }]);
    setChatInput("");
    if (text.toLowerCase() === "ready") {
      setTimeout(() => {
        setMessages((prev) => [...prev, { id: Date.now() + 1, kind: "topic-selection", text: "Great! Choose the topics you are interested in:", from: "coach", time: nowTime() }]);
      }, 750);
    }
  };

  const handleTopicSelect = (id: string, targetScreen: Screen) => {
    const topic = TOPICS.find((t) => t.id === id);
    setMessages((prev) => [...prev, { id: Date.now(), kind: "text", text: `Starting ${topic?.title}...`, from: "user", time: nowTime() }]);
    setPendingScreen(targetScreen);
    setPendingTopic(topic ? { emoji: topic.emoji, title: topic.title } : null);
    setTimeout(() => go("topic-loading"), 500);
  };

  const pressOtp = (key: string) => {
    if (key === "del") {
      const lastIdx = [...otp].map((v, i) => (v ? i : -1)).filter((i) => i >= 0).pop() ?? -1;
      if (lastIdx >= 0) setOtp((prev) => { const n = [...prev]; n[lastIdx] = ""; return n; });
      setOtpError(false);
      return;
    }
    const emptyIdx = otp.findIndex((v) => v === "");
    if (emptyIdx === -1) return;
    setOtp((prev) => { const n = [...prev]; n[emptyIdx] = key; return n; });
    setOtpError(false);
  };

  const verifyOtp = () => {
    const entered = otp.join("");
    if (entered.length < 6) return;
    if (entered === CORRECT_CODE) { setCompleted((prev) => new Set([...prev, "2fa"])); go("success"); }
    else { setOtpError(true); }
  };

  const strength = getPasswordStrength(password);
  const topicsWithStatus = TOPICS.map((t) => ({ ...t, status: completed.has(t.id) ? "100% Complete" : "Not Started", isCompleted: completed.has(t.id) }));

  const PrimaryBtn = ({ label, onClick, icon = true }: { label: string; onClick: () => void; icon?: boolean }) => (
    <button onClick={onClick} className="w-full bg-[#006D2F] rounded-xl h-14 flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all">
      <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>{label}</span>
      {icon && <ArrowRight size={18} className="text-white" />}
    </button>
  );

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (screen === "loading") return <LoadingScreen onDone={() => go("intro")} />;

  // ── INTRO HOME ────────────────────────────────────────────────────────────
  if (screen === "intro") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto overflow-hidden relative"
        style={{ background: "linear-gradient(180deg, #004d22 0%, #006D2F 45%, #F5FAF5 45%)", ...FADE }}>
        {/* Top green section */}
        <div className="flex flex-col items-center pt-12 pb-8 px-6 relative">
          {/* Decorative glow */}
          <div className="absolute w-64 h-64 bg-[#25D366] opacity-15 blur-3xl rounded-full top-[-20px]" />
          {/* Badge */}
          <div className="relative z-10 w-24 h-24 bg-white/15 rounded-3xl border border-white/25 flex items-center justify-center shadow-[0_0_40px_rgba(37,211,102,0.3)] mb-5">
            <Shield size={48} className="text-white" strokeWidth={1.5} />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center shadow-md">
              <Check size={14} className="text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-white font-bold text-[32px] text-center leading-tight relative z-10"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Welcome to<br />Safety Coach
          </h1>
          <p className="text-white/75 text-[16px] text-center mt-2 relative z-10"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Your Digital Safety Guide
          </p>
        </div>

        {/* White bottom section */}
        <div className="flex-1 overflow-y-auto bg-[#F5FAF5] rounded-t-3xl px-6 pt-7 pb-6 flex flex-col gap-6">
          {/* Intro text */}
          <div>
            <h2 className="text-[#005222] font-bold text-[22px] leading-snug"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              You will learn 4 topics with me:
            </h2>
            <div className="mt-4 space-y-3">
              {[
                { emoji: "🔐", label: "2-Factor Authentication", desc: "Keep your accounts extra secure" },
                { emoji: "🤖", label: "Generative AI", desc: "Spot AI voice scams and deepfakes" },
                { emoji: "📧", label: "Email Safety", desc: "Read, send and spot scam emails" },
                { emoji: "🚩", label: "False Information", desc: "Use S.U.R.E. to verify what you see" },
              ].map(({ emoji, label, desc }) => (
                <div key={label} className="flex items-center gap-4 bg-white rounded-xl px-4 py-3 shadow-sm border border-[#E5EDE5]">
                  <span className="text-[26px] shrink-0">{emoji}</span>
                  <div>
                    <p className="text-[#091E29] font-semibold text-[15px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>{label}</p>
                    <p className="text-[#6F7A6E] text-[13px]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-[#FFF8E6] border border-[#F59E0B]/30 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-[18px] shrink-0 mt-0.5">⚠️</span>
            <p className="text-[#92400E] text-[13px] leading-relaxed" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>
              Part of the <strong className="text-[#006D2F]">Digital For Life</strong> initiative. This simulator is intended for learning and practice purposes only.
            </p>
          </div>

          {/* CTA */}
          <button onClick={() => go("coach")}
            className="w-full bg-[#006D2F] rounded-full py-6 flex items-center justify-center gap-3 shadow-lg hover:brightness-105 transition-all">
            <Shield size={26} className="text-[#90EC9F]" />
            <span className="text-white font-bold text-[24px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>
              Meet Safety Coach
            </span>
            <ArrowRight size={24} className="text-[#90EC9F]" />
          </button>
        </div>
      </div>
    );
  }

  // ── TOPIC LOADING SPLASH ───────────────────────────────────────────────────
  if (screen === "topic-loading") {
    return <TopicLoadingScreen topic={pendingTopic} onDone={() => go(pendingScreen)} />;
  }

  // ── COACH CHAT ─────────────────────────────────────────────────────────────
  if (screen === "coach") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)" }}>
        <WhatsAppHeader />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              {msg.from === "coach" ? (
                <div className={`bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl shadow-sm border border-[rgba(187,203,185,0.3)] ${msg.kind === "topic-selection" ? "p-4 w-full max-w-[380px]" : "p-5 max-w-[320px]"}`}>
                  <p className="text-[#1C1B1F] text-[20px] leading-[32px] whitespace-pre-line" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>{renderBold(msg.text)}</p>
                  {msg.kind === "topic-selection" && <div className="mt-4"><TopicSelectionCards onSelect={handleTopicSelect} /></div>}
                  <p className="text-[rgba(60,74,61,0.6)] text-[13px] text-right mt-2">{msg.time}</p>
                </div>
              ) : (
                <div className="bg-[#D9F7BE] rounded-tl-2xl rounded-bl-2xl rounded-br-2xl p-4 max-w-[240px] shadow-sm">
                  <p className="text-[#1C1B1F] text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>{msg.text}</p>
                  <p className="text-gray-500 text-[13px] text-right mt-1">{msg.time}</p>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="shrink-0 px-4 pb-3 pt-2" style={{ background: "rgb(236,239,245)" }}>
          <div className="bg-white border border-[#BBCBB9] rounded-full flex items-center gap-2 p-2 shadow-md">
            <button className="p-2 rounded-full"><Plus size={16} className="text-[#3C4A3D]" /></button>
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Type a message..." className="flex-1 bg-transparent text-[18px] outline-none text-[rgba(60,74,61,0.7)]"
              style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }} />
            <button onClick={sendChat} className="bg-[#006D2F] rounded-full w-11 h-11 flex items-center justify-center shrink-0">
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── LESSONS LIST ───────────────────────────────────────────────────────────
  if (screen === "lessons") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(245,250,255)" }}>
        <div className="shrink-0 bg-[#F5FAFF] border-b border-[#D1D5DB] flex items-center h-14 px-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#006D2F] rounded-full flex items-center justify-center"><Shield size={16} className="text-[#90EC9F]" /></div>
            <span className="text-[#005222] font-bold text-[24px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Safety Coach</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <div className="bg-[#E6F4EA] border border-[rgba(0,82,34,0.1)] rounded-xl p-5 shadow-sm flex gap-4">
            <div className="bg-[#006D2F] rounded-2xl flex items-center justify-center shrink-0 w-9 h-12"><Shield size={15} className="text-[#90EC9F]" /></div>
            <div className="flex-1">
              <h3 className="text-[#005222] font-semibold text-[20px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Coach Tip</h3>
              <p className="text-[#3F493F] text-[17px] mt-1 leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {completed.size === 0
                  ? "Welcome! I am glad you are here. Let's start your digital safety journey together."
                  : completed.size === 4
                  ? "Amazing work! You have completed all four topics. You are now a Safety Graduate!"
                  : `Great progress! You have finished ${completed.size} of 4 topics. What would you like to learn about next?`}
              </p>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#005222] text-[14px] font-semibold">{completed.size} of 4 topics completed</span>
                  <span className="text-[#005222] text-[14px] font-bold">{Math.round(completed.size / 4 * 100)}%</span>
                </div>
                <div className="w-full bg-[#C8E6C9] rounded-full h-2">
                  <div className="bg-[#006D2F] h-2 rounded-full transition-all duration-500" style={{ width: `${Math.round(completed.size / 4 * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[#3F493F] text-[14px] font-semibold tracking-[0.7px] uppercase opacity-70 mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>YOUR TOPICS</p>
            <div className="flex flex-col gap-5">
              {topicsWithStatus.map((t) => (
                <TopicCard key={t.id} categoryLabel={t.category} categoryBg={t.categoryBg} categoryTextColor={t.categoryColor}
                  status={t.status} title={t.title} description={t.description} completed={t.isCompleted}
                  onClick={() => {
                    if (t.id === "2fa") go("2fa-explained");
                    else if (t.id === "ai") go("genai-intro");
                    else if (t.id === "email") go("email-setup");
                    else if (t.id === "false-info") go("false-info-intro");
                  }} />
              ))}
            </div>
          </div>
        </div>
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ── 2FA EXPLAINED ──────────────────────────────────────────────────────────
  if (screen === "2fa-explained") {
    return (
      <div className="h-screen flex flex-col max-w-[680px] mx-auto" style={{ background: "rgb(253,248,253)" }}>
        <WhatsAppHeader onBack={() => go("lessons")} />
        <div className="flex-1 overflow-y-auto px-6 py-7 space-y-6">
          <h2 className="text-[#006D2F] text-[30px] font-bold tracking-tight leading-tight" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>What is 2-Factor Authentication (2FA)</h2>
          <p className="text-[#3C4A3D] text-[18px] leading-relaxed" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>It sounds technical, but it is simply an extra layer of protection for your digital life.</p>
          <div className="bg-[#F7F2F8] border-2 border-[#BBCBB9] rounded-xl p-5 shadow-sm">
            <div className="flex flex-col items-center gap-2">
              {[
                { Icon: Lock, bg: "#8CF1E1", tc: "#006B5F", label: "Password" },
                { Icon: MessageSquare, bg: "#25D366", tc: "#005523", label: "Secret Code" },
              ].map(({ Icon, bg, tc, label }, i) => (
                <div key={i} className="flex items-center gap-4 w-full bg-white rounded-xl px-4 py-3 shadow-sm">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                    <Icon size={22} style={{ color: tc }} />
                  </div>
                  <span className="text-[17px] font-semibold" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif", color: tc }}>{label}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-[#BBCBB9]" />
                <span className="text-[22px] font-bold text-[#6C7B6B]">=</span>
                <div className="flex-1 h-px bg-[#BBCBB9]" />
              </div>
              <div className="flex items-center gap-4 w-full bg-[#006D2F] rounded-xl px-4 py-3 shadow-md">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <ShieldCheck size={22} className="text-white" />
                </div>
                <span className="text-white text-[17px] font-bold" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Safe Account</span>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(140,241,225,0.3)] rounded-xl pl-8 pr-6 py-6 border-l-8 border-[#006B5F]">
            <div className="flex gap-4 items-start">
              <Lightbulb size={20} className="text-[#006B5F] mt-1 shrink-0" />
              <div>
                <p className="text-[#006B5F] text-[17px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Think of it like this...</p>
                <p className="text-[#1C1B1F] text-[18px] mt-2 leading-relaxed" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>It is like having a <strong>key</strong> AND a <strong>second lock</strong> that only opens with a code sent directly to YOUR phone. Even if someone steals your key, they still cannot get in.</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[#3C4A3D] text-[17px] mb-4" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>What you will see on your phone:</p>
            <div className="max-w-[360px] mx-auto rounded-2xl overflow-hidden shadow-lg border-2 border-[#D1D5DB]">
              <div className="bg-[#F2F2F7] px-4 py-2 flex items-center justify-between border-b border-[#E5E5EA]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center"><MessageSquare size={14} className="text-white" /></div>
                  <div><p className="text-[#1C1B1F] text-[13px] font-semibold">Messages</p><p className="text-[#3C3C43] text-[11px] opacity-60">now</p></div>
                </div>
                <span className="text-[#3C3C43] text-[12px] opacity-60">10:45</span>
              </div>
              <div className="bg-white px-4 py-4">
                <p className="text-[#1C1B1F] text-[16px] leading-relaxed" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Safety Coach Login: Your secret code is <span className="font-bold bg-[rgba(37,211,102,0.25)] px-1 rounded">582-901</span>. Do not share this code.</p>
              </div>
            </div>
          </div>
          <button onClick={() => go("password-lesson")}
            className="w-full bg-[#006D2F] rounded-xl py-5 px-5 relative flex items-center justify-center shadow-md hover:brightness-105 transition-all">
            <span className="text-white font-bold text-[18px] text-center pr-8" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>
              Now Practice Password and Secret Code!
            </span>
            <ArrowRight size={18} className="text-white absolute right-5 top-1/2 -translate-y-1/2" />
          </button>
        </div>
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ── PASSWORD LESSON ────────────────────────────────────────────────────────
  if (screen === "password-lesson") {
    return (
      <div className="h-screen flex flex-col max-w-[680px] mx-auto" style={{ background: "rgb(253,248,253)" }}>
        <WhatsAppHeader onBack={() => go("2fa-explained")} />
        <div className="flex-1 overflow-y-auto px-6 py-7 space-y-6">
          <div><span className="bg-[#25D366] px-3 py-1 rounded-full text-[#005523] font-semibold text-[16px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Step 2 of 4</span></div>
          <h2 className="text-[#1C1B1F] text-[30px] font-bold tracking-tight" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Create a Strong Password</h2>
          <div className="bg-[#F7F2F8] border-l-8 border-[#006D2F] rounded-xl pl-8 pr-6 py-6 shadow-sm">
            <div className="flex gap-4 items-start">
              <Lightbulb size={20} className="text-[#006D2F] mt-1 shrink-0" />
              <div>
                <p className="text-[#006D2F] font-semibold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Coach Tip</p>
                <p className="text-[#3C4A3D] text-[18px] mt-1 leading-relaxed" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Avoid using your <strong>birthday, NRIC number</strong>, or family names. Scammers can easily find this information online.</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-[#1C1B1F] text-[22px] font-bold mb-4" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Try typing a password:</h3>
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Type here to test..."
              className="w-full bg-white border-2 border-[#1C1B1F] rounded-lg h-14 px-4 text-[20px] outline-none" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }} />
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-[#3C4A3D] font-semibold text-[18px]">Strength: {strength.label}</span>
                <span className="text-[#1C1B1F] font-semibold text-[18px]">{strength.score}%</span>
              </div>
              <div className="h-3 bg-[#E5E1E7] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${strength.score}%`, backgroundColor: strength.color }} />
              </div>
            </div>
          </div>
          <div className="bg-white border-2 border-[#BBCBB9] rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 pt-7 pb-6">
              <p className="text-[#6C7B6B] text-[15px] tracking-wide uppercase font-semibold mb-3" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>EXAMPLE OF A STRONG PASSWORD</p>
              <div className="bg-[#F1ECF2] rounded-lg flex items-center justify-between px-4 py-4">
                <span className="text-[#006B5F] font-bold text-[24px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>PurpleCoffee88!</span>
                <button className="p-2 active:scale-90 transition-transform" onClick={() => { navigator.clipboard.writeText("PurpleCoffee88!"); setPassword("PurpleCoffee88!"); }}>
                  <Copy size={18} className="text-[#006D2F]" />
                </button>
              </div>
              <div className="flex gap-4 mt-4 flex-wrap">
                {["Mix of letters", "Numbers", "Symbols (! @ #)"].map((tag) => (
                  <div key={tag} className="flex items-center gap-1"><Check size={14} className="text-[#006D2F]" /><span className="text-[#3C4A3D] font-semibold text-[16px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>{tag}</span></div>
                ))}
              </div>
            </div>
          </div>
          <PrimaryBtn label="Next: Practice Secret Code" onClick={() => go("2fa-practice")} />
        </div>
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ── 2FA PRACTICE ──────────────────────────────────────────────────────────
  if (screen === "2fa-practice") {
    const otpFilled = otp.every((v) => v !== "");
    return (
      <div className="h-screen flex flex-col max-w-[680px] mx-auto" style={{ background: "rgb(253,248,253)" }}>
        <WhatsAppHeader onBack={() => go("password-lesson")} />
        <div className="flex-1 overflow-y-auto px-6 py-7">
          <h2 className="text-[#1C1B1F] text-[28px] font-bold tracking-tight mb-2" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Try entering a code</h2>
          <p className="text-[#3C4A3D] text-[18px] leading-relaxed mb-8" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>A secret 6-digit code has been sent to your phone. Type it below to practice!</p>
          <div className="bg-[#F7F2F8] border-l-8 border-[#006D2F] rounded-xl pl-6 pr-4 py-5 mb-8 flex gap-4">
            <div className="bg-[#25D366] rounded-full w-12 h-12 flex items-center justify-center shrink-0"><MessageSquare size={20} className="text-[#005523]" /></div>
            <div>
              <p className="text-[#006D2F] text-[15px] font-semibold">New Message</p>
              <p className="text-[#1C1B1F] text-[18px] mt-1" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Your practice code is: <span className="font-bold text-[#006D2F] text-[26px] tracking-[2px]">562-901</span></p>
            </div>
          </div>
          {otpError && (
            <div className="mb-4 bg-red-500 rounded-xl py-3 px-4 flex items-center justify-center gap-2 shadow-md" style={{ animation: "screenFadeIn 0.2s ease-out" }}>
              <AlertTriangle size={18} className="text-white shrink-0" />
              <span className="text-white font-bold text-[16px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Wrong Code! Try again.</span>
            </div>
          )}
          <div className="flex items-center gap-2 mb-8 justify-center">
            {otp.slice(0, 3).map((digit, i) => (
              <div key={i} className={`flex-1 max-w-[90px] h-16 rounded-lg flex items-center justify-center border text-[30px] font-bold transition-colors ${otpError ? "border-red-500 bg-red-50" : digit ? "border-[#006D2F] bg-[#F1FCF4]" : "border-[#1C1B1F] bg-white"}`}>{digit ? "•" : ""}</div>
            ))}
            <span className="text-[#6C7B6B] font-bold text-[28px]">-</span>
            {otp.slice(3, 6).map((digit, i) => (
              <div key={i + 3} className={`flex-1 max-w-[90px] h-16 rounded-lg flex items-center justify-center border text-[30px] font-bold transition-colors ${otpError ? "border-red-500 bg-red-50" : digit ? "border-[#006D2F] bg-[#F1FCF4]" : "border-[#1C1B1F] bg-white"}`}>{digit ? "•" : ""}</div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 max-w-[384px] mx-auto mb-6">
            {["1","2","3","4","5","6","7","8","9"].map((n) => (
              <button key={n} onClick={() => pressOtp(n)} className="bg-white border-2 border-[#3C4A3D] rounded-xl h-16 text-[#1C1B1F] text-[26px] font-bold hover:bg-gray-50 active:scale-95 active:bg-[#E5E1E7] transition-all duration-75" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>{n}</button>
            ))}
            <div />
            <button onClick={() => pressOtp("0")} className="bg-white border-2 border-[#3C4A3D] rounded-xl h-16 text-[#1C1B1F] text-[26px] font-bold hover:bg-gray-50 active:scale-95 active:bg-[#E5E1E7] transition-all duration-75" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>0</button>
            <button onClick={() => pressOtp("del")} className="bg-white border-2 border-red-400 rounded-xl h-16 flex items-center justify-center hover:bg-red-50 active:scale-95 active:bg-red-100 transition-all duration-75"><Delete size={22} className="text-red-500" /></button>
          </div>
          <div className="max-w-[384px] mx-auto">
            <button onClick={verifyOtp} disabled={!otpFilled} className={`w-full h-14 rounded-xl flex items-center justify-center shadow-md transition-all ${otpFilled ? "bg-[#006D2F] hover:brightness-105" : "bg-[#006D2F] opacity-50 cursor-not-allowed"}`}>
              <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Verify Code</span>
            </button>
          </div>
        </div>
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ── SUCCESS (OTP Correct) ──────────────────────────────────────────────────
  if (screen === "success") {
    return (
      <div className="h-screen flex flex-col max-w-[680px] mx-auto" style={{ background: "rgb(253,248,253)" }}>
        <LightHeader />
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center">
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute w-60 h-60 bg-[#25D366] opacity-20 blur-3xl rounded-full" />
            <div className="w-44 h-44 bg-[#006D2F] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,211,102,0.4)] relative z-10"><ShieldCheck size={80} className="text-white" /></div>
          </div>
          <h1 className="text-[#1C1B1F] text-[30px] font-bold text-center" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Well Done!<br />Your Account is Extra Safe.</h1>
          <div className="mt-8 w-full bg-[#F7F2F8] border-l-8 border-[#006D2F] rounded-xl pl-8 pr-6 py-6 shadow-sm flex gap-4">
            <div className="w-9 h-9 bg-[#25D366] rounded-lg flex items-center justify-center shrink-0 mt-1"><Lightbulb size={16} className="text-[#005523]" /></div>
            <p className="text-[#3C4A3D] text-[19px] leading-relaxed" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>By entering that secret code, you have added a <span className="font-bold text-[#006D2F]">second lock</span> to your account. Even if someone finds your password, they still cannot get in without your phone.</p>
          </div>
          <div className="mt-8 w-full">
            <div className="h-4 bg-[#E5E1E7] rounded-full overflow-hidden"><div className="h-full bg-[#006D2F] rounded-full" style={{ width: "50%" }} /></div>
            <p className="text-[#3C4A3D] text-[15px] text-center mt-3 font-semibold tracking-wide uppercase" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>SET STRONG PASSWORDS AND 2FA: COMPLETE!</p>
          </div>
          <div className="mt-8 w-full"><PrimaryBtn label="Learn to Protect Your Phone" onClick={() => go("biometric")} /></div>
        </div>
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ── BIOMETRIC ──────────────────────────────────────────────────────────────
  if (screen === "biometric") {
    return (
      <div className="h-screen flex flex-col max-w-[680px] mx-auto" style={{ background: "rgb(253,248,253)" }}>
        <WhatsAppHeader onBack={() => go("success")} />
        <div className="flex-1 overflow-y-auto px-6 py-7 space-y-6">
          <h2 className="text-[#1C1B1F] text-[28px] font-bold tracking-tight leading-tight" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Unlock with your Face or Finger</h2>
          <p className="text-[#3C4A3D] text-[19px] leading-relaxed" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Using your body as a key is much safer and easier than remembering complex passwords.</p>
          {[
            { Icon: Eye, bg: "#8CF1E1", tc: "#006F64", title: "Face ID (Look to Unlock)", steps: ["Open your phone's Settings app.", "Look for \"Face ID & Passcode\".", "Follow the prompt to \"Set Up Face ID\".", "Slowly move your head in a circle."] },
            { Icon: Fingerprint, bg: "#8CF1E1", tc: "#006F64", title: "Touch ID (Fingerprint)", steps: ["Go to Settings and tap \"Touch ID\".", "Tap \"Add a Fingerprint\".", "Gently lift and rest your thumb on the sensor several times."] },
          ].map(({ Icon, bg, tc, title, steps }) => (
            <div key={title} className="bg-[#F7F2F8] rounded-xl p-6 shadow-sm">
              <div className="flex gap-4 items-start">
                <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                  <Icon size={26} style={{ color: tc }} />
                </div>
                <div>
                  <h3 className="text-[#1C1B1F] font-bold text-[22px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>{title}</h3>
                  <ol className="mt-3 space-y-2 list-decimal list-inside">
                    {steps.map((s, i) => <li key={i} className="text-[#3C4A3D] text-[18px] leading-relaxed" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>{s}</li>)}
                  </ol>
                </div>
              </div>
            </div>
          ))}
          <PrimaryBtn label="Give it a Try!" onClick={() => go("biometric-practice")} />
        </div>
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ── BIOMETRIC PRACTICE ─────────────────────────────────────────────────────
  if (screen === "biometric-practice") {
    return (
      <div className="h-screen flex flex-col max-w-[680px] mx-auto" style={{ background: "rgb(253,248,253)" }}>
        <WhatsAppHeader onBack={() => go("biometric")} />
        <div className="flex-1 overflow-y-auto px-6 py-7 space-y-6">
          <div className="text-center">
            <h2 className="text-[#006D2F] text-[28px] font-bold tracking-tight" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Give it a Try!</h2>
            <p className="text-[#3C4A3D] text-[18px] mt-2 leading-relaxed" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Practice unlocking the app with your Face or Finger. Do not worry, this is just a safe test!</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#1C1B1F] font-bold text-[22px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Face ID Test</h3>
              <div className="bg-[#25D366] flex items-center gap-1.5 px-3 py-1 rounded-full"><Check size={13} className="text-[#005523]" /><span className="text-[#005523] text-[14px] font-semibold">Verified Safe</span></div>
            </div>
            <div className="flex flex-col items-center gap-5 py-4">
              <p className="text-[#1C1B1F] text-[17px] font-semibold text-center" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Tap button to start scan</p>
              <div className="w-24 h-24 bg-[#8CF1E1] rounded-full flex items-center justify-center"><Eye size={44} className="text-[#006F64]" /></div>
              <button className="w-full bg-[#006D2F] rounded-xl h-14 flex items-center justify-center gap-2 shadow-md"><Eye size={20} className="text-white" /><span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Scan Face</span></button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#1C1B1F] font-bold text-[22px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Touch ID Test</h3>
              <div className="bg-[#25D366] flex items-center gap-1.5 px-3 py-1 rounded-full"><Check size={13} className="text-[#005523]" /><span className="text-[#005523] text-[14px] font-semibold">Verified Safe</span></div>
            </div>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-32 h-32 border-4 border-dashed border-[#6C7B6B] rounded-full flex flex-col items-center justify-center gap-1"><Fingerprint size={48} className="text-[#6C7B6B]" /><span className="text-[#6C7B6B] text-[14px]">Touch Here</span></div>
              <p className="text-[#1C1B1F] text-[17px] font-semibold text-center" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Hold your finger on the circle</p>
            </div>
          </div>
        </div>
        <div className="shrink-0 px-6 pt-4 pb-4 bg-[rgba(253,248,253,0.9)] border-t border-[#BBCBB9]">
          <PrimaryBtn label="Done with Practice" onClick={() => go("2fa-complete")} />
        </div>
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ── 2FA SUMMARY ───────────────────────────────────────────────────────────
  if (screen === "2fa-summary") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)", ...FADE }}>
        <WhatsAppHeader onBack={() => go("biometric-practice")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm">
              <p className="text-[#006D2F] font-bold text-[14px] mb-2 uppercase tracking-wide">Your 2-Factor Authentication Summary</p>
              <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Great work! Here is what you learned today.</p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">Now</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#D1D5DB] shadow-sm p-5 space-y-5">
            <p className="text-[#005222] font-bold text-[20px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>🌟 Remember These!</p>
            {[
              { icon: "🔐", title: "Use a strong password", tip: "Keep it secret. Never share it with anyone." },
              { icon: "📱", title: "Turn on 2FA", tip: "It adds an extra code to keep your account safe." },
              { icon: "⚠️", title: "Never share your secret code", tip: "Real services will never ask you for it." },
            ].map(({ icon, title, tip }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="text-[24px] shrink-0">{icon}</span>
                <div>
                  <p className="text-[#091E29] font-bold text-[18px] leading-snug" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</p>
                  <p className="text-[#3F493F] text-[17px] mt-0.5 leading-relaxed" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>{tip}</p>
                </div>
              </div>
            ))}
          </div>
          <PrimaryBtn label="Complete Module" onClick={() => go("2fa-complete")} />
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── 2FA COMPLETE ───────────────────────────────────────────────────────────
  if (screen === "2fa-complete") {
    return (
      <div className="h-screen flex flex-col max-w-[680px] mx-auto" style={{ background: "rgb(253,248,253)" }}>
        <LightHeader />
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center">
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute w-64 h-64 bg-[#25D366] opacity-20 blur-3xl rounded-full" />
            <div className="w-48 h-48 bg-[#006D2F] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,211,102,0.4)] relative z-10"><ShieldCheck size={88} className="text-white" /></div>
          </div>
          <h1 className="text-[#1C1B1F] text-[30px] font-bold text-center" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Well Done!<br />Your Phone is Secured.</h1>
          <div className="mt-8 w-full bg-[#F7F2F8] border-l-8 border-[#006D2F] rounded-xl pl-8 pr-6 py-6 shadow-sm flex gap-4">
            <div className="w-9 h-9 bg-[#25D366] rounded-lg flex items-center justify-center shrink-0 mt-1"><Lightbulb size={16} className="text-[#005523]" /></div>
            <p className="text-[#3C4A3D] text-[19px] leading-relaxed" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>By including Face ID and Touch ID, your phone would be protected if someone else tried to log into your mobile phone.</p>
          </div>
          <div className="mt-8 w-full">
            <div className="h-4 bg-[#E5E1E7] rounded-full overflow-hidden"><div className="h-full bg-[#006D2F] rounded-full" style={{ width: `${tfaBarPct}%`, transition: "width 1.2s cubic-bezier(0.34,1.1,0.64,1)" }} /></div>
            <p className="text-[#3C4A3D] text-[15px] text-center mt-3 font-semibold tracking-wide uppercase" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>2FA AND PHONE SECURITY: 100% COMPLETE!</p>
          </div>
          <div className="mt-8 w-full"><PrimaryBtn label="Learn About Other Topics" onClick={() => go("lessons")} /></div>
        </div>
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ── GENAI VOICE SCAM ───────────────────────────────────────────────────────
  if (screen === "genai-practice") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(240,242,245)" }}>
        <WhatsAppHeader onBack={() => go("lessons")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-center"><div className="bg-[#E1F3FB] rounded-lg px-4 py-1"><span className="text-[#54656F] text-[13px] font-semibold uppercase">TODAY</span></div></div>
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[310px] shadow-sm">
              <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Let's practice spotting AI voice scams. I've sent you a voice message. Listen carefully.</p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:15 AM</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-4 max-w-[290px] shadow-sm">
              <div className="flex items-center gap-3">
                <button className="w-11 h-11 bg-[#006D2F] rounded-full flex items-center justify-center shrink-0"><Play size={18} className="text-white fill-white" /></button>
                <div className="flex-1">
                  <div className="flex items-center gap-0.5 h-8">{[4,10,6,16,8,12,5,18,9,14,6,11,7,15,8].map((h, i) => <div key={i} className="w-1 bg-[#006D2F] rounded-full opacity-70" style={{ height: `${h}px` }} />)}</div>
                  <p className="text-[#3F493F] text-[13px] mt-1 font-medium">0:25</p>
                </div>
              </div>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:16 AM</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[rgba(0,82,34,0.1)] shadow-md p-6 space-y-5">
            <p className="text-[#091E29] text-[18px] text-center font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Do you think this is a real person or an AI?</p>
            {[{ label: "It's a real person", next: "voice-scam-incorrect" as Screen }, { label: "It sounds like AI", next: "voice-scam-correct" as Screen }, { label: "I can't listen right now", next: "voice-scam-incorrect" as Screen }].map(({ label, next }) => (
              <button key={label} onClick={() => go(next)} className="w-full bg-[#006D2F] rounded-full h-14 flex items-center justify-center shadow-md hover:brightness-105 transition-all">
                <span className="text-white text-[18px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── VOICE SCAM CORRECT ─────────────────────────────────────────────────────
  if (screen === "voice-scam-correct") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(245,250,255)" }}>
        <WhatsAppHeader onBack={() => go("genai-practice")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          <div className="flex justify-end"><div className="bg-[#005222] rounded-tl-xl rounded-bl-xl rounded-br-xl p-4 max-w-[260px] shadow-sm"><p className="text-white text-[18px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>It sounds like AI</p><p className="text-white/70 text-[13px] text-right mt-2">10:42 AM</p></div></div>
          <div className="flex justify-start">
            <div className="bg-white rounded-xl border border-[#D1D5DB] p-5 max-w-[315px] shadow-sm">
              <div className="flex items-center gap-2 mb-3"><div className="w-5 h-5 bg-[#005222] rounded-full flex items-center justify-center"><Check size={10} className="text-white" /></div><span className="text-[#005222] font-bold text-[14px] tracking-wide">Safety Coach</span></div>
              <p className="text-[#091E29] text-[18px] leading-[28px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Correct! That was an AI-generated voice. 🎉 You spotted the red flags: an urgent request for money and bank details.</p>
              <p className="text-[#091E29] text-[18px] leading-[28px] mt-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Remember, if a family member sounds strange or asks for money unexpectedly, always hang up and call them back on their regular number.</p>
              <p className="text-[#3F493F] text-[13px] text-right mt-3">10:43 AM</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#D1D5DB] p-5 shadow-sm">
            <div className="flex items-center gap-4 mb-4"><div className="w-14 h-14 bg-[#E6F4EA] rounded-full flex items-center justify-center shrink-0"><ShieldCheck size={28} className="text-[#005222]" /></div><div><p className="text-[#005222] font-semibold text-[20px]">Task Complete</p><p className="text-[#3F493F] text-[17px]">Voice Scam Awareness</p></div></div>
            <div className="h-3 bg-[#F8F9FA] rounded-full overflow-hidden"><div className="h-full bg-[#005222] rounded-full w-full" /></div>
          </div>
          <button onClick={() => go("news-practice")} className="w-full bg-[#006D2F] rounded-xl h-14 flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all">
            <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Next Lesson</span><ArrowRight size={18} className="text-white" />
          </button>
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── VOICE SCAM INCORRECT ───────────────────────────────────────────────────
  if (screen === "voice-scam-incorrect") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(245,250,255)" }}>
        <WhatsAppHeader onBack={() => go("genai-practice")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          <div className="flex justify-end"><div className="bg-[#DCF8C6] rounded-tl-xl rounded-bl-xl rounded-br-xl p-4 max-w-[260px] shadow-sm"><p className="text-[#091E29] text-[18px]">It's a real person</p><p className="text-[#6B7280] text-[13px] text-right mt-2">10:42 AM</p></div></div>
          <div className="flex justify-start">
            <div className="bg-white rounded-xl p-5 max-w-[300px] shadow-sm">
              <p className="text-[#091E29] text-[18px] leading-[28px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Actually, this is an AI voice! 🛑</p>
              <p className="text-[#091E29] text-[18px] leading-[28px] mt-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Scammers use <span className="font-bold text-[#9D1C52]">Generative AI</span> to mimic family members' voices to create urgency.</p>
              <p className="text-[#091E29] text-[18px] leading-[28px] mt-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Notice how 'he' asked for bank details immediately? Always call the person back on their known number to verify.</p>
              <p className="text-[#9CA3AF] text-[13px] text-right mt-3">10:43 AM</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#D1D5DB] p-5 shadow-sm">
            <div className="flex items-start gap-4"><div className="w-12 h-12 bg-[#9D1C52] rounded-full flex items-center justify-center shrink-0"><AlertTriangle size={22} className="text-white" /></div><div><p className="text-[#9D1C52] font-semibold text-[18px]">Voice Cloning Risk</p><p className="text-[#3F493F] text-[17px] mt-2 leading-relaxed">AI can clone a voice from just 3 seconds of audio. This is often used in the "Grandparent Scam" to create fake emergencies.</p></div></div>
          </div>
          <button onClick={() => go("news-practice")} className="w-full bg-[#006D2F] rounded-xl h-14 flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all">
            <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Next Lesson</span><ArrowRight size={18} className="text-white" />
          </button>
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── NEWS PRACTICE ──────────────────────────────────────────────────────────
  if (screen === "news-practice") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,229,221)" }}>
        <WhatsAppHeader onBack={() => go("lessons")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-start"><div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl p-4 max-w-[310px] shadow-sm"><p className="text-[#091E29] text-[18px] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Check this out! There are horses roaming the streets in Pasir Ris today!</p><p className="text-[#6F7A6E] text-[13px] text-right mt-1">10:42 AM</p></div></div>
          <div className="flex justify-start">
            <div className="bg-white rounded-xl overflow-hidden max-w-[310px] shadow-sm border border-[rgba(111,122,110,0.1)]">
              <div className="h-44 overflow-hidden"><img src={horsesImg} alt="Horses in Pasir Ris" className="w-full h-full object-cover" /></div>
              <div className="bg-[#F8F9FA] px-4 py-3"><p className="text-[#005222] text-[12px] font-bold uppercase tracking-wide">THE STRAITS TIMES</p><p className="text-[#091E29] text-[15px] font-medium mt-1 leading-tight">Horses spotted on the roads of Pasir Ris on the last day of Chinese New Year</p><a href="https://www.straitstimes.com/videos/6390301" target="_blank" rel="noopener noreferrer" className="text-[#1a73e8] text-[12px] mt-1 truncate block underline">https://www.straitstimes.com/videos/6390301</a></div>
              <div className="bg-white px-4 py-2 text-right"><p className="text-[#6F7A6E] text-[12px]">10:43 AM</p></div>
            </div>
          </div>
          <div className="bg-[rgba(255,255,255,0.8)] rounded-2xl border border-[rgba(0,82,34,0.1)] shadow-lg p-6 space-y-4">
            <p className="text-[#091E29] text-[18px] text-center font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Do you think this is real?</p>
            {[{ label: "It's real information", next: "news-correct" as Screen }, { label: "It looks suspicious", next: "news-incorrect" as Screen }].map(({ label, next }) => (
              <button key={label} onClick={() => go(next)} className="w-full bg-[#006D2F] rounded-full h-14 flex items-center justify-center shadow-md hover:brightness-105 transition-all">
                <span className="text-white text-[18px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</span>
              </button>
            ))}
            <button onClick={() => go("news-article")} className="w-full h-12 flex items-center justify-center rounded-full border border-[rgba(0,82,34,0.2)]">
              <span className="text-[#005222] text-[17px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>I can't check right now</span>
            </button>
          </div>
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── NEWS ARTICLE ───────────────────────────────────────────────────────────
  if (screen === "news-article") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(240,242,245)" }}>
        <WhatsAppHeader onBack={() => go("news-practice")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-end"><div className="bg-[#C5FFC9] rounded-tl-xl rounded-bl-xl rounded-br-xl p-4 max-w-[240px] shadow-sm"><p className="text-black text-[17px]">I can't check right now</p><p className="text-black/50 text-[12px] text-right mt-1">10:44 AM</p></div></div>
          <div className="flex justify-start"><div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl p-5 max-w-[310px] shadow-sm"><p className="text-black font-bold text-[17px] mb-3">The article says:</p><p className="text-black text-[17px] leading-relaxed">Two horses were seen galloping down the streets of Pasir Ris on March 3 on the 15th day of the Year of the Horse, in an equine sight that stopped noon-time traffic.</p><p className="text-black/50 text-[12px] text-right mt-3">10:44 AM</p></div></div>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-md p-6 space-y-4">
            <p className="text-black text-[18px] text-center font-medium">Do you think this is real?</p>
            {[{ label: "It's real information", next: "news-correct" as Screen }, { label: "It looks suspicious", next: "news-incorrect" as Screen }].map(({ label, next }) => (
              <button key={label} onClick={() => go(next)} className="w-full bg-[#006D2F] rounded-xl h-14 flex items-center justify-center shadow-md hover:brightness-105 transition-all">
                <span className="text-white text-[18px]">{label}</span>
              </button>
            ))}
          </div>
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── NEWS CORRECT ───────────────────────────────────────────────────────────
  if (screen === "news-correct") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(240,242,245)" }}>
        <WhatsAppHeader onBack={() => go("news-practice")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-end"><div className="bg-[#C5FFC9] rounded-tl-xl rounded-bl-xl rounded-br-xl p-4 max-w-[260px] shadow-sm"><p className="text-black text-[17px]">It's real information</p><p className="text-black/50 text-[12px] text-right mt-1">10:44 AM</p></div></div>
          <div className="flex justify-start"><div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl p-5 max-w-[310px] shadow-sm"><p className="text-black text-[17px] leading-relaxed">Correct! This is a verified report from The Straits Times, an official news source in Singapore.</p><p className="text-black text-[17px] leading-relaxed mt-3">By searching the link and the publisher, you successfully learnt how to verify!</p><p className="text-black/40 text-[12px] text-right mt-3">10:44 AM</p></div></div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-md p-5">
            <div className="flex items-center gap-4 mb-4"><div className="w-14 h-14 bg-[#E6F4EA] rounded-full flex items-center justify-center shrink-0"><ShieldCheck size={28} className="text-[#005222]" /></div><div><p className="text-black text-[18px] font-semibold">Task Complete</p><p className="text-black text-[17px]">News Verification</p></div></div>
            <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden"><div className="h-full bg-[#005222] rounded-full w-full" /></div>
          </div>
          <button onClick={() => go("lessons")} className="w-full bg-[#006D2F] rounded-xl h-14 flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all">
            <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Next Lesson</span><ArrowRight size={18} className="text-white" />
          </button>
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── NEWS INCORRECT ─────────────────────────────────────────────────────────
  if (screen === "news-incorrect") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,229,221)" }}>
        <WhatsAppHeader onBack={() => go("news-practice")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-end"><div className="bg-[#C5FFC9] rounded-tl-xl rounded-bl-xl rounded-br-xl p-4 max-w-[260px] shadow-sm"><p className="text-[#091E29] text-[17px]">It looks suspicious</p><p className="text-[#6F7A6E] text-[12px] text-right mt-1">10:44 AM</p></div></div>
          <div className="flex justify-start"><div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl p-5 max-w-[310px] shadow-sm"><p className="text-[#091E29] text-[17px] leading-relaxed">Actually, this information is real! It's great that you're being cautious.</p><p className="text-[#091E29] text-[17px] leading-relaxed mt-3">However, this article comes from The Straits Times, which is a verified and official news source. Checking the source is the first step!</p><p className="text-[#6F7A6E] text-[12px] text-right mt-3">10:44 AM</p></div></div>
          <div className="bg-[rgba(255,255,255,0.8)] rounded-2xl border border-[rgba(0,82,34,0.1)] shadow-md p-5">
            <div className="flex items-center gap-2 mb-3"><div className="w-5 h-5 bg-[#005222] rounded-full flex items-center justify-center"><Lightbulb size={11} className="text-white" /></div><span className="text-[#005222] font-bold text-[15px] tracking-wide">Safety Tip</span></div>
            <p className="text-[#091E29] text-[17px] leading-relaxed">News from official sites like The Straits Times, CNA, or government portals is verified and trustworthy. Always look for the source's reputation!</p>
          </div>
          <button onClick={() => go("lessons")} className="w-full bg-[#006D2F] rounded-xl h-14 flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all">
            <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Next Scenario</span><ArrowRight size={18} className="text-white" />
          </button>
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── FAIRPRICE SCAM PRACTICE ───────────────────────────────────────────────
  if (screen === "fairprice-practice") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,229,221)", ...FADE }}>
        <WhatsAppHeader onBack={() => { setFairPriceLinkClicked(false); go("news-practice"); }} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-center"><div className="bg-white/70 rounded-lg px-4 py-1"><span className="text-[#54656F] text-[13px] font-semibold uppercase">TODAY</span></div></div>

          {/* Coach intro */}
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[320px] shadow-sm">
              <p className="text-[#091E29] text-[18px] leading-[28px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {"Let's practice with promotions. Your friend Sarah has just sent you a message."}
              </p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:02 AM</p>
            </div>
          </div>

          {/* Sarah's forwarded FairPrice message */}
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl max-w-[310px] shadow-sm overflow-hidden">
              {/* Sender label */}
              <div className="px-3 pt-2.5 pb-1">
                <p className="text-[#006D2F] font-bold text-[13px]">Sarah</p>
              </div>
              {/* Promo image mockup */}
              <div className="mx-3 mb-2 rounded-lg overflow-hidden border border-[#E5E7EB]">
                <div className="bg-[#FFD700] px-3 py-2 flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#006D2F] rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold">FP</span>
                  </div>
                  <span className="text-[#006D2F] font-bold text-[12px]">FairPrice</span>
                </div>
                <div className="bg-[#C00000] px-3 py-3 text-center">
                  <p className="text-white font-black text-[22px] leading-none">90% OFF</p>
                  <p className="text-[#FFD700] font-black text-[13px] mt-0.5">EVERYTHING</p>
                  <p className="text-white text-[10px] mt-1">STOREWIDE SALE – TODAY ONLY!!!!!</p>
                  <div className="mt-2 bg-[#FFD700] rounded px-3 py-1 inline-block">
                    <span className="text-[#006D2F] font-black text-[11px]">CLAIM OFFER NOW!</span>
                  </div>
                  <p className="text-white/70 text-[9px] mt-1">www.fair-price.com.sg</p>
                </div>
                <div className="bg-white px-3 py-2 border-t border-[#E5E7EB]">
                  <p className="text-[#091E29] font-bold text-[13px]">FairPrice Mega Anniversary Sale</p>
                  <p className="text-[#3F493F] text-[12px] mt-0.5 leading-snug">Get 90% off on all items! Register now to claim your voucher before they run out!</p>
                  <p className="text-[#6B7280] text-[11px] mt-1">fair-price.com.sg</p>
                </div>
              </div>
              {/* Sarah's text */}
              <div className="px-3 pb-3">
                <p className="text-[#091E29] text-[17px] leading-relaxed">
                  Look at this! FairPrice is having a 90% off sale on everything! I just registered.
                </p>
                <p className="text-[#091E29] text-[17px] leading-relaxed mt-1">
                  You should too. Sign up here with{" "}
                  {!fairPriceLinkClicked ? (
                    <button
                      onClick={() => setFairPriceLinkClicked(true)}
                      className="text-[#1a73e8] underline text-[17px] font-medium break-all text-left">
                      https://fair-price.com.sg
                    </button>
                  ) : (
                    <span className="text-[#1a73e8] underline text-[17px]">https://fair-price.com.sg</span>
                  )}
                </p>
              </div>
              <p className="text-[#9CA3AF] text-[11px] text-right px-3 pb-2">10:03 AM</p>
            </div>
          </div>

          {/* Warning from Safety Coach after link tap */}
          {fairPriceLinkClicked && (
            <>
              <div className="flex justify-start">
                <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm border border-[rgba(187,203,185,0.3)]">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={18} className="text-[#1C1B1F]" />
                    <p className="text-[#1C1B1F] font-bold text-[14px]">Safety Coach Warning</p>
                  </div>
                  <p className="text-[#1C1B1F] text-[17px] leading-relaxed">
                    That was dangerous. <span className="text-[#D00000] font-bold">You just got scammed!</span> ⚠️
                  </p>
                  <div className="mt-3 space-y-2.5">
                    <p className="text-[#1C1B1F] text-[17px] leading-relaxed">
                      🌐 <span className="text-[#D00000] font-bold">The link</span> 'fair-price.com.sg' is not the official website. The real one is fairprice.com.sg.
                    </p>
                    <p className="text-[#1C1B1F] text-[17px] leading-relaxed">
                      🏷️ Real companies use secure, verified domains. A <span className="text-[#D00000] font-bold">90% discount</span> on everything is a major red flag for scams.
                    </p>
                    <p className="text-[#1C1B1F] text-[17px] leading-relaxed">
                      ⏰ Scammers use <span className="text-[#D00000] font-bold">urgent language</span> like "before they run out!" to rush you.
                    </p>
                    <p className="text-[#1C1B1F] text-[17px] leading-relaxed">
                      🧠 They want you to <span className="text-[#D00000] font-bold">act before you think.</span>
                    </p>
                  </div>
                  <p className="text-[#9CA3AF] text-[13px] italic text-right mt-3">10:04 AM</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm border border-[rgba(187,203,185,0.3)]">
                  <p className="text-[#091E29] text-[18px] leading-[28px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {"If it looks too good to be true, it usually is. Always check the URL carefully before clicking. Well done for completing this practice! 🎉"}
                  </p>
                  <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:05 AM</p>
                </div>
              </div>
              <button
                onClick={() => { setFairPriceLinkClicked(false); go("genai-summary"); }}
                className="w-full bg-[#006D2F] rounded-xl h-14 flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all">
                <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Complete Generative AI Module</span>
                <ArrowRight size={18} className="text-white" />
              </button>
            </>
          )}

          {/* If they haven't clicked the link yet, show a hint */}
          {!fairPriceLinkClicked && (
            <div className="bg-white/70 rounded-2xl border border-[rgba(0,82,34,0.1)] p-5 shadow-sm">
              <p className="text-[#091E29] text-[20px] font-semibold text-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Would you click the link Sarah shared?
              </p>
              <p className="text-[#3C4A3D] text-[18px] font-bold text-center mt-2" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Tap the link above to find out</p>
            </div>
          )}
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── GENAI SUMMARY ────────────────────────────────────────────────────────
  if (screen === "genai-summary") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)", ...FADE }}>
        <WhatsAppHeader onBack={() => go("fairprice-practice")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm">
              <p className="text-[#006D2F] font-bold text-[14px] mb-2 uppercase tracking-wide">Your Generative AI Summary</p>
              <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Excellent job! Here is what you learned today.</p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">Now</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#D1D5DB] shadow-sm p-5 space-y-5">
            <p className="text-[#005222] font-bold text-[20px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>🌟 Remember These!</p>
            {[
              { icon: "⏸️", title: "Pause before you act", tip: "If a call feels urgent or strange, hang up." },
              { icon: "📞", title: "Call back on the official number", tip: "Do not trust the caller. Look up the real number yourself." },
              { icon: "⚠️", title: "Check before you click or share", tip: "If something feels too good to be true, it probably is." },
            ].map(({ icon, title, tip }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="text-[24px] shrink-0">{icon}</span>
                <div>
                  <p className="text-[#091E29] font-bold text-[18px] leading-snug" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</p>
                  <p className="text-[#3F493F] text-[17px] mt-0.5 leading-relaxed" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>{tip}</p>
                </div>
              </div>
            ))}
          </div>
          <PrimaryBtn label="Complete Module" onClick={() => { setCompleted(prev => new Set([...prev, "ai"])); go("genai-complete"); }} />
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── GENAI COMPLETE ────────────────────────────────────────────────────────
  if (screen === "genai-complete") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(245,250,255)", ...FADE }}>
        <LightHeader />
        <Confetti />
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center text-center">
          {/* Trophy icon */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute w-56 h-56 bg-[#25D366] opacity-20 blur-3xl rounded-full" />
            <div className="w-40 h-40 bg-[#E6F4EA] rounded-full flex items-center justify-center relative z-10 shadow-lg">
              <div className="w-28 h-28 bg-[#006D2F]/10 rounded-full flex items-center justify-center">
                <Bot size={60} className="text-[#006D2F]" />
              </div>
            </div>
          </div>

          <h1 className="text-[#091E29] text-[26px] font-bold leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Generative AI Module Complete! 🤖
          </h1>
          <p className="text-[#3F493F] text-[17px] leading-relaxed mt-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            You can now spot AI voice scams, verify news sources, and identify fake promotions. Great work!
          </p>

          {/* 100% progress bar */}
          <div className="w-full bg-white border border-[#D1D5DB] rounded-xl p-5 mt-6 shadow-sm text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#3F493F] font-semibold text-[15px]">Generative AI Progress</span>
              <span className="text-[#005222] font-bold text-[17px]">100%</span>
            </div>
            <div className="h-3 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div className="h-full bg-[#006D2F] rounded-full w-full transition-all duration-1000" />
            </div>
          </div>

          {/* Skills earned */}
          <div className="w-full mt-5 space-y-2.5">
            {[
              { icon: "🎙️", text: "Spot AI voice scams" },
              { icon: "📰", text: "Verify news sources" },
              { icon: "🛒", text: "Identify fake promotions" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-[#E6F4EA] rounded-xl px-4 py-3 shadow-sm">
                <span className="text-[22px]">{icon}</span>
                <p className="text-[#005222] font-semibold text-[16px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>{text}</p>
                <div className="ml-auto w-6 h-6 bg-[#006D2F] rounded-full flex items-center justify-center shrink-0">
                  <Check size={13} className="text-white" strokeWidth={3} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 w-full">
            <button
              onClick={() => go("lessons")}
              className="w-full bg-[#006D2F] rounded-xl h-14 flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all">
              <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Back to Your Topics</span>
              <ArrowRight size={18} className="text-white" />
            </button>
          </div>
        </div>
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // EMAIL MODULE
  // ════════════════════════════════════════════════════════════════════════════

  // ── EMAIL SETUP: LET'S GET STARTED ────────────────────────────────────────
  if (screen === "email-setup") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)", ...FADE }}>
        <WhatsAppHeader onBack={() => go("lessons")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-center"><div className="bg-[#E1F3FB] rounded-lg px-4 py-1"><span className="text-[#54656F] text-[13px] font-semibold uppercase">TODAY</span></div></div>
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm">
              <p className="text-[#091E29] text-[22px] font-bold leading-snug mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{"Let's Get Started With Email 📧"}</p>
              <p className="text-[#091E29] text-[18px] leading-[28px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                You can use email to receive important messages from places you trust:
              </p>
              <div className="mt-4 space-y-3">
                {[
                  { emoji: "🏦", label: "Banks" },
                  { emoji: "🏥", label: "Hospitals" },
                  { emoji: "🏛️", label: "Government services" },
                ].map(({ emoji, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-[24px]">{emoji}</span>
                    <span className="text-[#091E29] text-[18px] font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[#091E29] text-[18px] leading-[28px] mt-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                I'll guide you through setting up your email and using it safely.
              </p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-3">10:15 AM</p>
            </div>
          </div>
          <PrimaryBtn label="Get Started" onClick={() => go("email-has-account")} />
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL SETUP: HAS ACCOUNT? ──────────────────────────────────────────────
  if (screen === "email-has-account") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)", ...FADE }}>
        <WhatsAppHeader onBack={() => go("email-setup")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[320px] shadow-sm">
              <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Let's get started. Do you already have an email account?
              </p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:16 AM</p>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={() => go("email-already-has")}
              className="w-full bg-[#006D2F] rounded-xl h-14 flex items-center justify-center gap-3 shadow-md hover:brightness-105 active:scale-95 transition-all">
              <Check size={20} className="text-white" />
              <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Yes, I have one</span>
            </button>
            <button onClick={() => go("email-choose-provider")}
              className="w-full bg-white border-2 border-[#006D2F] rounded-xl h-14 flex items-center justify-center gap-3 shadow-sm hover:bg-[#E6F4EA] active:scale-95 transition-all">
              <Mail size={20} className="text-[#006D2F]" />
              <span className="text-[#006D2F] font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>No, I need one</span>
            </button>
          </div>
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL ALREADY HAS ACCOUNT: INTRO TO LESSONS ───────────────────────────
  if (screen === "email-already-has") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)", ...FADE }}>
        <WhatsAppHeader onBack={() => go("email-has-account")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm">
              <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Great! Since you already have an email account, let me show you how to use it safely. 📧
              </p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:16 AM</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm">
              <p className="text-[#091E29] text-[18px] font-semibold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>In this module you will learn:</p>
              <div className="space-y-3">
                {[
                  { icon: "📥", title: "Reading your inbox", desc: "Find and organise your emails easily." },
                  { icon: "🚨", title: "Recognising suspicious emails", desc: "Spot scam senders and fake messages." },
                  { icon: "🔗", title: "Links and attachments", desc: "Know what is safe to open and what to avoid." },
                  { icon: "🔒", title: "Protecting your account", desc: "Keep your email secure with good habits." },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3 bg-[#F9FAFB] rounded-xl px-3 py-2.5">
                    <span className="text-[20px] shrink-0 mt-0.5">{icon}</span>
                    <div>
                      <p className="text-[#091E29] font-semibold text-[15px]">{title}</p>
                      <p className="text-[#6F7A6E] text-[13px] mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-3">10:17 AM</p>
            </div>
          </div>
          <PrimaryBtn label="Start Learning" onClick={() => go("email-overview")} />
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL SETUP: CHOOSE PROVIDER ───────────────────────────────────────────
  if (screen === "email-choose-provider") {
    const providers = [
      { id: "gmail" as const, label: "Gmail", domain: "@gmail.com", color: "#EA4335", bg: "#FEF2F2", letter: "G" },
      { id: "yahoo" as const, label: "Yahoo", domain: "@yahoo.com", color: "#6001D2", bg: "#F3EEFF", letter: "Y" },
      { id: "outlook" as const, label: "Outlook", domain: "@outlook.com", color: "#0078D4", bg: "#EFF6FF", letter: "O" },
    ];
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)", ...FADE }}>
        <WhatsAppHeader onBack={() => go("email-has-account")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[320px] shadow-sm">
              <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Which email provider do you use?
              </p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:17 AM</p>
            </div>
          </div>
          <div className="space-y-3">
            {providers.map(({ id, label, domain, color, bg, letter }) => (
              <button key={id} onClick={() => { setEmailProvider(id); go("email-create-address"); }}
                className={`w-full rounded-xl border-2 h-16 flex items-center gap-4 px-5 shadow-sm transition-all active:scale-95 ${emailProvider === id ? "border-[#006D2F]" : "border-[#D1D5DB] bg-white hover:border-[#006D2F]/40"}`}
                style={{ backgroundColor: emailProvider === id ? bg : "white" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-[18px] text-white" style={{ backgroundColor: color }}>{letter}</div>
                <div className="text-left">
                  <p className="font-bold text-[#091E29] text-[17px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>{label}</p>
                  <p className="text-[#6F7A6E] text-[13px]">{domain}</p>
                </div>
                {emailProvider === id && (
                  <div className="ml-auto w-6 h-6 bg-[#006D2F] rounded-full flex items-center justify-center shrink-0">
                    <Check size={13} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL SETUP: CREATE ADDRESS ────────────────────────────────────────────
  if (screen === "email-create-address") {
    const domainMap = { gmail: "@gmail.com", yahoo: "@yahoo.com", outlook: "@outlook.com" };
    const domain = emailProvider ? domainMap[emailProvider] : "@gmail.com";
    const base = emailUsername.trim();
    const fullEmail = base ? `${base}${domain}` : "";

    const getSuggestions = (u: string): string[] => {
      if (u.length < 2) return [];
      const cap = u.charAt(0).toUpperCase() + u.slice(1).toLowerCase();
      const numMap: Record<string, string> = { a: "4", e: "3", i: "1", o: "0", u: "v" };
      const modified = cap.replace(/[aeiou]/i, (c) => numMap[c.toLowerCase()] ?? c);
      return [`${modified}News`, `${cap}Connect`, `${cap}Updates`];
    };
    const suggestions = getSuggestions(base);

    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)", ...FADE }}>
        <WhatsAppHeader onBack={() => go("email-choose-provider")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm">
              <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {"Now let's create your email address. Type your name or a username below."}
              </p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:18 AM</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#D1D5DB] shadow-sm p-5 space-y-4">
            <p className="text-[#005222] font-bold text-[16px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Your email address</p>

            {/* Username input — full width */}
            <div>
              <label className="text-[#6F7A6E] text-[13px] font-medium mb-1.5 block">Username</label>
              <input
                type="text"
                value={emailUsername}
                onChange={e => setEmailUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
                placeholder="e.g. jamie"
                className="w-full rounded-xl border-2 border-[#BBCBB9] bg-[#F9FAFB] px-4 py-3.5 text-[18px] outline-none text-[#091E29] focus:border-[#006D2F] transition-colors"
                style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}
              />
            </div>

            {/* Domain display — clear, full width */}
            <div className="bg-[#F0F7FF] rounded-xl px-4 py-3 flex items-center gap-2 border border-[#BBCBB9]">
              <span className="text-[#3C4A3D] text-[15px] font-medium">Domain:</span>
              <span className="text-[#006D2F] font-bold text-[16px]">{domain}</span>
            </div>

            {/* Full email preview */}
            {fullEmail && (
              <div className="bg-[#E6F4EA] rounded-xl px-4 py-3 flex items-start gap-2">
                <Mail size={16} className="text-[#006D2F] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#6F7A6E] text-[12px] font-medium">Your email will be:</p>
                  <p className="text-[#005222] font-bold text-[16px] break-all mt-0.5">{fullEmail}</p>
                </div>
              </div>
            )}

            {/* 3 suggestions */}
            {suggestions.length > 0 && (
              <div>
                <p className="text-[#6F7A6E] text-[13px] font-medium mb-2">Suggestions (tap to use):</p>
                <div className="flex flex-col gap-2">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => setEmailUsername(s.toLowerCase())}
                      className="w-full text-left rounded-xl border-2 border-[#BBCBB9] bg-[#F9FAFB] px-4 py-2.5 hover:border-[#006D2F] hover:bg-[#E6F4EA] transition-all flex items-center justify-between">
                      <span className="text-[#091E29] font-medium text-[15px]">{s.toLowerCase()}{domain}</span>
                      <ArrowRight size={14} className="text-[#006D2F] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => { if (base) go("email-create-password"); }}
              disabled={!base}
              className={`w-full rounded-xl h-14 flex items-center justify-center gap-2 shadow-md transition-all ${base ? "bg-[#006D2F] hover:brightness-105" : "bg-[#BBCBB9] cursor-not-allowed"}`}>
              <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Continue</span>
              <ArrowRight size={18} className="text-white" />
            </button>
          </div>
          <button onClick={() => go("email-choose-provider")} className="w-full text-center text-[#006D2F] text-[15px] font-medium underline py-1">
            Change provider
          </button>
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL SETUP: CREATE PASSWORD ───────────────────────────────────────────
  if (screen === "email-create-password") {
    const pwd = emailSetupPassword;
    const getStrength = (p: string): { label: string; color: string; pct: number } => {
      if (!p) return { label: "", color: "#E5E7EB", pct: 0 };
      let score = 0;
      if (p.length >= 6) score++;
      if (p.length >= 10) score++;
      if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
      if (/[0-9]/.test(p)) score++;
      if (/[^A-Za-z0-9]/.test(p)) score++;
      if (score <= 1) return { label: "Weak", color: "#EF4444", pct: 33 };
      if (score <= 3) return { label: "Medium", color: "#F97316", pct: 66 };
      return { label: "Strong", color: "#006D2F", pct: 100 };
    };
    const strength = getStrength(pwd);
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)", ...FADE }}>
        <WhatsAppHeader onBack={() => go("email-create-address")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm">
              <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Now create a <span className="font-bold text-[#006D2F]">strong password</span> for your email account.
              </p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:19 AM</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#D1D5DB] shadow-sm p-5 space-y-4">
            <p className="text-[#005222] font-bold text-[16px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Create your password</p>
            {/* Password input — always hidden (type=password) */}
            <div className="flex items-center rounded-xl border-2 border-[#BBCBB9] bg-[#F9FAFB] overflow-hidden focus-within:border-[#006D2F] transition-colors">
              <input
                type="password"
                value={pwd}
                onChange={e => setEmailSetupPassword(e.target.value)}
                placeholder="Enter a strong password"
                className="flex-1 bg-transparent px-4 py-3.5 text-[18px] outline-none text-[#091E29]"
                style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}
              />
            </div>
            {/* Strength bar */}
            {pwd.length > 0 && (
              <div className="space-y-1.5">
                <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${strength.pct}%`, backgroundColor: strength.color }} />
                </div>
                <p className="text-[14px] font-semibold" style={{ color: strength.color }}>{strength.label}</p>
              </div>
            )}
            <button
              onClick={() => { if (pwd.length >= 4) go("email-password-reminder"); }}
              disabled={pwd.length < 4}
              className={`w-full rounded-xl h-14 flex items-center justify-center gap-2 shadow-md transition-all ${pwd.length >= 4 ? "bg-[#006D2F] hover:brightness-105" : "bg-[#BBCBB9] cursor-not-allowed"}`}>
              <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Continue</span>
              <ArrowRight size={18} className="text-white" />
            </button>
          </div>
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL SETUP: PASSWORD REMINDER ────────────────────────────────────────
  if (screen === "email-password-reminder") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)", ...FADE }}>
        <WhatsAppHeader onBack={() => go("email-create-password")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm">
              <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Password saved! Before we continue, here is an important reminder. 🔒
              </p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:20 AM</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm border-l-4 border-[#006D2F]">
              <div className="flex items-center gap-2 mb-3">
                <Lock size={18} className="text-[#006D2F]" />
                <p className="text-[#005222] font-bold text-[16px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Password Reminder</p>
              </div>
              <p className="text-[#091E29] text-[17px] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Remember to <span className="font-bold">write down your password</span> somewhere safe.
              </p>
              <p className="text-[#091E29] text-[17px] leading-relaxed mt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <span className="font-bold text-[#9D1C52]">Never share your password</span> with anyone, including family members or people who claim to be from technical support.
              </p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-3">10:20 AM</p>
            </div>
          </div>
          <PrimaryBtn label="Continue to 2-Step Verification" onClick={() => { setEmailTfaPhase("explain"); go("email-2fa-setup"); }} />
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL SETUP: 2FA ───────────────────────────────────────────────────────
  if (screen === "email-2fa-setup") {
    const SETUP_PIN = "739241";
    const pressSetupOtp = (key: string) => {
      if (key === "del") {
        const lastIdx = [...emailSetupOtp].map((v, i) => (v ? i : -1)).filter(i => i >= 0).pop() ?? -1;
        if (lastIdx >= 0) setEmailSetupOtp(prev => { const n = [...prev]; n[lastIdx] = ""; return n; });
        setEmailSetupOtpError(false);
        return;
      }
      const emptyIdx = emailSetupOtp.findIndex(v => v === "");
      if (emptyIdx === -1) return;
      setEmailSetupOtp(prev => { const n = [...prev]; n[emptyIdx] = key; return n; });
      setEmailSetupOtpError(false);
    };
    const verifySetupOtp = () => {
      if (emailSetupOtp.join("") === SETUP_PIN) {
        setEmailSetupOtp(["", "", "", "", "", ""]);
        setEmailSetupOtpError(false);
        go("email-setup-complete");
      } else {
        setEmailSetupOtpError(true);
      }
    };

    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)", ...FADE }}>
        <WhatsAppHeader onBack={() => { setEmailTfaPhase("explain"); go("email-password-reminder"); }} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

          {/* Explanation phase */}
          {emailTfaPhase === "explain" && (
            <>
              <div className="flex justify-start">
                <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm">
                  <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    One more step to keep your account safe!
                  </p>
                  <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:21 AM</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#D1D5DB] shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#E6F4EA] rounded-full flex items-center justify-center shrink-0">
                    <ShieldCheck size={24} className="text-[#006D2F]" />
                  </div>
                  <p className="text-[#005222] font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Turn on 2-Step Verification</p>
                </div>
                <p className="text-[#091E29] text-[16px] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Add an extra layer of protection. Even if someone knows your password, they still cannot access your account without the second step.
                </p>
                {[
                  "Your account stays safe even if your password is stolen",
                  "You confirm logins with a code sent to your phone",
                  "Much harder for scammers to break in",
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-[#006D2F] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                    <p className="text-[#3C4A3D] text-[17px] leading-snug">{tip}</p>
                  </div>
                ))}
                <button onClick={() => setEmailTfaPhase("pin")}
                  className="w-full bg-[#006D2F] rounded-xl h-14 flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all">
                  <ShieldCheck size={20} className="text-white" />
                  <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Turn on 2-Step Verification</span>
                </button>
              </div>
            </>
          )}

          {/* PIN entry phase */}
          {emailTfaPhase === "pin" && (
            <>
              <div className="flex justify-start">
                <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm">
                  <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    A verification code has been sent to your phone. Enter it below to confirm.
                  </p>
                  <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:22 AM</p>
                </div>
              </div>

              {/* Practice code card */}
              <div className="bg-[#E6F4EA] border border-[#BBCBB9] rounded-xl px-4 py-3 flex items-start gap-2">
                <Lightbulb size={16} className="text-[#006D2F] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[#005222] font-bold text-[14px]">Practice Simulation</p>
                  <p className="text-[#3C4A3D] text-[14px] mt-0.5">This is a practice exercise. Your code is:</p>
                  <p className="text-[#006D2F] font-black text-[28px] tracking-[6px] mt-1">739 241</p>
                </div>
              </div>

              {/* PIN entry */}
              <div className="bg-white rounded-xl border border-[#D1D5DB] shadow-sm p-5">
                <p className="text-[#005222] font-bold text-[16px] mb-4 text-center" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Enter your 6-digit code</p>
                <div className="flex justify-center gap-2 mb-4">
                  {emailSetupOtp.map((v, i) => (
                    <div key={i} className={`w-11 h-14 rounded-xl border-2 flex items-center justify-center text-[22px] font-bold transition-colors
                      ${emailSetupOtpError ? "border-red-400 bg-red-50" : v ? "border-[#006D2F] bg-[#E6F4EA]" : "border-[#D1D5DB] bg-[#F9FAFB]"}`}>
                      {v}
                    </div>
                  ))}
                </div>
                {emailSetupOtpError && (
                  <p className="text-red-500 text-[14px] text-center mb-3 font-medium">Incorrect code. Try again!</p>
                )}
                {/* Keypad */}
                <div className="grid grid-cols-3 gap-2">
                  {["1","2","3","4","5","6","7","8","9","","0","del"].map((k) => (
                    <button key={k} onClick={() => k && pressSetupOtp(k)}
                      disabled={!k}
                      className={`h-14 rounded-xl text-[22px] font-bold transition-all active:scale-90 ${
                        k === "del" ? "bg-[#F3F4F6] text-[#3C4A3D]" :
                        k === "" ? "invisible" :
                        "bg-[#F3F4F6] text-[#1C1B1F] hover:bg-[#E5E7EB]"
                      }`}>
                      {k === "del" ? <Delete size={20} className="mx-auto" /> : k}
                    </button>
                  ))}
                </div>
                <button onClick={verifySetupOtp}
                  disabled={emailSetupOtp.some(v => !v)}
                  className={`w-full mt-4 rounded-xl h-14 flex items-center justify-center gap-2 shadow-md transition-all ${emailSetupOtp.every(v => v) ? "bg-[#006D2F] hover:brightness-105" : "bg-[#BBCBB9] cursor-not-allowed"}`}>
                  <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Verify Code</span>
                </button>
              </div>
            </>
          )}
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL SETUP: COMPLETE ──────────────────────────────────────────────────
  if (screen === "email-setup-complete") {
    const domainMap = { gmail: "@gmail.com", yahoo: "@yahoo.com", outlook: "@outlook.com" };
    const domain = emailProvider ? domainMap[emailProvider] : "@gmail.com";
    const fullEmail = `${emailUsername.trim()}${domain}`;
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)", ...FADE }}>
        <WhatsAppHeader onBack={() => go("email-2fa-setup")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {/* Congrats message */}
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm">
              <p className="text-[#091E29] text-[22px] font-bold leading-snug mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Your email is ready! 🎉
              </p>
              <p className="text-[#091E29] text-[18px] leading-[28px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                You have successfully set up your email with 2-Step Verification. Your account is now protected!
              </p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:23 AM</p>
            </div>
          </div>

          {/* Account details card */}
          <div className="bg-white rounded-xl border border-[#D1D5DB] shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#E6F4EA] rounded-full flex items-center justify-center shrink-0">
                <Mail size={18} className="text-[#006D2F]" />
              </div>
              <p className="text-[#005222] font-bold text-[16px]">Your Account Details</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-xl px-4 py-3.5">
              <p className="text-[#6F7A6E] text-[13px] font-medium mb-1">Email</p>
              <p className="text-[#091E29] font-bold text-[16px] break-all">{fullEmail}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-xl px-4 py-3.5">
              <p className="text-[#6F7A6E] text-[13px] font-medium mb-1">Password</p>
              <p className="text-[#091E29] font-bold text-[20px] tracking-[6px]">{"••••••••••"}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-xl px-4 py-3 flex items-center gap-3">
              <p className="text-[#6F7A6E] text-[13px] font-medium">2-Step Verification</p>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-4 h-4 bg-[#25D366] rounded-full flex items-center justify-center shrink-0"><Check size={9} className="text-white" strokeWidth={3} /></div>
                <p className="text-[#006D2F] font-semibold text-[14px]">On</p>
              </div>
            </div>
            {/* Privacy reminder */}
            <div className="bg-[#E6F4EA] border border-[#BBCBB9] rounded-xl px-4 py-3 flex items-start gap-2">
              <Lock size={15} className="text-[#006D2F] mt-0.5 shrink-0" />
              <p className="text-[#005222] font-semibold text-[14px] leading-snug" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>
                Keep your password private. Never share it with others.
              </p>
            </div>
          </div>

          <button onClick={() => go("email-safety-bridge")}
            className="w-full bg-[#006D2F] rounded-xl h-14 flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all">
            <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Continue to Email Safety</span>
            <ArrowRight size={18} className="text-white" />
          </button>
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL SETUP: REMEMBER DETAILS ─────────────────────────────────────────
  if (screen === "email-remember-details") {
    const domainMap = { gmail: "@gmail.com", yahoo: "@yahoo.com", outlook: "@outlook.com" };
    const domain = emailProvider ? domainMap[emailProvider] : "@gmail.com";
    const fullEmail = `${emailUsername.trim()}${domain}`;
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)", ...FADE }}>
        <WhatsAppHeader onBack={() => go("email-setup-complete")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm">
              <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {"Here are your account details. Keep them somewhere safe, and remember: never share your password with anyone!"}
              </p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:22 AM</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#D1D5DB] shadow-sm p-5 space-y-4">
            <p className="text-[#005222] font-bold text-[16px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Your Account Details</p>
            <div className="space-y-3">
              <div className="bg-[#F9FAFB] rounded-xl px-4 py-3.5">
                <p className="text-[#6F7A6E] text-[13px] font-medium mb-1">Your email address</p>
                <p className="text-[#091E29] font-semibold text-[16px] break-all">{fullEmail}</p>
              </div>
              <div className="bg-[#F9FAFB] rounded-xl px-4 py-3.5">
                <p className="text-[#6F7A6E] text-[13px] font-medium mb-1">Your password</p>
                <p className="text-[#091E29] font-semibold text-[20px] tracking-[6px]">{"••••••••••"}</p>
              </div>
            </div>
            <div className="bg-[#E6F4EA] border border-[#BBCBB9] rounded-xl px-4 py-3 flex items-start gap-2">
              <Lock size={16} className="text-[#006D2F] mt-0.5 shrink-0" />
              <p className="text-[#005222] font-semibold text-[14px] leading-snug" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>
                Keep your password private. Never share your password with other people.
              </p>
            </div>
          </div>
          <PrimaryBtn label="Next" onClick={() => go("email-safety-bridge")} />
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL SAFETY BRIDGE ────────────────────────────────────────────────────
  if (screen === "email-safety-bridge") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)", ...FADE }}>
        <WhatsAppHeader onBack={() => go("email-remember-details")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {[
            "Great! Now let's learn how to use your email safely. 📧",
            "I will show you how to read your inbox, spot scam emails, open attachments safely, and compose emails.",
          ].map((text, i) => (
            <div key={i} className="flex justify-start">
              <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[320px] shadow-sm">
                <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{text}</p>
                <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:23 AM</p>
              </div>
            </div>
          ))}
          <PrimaryBtn label="Start Email Safety" onClick={() => go("email-overview")} />
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL OVERVIEW ─────────────────────────────────────────────────────────
  if (screen === "email-overview") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)" }}>
        <WhatsAppHeader onBack={() => go("lessons")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-center"><div className="bg-[#E1F3FB] rounded-lg px-4 py-1"><span className="text-[#54656F] text-[13px] font-semibold uppercase">TODAY</span></div></div>
          {[
            "Welcome to the Email Safety module! 📧",
            "Email is one of the most common ways scammers try to trick people. But don't worry. I will teach you everything you need to know to stay safe!",
            "In this module, you will learn:\n\n✅ How to read your inbox\n✅ How to spot scam emails by checking the sender\n✅ How to open attachments safely\n✅ How to compose and reply to emails",
          ].map((text, i) => (
            <div key={i} className="flex justify-start">
              <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[320px] shadow-sm">
                <p className="text-[#091E29] text-[19px] leading-[30px] whitespace-pre-line" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{text}</p>
                <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:15 AM</p>
              </div>
            </div>
          ))}
          <div className="shrink-0 px-0 py-3">
            <PrimaryBtn label="Start Email Lessons" onClick={() => go("email-inbox-lesson")} />
          </div>
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL INBOX LESSON ─────────────────────────────────────────────────────
  if (screen === "email-inbox-lesson") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto bg-white">
        <LightHeader onBack={() => go("email-overview")} title="Inbox" />
        <CoachTip text="Look at your inbox! Unread emails are shown in bold. The ⭐ button lets you save important emails." />
        <div className="flex-1 overflow-y-auto">
          {EMAILS.map((email) => (
            <EmailRow key={email.id} email={email} showStar starred={starred.has(email.id)}
              onStar={(e) => { e.stopPropagation(); setStarred(prev => { const n = new Set(prev); n.has(email.id) ? n.delete(email.id) : n.add(email.id); return n; }); }} />
          ))}
        </div>
        <div className="shrink-0 px-4 py-3 border-t border-[#E5E7EB]">
          <PrimaryBtn label="Next: Practice Searching" onClick={() => go("email-inbox-search")} />
        </div>
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL INBOX SEARCH ─────────────────────────────────────────────────────
  if (screen === "email-inbox-search") {
    const searchLower = emailSearch.toLowerCase().trim();
    const filteredEmails = searchLower === "cpf"
      ? EMAILS.filter(e => e.id === "cpf")
      : searchLower
      ? EMAILS.filter(e => e.sender.toLowerCase().includes(searchLower) || e.subject.toLowerCase().includes(searchLower))
      : EMAILS;
    const cpfFound = searchLower === "cpf";

    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto bg-white">
        <LightHeader onBack={() => go("email-inbox-lesson")} title="Inbox" />
        <CoachTip text='Try typing "CPF" in the search bar below to find your CPF email!' />
        <div className="shrink-0 px-4 py-2 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2 bg-[#F3F4F6] rounded-full px-3 py-2">
            <Search size={15} className="text-[#6F7A6E] shrink-0" />
            <input type="text" value={emailSearch} onChange={e => setEmailSearch(e.target.value)}
              placeholder="Search mail..." className="flex-1 bg-transparent text-[15px] outline-none text-[#091E29]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
            {emailSearch && <button onClick={() => setEmailSearch("")}><X size={14} className="text-[#6F7A6E]" /></button>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredEmails.map(email => (
            <EmailRow key={email.id} email={email} highlighted={cpfFound && email.id === "cpf"} />
          ))}
          {filteredEmails.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-[#9CA3AF]">
              <Search size={40} className="mb-3 opacity-40" />
              <p className="text-[16px]">No emails found</p>
            </div>
          )}
        </div>
        {cpfFound ? (
          <div className="shrink-0 px-4 py-3 border-t border-[#E5E7EB]">
            <button onClick={() => { setEmailSearch(""); go("email-cpf-view"); }} className="w-full bg-[#006D2F] rounded-xl h-14 flex items-center justify-center gap-2 shadow-md">
              <Check size={18} className="text-white" />
              <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Found it! View CPF Email</span>
              <ArrowRight size={18} className="text-white" />
            </button>
          </div>
        ) : (
          <div className="shrink-0 px-4 py-3 border-t border-[#E5E7EB] text-center">
            <p className="text-[#9CA3AF] text-[14px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Search for "CPF" above to continue</p>
          </div>
        )}
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL CPF VIEW ─────────────────────────────────────────────────────────
  if (screen === "email-cpf-view") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto bg-white">
        <LightHeader onBack={() => go("email-inbox-search")} title="CPF Board" />
        <CoachTip text="Look at the sender address carefully. Official emails come from trusted domains like @cpf.gov.sg, not @gmail.com!" />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
            <div className="bg-[#F3F4F6] px-4 py-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[20px]">🏛️</div>
                <div>
                  <p className="font-bold text-[#091E29] text-[16px]">CPF Board</p>
                  <div className="flex items-center gap-1">
                    <p className="text-[13px] text-[#6F7A6E]">From: </p>
                    <span className="text-[13px] font-semibold text-[#006D2F] bg-[#E6F4EA] px-2 py-0.5 rounded">cpf@cpf.gov.sg</span>
                    <Check size={12} className="text-[#006D2F]" />
                  </div>
                </div>
              </div>
              <p className="text-[#091E29] font-semibold text-[15px]">Your CPF Statement is ready</p>
              <p className="text-[#9CA3AF] text-[12px]">Yesterday · Inbox</p>
            </div>
            <div className="px-4 py-5 space-y-3">
              <p className="text-[#091E29] text-[16px] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Dear Member,</p>
              <p className="text-[#3F493F] text-[16px] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your CPF Statement for the period ending October 2024 is now ready to view.</p>
              <p className="text-[#3F493F] text-[16px] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>You may log in to my.cpf.gov.sg using your Singpass to access your statement.</p>
              <p className="text-[#3F493F] text-[16px] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>If you have any queries, please contact us at 1800-227-1188.</p>
              <p className="text-[#091E29] text-[16px] mt-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Regards,<br /><strong>CPF Board</strong></p>
            </div>
          </div>
          <div className="bg-[#E6F4EA] border border-[#006D2F] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="text-[#006D2F] mt-0.5 shrink-0" />
              <div>
                <p className="text-[#005222] font-bold text-[17px]">This email is safe!</p>
                <p className="text-[#3F493F] text-[17px] mt-1">The sender is <strong>cpf@cpf.gov.sg</strong>, an official government domain. Notice it ends in .gov.sg, not .com or .gmail.com.</p>
              </div>
            </div>
          </div>
          <PrimaryBtn label="Next: Check the Sender" onClick={() => go("email-check-sender")} />
        </div>
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL CHECK SENDER ─────────────────────────────────────────────────────
  if (screen === "email-check-sender") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)" }}>
        <WhatsAppHeader onBack={() => go("email-cpf-view")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[320px] shadow-sm">
              <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Now let's test your skills! Look at these two emails. One is real, one is a scam. Can you spot which sender is suspicious?</p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:20 AM</p>
            </div>
          </div>
          {/* Two email sender cards */}
          <div className="space-y-3">
            {[
              { id: "real", label: "Email A", from: "cpf@cpf.gov.sg", subject: "Your CPF Statement is ready", icon: "🏛️", tag: "Official .gov.sg domain" },
              { id: "scam", label: "Email B", from: "cpfboard@gmail.com", subject: "URGENT: Verify your CPF account", icon: "⚠️", tag: "Free email, suspicious!" },
            ].map(opt => (
              <button key={opt.id} onClick={() => setSenderChoice(opt.id === "scam" ? "correct" : "wrong")}
                className={`w-full text-left border-2 rounded-xl p-4 transition-all ${senderChoice === "correct" && opt.id === "scam" ? "border-[#9D1C52] bg-[#FFF0F4]" : senderChoice === "wrong" && opt.id === "real" ? "border-[#006D2F] bg-[#E6F4EA]" : "border-[#D1D5DB] bg-white"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[22px]">{opt.icon}</span>
                  <span className="font-bold text-[#091E29] text-[15px]">{opt.label}</span>
                </div>
                <p className="text-[13px] text-[#6F7A6E]">From: <span className={`font-semibold ${opt.id === "scam" ? "text-[#9D1C52]" : "text-[#006D2F]"}`}>{opt.from}</span></p>
                <p className="text-[14px] text-[#1C1B1F] mt-1">{opt.subject}</p>
              </button>
            ))}
          </div>
          {senderChoice === "wrong" && (
            <div className="bg-[#FFF0F4] border border-[#9D1C52] rounded-xl p-4">
              <div className="flex items-start gap-3"><AlertTriangle size={18} className="text-[#9D1C52] mt-0.5 shrink-0" />
                <div><p className="text-[#9D1C52] font-bold text-[17px]">Not quite!</p><p className="text-[#3F493F] text-[17px] mt-1">Email A is the safe one from the official CPF government domain. Look again. Email B uses @gmail.com which is suspicious for an official agency!</p></div>
              </div>
              <button onClick={() => setSenderChoice(null)} className="mt-3 w-full border border-[#9D1C52] rounded-lg py-2 text-[#9D1C52] font-semibold text-[17px]">Try Again</button>
            </div>
          )}
          {senderChoice === "correct" && (
            <div className="space-y-3">
              <div className="bg-[#E6F4EA] border border-[#006D2F] rounded-xl p-4">
                <div className="flex items-start gap-3"><ShieldCheck size={18} className="text-[#006D2F] mt-0.5 shrink-0" />
                  <div><p className="text-[#005222] font-bold text-[17px]">Correct! 🎉</p><p className="text-[#3F493F] text-[17px] mt-1">Email B is the scam! Real government agencies use official domains like @cpf.gov.sg, never free email services like @gmail.com.</p></div>
                </div>
              </div>
              <PrimaryBtn label="Next: Attachment Safety" onClick={() => { setSenderChoice(null); go("email-attachments-lesson"); }} />
            </div>
          )}
          {!senderChoice && (
            <div className="text-center text-[#9CA3AF] text-[14px] py-2">Tap the suspicious email above</div>
          )}
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL ATTACHMENTS LESSON ───────────────────────────────────────────────
  if (screen === "email-attachments-lesson") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)" }}>
        <WhatsAppHeader onBack={() => go("email-check-sender")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {[
            "Great job spotting the scam sender! 🛡️ Now let's talk about email attachments.",
            "Attachments are files that come with emails, like photos, documents (PDF), or other files.",
          ].map((text, i) => (
            <div key={i} className="flex justify-start">
              <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[320px] shadow-sm">
                <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{text}</p>
                <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:22 AM</p>
              </div>
            </div>
          ))}
          <div className="bg-white rounded-xl border border-[#D1D5DB] shadow-sm p-5 space-y-4">
            <p className="text-[#005222] font-bold text-[17px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>3 Golden Rules for Attachments</p>
            {[
              { icon: "✅", rule: "Only open from people you know", desc: "If you don't recognise the sender, don't open the attachment." },
              { icon: "📄", rule: "Safe file types: .pdf, .jpg, .png", desc: "These are usually safe. Be careful with .exe, .zip from unknown senders." },
              { icon: "❓", rule: "When in doubt, ask first!", desc: "Call or message the person to confirm they really sent it to you." },
            ].map(({ icon, rule, desc }) => (
              <div key={rule} className="flex items-start gap-3">
                <span className="text-[22px] shrink-0">{icon}</span>
                <div><p className="text-[#091E29] font-semibold text-[17px]">{rule}</p><p className="text-[#6F7A6E] text-[17px] mt-1">{desc}</p></div>
              </div>
            ))}
          </div>
          <PrimaryBtn label="See an Example" onClick={() => go("email-sister-mary-view")} />
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL SISTER MARY VIEW ─────────────────────────────────────────────────
  if (screen === "email-sister-mary-view") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto bg-white">
        <LightHeader onBack={() => go("email-attachments-lesson")} title="Sister Mary" />
        <CoachTip text="This is a safe email from Sister Mary, someone you know! The PDF attachment is a recipe document, perfectly safe to open." />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
            <div className="bg-[#F3F4F6] px-4 py-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[20px]">👩</div>
                <div>
                  <p className="font-bold text-[#091E29] text-[16px]">Sister Mary</p>
                  <p className="text-[13px] text-[#006D2F] font-medium">From: sister.mary@gmail.com</p>
                </div>
              </div>
              <p className="text-[#091E29] font-semibold text-[15px]">Recipe for Pineapple Tart</p>
              <p className="text-[#9CA3AF] text-[12px]">Monday · Inbox</p>
            </div>
            <div className="px-4 py-5 space-y-3">
              <p className="text-[#3F493F] text-[16px] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Hi dear,</p>
              <p className="text-[#3F493F] text-[16px] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Here is the Pineapple Tart recipe I promised you! I hope you enjoy making it for the family. Let me know how it turns out 😊</p>
              <p className="text-[#3F493F] text-[16px] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Love,<br />Mary</p>
              {/* Attachment */}
              <div className="border border-[#E5E7EB] rounded-xl p-3 flex items-center gap-3 bg-[#F9FAFB]">
                <div className="w-10 h-10 bg-[#DEF0FF] rounded-lg flex items-center justify-center shrink-0"><FileText size={20} className="text-[#3F493F]" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#091E29] font-semibold text-[14px] truncate">PineappleTartRecipe.pdf</p>
                  <p className="text-[#9CA3AF] text-[12px]">45 KB · PDF Document</p>
                </div>
                <div className="w-8 h-8 bg-[#E6F4EA] rounded-full flex items-center justify-center shrink-0">
                  <Check size={14} className="text-[#006D2F]" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#E6F4EA] border border-[#006D2F] rounded-xl p-4">
            <div className="flex items-start gap-3"><ShieldCheck size={18} className="text-[#006D2F] mt-0.5 shrink-0" />
              <div className="space-y-3">
                <p className="text-[#3F493F] text-[17px]">✅ <strong>Known sender</strong></p>
                <p className="text-[#3F493F] text-[17px]">✅ <strong>Safe .pdf file</strong></p>
                <p className="text-[#3F493F] text-[17px]">✅ <strong>Personal message</strong></p>
                <p className="text-[#005222] font-semibold text-[17px]">This attachment is safe to open!</p>
              </div>
            </div>
          </div>
          <PrimaryBtn label="Next: Learn to Compose" onClick={() => go("email-compose-lesson")} />
        </div>
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL COMPOSE LESSON ───────────────────────────────────────────────────
  if (screen === "email-compose-lesson") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)" }}>
        <WhatsAppHeader onBack={() => go("email-sister-mary-view")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-center"><div className="bg-[#E1F3FB] rounded-lg px-4 py-1"><span className="text-[#54656F] text-[13px] font-semibold uppercase">TODAY</span></div></div>
          {[
            "Did you know that you can also send emails? 📤",
            "Pressing the + Compose button allows you to write new emails to anyone! You can attach photos, documents and more.",
            "Try emailing me first at SafetyCoach@gmail.com. Just tell me about your day! I would love to hear from you 😊",
          ].map((text, i) => (
            <div key={i} className="flex justify-start">
              <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[320px] shadow-sm">
                <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{text}</p>
                <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:28 AM</p>
              </div>
            </div>
          ))}
          <PrimaryBtn label="Find the + Compose Button" onClick={() => go("email-inbox-find-compose")} />
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL INBOX FIND COMPOSE ───────────────────────────────────────────────
  if (screen === "email-inbox-find-compose") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto bg-white relative" style={FADE}>
        <LightHeader onBack={() => go("email-compose-lesson")} title="Inbox" />
        <CoachTip text="Can you spot the + Compose button? It's at the bottom right corner. Tap it to write a new email!" />
        <div className="flex-1 overflow-y-auto">
          {EMAILS.map(email => <EmailRow key={email.id} email={email} />)}
        </div>
        {/* Pulsing Compose FAB */}
        <button onClick={() => go("email-compose")}
          className="absolute bottom-[92px] right-4 bg-[#006D2F] rounded-2xl px-5 py-3 flex items-center gap-2 shadow-xl z-20"
          style={{ animation: "fabPulse 1.5s ease-in-out infinite" }}>
          <Plus size={20} className="text-white" />
          <span className="text-white font-bold text-[15px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Compose</span>
        </button>
        <style>{`@keyframes fabPulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,109,47,0.5)} 50%{box-shadow:0 0 0 12px rgba(0,109,47,0)} }`}</style>
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL COMPOSE ──────────────────────────────────────────────────────────
  if (screen === "email-compose") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto bg-white">
        <div className="shrink-0 bg-white border-b border-[#E5E7EB] flex items-center justify-between h-[56px] px-4 shadow-sm z-10">
          <button onClick={() => go("email-inbox-find-compose")} className="text-[#006D2F] flex items-center gap-1"><X size={20} /><span className="text-[15px] font-medium">Discard</span></button>
          <span className="text-[#091E29] font-bold text-[16px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>New Email</span>
          <button onClick={() => { setEmailBody(""); go("email-inbox-sister-mary"); }} className="bg-[#006D2F] text-white px-4 py-1.5 rounded-full text-[14px] font-bold flex items-center gap-1">
            <Send size={13} />Send
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div className="border-b border-[#E5E7EB] pb-3">
            <p className="text-[12px] text-[#9CA3AF] mb-1">To</p>
            <p className="text-[#006D2F] font-semibold text-[16px]">SafetyCoach@gmail.com</p>
          </div>
          <div className="border-b border-[#E5E7EB] pb-3">
            <p className="text-[12px] text-[#9CA3AF] mb-1">Subject</p>
            <p className="text-[#091E29] text-[16px]">My Day 😊</p>
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-[#9CA3AF] mb-2">Message</p>
            <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)}
              placeholder="Tell me about your day..."
              className="w-full h-48 text-[16px] text-[#091E29] outline-none resize-none leading-relaxed"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
          </div>
          <div className="bg-[#E6F4EA] rounded-xl p-4">
            <p className="text-[#005222] font-semibold text-[14px]">💡 Coach Tip</p>
            <p className="text-[#3F493F] text-[17px] mt-1">Type anything in the message box, then tap Send to continue the lesson!</p>
          </div>
        </div>
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL INBOX SISTER MARY ────────────────────────────────────────────────
  if (screen === "email-inbox-sister-mary") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto bg-white">
        <LightHeader title="Inbox" />
        <CoachTip text="Great job sending your first email! Now, let's reply to Sister Mary. Can you find her email and tap on it?" />
        <div className="flex-1 overflow-y-auto">
          {EMAILS.map(email => (
            <EmailRow key={email.id} email={email} highlighted={email.id === "mary"}
              onClick={email.id === "mary" ? () => go("email-compose-reply") : undefined} />
          ))}
        </div>
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL COMPOSE REPLY ────────────────────────────────────────────────────
  if (screen === "email-compose-reply") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto bg-white">
        <div className="shrink-0 bg-white border-b border-[#E5E7EB] flex items-center justify-between h-[56px] px-4 shadow-sm z-10">
          <button onClick={() => go("email-inbox-sister-mary")} className="text-[#006D2F] flex items-center gap-1"><X size={20} /><span className="text-[15px] font-medium">Discard</span></button>
          <span className="text-[#091E29] font-bold text-[16px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Reply</span>
          <button onClick={() => { setReplyBody(""); go("email-summary"); }}
            className="bg-[#006D2F] text-white px-4 py-1.5 rounded-full text-[14px] font-bold flex items-center gap-1">
            <Send size={13} />Send
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div className="border-b border-[#E5E7EB] pb-3">
            <p className="text-[12px] text-[#9CA3AF] mb-1">To</p>
            <p className="text-[#006D2F] font-semibold text-[16px]">sister.mary@gmail.com</p>
          </div>
          <div className="border-b border-[#E5E7EB] pb-3">
            <p className="text-[12px] text-[#9CA3AF] mb-1">Subject</p>
            <p className="text-[#091E29] text-[16px]">Re: Recipe for Pineapple Tart</p>
          </div>
          {/* Attachment */}
          <div className="border border-[#E5E7EB] rounded-xl p-3 flex items-center gap-3 bg-[#F9FAFB]">
            <div className="w-10 h-10 bg-[#FEF3C7] rounded-lg flex items-center justify-center shrink-0">
              <span className="text-[18px]">📸</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#091E29] font-semibold text-[14px] truncate">Pineapple Tart Fail.jpg</p>
              <p className="text-[#9CA3AF] text-[12px]">1.2 MB · Image</p>
            </div>
            <X size={14} className="text-[#9CA3AF]" />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-[#9CA3AF] mb-2">Message</p>
            <textarea value={replyBody} onChange={e => setReplyBody(e.target.value)}
              placeholder="Write your reply to Sister Mary..."
              className="w-full h-36 text-[16px] text-[#091E29] outline-none resize-none leading-relaxed"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
          </div>
          <div className="bg-[#E6F4EA] rounded-xl p-4">
            <p className="text-[#005222] font-semibold text-[14px]">💡 Coach Tip</p>
            <p className="text-[#3F493F] text-[17px] mt-1">You can attach photos when you reply! Type a message and tap Send to complete the Email module.</p>
          </div>
        </div>
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ── EMAIL COMPLETE ─────────────────────────────────────────────────────────
  if (screen === "email-complete") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(245,250,255)" }}>
        <LightHeader />
        <Confetti />
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center text-center">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute w-56 h-56 bg-[#25D366] opacity-20 blur-3xl rounded-full" />
            <div className="w-40 h-40 bg-[#E6F4EA] rounded-full flex items-center justify-center relative z-10 shadow-lg">
              <div className="w-28 h-28 bg-[#006D2F]/10 rounded-full flex items-center justify-center">
                <Mail size={60} className="text-[#006D2F]" />
              </div>
            </div>
          </div>
          <h1 className="text-[#091E29] text-[26px] font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Mastered: Email Safety</h1>
          <p className="text-[#3F493F] text-[17px] leading-relaxed mt-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>You've successfully completed the Email module. You learned to read emails, spot scams, check attachments and compose messages!</p>
          <div className="w-full bg-white border border-[#D1D5DB] rounded-xl p-5 mt-6 shadow-sm text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#3F493F] font-semibold text-[14px]">Topics Progress</span>
              <span className="text-[#005222] font-bold text-[16px]">100%</span>
            </div>
            <div className="h-3 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div className="h-full bg-[#006D2F] rounded-full w-full transition-all duration-1000" />
            </div>
          </div>
          <div className="mt-8 w-full">
            <PrimaryBtn label="Explore Next Topic" onClick={() => go("lessons")} />
          </div>
        </div>
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FALSE INFORMATION / S.U.R.E. MODULE
  // ════════════════════════════════════════════════════════════════════════════

  // ── FALSE INFO INTRO ───────────────────────────────────────────────────────
  if (screen === "false-info-intro") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)" }}>
        <WhatsAppHeader onBack={() => go("lessons")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-center"><div className="bg-[#E1F3FB] rounded-lg px-4 py-1"><span className="text-[#54656F] text-[13px] font-semibold uppercase">TODAY</span></div></div>
          {[
            "Welcome to the False Information & Inappropriate Content module! 🚩",
            "Every day, fake news and harmful content spread through WhatsApp, Facebook, and email. Learning to pause and check before sharing is a superpower!",
          ].map((text, i) => (
            <div key={i} className="flex justify-start">
              <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[320px] shadow-sm">
                <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{text}</p>
                <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:32 AM</p>
              </div>
            </div>
          ))}
          {/* Topic cards */}
          <div className="space-y-3">
            {[{ emoji: "📰", title: "False Information", desc: "Fake news, misleading health claims, and viral hoaxes.", color: "#9D1C52", bg: "#FFF0F4" },
              { emoji: "⚠️", title: "Inappropriate Content", desc: "Scam messages, threatening links, and shocking content meant to panic you.", color: "#594181", bg: "#F5F0FF" }].map(item => (
              <div key={item.title} className="bg-white border-2 rounded-xl p-4 flex items-start gap-3" style={{ borderColor: item.color }}>
                <span className="text-[24px] shrink-0 mt-0.5">{item.emoji}</span>
                <div><p className="font-bold text-[16px]" style={{ color: item.color }}>{item.title}</p><p className="text-[#3F493F] text-[14px] mt-1">{item.desc}</p></div>
              </div>
            ))}
          </div>
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[320px] shadow-sm">
              <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>I will teach you the <span className="font-bold text-[#006D2F]">S.U.R.E.</span> method — a simple way to check if information is real before you share it!</p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:33 AM</p>
            </div>
          </div>
          <PrimaryBtn label="Learn the S.U.R.E. Method" onClick={() => go("sure-breakdown")} />
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── SURE BREAKDOWN ─────────────────────────────────────────────────────────
  if (screen === "sure-breakdown") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)" }}>
        <WhatsAppHeader onBack={() => go("false-info-intro")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[320px] shadow-sm">
              <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>The <span className="font-bold text-[#006D2F]">S.U.R.E.</span> method helps you check if the information is <strong>REAL</strong> or <strong>FAKE</strong>.</p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:35 AM</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#D1D5DB] shadow-sm p-5 space-y-4">
            <p className="text-[#005222] font-bold text-[18px] text-center" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>How to be S.U.R.E.</p>
            {SURE_CARDS.map(({ letter, title, desc, color }) => (
              <div key={letter} className="flex items-start gap-4 p-3 rounded-xl bg-[#F9FAFB]">
                <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-[18px] text-white" style={{ backgroundColor: color }}>{letter}</div>
                <div>
                  <p className="font-bold text-[#091E29] text-[18px]">{title}</p>
                  <p className="text-[#6F7A6E] text-[17px] mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <PrimaryBtn label="Try a Practice Scenario" onClick={() => go("sure-diabetes-practice")} />
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── SURE DIABETES PRACTICE ─────────────────────────────────────────────────
  if (screen === "sure-diabetes-practice") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)" }}>
        <WhatsAppHeader onBack={() => go("sure-breakdown")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[320px] shadow-sm">
              <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your friend just forwarded you this message. What would you do?</p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:38 AM</p>
            </div>
          </div>
          {/* Forwarded message card */}
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl max-w-[320px] shadow-sm overflow-hidden">
              {/* Forwarded banner */}
              <div className="bg-[#F0F2F5] px-3 py-2 flex items-center gap-1.5 border-b border-[#E5E7EB]">
                <ArrowRight size={11} className="text-[#6F7A6E]" />
                <ArrowRight size={11} className="text-[#6F7A6E] -ml-2" />
                <span className="text-[11px] text-[#6F7A6E] font-semibold uppercase tracking-wide ml-0.5">Forwarded many times</span>
              </div>
              {/* Sender row */}
              <div className="px-3 pt-2.5 pb-1 flex items-center gap-2 border-b border-[#F3F4F6]">
                <div className="w-7 h-7 rounded-full bg-[#D1FAE5] flex items-center justify-center shrink-0">
                  <span className="text-[13px]">🏥</span>
                </div>
                <div>
                  <p className="text-[#006D2F] font-bold text-[12px]">HealthWatch Alerts</p>
                  <p className="text-[#9CA3AF] text-[10px]">Health & Wellness Channel · 47,821 subscribers</p>
                </div>
              </div>
              {/* Image */}
              <div className="h-36 overflow-hidden bg-[#F3F4F6]">
                <img
                  src="https://images.unsplash.com/photo-1580913702955-6c3fcf6ddedc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwaGVyYnMlMjB0cmFkaXRpb25hbCUyMG1lZGljaW5lfGVufDF8fHx8MTc4NzkwNjg0NHww&ixlib=rb-4.1.0&q=80&w=400"
                  alt="Chinese herbs"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Body */}
              <div className="p-3.5">
                <p className="text-[#9D1C52] font-bold text-[13px] mb-1.5">🚨 BREAKING HEALTH NEWS 🚨</p>
                <p className="text-[#091E29] text-[14px] leading-relaxed font-medium">Retired doctor reveals <strong>secret Chinese herb</strong> that CURES diabetes in just 3 weeks!</p>
                <p className="text-[#3F493F] text-[13px] mt-1.5 leading-relaxed">Hospitals don't want you to know! Stop your medication and try this NOW. Share with everyone you love! 💊❌</p>
                <p className="text-[#006D2F] text-[12px] mt-2 underline">bit.ly/diabetescure2024</p>
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#F3F4F6]">
                  <span className="text-[11px] text-[#9CA3AF]">👍 2.4k</span>
                  <span className="text-[11px] text-[#9CA3AF] ml-2">↗️ Share</span>
                </div>
              </div>
              <p className="text-[#9CA3AF] text-[11px] text-right px-3 pb-2">10:37 AM</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#D1D5DB] shadow-sm p-5 space-y-3">
            <p className="text-[#091E29] text-[18px] font-medium text-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>What would you do?</p>
            <button onClick={() => setDiabetesChoice("wrong")}
              className="w-full bg-[#F3F4F6] border-2 border-[#D1D5DB] rounded-xl h-14 flex items-center justify-center shadow-sm hover:bg-[#E5E7EB] transition-all">
              <span className="text-[#091E29] text-[16px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Yes, I'll stop my medication and try it!</span>
            </button>
            <button onClick={() => go("sure-diabetes-feedback")}
              className="w-full bg-[#006D2F] rounded-xl h-14 flex items-center justify-center shadow-md hover:brightness-105 transition-all">
              <span className="text-white text-[16px] font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No, let's be S.U.R.E. first!</span>
            </button>
          </div>
          {diabetesChoice === "wrong" && (
            <div className="bg-[#FFF0F4] border-2 border-[#9D1C52] rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3"><AlertTriangle size={20} className="text-[#9D1C52] mt-0.5 shrink-0" />
                <div><p className="text-[#9D1C52] font-bold text-[15px]">Wait a minute!</p><p className="text-[#3F493F] text-[14px] mt-1">Always be careful with health news that sounds too good to be true. Scammers use "retired doctors" and "secret herbs" to trick people into stopping real medicine. This could be very dangerous!</p></div>
              </div>
              <button onClick={() => { setDiabetesChoice(null); go("sure-diabetes-feedback"); }}
                className="w-full border-2 border-[#9D1C52] text-[#9D1C52] rounded-xl h-12 font-semibold text-[15px]">
                OK, let me check with S.U.R.E. →
              </button>
            </div>
          )}
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── SURE DIABETES FEEDBACK ─────────────────────────────────────────────────
  if (screen === "sure-diabetes-feedback") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)" }}>
        <WhatsAppHeader onBack={() => go("sure-diabetes-practice")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-end"><div className="bg-[#D9FBB0] rounded-tl-2xl rounded-bl-2xl rounded-br-2xl p-4 max-w-[260px] shadow-sm"><p className="text-[#1C1B1F] text-[18px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No, let's be S.U.R.E. first!</p><p className="text-[#6F7A6E] text-[13px] text-right mt-2">10:39 AM</p></div></div>
          {[
            "Excellent choice! 🌟 You recognized the red flags of health misinformation.",
            "Always consult a medical professional before changing your treatment. Scams often use 'secret cures' and 'retired doctors' to build false trust and create urgency.",
          ].map((text, i) => (
            <div key={i} className="flex justify-start">
              <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[320px] shadow-sm">
                <p className="text-[#091E29] text-[18px] leading-[28px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{text}</p>
                <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:40 AM</p>
              </div>
            </div>
          ))}
          <div className="bg-white rounded-xl border border-[#D1D5DB] p-5 shadow-sm">
            <div className="flex items-center gap-4 mb-4"><div className="w-14 h-14 bg-[#E6F4EA] rounded-full flex items-center justify-center shrink-0"><ShieldCheck size={28} className="text-[#005222]" /></div><div><p className="text-[#005222] font-semibold text-[18px]">Great catch!</p><p className="text-[#3F493F] text-[14px] mt-1">Medical scams often use emotional language and unverified claims.</p></div></div>
          </div>
          <PrimaryBtn label="Next Scenario" onClick={() => go("sure-terrorism-family")} />
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── SURE TERRORISM FAMILY CHAT ─────────────────────────────────────────────
  if (screen === "sure-terrorism-family") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)", ...FADE }}>
        <WhatsAppHeader onBack={() => { setTerrorismChoice(null); go("sure-diabetes-practice"); }} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {/* Practice 2 intro */}
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm">
              <p className="text-[#006D2F] font-bold text-[13px] mb-2 uppercase tracking-wide">Practice 2: Security Alert</p>
              <p className="text-[#091E29] text-[18px] leading-[28px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Sarah is worried about her safety. Help her decide if this security alert is real or a scam.</p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:41 AM</p>
            </div>
          </div>
          {/* Sarah's message */}
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-4 max-w-[300px] shadow-sm">
              <p className="text-[#9D1C52] font-bold text-[12px] mb-1">Sarah</p>
              <p className="text-[#091E29] text-[17px] leading-relaxed">Look at this! Someone shared a video on Facebook about a security threat in downtown Singapore. Is this real?? I'm so scared! 😰</p>
              <p className="text-[#9CA3AF] text-[11px] text-right mt-1.5">10:42 AM</p>
            </div>
          </div>
          {/* Singapore Alerts post */}
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl max-w-[320px] shadow-sm overflow-hidden">
              <div className="px-3 pt-3 pb-2 flex items-center gap-2 border-b border-[#F3F4F6]">
                <div className="w-9 h-9 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
                  <span className="text-[16px]">🚨</span>
                </div>
                <div>
                  <p className="text-[#DC2626] font-bold text-[13px]">Singapore Alerts</p>
                  <p className="text-[#9CA3AF] text-[11px]">5 mins ago</p>
                </div>
              </div>
              {/* Alert video thumbnail */}
              <div className="h-32 overflow-hidden bg-[#1C1B1F] relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <span className="text-[#FF4444] text-[10px] font-bold uppercase tracking-widest mb-2">● BREAKKING NEWS</span>
                  <p className="text-white text-[13px] font-bold text-center leading-tight">DOWNTOWN SINGAPORE: AVOID AREA</p>
                  <p className="text-white/70 text-[11px] mt-1 text-center">AUTHORITIES CONFIRM MAJOR INCIDENT</p>
                </div>
                <div className="absolute bottom-2 right-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Play size={14} className="text-white ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-3.5">
                <p className="text-[#DC2626] font-bold text-[13px] mb-1">🚨 SECURITY ALERT: DOWNTOWN SINGAPORE - AVOID AREA.</p>
                <p className="text-[#091E29] text-[13px] leading-relaxed">AUTHORITIES CONFIRM MAJOR INCIDENT UNDERWAY.</p>
                <p className="text-[#6F7A6E] text-[12px] mt-1">#SingaporeSafety #EmergencyAlert #SGP</p>
              </div>
              <p className="text-[#9CA3AF] text-[11px] text-right px-3 pb-2">10:42 AM</p>
            </div>
          </div>
          {/* Answer buttons */}
          {!terrorismChoice && (
            <div className="space-y-3">
              <button
                onClick={() => setTerrorismChoice("alert")}
                className="w-full bg-[#F3F4F6] border-2 border-[#D1D5DB] rounded-xl py-4 px-5 flex items-center justify-between shadow-sm hover:bg-[#E5E7EB] transition-all"
              >
                <span className="text-[#091E29] text-[16px] font-medium text-left">Alert family and friends now</span>
                <ArrowRight size={18} className="text-[#6F7A6E] shrink-0 ml-2" />
              </button>
              <button
                onClick={() => setTerrorismChoice("sure")}
                className="w-full bg-[#006D2F] rounded-xl py-4 px-5 flex items-center justify-between shadow-md hover:brightness-105 transition-all"
              >
                <span className="text-white text-[16px] font-semibold text-left">No, let's be S.U.R.E.</span>
                <ArrowRight size={18} className="text-white shrink-0 ml-2" />
              </button>
            </div>
          )}
          {/* Alert path — shows family panic */}
          {terrorismChoice === "alert" && (
            <>
              <div className="flex justify-end">
                <div className="bg-[#D9FBB0] rounded-tl-2xl rounded-bl-2xl rounded-br-2xl p-4 max-w-[270px] shadow-sm">
                  <p className="text-[#1C1B1F] text-[17px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Alert family and friends now</p>
                  <p className="text-[#6F7A6E] text-[13px] text-right mt-2">10:43 AM</p>
                </div>
              </div>
              {/* Sister panics */}
              <div className="flex justify-start">
                <div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl p-4 max-w-[290px] shadow-sm">
                  <p className="text-[#594181] font-semibold text-[12px] mb-1">Sister</p>
                  <p className="text-[#091E29] text-[17px]">OMG!! Is this real? I'm so scared right now 😱 Calling my daughter to check if they are ok!</p>
                  <p className="text-[#9CA3AF] text-[11px] text-right mt-1">10:43 AM</p>
                </div>
              </div>
              {/* Brother */}
              <div className="flex justify-start">
                <div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl p-4 max-w-[290px] shadow-sm">
                  <p className="text-[#006D2F] font-semibold text-[12px] mb-1">Brother</p>
                  <p className="text-[#091E29] text-[17px]">I just saw this on Facebook too! Stay safe everyone, don't go downtown!</p>
                  <p className="text-[#9CA3AF] text-[11px] text-right mt-1">10:44 AM</p>
                </div>
              </div>
              {/* Coach warning */}
              <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm border border-[rgba(187,203,185,0.3)]">
                <p className="text-[#1C1B1F] font-bold text-[15px] mb-2">Oh no!</p>
                <p className="text-[#1C1B1F] text-[16px] leading-relaxed">Let's pause. <span className="text-[#D00000] font-bold">High-stakes news</span> like this is often used to cause <span className="text-[#D00000] font-bold">panic</span> and spread misinformation. Always use S.U.R.E. to check if it's real first.</p>
                <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:45 AM</p>
              </div>
              <button
                onClick={() => { setTerrorismChoice(null); go("sure-terrorism-breakdown"); }}
                className="w-full bg-[#006D2F] rounded-xl h-14 flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all"
              >
                <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Let's use S.U.R.E. to check</span>
                <ArrowRight size={18} className="text-white" />
              </button>
            </>
          )}
          {/* SURE path */}
          {terrorismChoice === "sure" && (
            <>
              <div className="flex justify-end">
                <div className="bg-[#D9FBB0] rounded-tl-2xl rounded-bl-2xl rounded-br-2xl p-4 max-w-[270px] shadow-sm">
                  <p className="text-[#1C1B1F] text-[17px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No, let's be S.U.R.E.</p>
                  <p className="text-[#6F7A6E] text-[13px] text-right mt-2">10:43 AM</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm">
                  <p className="text-[#091E29] text-[18px] leading-[28px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Excellent! 🌟 Before sharing anything scary, we should always verify it first using S.U.R.E. Let's look at the evidence together.</p>
                  <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:44 AM</p>
                </div>
              </div>
              <button
                onClick={() => { setTerrorismChoice(null); go("sure-terrorism-breakdown"); }}
                className="w-full bg-[#006D2F] rounded-xl h-14 flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all"
              >
                <span className="text-white font-bold text-[18px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>See the Verification Checklist</span>
                <ArrowRight size={18} className="text-white" />
              </button>
            </>
          )}
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── SURE TERRORISM BREAKDOWN ───────────────────────────────────────────────
  if (screen === "sure-terrorism-breakdown") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)" }}>
        <WhatsAppHeader onBack={() => go("sure-terrorism-family")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[320px] shadow-sm">
              <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Let's use the <span className="font-bold text-[#006D2F]">S.U.R.E.</span> method to check if this news is real or fake.</p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:45 AM</p>
            </div>
          </div>
          {/* SURE checklist for this scenario */}
          <div className="bg-white rounded-xl border border-[#D1D5DB] shadow-sm p-5 space-y-4">
            <p className="text-[#005222] font-bold text-[17px]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Verification Checklist</p>
            {[
              { letter: "S", color: "#006D2F", bg: "#E6F4EA", title: "Source", finding: "'Singapore Alerts' is not an official source. Always look for a verified blue tick ✓ or a .gov.sg website!" },
              { letter: "U", color: "#9D1C52", bg: "#FFF0F4", title: "Understand", finding: "Did you notice 'BREAKKING' has two K's? Real news agencies don't make typos like this — this is a red flag!" },
              { letter: "R", color: "#594181", bg: "#F5F0FF", title: "Research", finding: "Check CNA or The Straits Times. This news is not appearing on any official news site." },
              { letter: "E", color: "#3C4A3D", bg: "#F3F4F6", title: "Evaluate", finding: "The image and text are designed to make you feel scared and act fast. Don't let panic win!" },
            ].map(({ letter, color, bg, title, finding }) => (
              <div key={letter} className="flex gap-3 p-3 rounded-xl" style={{ backgroundColor: bg }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-[16px] text-white" style={{ backgroundColor: color }}>{letter}</div>
                <div>
                  <p className="font-bold text-[14px] uppercase tracking-wider" style={{ color }}>{title}</p>
                  <p className="text-[#3F493F] text-[14px] mt-1 leading-relaxed">{finding}</p>
                </div>
              </div>
            ))}
          </div>
          <PrimaryBtn label="I see the red flags now!" onClick={() => go("sure-inappropriate-feedback")} />
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── SURE INAPPROPRIATE FEEDBACK ───────────────────────────────────────────
  if (screen === "sure-inappropriate-feedback") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)" }}>
        <WhatsAppHeader onBack={() => go("sure-terrorism-breakdown")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[320px] shadow-sm">
              <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>One more scenario! You receive this message from an unknown number. What do you do?</p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:50 AM</p>
            </div>
          </div>
          {/* Scam SMS mockup */}
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl max-w-[290px] shadow-sm overflow-hidden">
              <div className="bg-[#F3F4F6] px-3 py-2 border-b border-[#E5E7EB]">
                <p className="text-[#9D1C52] font-bold text-[13px]">+1 (555) 012-3456</p>
                <p className="text-[#9CA3AF] text-[11px]">Unknown contact</p>
              </div>
              <div className="p-4">
                <p className="text-[#091E29] text-[15px] leading-relaxed">Hey! Is this you in the video? 😱</p>
                <p className="text-[#006D2F] text-[14px] mt-2 underline">bit.ly/watch-video123</p>
              </div>
              <p className="text-[#9CA3AF] text-[11px] text-right px-4 pb-2">10:49 AM</p>
            </div>
          </div>
          {[
            "Wait! That link could be dangerous. 🛑",
            "Scammers use scare tactics like \"is this you?\" or \"watch this video\" to make you act without thinking — and click on dangerous links.",
          ].map((text, i) => (
            <div key={i} className="flex justify-start">
              <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[320px] shadow-sm">
                <p className="text-[#091E29] text-[18px] leading-[28px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{text}</p>
                <p className="text-[#3F493F] text-[13px] italic text-right mt-2">10:51 AM</p>
              </div>
            </div>
          ))}
          {/* Red flags card */}
          <div className="bg-white rounded-xl border border-[#D1D5DB] shadow-sm overflow-hidden">
            <div className="bg-[#9D1C52] px-4 py-3 flex items-center gap-2">
              <AlertTriangle size={18} className="text-white" />
              <p className="text-white font-bold text-[15px]">Red Flags Spotted</p>
            </div>
            <div className="p-4 space-y-4">
              {[
                { icon: "👤", title: "Unknown Sender", desc: "+1 (555) number is not in your contacts. Never click links from strangers." },
                { icon: "😱", title: "Threatening Language", desc: "\"Is this you?\" is designed to scare you into acting fast without thinking." },
                { icon: "🔗", title: "Suspicious Short Link", desc: "bit.ly links hide where they really go. Never tap shortened links from unknowns." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="text-[22px] shrink-0">{icon}</span>
                  <div><p className="font-semibold text-[#091E29] text-[15px]">{title}</p><p className="text-[#6F7A6E] text-[13px] mt-1">{desc}</p></div>
                </div>
              ))}
            </div>
          </div>
          <PrimaryBtn label="Finish False Information Module" onClick={() => { setCompleted(prev => new Set([...prev, "false-info"])); go("false-info-complete"); }} />
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── FALSE INFO SUMMARY ────────────────────────────────────────────────────
  if (screen === "false-info-summary") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(236,239,245)", ...FADE }}>
        <WhatsAppHeader onBack={() => go("sure-inappropriate-feedback")} />
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 max-w-[330px] shadow-sm">
              <p className="text-[#006D2F] font-bold text-[14px] mb-2 uppercase tracking-wide">Your False Information Summary</p>
              <p className="text-[#091E29] text-[19px] leading-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>You've done brilliantly! Here is what you learned today.</p>
              <p className="text-[#3F493F] text-[13px] italic text-right mt-2">Now</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#D1D5DB] shadow-sm p-5 space-y-5">
            <p className="text-[#005222] font-bold text-[20px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>🌟 Remember These!</p>
            {[
              { icon: "✋", title: "Stop before you share", tip: "Not everything online is true, even if it looks real." },
              { icon: "🔎", title: "Use S.U.R.E. to check", tip: "Source, Understand, Research, Evaluate." },
              { icon: "⚠️", title: "If unsure, don't share", tip: "Always check with a trusted person or source first." },
            ].map(({ icon, title, tip }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="text-[24px] shrink-0">{icon}</span>
                <div>
                  <p className="text-[#091E29] font-bold text-[18px] leading-snug" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</p>
                  <p className="text-[#3F493F] text-[17px] mt-0.5 leading-relaxed" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>{tip}</p>
                </div>
              </div>
            ))}
          </div>
          <PrimaryBtn label="Complete Module" onClick={() => { setCompleted(prev => new Set([...prev, "false-info"])); go("false-info-complete"); }} />
        </div>
        <BottomNav active="coach" onTab={switchTab} />
      </div>
    );
  }

  // ── FALSE INFO COMPLETE ────────────────────────────────────────────────────
  if (screen === "false-info-complete") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(245,250,255)" }}>
        <LightHeader />
        <Confetti />
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center text-center">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute w-56 h-56 bg-[#25D366] opacity-20 blur-3xl rounded-full" />
            <div className="w-40 h-40 bg-[#E6F4EA] rounded-full flex items-center justify-center relative z-10 shadow-lg">
              <div className="w-28 h-28 bg-[#006D2F]/10 rounded-full flex items-center justify-center">
                <ShieldCheck size={64} className="text-[#006D2F]" />
              </div>
            </div>
          </div>
          <h1 className="text-[#091E29] text-[24px] font-bold leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Mastered: False Information & Inappropriate Content</h1>
          <p className="text-[#3F493F] text-[17px] leading-relaxed mt-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>You've successfully learned to Pause, Check and use S.U.R.E. to verify what you see!</p>
          <div className="w-full bg-white border border-[#D1D5DB] rounded-xl p-5 mt-6 shadow-sm text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#3F493F] font-semibold text-[14px]">Topics Progress</span>
              <span className="text-[#005222] font-bold text-[16px]">100%</span>
            </div>
            <div className="h-3 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div className="h-full bg-[#006D2F] rounded-full w-full transition-all duration-1000" />
            </div>
          </div>
          <div className="mt-8 w-full">
            <PrimaryBtn label="Topics Complete" onClick={() => { setCompleted(new Set(["2fa", "ai", "email", "false-info"])); go("topics-summary"); }} />
          </div>
        </div>
        <BottomNav active="lessons" onTab={switchTab} />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GRADUATION SCREENS
  // ════════════════════════════════════════════════════════════════════════════

  // ── TOPICS SUMMARY ─────────────────────────────────────────────────────────
  if (screen === "topics-summary") {
    const topicData = [
      { id: "2fa", emoji: "🔐", title: "2-Factor Authentication", desc: "Extra security for your accounts." },
      { id: "ai", emoji: "🤖", title: "Generative AI", desc: "Using creative AI tools safely." },
      { id: "email", emoji: "📧", title: "Email Safety", desc: "Spotting scams and safe messaging." },
      { id: "false-info", emoji: "🚩", title: "False Information", desc: "Using S.U.R.E. to verify what you see." },
    ];
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(245,250,255)" }}>
        <LightHeader />
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
          <div>
            <h1 className="text-[#005222] text-[30px] font-bold leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your Learning Journey</h1>
            <p className="text-[#3F493F] text-[17px] mt-2 leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>You've successfully completed all four essential topics!</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {topicData.map((topic) => (
              <div key={topic.id} className="bg-white p-4 rounded-xl border border-[#D1D5DB] shadow-sm flex flex-col justify-between min-h-[140px]">
                <div className="flex justify-between items-start">
                  <span className="text-[28px]">{topic.emoji}</span>
                  <span className="bg-[#006D2F] px-2 py-0.5 rounded text-[10px] text-white font-bold tracking-wider">100% DONE</span>
                </div>
                <div className="mt-3">
                  <h3 className="text-[#091E29] font-bold text-[14px] leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{topic.title}</h3>
                  <p className="text-[#6F7A6E] text-[12px] mt-1">{topic.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#E6F4EA] border border-[#006D2F] rounded-xl p-5 text-center">
            <p className="text-[28px] mb-2">🎓</p>
            <p className="text-[#005222] font-bold text-[18px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>All Topics Completed!</p>
            <p className="text-[#3F493F] text-[15px] mt-1">You are now a Digital Safety Graduate</p>
          </div>
          <PrimaryBtn label="View Graduation Badge" onClick={() => go("safety-graduate")} />
        </div>
        <BottomNav active="progress" onTab={switchTab} />
      </div>
    );
  }

  // ── SAFETY GRADUATE ────────────────────────────────────────────────────────
  if (screen === "safety-graduate") {
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(245,250,255)" }}>
        <LightHeader />
        <Confetti />
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute w-64 h-64 bg-[#25D366] opacity-25 blur-3xl rounded-full" />
            <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,211,102,0.3)] relative z-10 border-4 border-[#25D366]"
              style={{ animation: "floatBadge 3s ease-in-out infinite" }}>
              <div className="flex flex-col items-center gap-1">
                <Trophy size={56} className="text-[#F59E0B]" />
                <div className="w-12 h-12 bg-[#006D2F] rounded-full flex items-center justify-center -mt-3">
                  <ShieldCheck size={24} className="text-white" />
                </div>
              </div>
            </div>
          </div>
          <style>{`@keyframes floatBadge { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }`}</style>
          <div className="bg-[#006D2F] text-white px-4 py-1.5 rounded-full text-[13px] font-bold tracking-wider mb-4">
            🎓 SAFETY GRADUATE
          </div>
          <h1 className="text-[#091E29] text-[30px] font-bold leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Achievement Unlocked!</h1>
          <p className="text-[#3F493F] text-[17px] mt-3 leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>You have completed all four Digital Safety modules and earned your Safety Graduate badge!</p>
          {/* Completed topics */}
          <div className="w-full bg-white border border-[#D1D5DB] rounded-xl p-5 mt-6 shadow-sm text-left space-y-3">
            <p className="text-[#005222] font-bold text-[15px] mb-2]" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Completed Topics</p>
            {[
              { emoji: "🔐", label: "2-Factor Authentication" },
              { emoji: "🤖", label: "Generative AI" },
              { emoji: "📧", label: "Email Safety" },
              { emoji: "🚩", label: "False Information & Inappropriate Content" },
            ].map(({ emoji, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-[20px]">{emoji}</span>
                <span className="text-[#091E29] text-[15px] flex-1">{label}</span>
                <div className="w-6 h-6 bg-[#25D366] rounded-full flex items-center justify-center"><Check size={12} className="text-[#005523]" strokeWidth={3} /></div>
              </div>
            ))}
          </div>
          <div className="mt-8 w-full">
            <PrimaryBtn label="View Topics Summary" onClick={() => go("all-topics-summary")} />
          </div>
        </div>
        <BottomNav active="progress" onTab={switchTab} />
      </div>
    );
  }

  // ── ALL TOPICS SUMMARY ────────────────────────────────────────────────────
  if (screen === "all-topics-summary") {
    const returnToDashboard = () => {
      setMessages([{ id: 1, kind: "text", text: "Hello! I am your Safety Coach.\n\nI am here to help you stay safe and become confident online. Type **Ready** to learn about online safety.", from: "coach", time: "10:42 AM" }]);
      go("intro");
    };
    return (
      <div className="h-screen flex flex-col max-w-[420px] mx-auto" style={{ background: "rgb(245,250,255)", ...FADE }}>
        <LightHeader />
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
          <div className="text-center mb-2">
            <div className="text-[48px] mb-3">🏆</div>
            <h1 className="text-[#005222] font-bold text-[28px] leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your Topics Summary</h1>
            <p className="text-[#3F493F] text-[17px] mt-2" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>Here is what you have learned:</p>
          </div>
          {[
            { emoji: "🔐", title: "Passwords and 2-Step Verification", takeaway: "Keep your password strong and private." },
            { emoji: "🤖", title: "Generative AI", takeaway: "Pause and check before trusting AI-generated content." },
            { emoji: "📧", title: "Email Safety", takeaway: "Think before opening links or attachments." },
            { emoji: "🔎", title: "False Information and Inappropriate Content", takeaway: "Pause, check and use S.U.R.E. before sharing." },
          ].map(({ emoji, title, takeaway }) => (
            <div key={title} className="bg-white rounded-xl border border-[#E5EDE5] shadow-sm px-5 py-4 flex gap-4 items-start">
              <span className="text-[32px] shrink-0 mt-0.5">{emoji}</span>
              <div>
                <p className="text-[#005222] font-bold text-[17px] leading-snug" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</p>
                <p className="text-[#3F493F] text-[17px] mt-1 leading-relaxed" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>{takeaway}</p>
              </div>
            </div>
          ))}
          <div className="mt-4 pb-4">
            <PrimaryBtn label="Return to Dashboard" onClick={returnToDashboard} />
          </div>
        </div>
        <BottomNav active="progress" onTab={switchTab} />
      </div>
    );
  }

  return null;
}
