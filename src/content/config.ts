import { defineCollection, z } from 'astro:content';

// === SCHEMAS ===

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
}).or(z.string()); // Allow string or object

const doctorSchema = z.object({
  id: z.string(), // Relaxed from uuid
  name: z.string().min(1),
  specialty: z.string().min(1),
  clinic: z.string().optional(),
  address: addressSchema.optional(),
  phone: z.string().optional(),
  email: z.string().optional(), // Relaxed from email()
  notes: z.string().optional(),
  firstVisit: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const appointmentSchema = z.object({
  id: z.string(), // Relaxed from uuid
  date: z.coerce.date(),
  time: z.string().optional(),
  doctorId: z.string(), // Relaxed from uuid
  type: z.string(), // Relaxed from enum
  reason: z.string().min(1),
  findings: z.string().optional(),
  diagnosis: z.string().optional(),
  recommendations: z.array(z.string()).or(z.string()).default([]),
  prescriptions: z.array(z.string()).default([]),
  documentIds: z.array(z.string()).default([]),
  notes: z.string().optional(),
  followUpDate: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const medicationSchema = z.object({
  id: z.string(), // Relaxed from uuid
  name: z.string().min(1),
  genericName: z.string().optional(),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  route: z.string().default('oral'),
  prescribingDoctorId: z.string().optional(), // Made optional
  appointmentId: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
  purpose: z.string().optional(), // Made optional
  effects: z.string().optional(),
  sideEffects: z.array(z.string()).or(z.string()).default([]),
  notes: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const statusSchema = z.object({
  id: z.string(), // Relaxed from uuid
  date: z.coerce.date(),
  time: z.string().optional(),
  painLevel: z.number().min(0).max(10),
  symptoms: z.array(z.string()).default([]),
  affectedAreas: z.array(z.string()).default([]),
  generalCondition: z.string().optional(), // Relaxed from enum
  sleep: z.string().optional(),
  appetite: z.string().optional(),
  mood: z.string().optional(), // Relaxed from enum
  notes: z.string().optional(),
  medicationsTaken: z.array(z.string()).default([]),
  documentIds: z.array(z.string()).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const documentSchema = z.object({
  id: z.string(), // Relaxed from uuid
  type: z.string(), // Relaxed from enum
  title: z.string().min(1),
  description: z.string().optional(),
  filePath: z.string().min(1),
  fileType: z.string(), // Relaxed from enum
  fileSize: z.number().optional(),
  date: z.coerce.date(),
  doctorId: z.string().optional(),
  appointmentId: z.string().optional(),
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
