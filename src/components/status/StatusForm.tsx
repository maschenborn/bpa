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
import Autocomplete from '@mui/material/Autocomplete';
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
  'Schütteln',
];

export default function StatusForm({ status, onSuccess, onCancel }: StatusFormProps) {
  // Helper to format date for input (YYYY-MM-DD from ISO string)
  const getInitialDate = () => {
    if (!status?.date) return new Date().toISOString().split('T')[0];
    try {
      const d = new Date(status.date);
      if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
      return d.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  // Helper to format time for input (HH:mm)
  const getInitialTime = () => {
    if (status?.time) return status.time;
    // New entry -> current time
    // Edit entry without time -> start empty to allow user to add it, OR default to now?
    // User complaint: "Uhrzeit wurde nicht gespeichert" -> they want it!
    // But if editing an old one, maybe keep it empty? 
    // Logic: If status exists (editing) and no time, return empty.
    // If status is null (creating), return current time.
    if (status) return '';
    return new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  // Ensure mood is valid or valid fallback
  const getInitialMood = () => {
    const m = status?.mood?.toLowerCase();
    if (m && moodOptions.some(opt => opt.value === m)) return m;
    // If value exists but matches no option (e.g. "Gut"), return it? No, Select won't show it.
    // We should probably map it if possible, or default to 'okay'
    return 'okay';
  };

  const [formData, setFormData] = useState({
    date: getInitialDate(),
    time: getInitialTime(),
    painLevel: status?.painLevel ?? 5,
    symptoms: status?.symptoms || [],
    mood: getInitialMood(),
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

  const handleSymptomsChange = (_: any, newValue: (string | unknown)[]) => {
    // Autocomplete freeSolo can return strings or objects if we had them. Here just strings.
    setFormData((prev) => ({
      ...prev,
      symptoms: newValue as string[],
    }));
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

      const payload = {
        date: formData.date,
        time: formData.time,
        painLevel: formData.painLevel,
        symptoms: formData.symptoms,
        mood: formData.mood,
        notes: formData.notes,
        // Preserve other fields if passed in status but not edited here
        affectedAreas: status?.affectedAreas || [],
        medicationsTaken: status?.medicationsTaken || [],
        documentIds: status?.documentIds || [],
      };

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
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Uhrzeit"
            type="time"
            value={formData.time}
            onChange={handleChange('time')}
            fullWidth
            InputLabelProps={{ shrink: true }}
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
            slotProps={{
              select: {
                MenuProps: {
                  sx: { zIndex: (theme) => theme.zIndex.modal + 12 }
                }
              }
            }}
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
          <Autocomplete
            multiple
            freeSolo
            options={commonSymptoms}
            value={formData.symptoms}
            onChange={handleSymptomsChange}
            renderTags={(value: readonly string[], getTagProps) =>
              value.map((option: string, index: number) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Symptome"
                placeholder="Symptom hinzufügen (Tippen + Enter)"
                helperText="Wählen Sie aus der Liste oder tippen Sie eigene Symptome ein"
              />
            )}
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
