"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  INITIAL_BEDS,
  INITIAL_INCOMING,
  INITIAL_PATIENTS,
} from "./mock-data";
import {
  BED_STATES,
  NEXT_STATE,
  ROLES,
  type AuditEvent,
  type Bed,
  type BedState,
  type GLStatus,
  type IncomingAdmission,
  type Patient,
  type Role,
} from "./types";

type State = {
  beds: Bed[];
  patients: Patient[];
  incoming: IncomingAdmission[];
  events: AuditEvent[];
};

type Action =
  | { type: "SET_BED_STATE"; bedId: string; state: BedState; actor: string }
  | { type: "ADVANCE_BED"; bedId: string; actor: string }
  | { type: "SET_GL_STATUS"; patientId: string; status: GLStatus; actor: string }
  | { type: "ADMIT_INCOMING"; incomingId: string; bedId: string; actor: string }
  | { type: "RESET" };

const initialState: State = {
  beds: INITIAL_BEDS,
  patients: INITIAL_PATIENTS,
  incoming: INITIAL_INCOMING,
  events: seedEvents(),
};

function seedEvents(): AuditEvent[] {
  return [
    {
      id: "EVT-S1",
      at: new Date("2026-05-21T07:42:00+08:00").toISOString(),
      actor: "Nurse Priya",
      action: "Marked bed clean",
      bedId: "C-205",
      from: "cleaning",
      to: "vacant-ready",
    },
    {
      id: "EVT-S2",
      at: new Date("2026-05-21T08:01:00+08:00").toISOString(),
      actor: "Bed Mgr Iqbal",
      action: "Reserved for incoming",
      bedId: "C-211",
      from: "vacant-ready",
      to: "reserved",
    },
    {
      id: "EVT-S3",
      at: new Date("2026-05-21T08:18:00+08:00").toISOString(),
      actor: "Dr. Iqbal Suji",
      action: "Discharge order signed",
      bedId: "C-220",
      from: "occupied",
      to: "discharge-ordered",
    },
    {
      id: "EVT-S4",
      at: new Date("2026-05-21T08:33:00+08:00").toISOString(),
      actor: "BO Michelle",
      action: "GL submitted to Allianz",
      bedId: "C-222",
      from: "discharge-ordered",
      to: "pending-gl",
    },
  ];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_BED_STATE":
    case "ADVANCE_BED": {
      const bed = state.beds.find((b) => b.id === action.bedId);
      if (!bed) return state;
      const next =
        action.type === "ADVANCE_BED" ? NEXT_STATE[bed.state] : action.state;
      const newBeds = state.beds.map((b) =>
        b.id === bed.id
          ? { ...b, state: next, stateSince: new Date().toISOString() }
          : b,
      );

      // Side effect: when a bed enters "released", the patient is discharged
      // (clear bedId on patient). When bed cycles to vacant-ready, clear patient assoc.
      let newPatients = state.patients;
      if (next === "vacant-ready") {
        newPatients = state.patients.map((p) =>
          p.bedId === bed.id ? { ...p, bedId: undefined } : p,
        );
      }

      const event: AuditEvent = {
        id: `EVT-${Date.now()}`,
        at: new Date().toISOString(),
        actor: action.actor,
        action: "Bed state changed",
        bedId: bed.id,
        from: bed.state,
        to: next,
      };
      return {
        ...state,
        beds: newBeds,
        patients: newPatients,
        events: [event, ...state.events].slice(0, 200),
      };
    }
    case "SET_GL_STATUS": {
      const patient = state.patients.find((p) => p.id === action.patientId);
      if (!patient) return state;
      const newPatients = state.patients.map((p) =>
        p.id === patient.id ? { ...p, glStatus: action.status } : p,
      );
      // If GL approved AND bed is pending-gl → advance bed to released
      let newBeds = state.beds;
      if (action.status === "approved" && patient.bedId) {
        const bed = state.beds.find((b) => b.id === patient.bedId);
        if (bed && bed.state === "pending-gl") {
          newBeds = state.beds.map((b) =>
            b.id === bed.id
              ? { ...b, state: "released", stateSince: new Date().toISOString() }
              : b,
          );
        }
      }
      const event: AuditEvent = {
        id: `EVT-${Date.now()}`,
        at: new Date().toISOString(),
        actor: action.actor,
        action: `GL ${action.status}`,
        patientId: patient.id,
        bedId: patient.bedId,
        from: patient.glStatus,
        to: action.status,
      };
      return {
        ...state,
        patients: newPatients,
        beds: newBeds,
        events: [event, ...state.events].slice(0, 200),
      };
    }
    case "ADMIT_INCOMING": {
      const inc = state.incoming.find((i) => i.id === action.incomingId);
      const bed = state.beds.find((b) => b.id === action.bedId);
      if (!inc || !bed) return state;
      const newPatient: Patient = {
        id: `P-${Date.now()}`,
        mrn: `MRN-${20000 + state.patients.length}`,
        name: inc.name,
        age: inc.age,
        sex: inc.sex,
        diagnosis: inc.procedure || "Scheduled admission",
        admittingDoctor: "Dr. Iqbal Suji",
        bedId: bed.id,
        insurer: "Allianz",
        glStatus: "not-required",
        predictedDischarge: new Date(
          Date.now() + 1000 * 60 * 60 * 72,
        ).toISOString(),
        admittedAt: new Date().toISOString(),
        acuity: "Stable",
      };
      const newBeds = state.beds.map((b) =>
        b.id === bed.id
          ? {
              ...b,
              state: "occupied" as BedState,
              stateSince: new Date().toISOString(),
              patientId: newPatient.id,
            }
          : b,
      );
      return {
        ...state,
        beds: newBeds,
        patients: [...state.patients, newPatient],
        incoming: state.incoming.filter((i) => i.id !== inc.id),
        events: [
          {
            id: `EVT-${Date.now()}`,
            at: new Date().toISOString(),
            actor: action.actor,
            action: "Patient admitted",
            bedId: bed.id,
            patientId: newPatient.id,
            from: "reserved",
            to: "occupied",
          },
          ...state.events,
        ].slice(0, 200),
      };
    }
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

type StoreCtx = {
  state: State;
  role: Role;
  setRole: (r: Role) => void;
  advanceBed: (bedId: string) => void;
  setBedState: (bedId: string, state: BedState) => void;
  setGlStatus: (patientId: string, status: GLStatus) => void;
  admitIncoming: (incomingId: string, bedId: string) => void;
  reset: () => void;
  // Selectors
  bedById: (id: string) => Bed | undefined;
  patientById: (id: string) => Patient | undefined;
  patientByBed: (bedId: string) => Patient | undefined;
};

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({
  children,
  initialRole = "bed-manager",
}: {
  children: ReactNode;
  initialRole?: Role;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [role, setRole] = useState<Role>(initialRole);

  const actorName = useMemo(() => {
    return (
      {
        "bed-manager": "Bed Mgr Iqbal",
        ward: "Nurse Priya",
        housekeeping: "HK Aminah",
        "business-office": "BO Michelle",
        executive: "CEO Dr Lim",
      } as Record<Role, string>
    )[role];
  }, [role]);

  const advanceBed = useCallback(
    (bedId: string) => {
      const bed = state.beds.find((b) => b.id === bedId);
      if (!bed) return;
      const next = NEXT_STATE[bed.state];
      dispatch({ type: "ADVANCE_BED", bedId, actor: actorName });
      const nextLabel = BED_STATES.find((s) => s.id === next)?.label ?? next;
      toast(`Bed ${bedId} → ${nextLabel}`, {
        description: `By ${actorName} · ${new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}`,
      });
    },
    [state.beds, actorName],
  );

  const setBedState = useCallback(
    (bedId: string, s: BedState) => {
      dispatch({ type: "SET_BED_STATE", bedId, state: s, actor: actorName });
      const label = BED_STATES.find((x) => x.id === s)?.label ?? s;
      toast(`Bed ${bedId} → ${label}`, {
        description: `By ${actorName}`,
      });
    },
    [actorName],
  );

  const setGlStatus = useCallback(
    (patientId: string, status: GLStatus) => {
      dispatch({ type: "SET_GL_STATUS", patientId, status, actor: actorName });
      toast(`GL ${status.replace("-", " ")}`, {
        description: `By ${actorName}`,
      });
    },
    [actorName],
  );

  const admitIncoming = useCallback(
    (incomingId: string, bedId: string) => {
      dispatch({ type: "ADMIT_INCOMING", incomingId, bedId, actor: actorName });
      toast(`Patient admitted to ${bedId}`, {
        description: `By ${actorName}`,
      });
    },
    [actorName],
  );

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    toast("Demo data reset");
  }, []);

  const value = useMemo<StoreCtx>(
    () => ({
      state,
      role,
      setRole,
      advanceBed,
      setBedState,
      setGlStatus,
      admitIncoming,
      reset,
      bedById: (id) => state.beds.find((b) => b.id === id),
      patientById: (id) => state.patients.find((p) => p.id === id),
      patientByBed: (bedId) => state.patients.find((p) => p.bedId === bedId),
    }),
    [state, role, advanceBed, setBedState, setGlStatus, admitIncoming, reset],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function useRoleMeta() {
  const { role } = useStore();
  const meta = ROLES.find((r) => r.id === role)!;
  return meta;
}
