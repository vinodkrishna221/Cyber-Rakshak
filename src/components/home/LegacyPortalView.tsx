import React from 'react';
import {
  Home,
  Phone,
  Shield,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export const LegacyPortalView: React.FC = () => {
  return (
    <div className="w-full bg-white text-slate-800 font-sans select-none overflow-hidden text-xs sm:text-sm shadow-2xl">
      {/* 1. Top Government Official Header */}
      <div className="border-b border-slate-200 bg-white px-3 py-2 sm:px-6 sm:py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Ashoka Emblem & Government of India */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center text-[10px] text-slate-700 font-serif leading-tight">
              <svg className="size-8 text-amber-800" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9 5h6l-3-3zm-5 6h10v2H7V8zm2 3h6v8H9v-8zm-4 9h14v2H5v-2z" />
              </svg>
              <span className="font-bold text-[9px]">सत्यमेव जयते</span>
            </div>
            <div className="flex flex-col border-l border-slate-300 pl-2 text-[10px] sm:text-xs text-slate-800">
              <span className="font-semibold text-slate-700">भारत सरकार</span>
              <span className="font-bold text-slate-900 tracking-tight">GOVERNMENT OF INDIA</span>
              <span className="text-[9px] text-slate-600">गृह मंत्रालय / MINISTRY OF HOME AFFAIRS</span>
            </div>
          </div>

          {/* Center: I4C & Portal Title */}
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="hidden md:flex flex-col items-center justify-center bg-blue-50 border border-blue-200 px-2.5 py-1 rounded text-center">
              <span className="text-[11px] font-extrabold text-blue-900 leading-none">I4C</span>
              <span className="text-[8px] text-blue-700 font-medium">Cyber Crime Centre</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xs sm:text-base md:text-lg font-bold text-blue-900 leading-tight">
                राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल
              </h1>
              <h2 className="text-[11px] sm:text-sm md:text-base font-bold text-slate-900 tracking-tight">
                National Cyber Crime Reporting Portal
              </h2>
            </div>
          </div>

          {/* Right: Azadi Ka Amrit Mahotsav & Language */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1 bg-gradient-to-r from-orange-100 via-white to-green-100 border border-slate-200 px-2 py-1 rounded">
              <div className="text-right">
                <span className="block text-[10px] font-extrabold text-orange-600 leading-none">75</span>
                <span className="block text-[8px] font-bold text-green-700 leading-none">आज़ादी का महोत्सव</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-600 text-white px-2.5 py-1 rounded text-xs font-semibold shadow-2xs">
              <span>Language</span>
              <span className="text-[10px] bg-blue-700 px-1 rounded">EN/HI</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Legacy Primary Blue Navigation Menu */}
      <nav className="bg-[#1E88E5] text-white px-3 py-1.5 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto text-[11px] sm:text-xs font-semibold whitespace-nowrap gap-4">
          <div className="flex items-center gap-1 bg-blue-700 px-2 py-1 rounded">
            <Home className="size-3.5" />
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="hover:underline cursor-pointer">Register a Complaint +</span>
            <span className="hover:underline cursor-pointer">Track your Complaint</span>
            <span className="hover:underline cursor-pointer hidden md:inline">Report & Check Suspect +</span>
            <span className="hover:underline cursor-pointer hidden lg:inline">Cyber Volunteers +</span>
            <span className="hover:underline cursor-pointer hidden lg:inline">Learning Corner +</span>
            <span className="hover:underline cursor-pointer">Contact Us</span>
          </div>
        </div>
      </nav>

      {/* 3. Hero Dark Blue Banner Area */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#053F66] to-[#002B49] text-white px-4 py-6 sm:px-8 sm:py-8 border-b-4 border-amber-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Official Slogan & Notice */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded border border-white/20 text-[10px] font-semibold text-amber-300">
                <Shield className="size-3 text-amber-400" />
                <span>CYBER DOST • I4C INITIATIVE</span>
              </div>
              <span className="text-[10px] text-cyan-200">Helpline: 1930</span>
            </div>

            <div className="space-y-2">
              <p className="text-sm sm:text-lg md:text-xl font-bold text-white leading-snug">
                आधुनिक टेक्नोलॉजी के इस्तेमाल के कारण साइबर सुरक्षा वर्तमान जीवन का अभिन्न अंग बन गया है
              </p>
              <div className="h-0.5 w-32 bg-amber-400" />
              <p className="text-xs sm:text-sm text-cyan-100 font-medium">
                साइबर स्वच्छ प्रथाओं का पालन करें और साइबर क्राइम से बचें
              </p>
            </div>
          </div>

          {/* Right Column: 1930 Helpline Callout Banner */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end text-center lg:text-right">
            <div className="bg-white/10 backdrop-blur-sm border border-white/25 p-4 sm:p-5 rounded-2xl max-w-sm w-full space-y-2.5 shadow-xl">
              <span className="text-xs sm:text-sm text-amber-300 font-bold block uppercase tracking-wider">
                ऑनलाइन वित्तीय धोखाधड़ी की रिपोर्ट करने के लिए
              </span>
              <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-xl shadow-lg">
                <Phone className="size-5 animate-pulse" />
                <span className="text-2xl sm:text-3xl font-extrabold tracking-wider">1930</span>
                <span className="text-xs font-bold uppercase ml-1">पर कॉल करें</span>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-200 block font-mono">
                cybercrime.gov.in पर अपनी शिकायत दर्ज करें
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Legacy 3-Category Boxes & Notification Feed */}
      <div className="bg-slate-100 px-3 py-6 sm:px-6 sm:py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Women / Children Related Crime */}
          <div className="bg-[#1C2833] text-white rounded-lg overflow-hidden border border-slate-700 shadow-md flex flex-col justify-between">
            <div className="p-4 space-y-2">
              <div className="h-28 bg-gradient-to-b from-slate-700 to-slate-900 rounded flex flex-col items-center justify-center p-2 text-center border border-slate-600">
                <Shield className="size-8 text-pink-400 mb-1" />
                <span className="text-[10px] text-pink-200 font-semibold">Harassment • Stalking • Abuse</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-center uppercase tracking-tight text-pink-400 pt-1">
                Women/Children Related Crime
              </h3>
            </div>
            <div className="p-3 bg-slate-900/80 border-t border-slate-700 flex flex-col gap-2">
              <button
                type="button"
                className="w-full bg-[#00A8B5] hover:bg-[#00929e] text-white py-1.5 rounded text-xs font-bold transition-colors"
              >
                Register Anonymously
              </button>
              <button
                type="button"
                className="w-full bg-[#00838F] hover:bg-[#006972] text-white py-1.5 rounded text-xs font-bold transition-colors"
              >
                Register & Track
              </button>
            </div>
          </div>

          {/* Card 2: Financial Fraud */}
          <div className="bg-[#1C2833] text-white rounded-lg overflow-hidden border border-slate-700 shadow-md flex flex-col justify-between">
            <div className="p-4 space-y-2">
              <div className="h-28 bg-gradient-to-b from-slate-700 to-slate-900 rounded flex flex-col items-center justify-center p-2 text-center border border-slate-600">
                <AlertTriangle className="size-8 text-amber-400 mb-1" />
                <span className="text-[10px] text-amber-200 font-semibold">UPI • Net Banking • Card • OTP</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-center uppercase tracking-tight text-amber-400 pt-1">
                Financial Fraud
              </h3>
            </div>
            <div className="p-3 bg-slate-900/80 border-t border-slate-700">
              <button
                type="button"
                className="w-full bg-[#00A8B5] hover:bg-[#00929e] text-white py-2 rounded text-xs font-bold transition-colors"
              >
                Register a Complaint
              </button>
            </div>
          </div>

          {/* Card 3: Other Cyber Crime */}
          <div className="bg-[#1C2833] text-white rounded-lg overflow-hidden border border-slate-700 shadow-md flex flex-col justify-between">
            <div className="p-4 space-y-2">
              <div className="h-28 bg-gradient-to-b from-slate-700 to-slate-900 rounded flex flex-col items-center justify-center p-2 text-center border border-slate-600">
                <Lock className="size-8 text-cyan-400 mb-1" />
                <span className="text-[10px] text-cyan-200 font-semibold">Hacking • Phishing • Identity Theft</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-center uppercase tracking-tight text-cyan-400 pt-1">
                Other Cyber Crime
              </h3>
            </div>
            <div className="p-3 bg-slate-900/80 border-t border-slate-700">
              <button
                type="button"
                className="w-full bg-[#00A8B5] hover:bg-[#00929e] text-white py-2 rounded text-xs font-bold transition-colors"
              >
                Register a Complaint
              </button>
            </div>
          </div>

          {/* Card 4: What's New Feed */}
          <div className="bg-white rounded-lg overflow-hidden border border-slate-300 shadow-md flex flex-col">
            <div className="bg-[#1E88E5] text-white px-3 py-2 text-xs font-bold flex items-center justify-between">
              <span>What's new</span>
              <span className="text-[9px] bg-blue-700 px-1 rounded">Updates</span>
            </div>
            <div className="p-3 text-xs space-y-2 text-slate-700 flex-1 overflow-y-auto max-h-48">
              <div className="p-2 bg-blue-50/70 rounded border border-blue-100 text-[11px] leading-relaxed">
                <span className="font-bold text-blue-900 block">Advisory on Fake Summons:</span>
                Fraudulent summons sent claiming to be from Delhi Police or CBI. Always verify on official portal.
              </div>
              <div className="p-2 bg-amber-50/70 rounded border border-amber-100 text-[11px] leading-relaxed">
                <span className="font-bold text-amber-900 block">Golden Hour Reminder:</span>
                Call 1930 immediately within 2 hours of financial cyber theft.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
