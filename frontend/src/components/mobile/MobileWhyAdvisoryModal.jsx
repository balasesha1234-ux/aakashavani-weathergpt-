import React from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, CloudRain, Wind, Droplets } from 'lucide-react';

export default function MobileWhyAdvisoryModal({
  isOpen,
  onClose,
  currentLang = 'te',
  district = 'Waradha',
  crop = 'Cotton'
}) {
  if (!isOpen) return null;

  const content = {
    te: {
      title: 'ఎందుకు ఈ సలహా ఇవ్వబడింది?',
      subtitle: `${crop} పంట రక్షణ శాస్త్రీయ విశ్లేషణ - ${district}`,
      reasons: [
        {
          icon: CloudRain,
          color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40',
          title: 'వర్షపాతం రాబోయే 24 గంటల్లో (25-40 mm)',
          desc: 'డోప్లర్ రాడార్ విశ్లేషణ ప్రకారం సమీపంలో మేఘ సాంద్రత పెరుగుతోంది. మందు పిచికారీ చేసిన 3 గంటల్లో వర్షం కురిస్తే మందు కడిగివేయబడుతుంది.'
        },
        {
          icon: Wind,
          color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
          title: 'గాలి వేగం: 15-22 km/h',
          desc: 'గాలి వేగం ఎక్కువగా ఉండటం వలన మందు ఆకులపై నిలబడకుండా పక్క పొలాలకు కొట్టుకుపోతుంది (Drift Loss).'
        },
        {
          icon: Droplets,
          color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40',
          title: 'గాలిలో తేమ (72%)',
          desc: 'అధిక తేమ కారణంగా శిలీంద్ర వ్యాప్తి తక్కువ సమయంలో జరిగే అవకాశం ఉన్నప్పటికీ వర్షం తగ్గాకే పిచికారీ సురక్షితం.'
        }
      ],
      nextActionTitle: 'రైతు ఏమి చేయాలి?',
      nextActionDesc: 'ఈ రోజు పిచికారీ నిలిపివేయండి. ఎల్లుండి ఉదయం (వర్షం తగ్గిన తర్వాత) ఎండ వచ్చే సమయంలో పిచికారీ చేయడం వల్ల 100% ప్రయోజనం లభిస్తుంది.',
      closeBtn: 'అర్థమైంది (సరే)'
    },
    hi: {
      title: 'यह सलाह क्यों दी गई है?',
      subtitle: `${crop} फसल सुरक्षा वैज्ञानिक विश्लेषण - ${district}`,
      reasons: [
        {
          icon: CloudRain,
          color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40',
          title: 'अगले 24 घंटों में वर्षा (25-40 mm)',
          desc: 'डॉप्लर रडार विश्लेषण के अनुसार बादल घने हो रहे हैं। दवा छिड़कने के 3 घंटे के भीतर बारिश होने से दवा बह जाएगी।'
        },
        {
          icon: Wind,
          color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
          title: 'हवा की गति: 15-22 km/h',
          desc: 'तेज हवा के कारण दवा पत्तियों पर रुकने के बजाय उड़ जाएगी (Drift Loss)।'
        },
        {
          icon: Droplets,
          color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40',
          title: 'आर्द्रता: 72%',
          desc: 'बारिश रुकने के बाद धूप खिलने पर छिड़काव करने से पूरा लाभ मिलेगा।'
        }
      ],
      nextActionTitle: 'किसान क्या करें?',
      nextActionDesc: 'आज छिड़काव रोक दें। परसों सुबह मौसम साफ होने पर छिड़काव करें।',
      closeBtn: 'समझ गया (ठीक है)'
    },
    en: {
      title: 'Why this advisory?',
      subtitle: `${crop} Crop Scientific Meteorological Rationale - ${district}`,
      reasons: [
        {
          icon: CloudRain,
          color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40',
          title: 'Rainfall expected in 24h (25-40 mm)',
          desc: 'IMD Doppler radar indicates convective cloud formation. Rain within 3-4 hours of pesticide spraying washes off the active chemicals.'
        },
        {
          icon: Wind,
          color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
          title: 'Wind Gusts: 15-22 km/h',
          desc: 'Higher wind speeds cause spray drift away from the target foliage onto unwanted areas.'
        },
        {
          icon: Droplets,
          color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40',
          title: 'High Humidity: 72%',
          desc: 'Optimum spraying efficiency is achieved post-rain clearing with dry canopy conditions.'
        }
      ],
      nextActionTitle: 'Recommended Action for Farmer',
      nextActionDesc: 'Postpone spraying today. Schedule application 48 hours later once the precipitation window passes.',
      closeBtn: 'Understood'
    }
  };

  const text = content[currentLang] || content.en;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              AGROMET INTELLIGENCE
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
              {text.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{text.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scientific Reasons List */}
        <div className="py-4 space-y-3">
          {text.reasons.map((r, i) => {
            const Icon = r.icon;
            return (
              <div key={i} className="flex gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <div className={`p-2.5 rounded-xl flex-shrink-0 h-fit ${r.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{r.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Farmer Next Action Card */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{text.nextActionTitle}</span>
          </div>
          <p className="text-xs text-emerald-900 dark:text-emerald-200/90 mt-1.5 leading-relaxed font-medium">
            {text.nextActionDesc}
          </p>
        </div>

        {/* Close CTA */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
        >
          {text.closeBtn}
        </button>
      </div>
    </div>
  );
}
