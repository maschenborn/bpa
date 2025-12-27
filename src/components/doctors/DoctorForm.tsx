import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import type { Doctor } from '../../content/config';

interface DoctorFormProps {
  doctor?: Doctor | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DoctorForm({ doctor, onSuccess, onCancel }: DoctorFormProps) {
  const [formData, setFormData] = useState({
    name: doctor?.name || '',
    specialty: doctor?.specialty || '',
    clinic: doctor?.clinic || '',
    street: typeof doctor?.address === 'object' ? (doctor.address as any).street || '' : '',
    zip: typeof doctor?.address === 'object' ? (doctor.address as any).zip || '' : '',
    city: typeof doctor?.address === 'object' ? (doctor.address as any).city || '' : '',
    phone: doctor?.phone || '',
    email: doctor?.email || '',
    website: doctor?.website || '',
    notes: doctor?.notes || '',
    isActive: doctor?.isActive ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Name ist erforderlich');
      return;
    }
    if (!formData.specialty.trim()) {
      setError('Fachgebiet ist erforderlich');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const url = doctor ? `/api/doctors/${doctor.id}` : '/api/doctors';
      const method = doctor ? 'PUT' : 'POST';

      const dataToSave = {
        name: formData.name,
        specialty: formData.specialty,
        clinic: formData.clinic,
        address: {
          street: formData.street,
          zip: formData.zip,
          city: formData.city,
        },
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        notes: formData.notes,
        isActive: formData.isActive,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
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

      <TextField
        label="Name"
        value={formData.name}
        onChange={handleChange('name')}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Fachgebiet"
        value={formData.specialty}
        onChange={handleChange('specialty')}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Praxis/Klinik"
        value={formData.clinic}
        onChange={handleChange('clinic')}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Straße & Hausnummer"
        value={formData.street}
        onChange={handleChange('street')}
        fullWidth
        margin="normal"
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="PLZ"
          value={formData.zip}
          onChange={handleChange('zip')}
          fullWidth
          margin="normal"
          sx={{ flex: 1 }}
        />
        <TextField
          label="Stadt"
          value={formData.city}
          onChange={handleChange('city')}
          fullWidth
          margin="normal"
          sx={{ flex: 2 }}
        />
      </Box>

      <TextField
        label="Telefon"
        value={formData.phone}
        onChange={handleChange('phone')}
        fullWidth
        margin="normal"
      />

      <TextField
        label="E-Mail"
        type="email"
        value={formData.email}
        onChange={handleChange('email')}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Webseite"
        type="url"
        value={formData.website}
        onChange={handleChange('website')}
        fullWidth
        margin="normal"
        placeholder="https://..."
      />

      <TextField
        label="Notizen"
        value={formData.notes}
        onChange={handleChange('notes')}
        fullWidth
        multiline
        rows={3}
        margin="normal"
      />

      <FormControlLabel
        control={
          <Switch
            checked={formData.isActive}
            onChange={handleChange('isActive')}
          />
        }
        label="Aktiv"
        sx={{ mt: 1 }}
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
