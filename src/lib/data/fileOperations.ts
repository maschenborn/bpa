import { db } from '../firebase/server';
import { v4 as uuidv4 } from 'uuid';
import type { Doctor, Appointment, Medication, Status, Document } from '../../content/config';

// === UTILITY FUNCTIONS ===

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateId(): string {
  return uuidv4();
}


function now(): string {
  return new Date().toISOString();
}

function cleanUndefined(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(v => cleanUndefined(v));
  const res: any = {};
  for (const k in obj) {
    if (obj[k] !== undefined) {
      res[k] = cleanUndefined(obj[k]);
    }
  }
  return res;
}

// === DOCTORS ===

export async function getAllDoctors(): Promise<Doctor[]> {
  const snapshot = await db.ref('doctors').once('value');
  const val = snapshot.val();
  if (!val) return [];
  return Object.values(val) as Doctor[];
}

export async function getDoctorById(id: string): Promise<Doctor | null> {
  const snapshot = await db.ref(`doctors/${id}`).once('value');
  return snapshot.val() || null;
}

export async function createDoctor(data: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor> {
  const doctor: Doctor = {
    ...data,
    id: generateId(),
    createdAt: new Date(now()),
    updatedAt: new Date(now()),
  };

  await db.ref(`doctors/${doctor.id}`).set(cleanUndefined(doctor));
  return doctor;
}

export async function updateDoctor(id: string, data: Partial<Doctor>): Promise<Doctor | null> {
  const ref = db.ref(`doctors/${id}`);
  const snapshot = await ref.once('value');
  const current = snapshot.val();

  if (!current) return null;

  const updated: Doctor = {
    ...current,
    ...cleanUndefined(data),
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date(now()),
  };

  await ref.set(cleanUndefined(updated));
  return updated;
}

export async function deleteDoctor(id: string): Promise<boolean> {
  const ref = db.ref(`doctors/${id}`);
  const snapshot = await ref.once('value');
  if (!snapshot.exists()) return false;

  await ref.remove();
  return true;
}

// === APPOINTMENTS ===

export async function getAllAppointments(): Promise<Appointment[]> {
  const snapshot = await db.ref('appointments').once('value');
  const val = snapshot.val();
  if (!val) return [];
  const appointments = Object.values(val) as Appointment[];
  return appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const snapshot = await db.ref(`appointments/${id}`).once('value');
  return snapshot.val() || null;
}

export async function createAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
  const appointment: Appointment = {
    ...data,
    id: generateId(),
    createdAt: new Date(now()),
    updatedAt: new Date(now()),
  };

  await db.ref(`appointments/${appointment.id}`).set(cleanUndefined(appointment));
  return appointment;
}

export async function updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment | null> {
  const ref = db.ref(`appointments/${id}`);
  const snapshot = await ref.once('value');
  const current = snapshot.val();

  if (!current) return null;

  const updated: Appointment = {
    ...current,
    ...cleanUndefined(data),
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date(now()),
  };

  await ref.set(cleanUndefined(updated));
  return updated;
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const ref = db.ref(`appointments/${id}`);
  const snapshot = await ref.once('value');
  if (!snapshot.exists()) return false;

  await ref.remove();
  return true;
}

// === MEDICATIONS ===

export async function getAllMedications(): Promise<Medication[]> {
  const snapshot = await db.ref('medications').once('value');
  const val = snapshot.val();
  if (!val) return [];
  const medications = Object.values(val) as Medication[];
  return medications.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

export async function getMedicationById(id: string): Promise<Medication | null> {
  const snapshot = await db.ref(`medications/${id}`).once('value');
  return snapshot.val() || null;
}

export async function createMedication(data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medication> {
  const medication: Medication = {
    ...data,
    id: generateId(),
    createdAt: new Date(now()),
    updatedAt: new Date(now()),
  };

  await db.ref(`medications/${medication.id}`).set(cleanUndefined(medication));
  return medication;
}

export async function updateMedication(id: string, data: Partial<Medication>): Promise<Medication | null> {
  const ref = db.ref(`medications/${id}`);
  const snapshot = await ref.once('value');
  const current = snapshot.val();

  if (!current) return null;

  const updated: Medication = {
    ...current,
    ...cleanUndefined(data),
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date(now()),
  };

  await ref.set(cleanUndefined(updated));
  return updated;
}

export async function deleteMedication(id: string): Promise<boolean> {
  const ref = db.ref(`medications/${id}`);
  const snapshot = await ref.once('value');
  if (!snapshot.exists()) return false;

  await ref.remove();
  return true;
}

// === STATUS ===

interface StatusWithContent extends Status {
  content: string;
}

// Note: Status was previously stored as Markdown with Frontmatter.
// Now it's just JSON. 'content' assumes simple text/markdown string inside logic.
// The new Firebase model stores 'content' as a regular string field alongside other props.

export async function getAllStatuses(): Promise<StatusWithContent[]> {
  const snapshot = await db.ref('status').once('value');
  const val = snapshot.val();
  if (!val) return [];

  const statuses = Object.values(val) as StatusWithContent[];
  return statuses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getStatusById(id: string): Promise<StatusWithContent | null> {
  const snapshot = await db.ref(`status/${id}`).once('value');
  return snapshot.val() || null;
}

export async function createStatus(data: Omit<StatusWithContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<StatusWithContent> {
  const status: StatusWithContent = {
    ...data,
    id: generateId(),
    createdAt: new Date(now()),
    updatedAt: new Date(now()),
  };

  await db.ref(`status/${status.id}`).set(cleanUndefined(status));
  return status;
}

export async function updateStatus(id: string, data: Partial<StatusWithContent>): Promise<StatusWithContent | null> {
  const ref = db.ref(`status/${id}`);
  const snapshot = await ref.once('value');
  const current = snapshot.val();

  if (!current) return null;

  const updated: StatusWithContent = {
    ...current,
    ...cleanUndefined(data),
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date(now()),
  };

  await ref.set(cleanUndefined(updated));
  return updated;
}

export async function deleteStatus(id: string): Promise<boolean> {
  const ref = db.ref(`status/${id}`);
  const snapshot = await ref.once('value');
  if (!snapshot.exists()) return false;

  await ref.remove();
  return true;
}

// === DOCUMENTS ===

export async function getAllDocuments(): Promise<Document[]> {
  const snapshot = await db.ref('documents').once('value');
  const val = snapshot.val();
  if (!val) return [];

  const documents = Object.values(val) as Document[];
  return documents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getDocumentById(id: string): Promise<Document | null> {
  const snapshot = await db.ref(`documents/${id}`).once('value');
  return snapshot.val() || null;
}

export async function createDocument(data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
  const document: Document = {
    ...data,
    id: generateId(),
    createdAt: new Date(now()),
    updatedAt: new Date(now()),
  };

  await db.ref(`documents/${document.id}`).set(cleanUndefined(document));
  return document;
}

export async function updateDocument(id: string, data: Partial<Document>): Promise<Document | null> {
  const ref = db.ref(`documents/${id}`);
  const snapshot = await ref.once('value');
  const current = snapshot.val();

  if (!current) return null;

  const updated: Document = {
    ...current,
    ...cleanUndefined(data),
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date(now()),
  };

  await ref.set(cleanUndefined(updated));
  return updated;
}

export async function deleteDocument(id: string): Promise<boolean> {
  const ref = db.ref(`documents/${id}`);
  const snapshot = await ref.once('value');
  if (!snapshot.exists()) return false;

  await ref.remove();
  return true;
}

// === TIMELINE ===

export interface TimelineEntry {
  id: string;
  type: 'appointment' | 'medication' | 'medication-start' | 'medication-end' | 'status' | 'document';
  date: Date;
  time?: string;
  title: string;
  summary: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  relatedEntities: {
    doctorId?: string;
    appointmentId?: string;
    medicationId?: string;
    documentIds?: string[];
  };
  data: Record<string, unknown>; // Raw entity data for detail rendering
}

export async function getTimeline(options?: {
  startDate?: Date;
  endDate?: Date;
  types?: TimelineEntry['type'][];
  doctorId?: string;
  minPainLevel?: number;
  maxPainLevel?: number;
}): Promise<TimelineEntry[]> {
  const [appointments, medications, statuses, documents, doctors] = await Promise.all([
    getAllAppointments(),
    getAllMedications(),
    getAllStatuses(),
    getAllDocuments(),
    getAllDoctors(),
  ]);

  const doctorMap = new Map(doctors.map(d => [d.id, d]));
  const entries: TimelineEntry[] = [];

  // Appointments
  for (const apt of appointments) {
    const doctor = doctorMap.get(apt.doctorId);
    entries.push({
      id: apt.id,
      type: 'appointment',
      date: new Date(apt.date),
      time: apt.time,
      title: `Termin: ${doctor?.name || 'Unbekannt'}`,
      summary: apt.reason + (apt.findings ? ` - ${apt.findings}` : ''),
      relatedEntities: {
        doctorId: apt.doctorId,
        appointmentId: apt.id,
        documentIds: apt.documentIds,
      },
      data: { ...apt, doctorName: doctor?.name },
    });
  }

  // Medications
  for (const med of medications) {
    const doctor = doctorMap.get(med.prescribingDoctorId || '');
    entries.push({
      id: med.id,
      type: 'medication',
      date: new Date(med.startDate),
      title: `Medikament: ${med.name}`,
      summary: `${med.dosage}, ${med.frequency}${med.purpose ? ` - ${med.purpose}` : ''}`,
      relatedEntities: {
        medicationId: med.id,
        doctorId: med.prescribingDoctorId,
      },
      data: { ...med, doctorName: doctor?.name },
    });
  }

  // Status entries
  for (const status of statuses) {
    const severityMap: Record<number, TimelineEntry['severity']> = {
      0: 'low', 1: 'low', 2: 'low', 3: 'low',
      4: 'medium', 5: 'medium', 6: 'medium',
      7: 'high', 8: 'high',
      9: 'critical', 10: 'critical',
    };

    entries.push({
      id: status.id,
      type: 'status',
      date: new Date(status.date),
      time: status.time,
      title: `Befinden: Schmerz ${status.painLevel}/10`,
      summary: (status.symptoms || []).join(', ') || (status.content || '').slice(0, 100),
      severity: severityMap[status.painLevel],
      relatedEntities: {
        documentIds: status.documentIds,
      },
      data: { ...status, painLevel: status.painLevel },
    });
  }

  // Documents
  for (const doc of documents) {
    const doctor = doctorMap.get(doc.doctorId || '');
    entries.push({
      id: doc.id,
      type: 'document',
      date: new Date(doc.date),
      title: `Dokument: ${doc.title}`,
      summary: doc.description || doc.type,
      relatedEntities: {
        doctorId: doc.doctorId,
        appointmentId: doc.appointmentId,
        documentIds: [doc.id],
      },
      data: { ...doc, doctorName: doctor?.name },
    });
  }

  // Apply filters
  let filtered = entries;

  if (options?.startDate) {
    filtered = filtered.filter(e => new Date(e.date) >= options.startDate!);
  }
  if (options?.endDate) {
    filtered = filtered.filter(e => new Date(e.date) <= options.endDate!);
  }
  if (options?.types && options.types.length > 0) {
    filtered = filtered.filter(e => options.types!.includes(e.type));
  }
  if (options?.doctorId) {
    filtered = filtered.filter(e => e.relatedEntities.doctorId === options.doctorId);
  }
  // Pain level filters only apply to status entries
  if (options?.minPainLevel !== undefined) {
    filtered = filtered.filter(e => {
      if (e.type !== 'status') return true;
      const painLevel = e.data.painLevel as number;
      return painLevel >= options.minPainLevel!;
    });
  }
  if (options?.maxPainLevel !== undefined) {
    filtered = filtered.filter(e => {
      if (e.type !== 'status') return true;
      const painLevel = e.data.painLevel as number;
      return painLevel <= options.maxPainLevel!;
    });
  }

  // Sort by date + time descending (newest first)
  const getSortableTimestamp = (entry: TimelineEntry): number => {
    const baseTime = new Date(entry.date).getTime();
    if (entry.time) {
      // Parse time string (expected format: "HH:MM" or "HH:MM:SS")
      const [hours, minutes, seconds = 0] = entry.time.split(':').map(Number);
      return baseTime + (hours * 3600 + minutes * 60 + Number(seconds)) * 1000;
    }
    return baseTime;
  };

  return filtered.sort((a, b) => getSortableTimestamp(b) - getSortableTimestamp(a));
}

export { generateId, slugify };
