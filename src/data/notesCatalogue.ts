import { SubjectUnit } from "@/types/notes";

export const SUBJECT_UNITS: Record<string, SubjectUnit[]> = {
  // BT-101: Engineering Chemistry
  "sub-bt101": [
    { unitNumber: 1, title: "Unit 1: Water & Its Treatment", description: "Hardness of water, EDTA method, softening processes (Zeolite, Lime-Soda, Demineralization), boiler troubles." },
    { unitNumber: 2, title: "Unit 2: Lubricants & Lubrication", description: "Mechanism of lubrication, classification, physical and chemical properties of lubricants." },
    { unitNumber: 3, title: "Unit 3: Polymers & Polymerization", description: "Classification of polymers, mechanism of polymerization, thermoplastics and thermosetting resins, conducting polymers." },
    { unitNumber: 4, title: "Unit 4: Fuels & Combustion Analysis", description: "Calorific value (HCV/LCV), Dulong formula, proximate and ultimate analysis of coal, carbonization." },
    { unitNumber: 5, title: "Unit 5: Phase Rule & Spectroscopy", description: "Gibbs phase rule, one component water system, principles of UV-Visible and IR spectroscopy." },
  ],

  // BT-102: Mathematics-I
  "sub-bt102": [
    { unitNumber: 1, title: "Unit 1: Differential Calculus", description: "Rolle's theorem, Mean value theorems, Taylor's and Maclaurin's series, indeterminate forms, curvature." },
    { unitNumber: 2, title: "Unit 2: Linear Algebra & Matrices", description: "Rank of matrix, solution of simultaneous linear equations, Eigenvalues, Eigenvectors, Cayley-Hamilton theorem." },
    { unitNumber: 3, title: "Unit 3: Integral Calculus", description: "Beta and Gamma functions and their properties, definite integrals, volume and surface area of revolution." },
    { unitNumber: 4, title: "Unit 4: Vector Calculus", description: "Gradient, divergence and curl, directional derivatives, line, surface and volume integrals, Gauss and Green theorems." },
    { unitNumber: 5, title: "Unit 5: Differential Equations", description: "First order and higher order linear differential equations with constant coefficients, method of variation of parameters." },
  ],

  // BT-104: Basic Electrical & Electronics
  "sub-bt104": [
    { unitNumber: 1, title: "Unit 1: DC Circuit Analysis & Theorems", description: "Kirchhoff's Laws, Node and Mesh analysis, Superposition, Thevenin's, Norton's and Maximum Power Transfer theorems." },
    { unitNumber: 2, title: "Unit 2: Single Phase AC Circuits", description: "Sinusoidal waveforms, phasor representation, RL, RC, and RLC series/parallel circuits, resonance, power factor." },
    { unitNumber: 3, title: "Unit 3: Magnetic Circuits & Transformers", description: "B-H curve, magnetic circuit concepts, single phase transformer: principle, EMF equation, equivalent circuit, losses." },
    { unitNumber: 4, title: "Unit 4: Electrical Machines", description: "Operating principles of DC generator and DC motor, torque equation, three-phase induction motor overview." },
    { unitNumber: 5, title: "Unit 5: Basic Electronics & Diodes", description: "Semiconductor physics, P-N junction diode, half-wave and full-wave rectifiers, Zener diode, BJT introduction." },
  ],

  // BT-105: Engineering Graphics
  "sub-bt105": [
    { unitNumber: 1, title: "Unit 1: Scales & Engineering Curves", description: "Plain, diagonal, and vernier scales, conic sections (ellipse, parabola, hyperbola), cycloidal curves, involutes." },
    { unitNumber: 2, title: "Unit 2: Projections of Points, Lines & Planes", description: "Orthographic projection, projections of points in 4 quadrants, projection of straight lines and planes inclined to reference." },
    { unitNumber: 3, title: "Unit 3: Projections of Solids", description: "Projections of prisms, pyramids, cylinders, and cones with axis inclined to reference planes." },
    { unitNumber: 4, title: "Unit 4: Section of Solids & Development", description: "Section planes, sectional views, true shape of sections, development of lateral surfaces of simple solids." },
    { unitNumber: 5, title: "Unit 5: Isometric Projections & Multi-Views", description: "Isometric scale, isometric axes, isometric view of planes, simple solids, and conversion of pictorial views to orthographic." },
  ],

  // BT-106: English for Communication (Provisional)
  "sub-bt106": [
    { unitNumber: 1, title: "Unit 1: Communication Theory & Barriers", description: "Process of communication, verbal and non-verbal communication, psychological, physical and semantic barriers." },
    { unitNumber: 2, title: "Unit 2: Technical Vocabulary & Phonetics", description: "Prefixes, suffixes, technical terminology, phonetic symbols, stress and intonation patterns." },
    { unitNumber: 3, title: "Unit 3: Reading Comprehension & Summaries", description: "Skimming, scanning, intensive reading, comprehension of technical texts, precis and abstract writing." },
    { unitNumber: 4, title: "Unit 4: Professional Correspondence", description: "Formal business letters, technical inquiry letters, professional email etiquette, resume and CV formatting." },
    { unitNumber: 5, title: "Unit 5: Presentation & Oral Delivery", description: "Structuring a technical presentation, body language, effective visual aids, group discussion strategies." },
  ],
};

/**
 * Helper to get units for a subject with fallback.
 */
export function getSubjectUnits(subjectId: string): SubjectUnit[] {
  return SUBJECT_UNITS[subjectId] || [
    { unitNumber: 1, title: "Unit 1: Fundamentals & Basic Concepts" },
    { unitNumber: 2, title: "Unit 2: Core Analytical Principles" },
    { unitNumber: 3, title: "Unit 3: Intermediate Applications" },
    { unitNumber: 4, title: "Unit 4: Advanced Methodologies" },
    { unitNumber: 5, title: "Unit 5: Applied Technical Case Studies" },
  ];
}

/**
 * Helper to get the specific title of a unit.
 */
export function getUnitTitle(subjectId: string, unitNumber: number): string {
  const units = getSubjectUnits(subjectId);
  const found = units.find((u) => u.unitNumber === unitNumber);
  return found ? found.title : `Unit ${unitNumber}`;
}
