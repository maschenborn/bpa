import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MedicationIcon from '@mui/icons-material/Medication';
import type { Medication, Doctor } from '../../content/config';
import MedicationForm from './MedicationForm';

export default function MedicationsList() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [medicationsRes, doctorsRes] = await Promise.all([
        fetch('/api/medications'),
        fetch('/api/doctors'),
      ]);
      if (!medicationsRes.ok || !doctorsRes.ok) throw new Error('Fehler beim Laden');
      const medicationsData = await medicationsRes.json();
      const doctorsData = await doctorsRes.json();
      // Sort by start date descending
      medicationsData.sort((a: Medication, b: Medication) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      setMedications(medicationsData);
      setDoctors(doctorsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDoctorName = (doctorId?: string) => {
    if (!doctorId) return 'Unbekannt';
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor?.name || 'Unbekannt';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE');
  };

  const isActive = (medication: Medication) => {
    const today = new Date();
    const start = new Date(medication.startDate);
    const end = medication.endDate ? new Date(medication.endDate) : null;
    return start <= today && (!end || end >= today);
  };

  const handleAdd = () => {
    setEditingMedication(null);
    setFormOpen(true);
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setFormOpen(true);
  };

  const handleDeleteClick = (medication: Medication) => {
    setMedicationToDelete(medication);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!medicationToDelete) return;
    try {
      const response = await fetch(`/api/medications/${medicationToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Fehler beim Löschen');
      await fetchData();
      setDeleteConfirmOpen(false);
      setMedicationToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingMedication(null);
  };

  const handleFormSuccess = () => {
    fetchData();
    handleFormClose();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Medikamente
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Medikament hinzufügen
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {medications.map((medication) => (
          <Grid key={medication.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={{ opacity: isActive(medication) ? 1 : 0.7 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MedicationIcon color="primary" />
                    <Typography variant="h6">
                      {medication.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={isActive(medication) ? 'Aktiv' : 'Beendet'}
                    color={isActive(medication) ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                <Typography variant="body1" gutterBottom>
                  {medication.dosage} - {medication.frequency}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {formatDate(medication.startDate)}
                  {medication.endDate && ` - ${formatDate(medication.endDate)}`}
                </Typography>

                {medication.prescribingDoctorId && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Verschrieben von: {getDoctorName(medication.prescribingDoctorId)}
                  </Typography>
                )}

                {medication.purpose && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Zweck:</strong> {medication.purpose}
                  </Typography>
                )}

                {medication.sideEffects && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <strong>Nebenwirkungen:</strong> {medication.sideEffects}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <IconButton size="small" onClick={() => handleEdit(medication)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteClick(medication)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {medications.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Noch keine Medikamente eingetragen.
          </Typography>
        </Box>
      )}

      <Dialog open={formOpen} onClose={handleFormClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMedication ? 'Medikament bearbeiten' : 'Neues Medikament'}
        </DialogTitle>
        <DialogContent>
          <MedicationForm
            medication={editingMedication}
            doctors={doctors}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Medikament löschen?</DialogTitle>
        <DialogContent>
          <Typography>
            Möchten Sie {medicationToDelete?.name} wirklich löschen?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Abbrechen</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
