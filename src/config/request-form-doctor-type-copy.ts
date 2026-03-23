import type { RequestFormField } from "@/config/request-form";

export type DoctorFormType = "KOL" | "KBL" | "General";

type CopyOverride = { label?: string; description?: string; placeholder?: string };

/** Per-field copy when a doctor type is selected. Omitted types keep the base field config. */
const OVERRIDES: Record<string, Partial<Record<DoctorFormType, CopyOverride>>> = {
  primary_hospital_institution: {
    KOL: {
      label: "Current Hospital / Institution",
    },
    General: {
      label: "Current Hospital / Institution",
    },
    KBL: {
      label: "Hospital / Organisation you lead",
      description:
        "The main hospital, network, or organisation where you lead or hold primary responsibility",
    },
  },
  years_of_practice: {
    KBL: {
      label: "Years in Healthcare (clinical + admin)",
      description: "Approximate total across clinical and administrative roles is fine — e.g. 25 years",
    },
  },
  research_papers_published: {
    KOL: {
      label: "How many papers published? Key journals?",
      description: "A rough count is fine — note landmark or high-impact journals if relevant",
    },
    KBL: {
      label: "Any papers, white papers, or case studies?",
      description: "Internal or external publications, case studies, or thought leadership pieces",
    },
    General: {
      label: "Any papers or case reports?",
      description: "A rough number or short summary is enough",
    },
  },
  books_contributed: {
    KOL: {
      label: "Any textbooks or clinical reference chapters?",
      description: "List titles, chapters, or editions — or give a quick count",
    },
    KBL: {
      label: "Any manuals, SOPs, or handbooks you've written?",
      description: "Operational documents, protocols, or training materials you've authored",
    },
  },
  leadership_roles: {
    KOL: {
      label: "Roles in medical societies, guideline committees, or advisory boards?",
      description: "National or international societies, guideline panels, pharma or device advisory work, etc.",
    },
    KBL: {
      label: "Departments, hospitals, or organisations you've led?",
      description: "Executive, departmental, or system-level leadership — scope and years if helpful",
    },
    General: {
      label: "Roles in local medical associations or community health?",
      description: "Local societies, community programmes, or volunteer leadership that shaped care in your area",
    },
  },
  specialty_choice_reason: {
    KBL: {
      label: "What drew you from clinical work to running hospitals?",
      description: "2–3 sentences is enough — the shift from bedside to organisational leadership",
    },
  },
  career_shaping_moment: {
    KOL: {
      label: "Was there a moment that shaped your career?",
    },
    KBL: {
      label: "Was there a moment that shaped your career?",
    },
    General: {
      label: "Was there a moment that shaped your career?",
    },
  },
  international_recognition_positions: {
    KOL: {
      label: "International roles, fellowships, or speaking invitations?",
      description: "Global societies, visiting positions, keynote or faculty roles abroad, etc.",
    },
    KBL: {
      label: "International roles in healthcare management?",
      description: "Cross-border leadership, consulting, conferences, or management programmes",
    },
  },
  field_or_patient_impact: {
    KOL: {
      label: "What changed in practice, guidelines, or outcomes because of your work?",
      description:
        "Treatments, protocols, guidelines, registries, or measurable outcomes — think clinical and scientific impact",
    },
    KBL: {
      label: "What changed in how your hospital delivers care because of you?",
      description: "Access, quality, throughput, new services, or culture — organisational impact",
    },
    General: {
      label: "What difference has your work made for your patients or community?",
      description: "Day-to-day care, trust, outreach, or local programmes — impact at the community level",
    },
  },
  clinics_programmes_foundations: {
    KOL: {
      label: "Any foundations, registries, or training programmes you've built?",
      description: "Beyond routine practice — lasting structures others now use",
    },
    KBL: {
      label: "Any departments, service lines, or systems you built from scratch?",
      description: "New units, digital or operational systems, or care pathways you stood up",
    },
    General: {
      label: "Any initiatives or programmes you've started?",
      description: "Clinics, camps, education, or community programmes — anything you originated",
    },
  },
};

export function resolveRequestFieldCopy(
  field: RequestFormField,
  doctorType: string,
): { label: string; description?: string; placeholder?: string } {
  const t =
    doctorType === "KOL" || doctorType === "KBL" || doctorType === "General"
      ? (doctorType as DoctorFormType)
      : null;

  if (!t) {
    return {
      label: field.label,
      description: field.description,
      placeholder: field.placeholder,
    };
  }

  const override = OVERRIDES[field.key]?.[t];
  return {
    label: override?.label ?? field.label,
    description: override?.description ?? field.description,
    placeholder: override?.placeholder ?? field.placeholder,
  };
}
