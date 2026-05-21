import type {
  Bed,
  BedState,
  IncomingAdmission,
  Insurer,
  Patient,
  Ward,
} from "./types";

// ---- Deterministic mock generation (no Math.random in render path) ----

const NOW = new Date("2026-05-21T09:00:00+08:00");

function hoursAgo(h: number): string {
  return new Date(NOW.getTime() - h * 60 * 60 * 1000).toISOString();
}
function hoursAhead(h: number): string {
  return new Date(NOW.getTime() + h * 60 * 60 * 1000).toISOString();
}

const MALAY_NAMES = [
  "Tan Wei Ming", "Siti Nurhaliza binti Abdullah", "Rajesh Kumar a/l Subramaniam",
  "Lim Mei Ling", "Ahmad Faiz bin Ismail", "Wong Kah Hui", "Nurul Aisyah binti Rahman",
  "Chong Boon Keat", "Fatimah binti Yusof", "Krishnan a/l Govindasamy",
  "Lee Sze Wei", "Mohd Hafiz bin Hassan", "Priya Devi a/p Murugan",
  "Ng Chee Wai", "Zainab binti Mohd Nor", "Goh Eng Hock", "Iskandar bin Zulkifli",
  "Vincent Cheong", "Norhayati binti Salleh", "Saravanan a/l Pillai",
  "Lau Hui Min", "Mohd Rizal bin Othman", "Catherine Yap", "Devi a/p Selvam",
  "Chen Jun Hao", "Aminah binti Ibrahim", "Vijay Kumar", "Ooi Chin Hock",
  "Roslan bin Mahmud", "Christina Soh", "Ramesh a/l Krishnan",
  "Phua Bee Kim", "Hisham bin Abu Bakar", "Anand a/l Pillay",
  "Yeoh Soon Lee", "Halimah binti Daud", "Murali a/l Suppiah",
  "Lim Boon Sin", "Sarimah binti Hashim", "Daniel Tan",
  "Zaharah binti Ali", "Suresh a/l Manickam", "Choo Mei Yee",
  "Mohd Azlan bin Hamid", "Sangeetha a/p Raman",
];

const DOCTORS = [
  "Dr. Iqbal Suji", "Dr. Michelle Wong", "Dr. Tan Cheng Lock",
  "Dr. Sharmila Devi", "Dr. Ahmad Razif", "Dr. Lim Kok Wei",
  "Dr. Nirmala Devi", "Dr. Goh Boon Tat",
];

const DIAGNOSES_CARDIAC = [
  "NSTEMI", "STEMI post-PCI", "Unstable Angina", "CABG Day 3",
  "Heart Failure (NYHA III)", "Atrial Fibrillation", "Aortic Stenosis post-TAVI",
  "Mitral Regurgitation", "Pericardial Effusion", "Hypertensive Crisis",
];
const DIAGNOSES_ICU = [
  "Post-CABG (ventilated)", "Cardiogenic Shock", "Septic Shock",
  "Post-TAVI monitoring", "ARDS (post-op)", "Acute MI with complications",
];
const DIAGNOSES_HDU = [
  "Post-PCI observation", "Arrhythmia monitoring", "Post-cath observation",
  "Pre-op CABG workup", "Heart Failure stabilising",
];
const DIAGNOSES_STEPDOWN = [
  "Stable post-PCI", "CHF stable", "Pre-discharge cardiac rehab",
  "Routine post-procedure", "Hypertension control",
];

const INSURERS: Insurer[] = [
  "Allianz", "AIA", "Great Eastern", "Prudential", "AXA",
  "Corporate (Petronas)", "Corporate (Maybank)", "Self-pay",
];

function diagFor(ward: Ward, i: number): string {
  const list =
    ward === "Cardiac" ? DIAGNOSES_CARDIAC :
    ward === "ICU" ? DIAGNOSES_ICU :
    ward === "HDU" ? DIAGNOSES_HDU :
    DIAGNOSES_STEPDOWN;
  return list[i % list.length];
}

// ---- 60 beds across 4 wards ----
// Cardiac: 28 beds (C-201..C-228)
// ICU:      8 beds (I-301..I-308)
// HDU:     12 beds (H-401..H-412)
// Step-down: 12 beds (S-501..S-512)

type BedSpec = { prefix: string; ward: Ward; count: number; floor: string };
const BED_SPECS: BedSpec[] = [
  { prefix: "C", ward: "Cardiac", count: 28, floor: "2" },
  { prefix: "I", ward: "ICU", count: 8, floor: "3" },
  { prefix: "H", ward: "HDU", count: 12, floor: "4" },
  { prefix: "S", ward: "Step-down", count: 12, floor: "5" },
];

// Hand-picked state distribution per ward so it looks like a real hospital morning:
// Cardiac (28): 5 ready, 2 reserved, 14 occupied, 2 DC ordered, 3 pending GL, 1 released, 1 cleaning
// ICU (8):    1 ready, 1 reserved, 5 occupied, 1 DC ordered, 0, 0, 0
// HDU (12):   2 ready, 1 reserved, 7 occupied, 1 DC ordered, 1 pending GL, 0, 0
// Step-down (12): 3 ready, 0, 5 occupied, 2 DC ordered, 1 pending GL, 1 cleaning, 0
const STATE_PLAN: Record<Ward, BedState[]> = {
  Cardiac: [
    "vacant-ready", "vacant-ready", "vacant-ready", "vacant-ready", "vacant-ready",
    "reserved", "reserved",
    "occupied", "occupied", "occupied", "occupied", "occupied", "occupied", "occupied",
    "occupied", "occupied", "occupied", "occupied", "occupied", "occupied", "occupied",
    "discharge-ordered", "discharge-ordered",
    "pending-gl", "pending-gl", "pending-gl",
    "released",
    "cleaning",
  ],
  ICU: [
    "vacant-ready",
    "reserved",
    "occupied", "occupied", "occupied", "occupied", "occupied",
    "discharge-ordered",
  ],
  HDU: [
    "vacant-ready", "vacant-ready",
    "reserved",
    "occupied", "occupied", "occupied", "occupied", "occupied", "occupied", "occupied",
    "discharge-ordered",
    "pending-gl",
  ],
  "Step-down": [
    "vacant-ready", "vacant-ready", "vacant-ready",
    "occupied", "occupied", "occupied", "occupied", "occupied",
    "discharge-ordered", "discharge-ordered",
    "pending-gl",
    "cleaning",
  ],
};

// Build beds
const beds: Bed[] = [];
for (const spec of BED_SPECS) {
  for (let i = 0; i < spec.count; i++) {
    const num = (parseInt(spec.floor) * 100 + i + 1).toString();
    const id = `${spec.prefix}-${num}`;
    const state = STATE_PLAN[spec.ward][i];
    const hoursInState =
      state === "vacant-ready" ? 1 + (i % 5) :
      state === "reserved" ? 0.5 :
      state === "occupied" ? 6 + (i % 48) :
      state === "discharge-ordered" ? 1 + (i % 3) :
      state === "pending-gl" ? 2 + (i % 6) :
      state === "released" ? 0.3 :
      state === "cleaning" ? 0.4 :
      0;
    beds.push({
      id,
      ward: spec.ward,
      room: id,
      state,
      stateSince: hoursAgo(hoursInState),
    });
  }
}

// ---- Patients: one per non-ready/cleaning bed ----
const patients: Patient[] = [];
let nameIdx = 0;
let mrnSeed = 18420;
for (const bed of beds) {
  const needsPatient =
    bed.state !== "vacant-ready" && bed.state !== "cleaning";
  if (!needsPatient) continue;
  const i = patients.length;
  const name = MALAY_NAMES[nameIdx++ % MALAY_NAMES.length];
  const age = 38 + ((i * 7) % 50);
  const sex: "M" | "F" = i % 2 === 0 ? "M" : "F";
  const insurer = INSURERS[i % INSURERS.length];
  const isSelfPay = insurer === "Self-pay";
  const glStatus =
    bed.state === "pending-gl" ? (i % 3 === 0 ? "queries" : "under-review") :
    bed.state === "released" ? "approved" :
    bed.state === "discharge-ordered" ? (isSelfPay ? "not-required" : "submitted") :
    bed.state === "occupied" ? (isSelfPay ? "not-required" : i % 4 === 0 ? "submitted" : "not-required") :
    "not-required";
  const acuity: Patient["acuity"] =
    bed.ward === "ICU" ? (i % 3 === 0 ? "Critical" : "Watch") :
    bed.ward === "HDU" ? (i % 4 === 0 ? "Watch" : "Stable") :
    "Stable";
  const admittedHoursAgo =
    bed.state === "occupied" ? 12 + (i % 96) :
    bed.state === "discharge-ordered" ? 48 + (i * 13) % 120 :
    bed.state === "pending-gl" ? 72 + (i * 11) % 96 :
    bed.state === "released" ? 96 :
    bed.state === "reserved" ? 0 :
    24;
  const predDischargeHours =
    bed.state === "occupied" ? 4 + ((i * 5) % 48) :
    bed.state === "discharge-ordered" ? 2 + (i % 4) :
    bed.state === "pending-gl" ? 1 + (i % 3) :
    bed.state === "released" ? -0.5 :
    bed.state === "reserved" ? 72 :
    24;
  patients.push({
    id: `P-${(1000 + i).toString()}`,
    mrn: `MRN-${(mrnSeed + i).toString()}`,
    name,
    age,
    sex,
    diagnosis: diagFor(bed.ward, i),
    admittingDoctor: DOCTORS[i % DOCTORS.length],
    bedId: bed.id,
    insurer,
    glStatus,
    glSubmittedAt: glStatus !== "not-required" ? hoursAgo(2 + (i % 12)) : undefined,
    glAmount: glStatus !== "not-required" ? 4800 + ((i * 1320) % 28500) : undefined,
    predictedDischarge: hoursAhead(predDischargeHours),
    admittedAt: hoursAgo(admittedHoursAgo),
    acuity,
  });
  bed.patientId = patients[patients.length - 1].id;
}

// Reserved beds also get an "incoming" patient assigned for arrival demos
for (const bed of beds.filter((b) => b.state === "reserved")) {
  const i = patients.length;
  const name = MALAY_NAMES[nameIdx++ % MALAY_NAMES.length];
  patients.push({
    id: `P-${(1000 + i).toString()}`,
    mrn: `MRN-${(mrnSeed + i).toString()}`,
    name,
    age: 50 + (i % 30),
    sex: i % 2 === 0 ? "F" : "M",
    diagnosis: diagFor(bed.ward, i),
    admittingDoctor: DOCTORS[i % DOCTORS.length],
    bedId: bed.id,
    insurer: INSURERS[i % INSURERS.length],
    glStatus: "not-required",
    admittedAt: hoursAhead(0.5),
    predictedDischarge: hoursAhead(72),
    acuity: bed.ward === "ICU" ? "Watch" : "Stable",
  });
  bed.patientId = patients[patients.length - 1].id;
}

export const INITIAL_BEDS: Bed[] = beds;
export const INITIAL_PATIENTS: Patient[] = patients;

// ---- Incoming queue (planned admissions, not yet bedded) ----
export const INITIAL_INCOMING: IncomingAdmission[] = [
  { id: "INC-001", name: "Mohd Iskandar bin Rashid", age: 62, sex: "M", expectedAt: hoursAhead(1.5), needs: "Cardiac", source: "Scheduled", procedure: "Elective PCI" },
  { id: "INC-002", name: "Catherine Lim Hui Yi", age: 58, sex: "F", expectedAt: hoursAhead(2.25), needs: "Cardiac", source: "OPD", procedure: "Post-cath observation" },
  { id: "INC-003", name: "Sundaram a/l Pillai", age: 71, sex: "M", expectedAt: hoursAhead(3), needs: "HDU", source: "Transfer", procedure: "From Pantai KL" },
  { id: "INC-004", name: "Nor Aishah binti Hamzah", age: 67, sex: "F", expectedAt: hoursAhead(3.75), needs: "Cardiac", source: "ED", procedure: "Chest pain workup" },
  { id: "INC-005", name: "Tan Boon Hwa", age: 55, sex: "M", expectedAt: hoursAhead(5), needs: "Step-down", source: "Scheduled", procedure: "Pre-op admission" },
  { id: "INC-006", name: "Letchumi a/p Govindan", age: 64, sex: "F", expectedAt: hoursAhead(6.5), needs: "ICU", source: "Scheduled", procedure: "Scheduled CABG" },
];
