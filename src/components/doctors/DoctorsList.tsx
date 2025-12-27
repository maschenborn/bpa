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
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { Doctor, Address } from '../../content/config';
import DoctorForm from './DoctorForm';

// Helper to format address (can be string or object)
function formatAddress(address: Address | undefined): string {
  if (!address) return '';
  if (typeof address === 'string') return address;
  const parts = [address.street, address.zip, address.city].filter(Boolean);
  return parts.join(', ');
}

export default function DoctorsList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/doctors');
      if (!response.ok) throw new Error('Fehler beim Laden der Ärzte');
      const data = await response.json();
      setDoctors(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAdd = () => {
    setEditingDoctor(null);
    setFormOpen(true);
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormOpen(true);
  };

  const handleDeleteClick = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!doctorToDelete) return;
    try {
      const response = await fetch(`/api/doctors/${doctorToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Fehler beim Löschen');
      await fetchDoctors();
      setDeleteConfirmOpen(false);
      setDoctorToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingDoctor(null);
  };

  const handleFormSuccess = () => {
    fetchDoctors();
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
          Ärzte
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Arzt hinzufügen
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {doctors.map((doctor) => (
          <Grid key={doctor.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" component="h2">
                      {doctor.name}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      {doctor.specialty}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip
                      label={doctor.isActive ? 'Aktiv' : 'Inaktiv'}
                      color={doctor.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Box>

                {doctor.clinic && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {doctor.clinic}
                  </Typography>
                )}

                {doctor.address && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatAddress(doctor.address)}
                    </Typography>
                  </Box>
                )}

                {doctor.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {doctor.phone}
                    </Typography>
                  </Box>
                )}

                {doctor.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <EmailIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {doctor.email}
                    </Typography>
                  </Box>
                )}

                {doctor.notes && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    {doctor.notes}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <IconButton size="small" onClick={() => handleEdit(doctor)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteClick(doctor)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {doctors.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Noch keine Ärzte eingetragen.
          </Typography>
        </Box>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onClose={handleFormClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDoctor ? 'Arzt bearbeiten' : 'Neuer Arzt'}
        </DialogTitle>
        <DialogContent>
          <DoctorForm
            doctor={editingDoctor}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Arzt löschen?</DialogTitle>
        <DialogContent>
          <Typography>
            Möchten Sie {doctorToDelete?.name} wirklich löschen?
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
