import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import type { Medication, Doctor } from '../../content/config';

interface MedicationFormProps {
  medication?: Medication | null;
  doctors: Doctor[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MedicationForm({ medication, doctors, onSuccess, onCancel }: MedicationFormProps) {
  const [formData, setFormData] = useState({
    name: medication?.name || '',
    dosage: medication?.dosage || '',
    frequency: medication?.frequency || '',
    startDate: medication?.startDate || new Date().toISOString().split('T')[0],
    endDate: medication?.endDate || '',
    prescribingDoctorId: medication?.prescribingDoctorId || '',
    purpose: medication?.purpose || '',
    sideEffects: medication?.sideEffects || '',
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

    if (!formData.name.trim()) {
      setError('Name ist erforderlich');
      return;
    }
    if (!formData.dosage.trim()) {
      setError('Dosierung ist erforderlich');
      return;
    }
    if (!formData.frequency.trim()) {
      setError('Einnahme ist erforderlich');
      return;
    }
    if (!formData.startDate) {
      setError('Startdatum ist erforderlich');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const url = medication ? `/api/medications/${medication.id}` : '/api/medications';
      const method = medication ? 'PUT' : 'POST';

      // Only include endDate if it has a value
      const dataToSend = {
        ...formData,
        endDate: formData.endDate || undefined,
        prescribingDoctorId: formData.prescribingDoctorId || undefined,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
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
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Medikament"
            value={formData.name}
            onChange={handleChange('name')}
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Dosierung"
            value={formData.dosage}
            onChange={handleChange('dosage')}
            fullWidth
            required
            placeholder="z.B. 500mg"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Einnahme"
            value={formData.frequency}
            onChange={handleChange('frequency')}
            fullWidth
            required
            placeholder="z.B. 3x täglich"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Startdatum"
            type="date"
            value={formData.startDate}
            onChange={handleChange('startDate')}
            fullWidth
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Enddatum"
            type="date"
            value={formData.endDate}
            onChange={handleChange('endDate')}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Verschrieben von"
            select
            value={formData.prescribingDoctorId}
            onChange={handleChange('prescribingDoctorId')}
            fullWidth
          >
            <MenuItem value="">— Nicht zugeordnet —</MenuItem>
            {doctors.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.id}>
                {doctor.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Zweck"
            value={formData.purpose}
            onChange={handleChange('purpose')}
            fullWidth
            multiline
            rows={2}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Nebenwirkungen"
            value={formData.sideEffects}
            onChange={handleChange('sideEffects')}
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
