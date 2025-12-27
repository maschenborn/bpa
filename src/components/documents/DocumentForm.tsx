import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import type { Document, Doctor, Appointment } from '../../content/config';

interface DocumentFormProps {
  document?: Document | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const DOCUMENT_TYPES = [
  'Befund',
  'Labor',
  'Rezept',
  'Rechnung',
  'Arztbrief',
  'Überweisung',
  'Bildgebung',
  'Sonstiges',
];

const FILE_TYPES = ['pdf', 'jpg', 'png', 'doc', 'docx'];

export default function DocumentForm({ document, onSuccess, onCancel }: DocumentFormProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Helper to format date for input
  const formatDateForInput = (dateStr?: string | Date) => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
      return d.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const [formData, setFormData] = useState({
    type: document?.type || 'Befund',
    title: document?.title || '',
    description: document?.description || '',
    filePath: document?.filePath || '',
    fileType: document?.fileType || 'pdf',
    date: formatDateForInput(document?.date),
    doctorId: document?.doctorId || '',
    appointmentId: document?.appointmentId || '',
    tags: document?.tags?.join(', ') || '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch doctors and appointments for dropdowns
    Promise.all([
      fetch('/api/doctors').then(r => r.json()),
      fetch('/api/appointments').then(r => r.json()),
    ]).then(([docs, apts]) => {
      setDoctors(docs);
      setAppointments(apts);
    }).catch(console.error);
  }, []);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Titel ist erforderlich');
      return;
    }
    if (!formData.filePath.trim()) {
      setError('Dateipfad ist erforderlich');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        ...formData,
        date: new Date(formData.date),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        doctorId: formData.doctorId || undefined,
        appointmentId: formData.appointmentId || undefined,
      };

      const url = document ? `/api/documents/${document.id}` : '/api/documents';
      const method = document ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setSaving(false);
    }
  };

  // Format appointment for display
  const formatAppointment = (apt: Appointment) => {
    const date = new Date(apt.date).toLocaleDateString('de-DE');
    const doctor = doctors.find(d => d.id === apt.doctorId);
    return `${date} - ${apt.reason}${doctor ? ` (${doctor.name})` : ''}`;
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        select
        label="Dokumenttyp"
        value={formData.type}
        onChange={handleChange('type')}
        fullWidth
        required
        margin="normal"
      >
        {DOCUMENT_TYPES.map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Titel"
        value={formData.title}
        onChange={handleChange('title')}
        fullWidth
        required
        margin="normal"
        placeholder="z.B. Blutwerte vom 27.12.2025"
      />

      <TextField
        label="Beschreibung"
        value={formData.description}
        onChange={handleChange('description')}
        fullWidth
        multiline
        rows={2}
        margin="normal"
      />

      <TextField
        label="Dateipfad"
        value={formData.filePath}
        onChange={handleChange('filePath')}
        fullWidth
        required
        margin="normal"
        placeholder="/documents/2025-12/blutwerte.pdf"
        helperText="Pfad zur Datei im public/documents Ordner"
      />

      <TextField
        select
        label="Dateityp"
        value={formData.fileType}
        onChange={handleChange('fileType')}
        fullWidth
        margin="normal"
      >
        {FILE_TYPES.map((type) => (
          <MenuItem key={type} value={type}>
            {type.toUpperCase()}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        type="date"
        label="Datum"
        value={formData.date}
        onChange={handleChange('date')}
        fullWidth
        margin="normal"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <TextField
        select
        label="Arzt (optional)"
        value={formData.doctorId}
        onChange={handleChange('doctorId')}
        fullWidth
        margin="normal"
      >
        <MenuItem value="">- Kein Arzt -</MenuItem>
        {doctors.map((doctor) => (
          <MenuItem key={doctor.id} value={doctor.id}>
            {doctor.name} ({doctor.specialty})
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Termin (optional)"
        value={formData.appointmentId}
        onChange={handleChange('appointmentId')}
        fullWidth
        margin="normal"
      >
        <MenuItem value="">- Kein Termin -</MenuItem>
        {appointments.map((apt) => (
          <MenuItem key={apt.id} value={apt.id}>
            {formatAppointment(apt)}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Tags"
        value={formData.tags}
        onChange={handleChange('tags')}
        fullWidth
        margin="normal"
        placeholder="labor, wichtig, nachsorge"
        helperText="Kommagetrennte Tags"
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button onClick={onCancel} disabled={saving}>
          Abbrechen
        </Button>
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? 'Speichert...' : 'Speichern'}
        </Button>
      </Box>
    </Box>
  );
}
