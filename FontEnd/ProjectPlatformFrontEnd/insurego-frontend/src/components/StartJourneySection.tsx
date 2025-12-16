import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

const StartJourneySection = () => {
  return (
    <section className="w-full py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[500px]">
          
          {/* LEFT SIDE: The Action */}
          <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full">
                InsureGo Protection
              </span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              Secure your future in <span className="text-blue-600">clicks, not paperwork.</span>
            </h2>
            
            <p className="text-slate-600 mb-10 text-lg leading-relaxed">
              Join the new standard of insurance. Instant quotes, transparent policies, and claims paid in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all hover:scale-[1.02] shadow-lg shadow-blue-200">
                Get Your Quote <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
                View Plans
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: The Trust Visual */}
          <div className="lg:w-1/2 bg-blue-600 relative overflow-hidden flex items-center justify-center p-12">
            
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800"></div>
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl"></div>

            {/* Floating Card UI Element */}
            <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl max-w-sm w-full text-white shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <ShieldCheck className="w-12 h-12 text-blue-200 mb-4" />
              <h3 className="text-2xl font-bold mb-2">100% Secure</h3>
              <p className="text-blue-100 mb-6">
                Your data is encrypted and your coverage is backed by top-tier global partners.
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-blue-600"></div>
                  <div className="w-8 h-8 rounded-full bg-green-400 border-2 border-blue-600"></div>
                  <div className="w-8 h-8 rounded-full bg-red-400 border-2 border-blue-600"></div>
                </div>
                <span className="text-sm font-medium">Trusted by 50k+ users</span>
              </div>
            </div>

          </div>
          
        </div>
      </div>
    </section>
  );
};

export default StartJourneySection;