# Request form: questions, placeholders, and examples

Source: `src/config/request-form.ts` (`REQUEST_FORM_FIELDS`).

For each field: **Question** is the label shown in the UI. **Placeholder** is only set where the config defines `placeholder`. **Examples / guidance** comes from the `description` field (and related hints) when present.

---

## Active fields (shown in the form)

| Field key | Question | Placeholder | Examples / guidance |
| --- | --- | --- | --- |
| `medical_specialty` | Medical Specialty | — | E.g. Endocrinology, Cardiology, Oncology |
| `city` | City | — | — |
| `primary_hospital_institution` | Primary Hospital / Institution | — | Where you currently practice or are most associated with |
| `years_of_practice` | Years of Practice | — | Approximate is fine — e.g. 20 years |
| `degrees_completed` | Degrees Completed | — | List all degrees — MBBS, MD, MS, DM, DNB, etc. |
| `colleges_universities_attended` | Colleges / Universities Attended | — | One per degree if different institutions |
| `academic_distinctions` | Any academic distinctions? | — | Gold medals, university toppers, rank holders — list any that apply. Leave blank if none. |
| `research_papers_published` | Approximately how many research papers have you published? | — | A rough number is fine — e.g. 50+, around 200, over 800 |
| `books_contributed` | Have you authored or contributed to any books? | — | List titles if you'd like, or just the number |
| `leadership_roles` | Any leadership roles in your field? | — | Society president, committee member, guidelines author, department head — anything that shaped how your field operates |
| `specialty_choice_reason` | Why did you choose this specialty? | — | 2–3 sentences is enough. What drew you to this field over others? |
| `career_shaping_moment` | Was there a specific moment, patient, or experience that shaped the direction of your career? | — | Optional — but if there's a story, this is where it goes. Even a brief description helps. |
| `personal_journey` | Tell us about your journey | `Share the moments, challenges, or milestones that shaped your journey.` | This is a more personal question. Type your answer here, or upload an audio note below instead. |
| `awards_honours_received` | Awards or honours received | — | Name of award, year, and awarding body. E.g. Padma Shri, 2019, Government of India. List as many as relevant. |
| `international_recognition_positions` | Any international recognition or positions? | — | International society roles, global awards, visiting faculty abroad, etc. |
| `field_or_patient_impact` | What has changed in your field or for your patients because of your work? | — | This could be a treatment that's now standard, a guideline you helped write, a programme you started, or simply the number of patients you've treated. Think impact, not modesty. |
| `clinics_programmes_foundations` | Have you started any clinics, programmes, foundations, or initiatives? | — | Anything you built beyond your regular practice |
| `anything_else` | Anything else you'd like us to know? | — | A detail that doesn't fit above — a personal philosophy, a milestone, something you're proud of that hasn't come up yet |

### Required active fields

- Medical Specialty  
- City  
- Primary Hospital / Institution  
- Years of Practice  
- Degrees Completed  
- Colleges / Universities Attended  
- Why did you choose this specialty?  
- What has changed in your field or for your patients because of your work?  

---

## Inactive / internal fields (`active: false`)

These are defined in config but not shown as regular form prompts in the UI.

| Field key | Question | Placeholder | Examples / guidance |
| --- | --- | --- | --- |
| `young_photo_age` | Age in Younger Photo | — | — |
| `current_photo_age` | Current Age in Recent Photo | — | — |
| `young_photo_path` | Younger Photo | — | — |
| `current_photo_path` | Current Photo | — | — |
| `journey_audio_path` | Journey Audio | — | — |

---

## Autofill hints (not shown as placeholders)

Some fields use `resumeAutofill` / `resumeAutofillHint` for resume-based filling:

| Field key | `resumeAutofillHint` (if any) |
| --- | --- |
| `years_of_practice` | Use explicit years of practice or estimate from training and work history only if clearly supported. |

All other fields with autofill enabled do not define a separate hint in config.
