export type Role =
  | "bed-manager"
  | "ward"
  | "housekeeping"
  | "business-office"
  | "executive";

export const ROLES: { id: Role; label: string; question: string; href: string }[] = [
  {
    id: "bed-manager",
    label: "Bed Manager",
    question: "What's free in the next 4 hours?",
    href: "/bed-manager",
  },
  {
    id: "ward",
    label: "Ward Nurse",
    question: "Whose paperwork is moving?",
    href: "/ward",
  },
  {
    id: "housekeeping",
    label: "Housekeeping",
    question: "Which beds matter most right now?",
    href: "/housekeeping",
  },
  {
    id: "business-office",
    label: "Business Office",
    question: "Where are we stuck on GL?",
    href: "/business-office",
  },
  {
    id: "executive",
    label: "Executive",
    question: "Are we burning bed-hours?",
    href: "/executive",
  },
];

export type BedState =
  | "vacant-ready"
  | "reserved"
  | "occupied"
  | "discharge-ordered"
  | "pending-gl"
  | "released"
  | "cleaning";

export const BED_STATES: { id: BedState; label: string; short: string; tone: string }[] = [
  { id: "vacant-ready", label: "Vacant Ready", short: "Ready", tone: "success" },
  { id: "reserved", label: "Reserved", short: "Reserved", tone: "info" },
  { id: "occupied", label: "Occupied", short: "Occupied", tone: "primary" },
  { id: "discharge-ordered", label: "Discharge Ordered", short: "DC Ordered", tone: "warning" },
  { id: "pending-gl", label: "Pending GL", short: "GL", tone: "destructive" },
  { id: "released", label: "Bed Released", short: "Released", tone: "violet" },
  { id: "cleaning", label: "Cleaning", short: "Cleaning", tone: "fuchsia" },
];

export const NEXT_STATE: Record<BedState, BedState> = {
  "vacant-ready": "reserved",
  reserved: "occupied",
  occupied: "discharge-ordered",
  "discharge-ordered": "pending-gl",
  "pending-gl": "released",
  released: "cleaning",
  cleaning: "vacant-ready",
};

export type Ward = "Cardiac" | "ICU" | "HDU" | "Step-down";

export const WARDS: Ward[] = ["Cardiac", "ICU", "HDU", "Step-down"];

export type Bed = {
  id: string;
  ward: Ward;
  room: string;
  state: BedState;
  patientId?: string;
  stateSince: string;
};

export type Insurer =
  | "Allianz"
  | "AIA"
  | "Great Eastern"
  | "Prudential"
  | "AXA"
  | "Self-pay"
  | "Corporate (Petronas)"
  | "Corporate (Maybank)";

export type GLStatus =
  | "not-required"
  | "submitted"
  | "under-review"
  | "queries"
  | "approved"
  | "rejected";

export type Patient = {
  id: string;
  mrn: string;
  name: string;
  age: number;
  sex: "M" | "F";
  diagnosis: string;
  admittingDoctor: string;
  bedId?: string;
  insurer: Insurer;
  glStatus: GLStatus;
  glSubmittedAt?: string;
  glAmount?: number;
  predictedDischarge?: string;
  admittedAt: string;
  notes?: string;
  acuity: "Stable" | "Watch" | "Critical";
};

export type IncomingAdmission = {
  id: string;
  name: string;
  age: number;
  sex: "M" | "F";
  expectedAt: string;
  needs: Ward;
  source: "OPD" | "ED" | "Transfer" | "Scheduled";
  procedure?: string;
};

export type AuditEvent = {
  id: string;
  patientId?: string;
  bedId?: string;
  at: string;
  actor: string;
  action: string;
  from?: string;
  to?: string;
};
