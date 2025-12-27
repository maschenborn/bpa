import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import type { Status } from '../../content/config';

interface StatusFormProps {
  status?: Status | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const moodOptions = [
  { value: 'good', label: 'Gut' },
  { value: 'okay', label: 'Okay' },
  { value: 'bad', label: 'Schlecht' },
  { value: 'terrible', label: 'Sehr schlecht' },
];

const commonSymptoms = [
  'Schwellung',
  'Rötung',
  'Fieber',
  'Müdigkeit',
  'Appetitlosigkeit',
  'Schlafstörungen',
  'Kopfschmerzen',
  'Übelkeit',
  'Taubheitsgefühl',
  'Druckschmerz',
];

export default function StatusForm({ status, onSuccess, onCancel }: StatusFormProps) {
  const [formData, setFormData] = useState({
    date: status?.date || new Date().toISOString().split('T')[0],
    painLevel: status?.painLevel ?? 5,
    symptoms: status?.symptoms || [],
    generalCondition: status?.generalCondition || '',
    mood: status?.mood || 'okay',
    notes: status?.notes || '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handlePainLevelChange = (_: Event, value: number | number[]) => {
    setFormData((prev) => ({
      ...prev,
      painLevel: value as number,
    }));
  };

  const toggleSymptom = (symptom: string) => {
    setFormData((prev) => {
      const symptoms = prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom];
      return { ...prev, symptoms };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date) {
      setError('Datum ist erforderlich');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const url = status ? `/api/status/${status.id}` : '/api/status';
      const method = status ? 'PUT' : 'POST';

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
            label="Stimmung"
            select
            value={formData.mood}
            onChange={handleChange('mood')}
            fullWidth
            required
          >
            {moodOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography gutterBottom>Schmerzlevel: {formData.painLevel}/10</Typography>
          <Slider
            value={formData.painLevel}
            onChange={handlePainLevelChange}
            min={0}
            max={10}
            step={1}
            marks
            valueLabelDisplay="auto"
            color={
              formData.painLevel <= 2 ? 'success' :
              formData.painLevel <= 4 ? 'info' :
              formData.painLevel <= 6 ? 'warning' : 'error'
            }
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Symptome (klicken zum Auswählen):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {commonSymptoms.map((symptom) => (
              <Chip
                key={symptom}
                label={symptom}
                onClick={() => toggleSymptom(symptom)}
                color={formData.symptoms.includes(symptom) ? 'primary' : 'default'}
                variant={formData.symptoms.includes(symptom) ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Allgemeinzustand"
            value={formData.generalCondition}
            onChange={handleChange('generalCondition')}
            fullWidth
            placeholder="z.B. Erschöpft aber stabil"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Notizen"
            value={formData.notes}
            onChange={handleChange('notes')}
            fullWidth
            multiline
            rows={4}
            placeholder="Weitere Beobachtungen..."
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
