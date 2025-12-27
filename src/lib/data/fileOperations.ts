import { promises as fs } from 'node:fs';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import type { Doctor, Appointment, Medication, Status, Document } from '../../content/config';

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content');

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

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function listJsonFiles(dir: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dir);
    return files.filter(f => f.endsWith('.json'));
  } catch {
    return [];
  }
}

async function listMdFiles(dir: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dir);
    return files.filter(f => f.endsWith('.md'));
  } catch {
    return [];
  }
}

// === DOCTORS ===

export async function getAllDoctors(): Promise<Doctor[]> {
  const dir = path.join(CONTENT_DIR, 'doctors');
  const files = await listJsonFiles(dir);
  const doctors = await Promise.all(
    files.map(f => readJsonFile<Doctor>(path.join(dir, f)))
  );
  return doctors.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getDoctorById(id: string): Promise<Doctor | null> {
  const doctors = await getAllDoctors();
  return doctors.find(d => d.id === id) || null;
}

export async function createDoctor(data: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor> {
  const dir = path.join(CONTENT_DIR, 'doctors');
  await ensureDir(dir);

  const doctor: Doctor = {
    ...data,
    id: generateId(),
    createdAt: new Date(now()),
    updatedAt: new Date(now()),
  };

  const filename = `${slugify(doctor.name)}-${doctor.id.slice(0, 8)}.json`;
  await writeJsonFile(path.join(dir, filename), doctor);
  return doctor;
}

export async function updateDoctor(id: string, data: Partial<Doctor>): Promise<Doctor | null> {
  const dir = path.join(CONTENT_DIR, 'doctors');
  const files = await listJsonFiles(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const doctor = await readJsonFile<Doctor>(filePath);
    if (doctor.id === id) {
      const updated: Doctor = {
        ...doctor,
        ...data,
        id: doctor.id,
        createdAt: doctor.createdAt,
        updatedAt: new Date(now()),
      };
      await writeJsonFile(filePath, updated);
      return updated;
    }
  }
  return null;
}

export async function deleteDoctor(id: string): Promise<boolean> {
  const dir = path.join(CONTENT_DIR, 'doctors');
  const files = await listJsonFiles(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const doctor = await readJsonFile<Doctor>(filePath);
    if (doctor.id === id) {
      await fs.unlink(filePath);
      return true;
    }
  }
  return false;
}

// === APPOINTMENTS ===

export async function getAllAppointments(): Promise<Appointment[]> {
  const dir = path.join(CONTENT_DIR, 'appointments');
  const files = await listJsonFiles(dir);
  const appointments = await Promise.all(
    files.map(f => readJsonFile<Appointment>(path.join(dir, f)))
  );
  return appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const appointments = await getAllAppointments();
  return appointments.find(a => a.id === id) || null;
}

export async function createAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
  const dir = path.join(CONTENT_DIR, 'appointments');
  await ensureDir(dir);

  const appointment: Appointment = {
    ...data,
    id: generateId(),
    createdAt: new Date(now()),
    updatedAt: new Date(now()),
  };

  const dateStr = new Date(data.date).toISOString().split('T')[0];
  const filename = `${dateStr}-${appointment.id.slice(0, 8)}.json`;
  await writeJsonFile(path.join(dir, filename), appointment);
  return appointment;
}

export async function updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment | null> {
  const dir = path.join(CONTENT_DIR, 'appointments');
  const files = await listJsonFiles(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const appointment = await readJsonFile<Appointment>(filePath);
    if (appointment.id === id) {
      const updated: Appointment = {
        ...appointment,
        ...data,
        id: appointment.id,
        createdAt: appointment.createdAt,
        updatedAt: new Date(now()),
      };
      await writeJsonFile(filePath, updated);
      return updated;
    }
  }
  return null;
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const dir = path.join(CONTENT_DIR, 'appointments');
  const files = await listJsonFiles(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const appointment = await readJsonFile<Appointment>(filePath);
    if (appointment.id === id) {
      await fs.unlink(filePath);
      return true;
    }
  }
  return false;
}

// === MEDICATIONS ===

export async function getAllMedications(): Promise<Medication[]> {
  const dir = path.join(CONTENT_DIR, 'medications');
  const files = await listJsonFiles(dir);
  const medications = await Promise.all(
    files.map(f => readJsonFile<Medication>(path.join(dir, f)))
  );
  return medications.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

export async function getMedicationById(id: string): Promise<Medication | null> {
  const medications = await getAllMedications();
  return medications.find(m => m.id === id) || null;
}

export async function createMedication(data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medication> {
  const dir = path.join(CONTENT_DIR, 'medications');
  await ensureDir(dir);

  const medication: Medication = {
    ...data,
    id: generateId(),
    createdAt: new Date(now()),
    updatedAt: new Date(now()),
  };

  const filename = `${slugify(medication.name)}-${medication.id.slice(0, 8)}.json`;
  await writeJsonFile(path.join(dir, filename), medication);
  return medication;
}

export async function updateMedication(id: string, data: Partial<Medication>): Promise<Medication | null> {
  const dir = path.join(CONTENT_DIR, 'medications');
  const files = await listJsonFiles(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const medication = await readJsonFile<Medication>(filePath);
    if (medication.id === id) {
      const updated: Medication = {
        ...medication,
        ...data,
        id: medication.id,
        createdAt: medication.createdAt,
        updatedAt: new Date(now()),
      };
      await writeJsonFile(filePath, updated);
      return updated;
    }
  }
  return null;
}

export async function deleteMedication(id: string): Promise<boolean> {
  const dir = path.join(CONTENT_DIR, 'medications');
  const files = await listJsonFiles(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const medication = await readJsonFile<Medication>(filePath);
    if (medication.id === id) {
      await fs.unlink(filePath);
      return true;
    }
  }
  return false;
}

// === STATUS ===

interface StatusWithContent extends Status {
  content: string;
}

function parseMarkdownStatus(content: string, filename: string): StatusWithContent {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) {
    throw new Error(`Invalid markdown format in ${filename}`);
  }

  const [, frontmatter, body] = frontmatterMatch;
  const data: Record<string, unknown> = {};

  // Simple YAML parsing
  let currentKey = '';
  let inArray = false;
  let arrayValues: string[] = [];

  for (const line of frontmatter.split('\n')) {
    if (line.startsWith('  - ')) {
      if (inArray) {
        arrayValues.push(line.replace('  - ', '').replace(/"/g, '').trim());
      }
    } else if (line.includes(':')) {
      if (inArray && currentKey) {
        data[currentKey] = arrayValues;
        arrayValues = [];
        inArray = false;
      }
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      currentKey = key.trim();
      if (value === '') {
        inArray = true;
        arrayValues = [];
      } else if (value === '[]') {
        // Handle empty inline array
        data[currentKey] = [];
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Handle inline array like ["a", "b", "c"]
        try {
          data[currentKey] = JSON.parse(value);
        } catch {
          data[currentKey] = value.replace(/"/g, '');
        }
      } else {
        data[currentKey] = value.replace(/"/g, '');
      }
    }
  }
  if (inArray && currentKey) {
    data[currentKey] = arrayValues;
  }

  return {
    id: data.id as string,
    date: new Date(data.date as string),
    time: data.time as string | undefined,
    painLevel: parseInt(data.painLevel as string, 10),
    symptoms: (data.symptoms as string[]) || [],
    affectedAreas: (data.affectedAreas as string[]) || [],
    generalCondition: data.generalCondition as Status['generalCondition'],
    sleep: data.sleep as Status['sleep'],
    appetite: data.appetite as Status['appetite'],
    mood: data.mood as Status['mood'],
    medicationsTaken: (data.medicationsTaken as string[]) || [],
    documentIds: (data.documentIds as string[]) || [],
    createdAt: new Date(data.createdAt as string),
    updatedAt: new Date(data.updatedAt as string),
    content: body.trim(),
  };
}

function statusToMarkdown(status: StatusWithContent): string {
  const formatArray = (arr: string[]): string => {
    if (arr.length === 0) return '[]';
    return '\n' + arr.map(item => `  - "${item}"`).join('\n');
  };

  return `---
id: "${status.id}"
date: ${new Date(status.date).toISOString().split('T')[0]}
time: "${status.time || ''}"
painLevel: ${status.painLevel}
symptoms: ${formatArray(status.symptoms)}
affectedAreas: ${formatArray(status.affectedAreas)}
generalCondition: "${status.generalCondition}"
sleep: "${status.sleep || ''}"
appetite: "${status.appetite || ''}"
mood: "${status.mood || ''}"
medicationsTaken: ${formatArray(status.medicationsTaken)}
documentIds: ${formatArray(status.documentIds)}
createdAt: ${new Date(status.createdAt).toISOString()}
updatedAt: ${new Date(status.updatedAt).toISOString()}
---

${status.content}
`;
}

export async function getAllStatuses(): Promise<StatusWithContent[]> {
  const dir = path.join(CONTENT_DIR, 'status');
  const files = await listMdFiles(dir);
  const statuses: StatusWithContent[] = [];

  for (const file of files) {
    try {
      const content = await fs.readFile(path.join(dir, file), 'utf-8');
      statuses.push(parseMarkdownStatus(content, file));
    } catch (e) {
      console.error(`Error parsing ${file}:`, e);
    }
  }

  return statuses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getStatusById(id: string): Promise<StatusWithContent | null> {
  const statuses = await getAllStatuses();
  return statuses.find(s => s.id === id) || null;
}

export async function createStatus(data: Omit<StatusWithContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<StatusWithContent> {
  const dir = path.join(CONTENT_DIR, 'status');
  await ensureDir(dir);

  const status: StatusWithContent = {
    ...data,
    id: generateId(),
    createdAt: new Date(now()),
    updatedAt: new Date(now()),
  };

  const dateStr = new Date(data.date).toISOString().split('T')[0];
  const timeStr = data.time ? `-${data.time.replace(':', '')}` : '';
  const filename = `${dateStr}${timeStr}-${status.id.slice(0, 8)}.md`;

  await fs.writeFile(path.join(dir, filename), statusToMarkdown(status), 'utf-8');
  return status;
}

export async function updateStatus(id: string, data: Partial<StatusWithContent>): Promise<StatusWithContent | null> {
  const dir = path.join(CONTENT_DIR, 'status');
  const files = await listMdFiles(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const status = parseMarkdownStatus(content, file);
      if (status.id === id) {
        const updated: StatusWithContent = {
          ...status,
          ...data,
          id: status.id,
          createdAt: status.createdAt,
          updatedAt: new Date(now()),
        };
        await fs.writeFile(filePath, statusToMarkdown(updated), 'utf-8');
        return updated;
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function deleteStatus(id: string): Promise<boolean> {
  const dir = path.join(CONTENT_DIR, 'status');
  const files = await listMdFiles(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const status = parseMarkdownStatus(content, file);
      if (status.id === id) {
        await fs.unlink(filePath);
        return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}

// === DOCUMENTS ===

export async function getAllDocuments(): Promise<Document[]> {
  const dir = path.join(CONTENT_DIR, 'documents');
  const files = await listJsonFiles(dir);
  const documents = await Promise.all(
    files.map(f => readJsonFile<Document>(path.join(dir, f)))
  );
  return documents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getDocumentById(id: string): Promise<Document | null> {
  const documents = await getAllDocuments();
  return documents.find(d => d.id === id) || null;
}

export async function createDocument(data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
  const dir = path.join(CONTENT_DIR, 'documents');
  await ensureDir(dir);

  const document: Document = {
    ...data,
    id: generateId(),
    createdAt: new Date(now()),
    updatedAt: new Date(now()),
  };

  const filename = `${slugify(document.title)}-${document.id.slice(0, 8)}.json`;
  await writeJsonFile(path.join(dir, filename), document);
  return document;
}

export async function updateDocument(id: string, data: Partial<Document>): Promise<Document | null> {
  const dir = path.join(CONTENT_DIR, 'documents');
  const files = await listJsonFiles(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const document = await readJsonFile<Document>(filePath);
    if (document.id === id) {
      const updated: Document = {
        ...document,
        ...data,
        id: document.id,
        createdAt: document.createdAt,
        updatedAt: new Date(now()),
      };
      await writeJsonFile(filePath, updated);
      return updated;
    }
  }
  return null;
}

export async function deleteDocument(id: string): Promise<boolean> {
  const dir = path.join(CONTENT_DIR, 'documents');
  const files = await listJsonFiles(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const document = await readJsonFile<Document>(filePath);
    if (document.id === id) {
      await fs.unlink(filePath);
      return true;
    }
  }
  return false;
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
      title: `Tagesstatus: Schmerz ${status.painLevel}/10`,
      summary: status.symptoms.join(', ') || status.content.slice(0, 100),
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
    filtered = filtered.filter(e => e.date >= options.startDate!);
  }
  if (options?.endDate) {
    filtered = filtered.filter(e => e.date <= options.endDate!);
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
  // Combine date and time for proper ordering within the same day
  const getSortableTimestamp = (entry: TimelineEntry): number => {
    const baseTime = entry.date.getTime();
    if (entry.time) {
      // Parse time string (expected format: "HH:MM" or "HH:MM:SS")
      const [hours, minutes, seconds = 0] = entry.time.split(':').map(Number);
      // Add milliseconds for time-of-day
      return baseTime + (hours * 3600 + minutes * 60 + Number(seconds)) * 1000;
    }
    // No time specified - use end of day to sort at bottom of that day
    return baseTime;
  };

  return filtered.sort((a, b) => getSortableTimestamp(b) - getSortableTimestamp(a));
}

export { generateId, slugify };
