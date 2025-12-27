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
import LinearProgress from '@mui/material/LinearProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { Status } from '../../content/config';
import StatusForm from './StatusForm';
import DetailDrawer from '../ui/DetailDrawer';
import EditDrawer from '../ui/EditDrawer';

const moodLabels: Record<string, string> = {
  good: 'Gut',
  okay: 'Okay',
  bad: 'Schlecht',
  terrible: 'Sehr schlecht',
};

const moodColors: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
  good: 'success',
  okay: 'info',
  bad: 'warning',
  terrible: 'error',
};

export default function StatusList() {
  const [statusEntries, setStatusEntries] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<Status | null>(null);

  // Context menu state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);

  // Detail drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerStatus, setDrawerStatus] = useState<Status | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/status');
      if (!response.ok) throw new Error('Fehler beim Laden');
      const data = await response.json();
      // Sort by date descending
      data.sort((a: Status, b: Status) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setStatusEntries(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData().then((data) => {
      const params = new URLSearchParams(window.location.search);

      // Check for 'new' query param (for PWA shortcut)
      if (params.get('new') === '1') {
        setFormOpen(true);
        window.history.replaceState({}, '', '/status');
        return;
      }

      // Check for edit query param
      const editId = params.get('edit');
      if (editId && data.length > 0) {
        const toEdit = data.find((s: Status) => s.id === editId);
        if (toEdit) {
          setEditingStatus(toEdit);
          setFormOpen(true);
          window.history.replaceState({}, '', '/status');
        }
      }
    });
  }, []);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getPainColor = (level: number) => {
    if (level <= 2) return 'success';
    if (level <= 4) return 'info';
    if (level <= 6) return 'warning';
    return 'error';
  };

  const handleAdd = () => {
    setEditingStatus(null);
    setFormOpen(true);
  };

  // Context menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, status: Status) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedStatus(status);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    if (selectedStatus) {
      setEditingStatus(selectedStatus);
      setFormOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedStatus) {
      setStatusToDelete(selectedStatus);
      setDeleteConfirmOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!statusToDelete) return;
    try {
      const response = await fetch(`/api/status/${statusToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Fehler beim Löschen');
      await fetchData();
      setDeleteConfirmOpen(false);
      setStatusToDelete(null);
      setSelectedStatus(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingStatus(null);
  };

  const handleFormSuccess = () => {
    fetchData();
    handleFormClose();
  };

  // Detail drawer handlers
  const handleCardClick = (status: Status) => {
    setDrawerStatus(status);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleDrawerEdit = () => {
    if (drawerStatus) {
      setEditingStatus(drawerStatus);
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
          Befinden
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Status hinzufügen
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {statusEntries.map((status) => (
          <Grid key={status.id} size={{ xs: 12, md: 6 }}>
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
              <CardActionArea onClick={() => handleCardClick(status)}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                      <Typography variant="h6">
                        {formatDate(status.date)}
                      </Typography>
                      {status.time && (
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, color: 'text.secondary' }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="body2">{status.time}</Typography>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip
                        label={(status.mood && moodLabels[status.mood]) || status.mood || 'Unbekannt'}
                        color={(status.mood && moodColors[status.mood]) || 'default'}
                        size="small"
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, status);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Schmerzlevel
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {status.painLevel}/10
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={status.painLevel * 10}
                      color={getPainColor(status.painLevel)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {status.generalCondition && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Allgemeinzustand:</strong> {status.generalCondition}
                    </Typography>
                  )}

                  {status.symptoms && status.symptoms.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Symptome:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {status.symptoms.map((symptom, idx) => (
                          <Chip key={idx} label={symptom} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {status.notes && (
                    <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                      {status.notes}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {statusEntries.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Noch kein Befinden eingetragen.
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

      <EditDrawer
        open={formOpen}
        onClose={handleFormClose}
        title={editingStatus ? 'Status bearbeiten' : 'Neuer Status'}
      >
        <StatusForm
          status={editingStatus}
          onSuccess={handleFormSuccess}
          onCancel={handleFormClose}
        />
      </EditDrawer>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Status löschen?</DialogTitle>
        <DialogContent>
          <Typography>
            Möchten Sie den Status vom {statusToDelete && formatDate(statusToDelete.date)} wirklich löschen?
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
        type="status"
        data={drawerStatus}
        onEdit={handleDrawerEdit}
      />
    </Box>
  );
}
