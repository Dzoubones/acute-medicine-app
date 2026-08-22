export const offlineEmergencies = [
  {
    id: 'cardiac-arrest',
    title: 'Cardiac arrest',
    priority: 'Immediate resuscitation',
    summary: 'Start ALS immediately, minimise interruptions to compressions, identify rhythm, defibrillate shockable rhythms and treat reversible causes.',
    steps: [
      'Confirm unresponsiveness and abnormal or absent breathing; call for the resuscitation team and defibrillator.',
      'Start high-quality CPR at 30:2 unless an advanced airway is in place; minimise pauses.',
      'Attach defibrillator/monitor as soon as possible and identify shockable versus non-shockable rhythm.',
      'For VF/pVT: deliver shock according to current ALS guidance, immediately resume CPR, and follow the shockable algorithm.',
      'For PEA/asystole: continue CPR, give adrenaline according to current ALS guidance, and search for reversible causes.',
      'Treat reversible causes (4 Hs and 4 Ts) and escalate to senior/resuscitation support.'
    ],
    safety: 'Use the current Resuscitation Council UK / local ALS algorithm. This offline summary is a rapid orientation aid, not a substitute for the full resuscitation algorithm.'
  },
  {
    id: 'anaphylaxis',
    title: 'Anaphylaxis',
    priority: 'IM adrenaline first-line',
    summary: 'Recognise airway, breathing or circulation compromise with likely allergic trigger. Give IM adrenaline promptly and repeat if necessary while resuscitating.',
    steps: [
      'Call for help, remove the trigger if possible and position according to haemodynamic/respiratory status.',
      'Give IM adrenaline promptly using the current age-appropriate dose and concentration recommended by Resuscitation Council UK.',
      'Give high-flow oxygen when indicated and establish IV access.',
      'Give rapid IV crystalloid for hypotension/shock and reassess frequently.',
      'Repeat IM adrenaline at recommended intervals if ABC problems persist; involve critical care early for refractory reactions.',
      'Observe appropriately after recovery and document trigger, treatment and follow-up.'
    ],
    safety: 'Always check the current Resuscitation Council UK anaphylaxis algorithm for doses and observation recommendations.'
  },
  {
    id: 'sepsis',
    title: 'Suspected sepsis',
    priority: 'Recognise deterioration and treat time-critical infection',
    summary: 'Assess severity, obtain cultures when this does not delay treatment, give appropriate antimicrobials when indicated, resuscitate and achieve source control.',
    steps: [
      'Perform immediate ABCDE assessment, NEWS2 and senior escalation for physiological instability.',
      'Measure lactate and obtain relevant blood tests; take cultures before antibiotics when this will not create harmful delay.',
      'Give oxygen only when clinically indicated and target appropriate saturations.',
      'Give IV antimicrobials promptly when high-risk sepsis/septic shock is suspected, following local antimicrobial policy.',
      'Give IV crystalloid for hypoperfusion/hypotension with repeated reassessment and caution in patients at risk of fluid overload.',
      'Look actively for source control needs and escalate early to critical care if shock or organ dysfunction persists.'
    ],
    safety: 'Antibiotic choice and timing must follow current local/NICE antimicrobial and sepsis guidance.'
  },
  {
    id: 'hyperkalaemia',
    title: 'Severe hyperkalaemia',
    priority: 'Protect the myocardium and lower potassium',
    summary: 'Confirm urgently, obtain ECG, stabilise the myocardium when ECG changes are present, shift potassium intracellularly and remove potassium from the body.',
    steps: [
      'Repeat/confirm potassium urgently if appropriate while obtaining an ECG; do not delay treatment when severe hyperkalaemia with toxicity is strongly suspected.',
      'If ECG changes are present, give IV calcium using the current UK Kidney Association/local emergency protocol.',
      'Give insulin/glucose according to protocol and monitor capillary glucose closely for delayed hypoglycaemia.',
      'Consider nebulised salbutamol as adjunctive intracellular shift therapy when appropriate.',
      'Stop potassium-raising drugs where clinically appropriate and treat the underlying cause.',
      'Recheck potassium frequently and obtain urgent renal/critical care input for refractory cases or dialysis indications.'
    ],
    safety: 'Exact calcium and insulin/glucose regimens vary by protocol; use the current UK Kidney Association/local pathway.'
  },
  {
    id: 'acute-asthma',
    title: 'Life-threatening asthma',
    priority: 'Escalate early for impending respiratory failure',
    summary: 'Treat severe bronchospasm aggressively, reassess frequently and recognise exhaustion, hypoxia, silent chest or rising/normal PaCO₂ as danger signs.',
    steps: [
      'ABCDE assessment and immediate senior help for life-threatening features.',
      'Give oxygen to target appropriate saturation and repeated/nebulised bronchodilator therapy according to current guideline.',
      'Give systemic corticosteroid promptly.',
      'Give IV magnesium when indicated in severe/life-threatening attacks.',
      'Obtain blood gas when clinically indicated; a normal or rising PaCO₂ in a tiring patient is concerning.',
      'Involve critical care/anaesthesia early if deterioration, exhaustion, altered consciousness or refractory hypoxaemia develops.'
    ],
    safety: 'Use current BTS/NICE/local acute asthma guidance for drug doses and escalation criteria.'
  }
];
