import { defineCollection, z } from 'astro:content';

// === SCHEMAS ===

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
});

const doctorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  specialty: z.string().min(1),
  clinic: z.string().optional(),
  address: addressSchema.optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  notes: z.string().optional(),
  firstVisit: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const appointmentSchema = z.object({
  id: z.string().uuid(),
  date: z.coerce.date(),
  time: z.string().optional(), // "14:30"
  doctorId: z.string().uuid(),
  type: z.enum(['consultation', 'treatment', 'follow-up', 'emergency', 'examination']),
  reason: z.string().min(1),
  findings: z.string().optional(),
  diagnosis: z.string().optional(),
  recommendations: z.array(z.string()).default([]),
  prescriptions: z.array(z.string()).default([]), // Medication IDs
  documentIds: z.array(z.string()).default([]),
  notes: z.string().optional(),
  followUpDate: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const medicationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  genericName: z.string().optional(),
  dosage: z.string().min(1), // "500mg"
  frequency: z.string().min(1), // "3x täglich"
  route: z.enum(['oral', 'topical', 'injection', 'other']).default('oral'),
  prescribingDoctorId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
  purpose: z.string().min(1),
  effects: z.string().optional(),
  sideEffects: z.array(z.string()).default([]),
  notes: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const statusSchema = z.object({
  id: z.string().uuid(),
  date: z.coerce.date(),
  time: z.string().optional(),
  painLevel: z.number().min(0).max(10),
  symptoms: z.array(z.string()).default([]),
  affectedAreas: z.array(z.string()).default([]),
  generalCondition: z.enum(['very-poor', 'poor', 'moderate', 'okay', 'good']),
  sleep: z.enum(['none', 'poor', 'moderate', 'good', 'excellent']).optional(),
  appetite: z.enum(['none', 'poor', 'moderate', 'good', 'excellent']).optional(),
  mood: z.enum(['very-low', 'low', 'neutral', 'okay', 'good']).optional(),
  medicationsTaken: z.array(z.string()).default([]), // Medication IDs
  documentIds: z.array(z.string()).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const documentSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['report', 'prescription', 'xray', 'photo', 'invoice', 'referral', 'lab-results', 'other']),
  title: z.string().min(1),
  description: z.string().optional(),
  filePath: z.string().min(1), // Relative to /public/documents/
  fileType: z.enum(['pdf', 'jpg', 'png', 'jpeg', 'webp']),
  fileSize: z.number().optional(), // bytes
  date: z.coerce.date(), // Document date (not upload date)
  doctorId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// === COLLECTIONS ===

const doctors = defineCollection({
  type: 'data',
  schema: doctorSchema,
});

const appointments = defineCollection({
  type: 'data',
  schema: appointmentSchema,
});

const medications = defineCollection({
  type: 'data',
  schema: medicationSchema,
});

const status = defineCollection({
  type: 'content', // Markdown with frontmatter
  schema: statusSchema,
});

const documents = defineCollection({
  type: 'data',
  schema: documentSchema,
});

// === EXPORTS ===

export const collections = {
  doctors,
  appointments,
  medications,
  status,
  documents,
};

// Export schemas for use in API routes and forms
export {
  doctorSchema,
  appointmentSchema,
  medicationSchema,
  statusSchema,
  documentSchema,
  addressSchema,
};

// Export TypeScript types inferred from schemas
export type Doctor = z.infer<typeof doctorSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;
export type Medication = z.infer<typeof medicationSchema>;
export type Status = z.infer<typeof statusSchema>;
export type Document = z.infer<typeof documentSchema>;
export type Address = z.infer<typeof addressSchema>;
