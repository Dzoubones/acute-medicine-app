export const ATLAS_SYSTEMS = [
  'Respiratory','Cardiology','Neurology','Renal / Urology','Electrolytes / Acid–Base',
  'Diabetes / Endocrinology','Gastroenterology','Liver / Hepatology','Haematology','Infection',
  'Allergy / Immunology','Musculoskeletal / Rheumatology','Dermatology','Oncology',
  'Women’s Health / Gynaecology','Pregnancy / Obstetrics','Sexual Health','ENT','Ophthalmology',
  'Psychiatry / Mental Health','Neurodevelopment / Disability','Toxicology / Poisoning','Vascular','Procedures'
];

const card = (title, system, preview = false) => ({
  title,
  system,
  preview,
  slug: title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
});

export const ILLUSTRATION_CARDS = [
  card('Migraine','Neurology',true),
  card('Parkinson’s','Neurology'),
  card('Multiple Sclerosis','Neurology'),
  card('Hypercalcaemia','Electrolytes / Acid–Base',true),
  card('Adrenal Insufficiency','Diabetes / Endocrinology',true),
  card('C. difficile','Infection',true),
  card('Cellulitis','Dermatology'),
  card('Shingles','Infection'),
  card('Skin Infections','Dermatology'),
  card('Acute Cholecystitis','Gastroenterology',true),
  card('Upper GI Bleeding','Gastroenterology'),
  card('Lower GI Bleeding','Gastroenterology'),
  card('Glaucoma','Ophthalmology',true),
  card('Cataracts','Ophthalmology'),
  card('Hearing Loss','ENT'),
  card('Tinnitus','ENT'),
  card('Vertigo','ENT'),
  card('Erectile Dysfunction','Sexual Health'),
  card('Depression','Psychiatry / Mental Health'),
  card('Anxiety','Psychiatry / Mental Health'),
  card('Panic Attack','Psychiatry / Mental Health'),
  card('Bipolar Disorder','Psychiatry / Mental Health'),
  card('Psychosis','Psychiatry / Mental Health'),
  card('Schizophrenia','Psychiatry / Mental Health'),
  card('PTSD','Psychiatry / Mental Health'),
  card('OCD','Psychiatry / Mental Health'),
  card('Eating Disorders','Psychiatry / Mental Health'),
  card('Alcohol Withdrawal','Psychiatry / Mental Health'),
  card('Delirium','Psychiatry / Mental Health'),
  card('Dementia','Psychiatry / Mental Health'),
  card('Self-Harm / Crisis Support','Psychiatry / Mental Health'),
  card('Mental Health Support','Psychiatry / Mental Health'),
  card('Paracetamol Overdose','Toxicology / Poisoning',true),
  card('Opioid Overdose','Toxicology / Poisoning'),
  card('Carbon Monoxide Poisoning','Toxicology / Poisoning'),
  card('Alcohol Intoxication','Toxicology / Poisoning'),
  card('Benzodiazepine Toxicity','Toxicology / Poisoning'),
  card('Tricyclic Antidepressant Overdose','Toxicology / Poisoning'),
  card('Salicylate Poisoning','Toxicology / Poisoning'),
  card('Serotonin Syndrome','Toxicology / Poisoning'),
  card('Neuroleptic Malignant Syndrome','Toxicology / Poisoning')
];

export const previewCards = () => ILLUSTRATION_CARDS.filter(item => item.preview);
export const cardsForSystem = system => ILLUSTRATION_CARDS.filter(item => item.system === system);
