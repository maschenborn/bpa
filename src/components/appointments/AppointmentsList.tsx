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
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { Appointment, Doctor } from '../../content/config';
import AppointmentForm from './AppointmentForm';

const typeLabels: Record<string, string> = {
  consultation: 'Beratung',
  treatment: 'Behandlung',
  followup: 'Nachsorge',
  emergency: 'Notfall',
  surgery: 'Operation',
  imaging: 'Bildgebung',
};

const typeColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  consultation: 'info',
  treatment: 'primary',
  followup: 'success',
  emergency: 'error',
  surgery: 'warning',
  imaging: 'secondary',
};

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, doctorsRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/doctors'),
      ]);
      if (!appointmentsRes.ok || !doctorsRes.ok) throw new Error('Fehler beim Laden');
      const appointmentsData = await appointmentsRes.json();
      const doctorsData = await doctorsRes.json();
      // Sort by date descending
      appointmentsData.sort((a: Appointment, b: Appointment) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setAppointments(appointmentsData);
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

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor?.name || 'Unbekannt';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleAdd = () => {
    setEditingAppointment(null);
    setFormOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormOpen(true);
  };

  const handleDeleteClick = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!appointmentToDelete) return;
    try {
      const response = await fetch(`/api/appointments/${appointmentToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Fehler beim Löschen');
      await fetchData();
      setDeleteConfirmOpen(false);
      setAppointmentToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingAppointment(null);
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
          Termine
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Termin hinzufügen
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {appointments.map((appointment) => (
          <Grid key={appointment.id} size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon color="action" />
                    <Typography variant="h6">
                      {formatDate(appointment.date)}
                    </Typography>
                    {appointment.time && (
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">{appointment.time}</Typography>
                      </Box>
                    )}
                  </Box>
                  <Chip
                    label={typeLabels[appointment.type] || appointment.type}
                    color={typeColors[appointment.type] || 'default'}
                    size="small"
                  />
                </Box>

                <Typography variant="subtitle1" color="primary" gutterBottom>
                  {getDoctorName(appointment.doctorId)}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Grund:</strong> {appointment.reason}
                </Typography>

                {appointment.findings && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Befund:</strong> {appointment.findings}
                  </Typography>
                )}

                {appointment.diagnosis && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <strong>Diagnose:</strong> {appointment.diagnosis}
                  </Typography>
                )}

                {appointment.recommendations && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <strong>Empfehlung:</strong> {appointment.recommendations}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <IconButton size="small" onClick={() => handleEdit(appointment)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteClick(appointment)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {appointments.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Noch keine Termine eingetragen.
          </Typography>
        </Box>
      )}

      <Dialog open={formOpen} onClose={handleFormClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAppointment ? 'Termin bearbeiten' : 'Neuer Termin'}
        </DialogTitle>
        <DialogContent>
          <AppointmentForm
            appointment={editingAppointment}
            doctors={doctors}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Termin löschen?</DialogTitle>
        <DialogContent>
          <Typography>
            Möchten Sie den Termin vom {appointmentToDelete && formatDate(appointmentToDelete.date)} wirklich löschen?
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
