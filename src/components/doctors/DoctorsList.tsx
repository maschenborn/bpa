import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { Doctor, Address } from '../../content/config';
import DoctorForm from './DoctorForm';
import DetailDrawer from '../ui/DetailDrawer';
import EditDrawer from '../ui/EditDrawer';

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

  // Context menu state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Detail drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDoctor, setDrawerDoctor] = useState<Doctor | null>(null);

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

  // Context menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, doctor: Doctor) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedDoctor(doctor);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    if (selectedDoctor) {
      setEditingDoctor(selectedDoctor);
      setFormOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedDoctor) {
      setDoctorToDelete(selectedDoctor);
      setDeleteConfirmOpen(true);
    }
    handleMenuClose();
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

  // Detail drawer handlers
  const handleCardClick = (doctor: Doctor) => {
    setDrawerDoctor(doctor);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleDrawerEdit = () => {
    if (drawerDoctor) {
      setEditingDoctor(drawerDoctor);
      setFormOpen(true);
      setDrawerOpen(false);
    }
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
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, transform 0.2s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <CardActionArea onClick={() => handleCardClick(doctor)}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" component="h2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doctor.name}
                      </Typography>
                      <Typography color="text.secondary" gutterBottom>
                        {doctor.specialty}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip
                        label={doctor.isActive ? 'Aktiv' : 'Inaktiv'}
                        color={doctor.isActive ? 'success' : 'default'}
                        size="small"
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, doctor);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
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
                </CardContent>
              </CardActionArea>
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

      {/* Context Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Bearbeiten
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Löschen
        </MenuItem>
      </Menu>

      {/* Form Drawer */}
      <EditDrawer
        open={formOpen}
        onClose={handleFormClose}
        title={editingDoctor ? 'Arzt bearbeiten' : 'Neuer Arzt'}
      >
        <DoctorForm
          doctor={editingDoctor}
          onSuccess={handleFormSuccess}
          onCancel={handleFormClose}
        />
      </EditDrawer>

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

      {/* Detail Drawer */}
      <DetailDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        type="doctor"
        data={drawerDoctor}
        onEdit={handleDrawerEdit}
      />
    </Box>
  );
}
