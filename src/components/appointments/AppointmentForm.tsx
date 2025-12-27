import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import type { Appointment, Doctor } from '../../content/config';

interface AppointmentFormProps {
  appointment?: Appointment | null;
  doctors: Doctor[];
  onSuccess: () => void;
  onCancel: () => void;
}

const appointmentTypes = [
  { value: 'consultation', label: 'Beratung' },
  { value: 'treatment', label: 'Behandlung' },
  { value: 'followup', label: 'Nachsorge' },
  { value: 'emergency', label: 'Notfall' },
  { value: 'surgery', label: 'Operation' },
  { value: 'imaging', label: 'Bildgebung' },
];

export default function AppointmentForm({ appointment, doctors, onSuccess, onCancel }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    date: appointment?.date || new Date().toISOString().split('T')[0],
    time: appointment?.time || '',
    doctorId: appointment?.doctorId || '',
    type: appointment?.type || 'consultation',
    reason: appointment?.reason || '',
    findings: appointment?.findings || '',
    diagnosis: appointment?.diagnosis || '',
    recommendations: appointment?.recommendations || '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date) {
      setError('Datum ist erforderlich');
      return;
    }
    if (!formData.doctorId) {
      setError('Arzt ist erforderlich');
      return;
    }
    if (!formData.reason.trim()) {
      setError('Grund ist erforderlich');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const url = appointment ? `/api/appointments/${appointment.id}` : '/api/appointments';
      const method = appointment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Datum"
            type="date"
            value={formData.date}
            onChange={handleChange('date')}
            fullWidth
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Uhrzeit"
            type="time"
            value={formData.time}
            onChange={handleChange('time')}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Arzt"
            select
            value={formData.doctorId}
            onChange={handleChange('doctorId')}
            fullWidth
            required
          >
            {doctors.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.id}>
                {doctor.name} - {doctor.specialty}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Art"
            select
            value={formData.type}
            onChange={handleChange('type')}
            fullWidth
            required
          >
            {appointmentTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Grund"
            value={formData.reason}
            onChange={handleChange('reason')}
            fullWidth
            required
            multiline
            rows={2}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Befund"
            value={formData.findings}
            onChange={handleChange('findings')}
            fullWidth
            multiline
            rows={3}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Diagnose"
            value={formData.diagnosis}
            onChange={handleChange('diagnosis')}
            fullWidth
            multiline
            rows={2}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Empfehlung"
            value={formData.recommendations}
            onChange={handleChange('recommendations')}
            fullWidth
            multiline
            rows={2}
          />
        </Grid>
      </Grid>

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
