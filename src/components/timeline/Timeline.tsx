import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import Snackbar from '@mui/material/Snackbar';
import EventIcon from '@mui/icons-material/Event';
import MedicationIcon from '@mui/icons-material/Medication';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import DescriptionIcon from '@mui/icons-material/Description';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import type { Doctor, Appointment, Medication, Status, Document } from '../../content/config';
import DetailDrawer, { type DetailType } from '../ui/DetailDrawer';

interface TimelineEntry {
  id: string;
  type: 'appointment' | 'medication' | 'status' | 'document';
  date: string;
  time?: string;
  title: string;
  description?: string;
  data: Record<string, unknown>;
}

const typeLabels: Record<string, string> = {
  appointment: 'Termin',
  medication: 'Medikament',
  status: 'Status',
  document: 'Dokument',
};

const typeIcons: Record<string, React.ReactNode> = {
  appointment: <EventIcon />,
  medication: <MedicationIcon />,
  status: <MonitorHeartIcon />,
  document: <DescriptionIcon />,
};

const typeColors: Record<string, 'primary' | 'secondary' | 'success' | 'info'> = {
  appointment: 'primary',
  medication: 'secondary',
  status: 'success',
  document: 'info',
};

const typeEditUrls: Record<string, string> = {
  appointment: '/appointments',
  medication: '/medications',
  status: '/status',
  document: '/documents',
};

export default function Timeline() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter dialog
  const [filterOpen, setFilterOpen] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [minPainLevel, setMinPainLevel] = useState('');
  const [maxPainLevel, setMaxPainLevel] = useState('');

  // Context menu
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Detail drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerEntry, setDrawerEntry] = useState<TimelineEntry | null>(null);

  const activeFilterCount = [startDate, endDate, selectedDoctorId, minPainLevel, maxPainLevel].filter(Boolean).length + selectedTypes.length;

  const fetchData = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedTypes.length > 0) params.append('types', selectedTypes.join(','));
      if (selectedDoctorId) params.append('doctorId', selectedDoctorId);
      if (minPainLevel) params.append('minPainLevel', minPainLevel);
      if (maxPainLevel) params.append('maxPainLevel', maxPainLevel);

      const [timelineRes, doctorsRes] = await Promise.all([
        fetch(`/api/timeline?${params.toString()}`),
        fetch('/api/doctors'),
      ]);

      if (!timelineRes.ok || !doctorsRes.ok) throw new Error('Fehler beim Laden');

      const timelineData = await timelineRes.json();
      const doctorsData = await doctorsRes.json();

      setEntries(timelineData);
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
  }, [startDate, endDate, selectedTypes, selectedDoctorId, minPainLevel, maxPainLevel]);

  const formatDate = (dateStr: string, timeStr?: string) => {
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    if (timeStr) {
      return `${dateFormatted}, ${timeStr} Uhr`;
    }
    return dateFormatted;
  };

  const getDoctorName = (doctorId?: string) => {
    if (!doctorId) return null;
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor?.name;
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, entry: TimelineEntry) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedEntry(entry);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    if (selectedEntry) {
      const baseUrl = typeEditUrls[selectedEntry.type];
      window.location.href = `${baseUrl}?edit=${selectedEntry.id}`;
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEntry) return;

    try {
      const typeToEndpoint: Record<string, string> = {
        appointment: 'appointments',
        medication: 'medications',
        status: 'status',
        document: 'documents',
      };

      const res = await fetch(`/api/${typeToEndpoint[selectedEntry.type]}/${selectedEntry.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Löschen fehlgeschlagen');

      setSnackbar({ open: true, message: 'Eintrag gelöscht', severity: 'success' });
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Fehler beim Löschen', severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedEntry(null);
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedTypes([]);
    setSelectedDoctorId('');
    setMinPainLevel('');
    setMaxPainLevel('');
  };

  // Detail drawer handlers
  const handleCardClick = (entry: TimelineEntry) => {
    setDrawerEntry(entry);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleDrawerEdit = () => {
    if (drawerEntry) {
      const baseUrl = typeEditUrls[drawerEntry.type];
      window.location.href = `${baseUrl}?edit=${drawerEntry.id}`;
    }
  };

  // Convert TimelineEntry data to the correct type for the drawer
  const getDrawerData = (): Appointment | Medication | Status | Document | null => {
    if (!drawerEntry) return null;

    const data = drawerEntry.data as Record<string, unknown>;

    // Reconstruct the full object from the timeline entry data
    switch (drawerEntry.type) {
      case 'appointment':
        return {
          id: drawerEntry.id,
          date: new Date(drawerEntry.date),
          time: drawerEntry.time,
          doctorId: data.doctorId as string,
          type: data.type as string || 'consultation',
          reason: data.reason as string || drawerEntry.description || '',
          findings: data.findings as string,
          diagnosis: data.diagnosis as string,
          recommendations: data.recommendations as string[] || [],
          prescriptions: data.prescriptions as string[] || [],
          documentIds: data.documentIds as string[] || [],
          notes: data.notes as string,
          followUpDate: data.followUpDate ? new Date(data.followUpDate as string) : undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Appointment;

      case 'medication':
        return {
          id: drawerEntry.id,
          name: drawerEntry.title,
          genericName: data.genericName as string,
          dosage: data.dosage as string || '',
          frequency: data.frequency as string || '',
          route: data.route as string || 'oral',
          prescribingDoctorId: data.prescribingDoctorId as string,
          appointmentId: data.appointmentId as string,
          startDate: new Date(drawerEntry.date),
          endDate: data.endDate ? new Date(data.endDate as string) : undefined,
          isActive: data.isActive as boolean ?? true,
          purpose: data.purpose as string,
          effects: data.effects as string,
          sideEffects: data.sideEffects as string[] || [],
          notes: data.notes as string,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Medication;

      case 'status':
        return {
          id: drawerEntry.id,
          date: new Date(drawerEntry.date),
          time: drawerEntry.time,
          painLevel: data.painLevel as number || 0,
          symptoms: data.symptoms as string[] || [],
          affectedAreas: data.affectedAreas as string[] || [],
          generalCondition: data.generalCondition as string,
          sleep: data.sleep as string,
          appetite: data.appetite as string,
          mood: data.mood as string,
          notes: data.notes as string || drawerEntry.description,
          medicationsTaken: data.medicationsTaken as string[] || [],
          documentIds: data.documentIds as string[] || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Status;

      case 'document':
        return {
          id: drawerEntry.id,
          type: data.type as string || 'Sonstiges',
          title: drawerEntry.title,
          description: drawerEntry.description,
          filePath: data.filePath as string || '',
          fileType: data.fileType as string || 'pdf',
          fileSize: data.fileSize as number,
          date: new Date(drawerEntry.date),
          doctorId: data.doctorId as string,
          appointmentId: data.appointmentId as string,
          tags: data.tags as string[] || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Document;

      default:
        return null;
    }
  };

  const renderEntryDetails = (entry: TimelineEntry) => {
    const data = entry.data as Record<string, unknown>;

    switch (entry.type) {
      case 'appointment':
        return (
          <>
            {data.findings && (
              <Typography variant="body2" sx={{ mt: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                <strong>Befund:</strong> {String(data.findings)}
              </Typography>
            )}
            {data.diagnosis && (
              <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                <strong>Diagnose:</strong> {String(data.diagnosis)}
              </Typography>
            )}
          </>
        );

      case 'medication':
        return (
          <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            {String(data.dosage)} - {String(data.frequency)}
          </Typography>
        );

      case 'status':
        const painLevel = Number(data.painLevel || 0);
        const symptoms = (data.symptoms || []) as string[];
        return (
          <>
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, minWidth: 70 }}>
                  Schmerz: {painLevel}/10
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={painLevel * 10}
                    color={painLevel <= 3 ? 'success' : painLevel <= 6 ? 'warning' : 'error'}
                    sx={{ height: 4, borderRadius: 2 }}
                  />
                </Box>
              </Box>
            </Box>
            {symptoms.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {symptoms.slice(0, 3).map((symptom, idx) => (
                  <Chip key={idx} label={symptom} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                ))}
                {symptoms.length > 3 && (
                  <Chip label={`+${symptoms.length - 3}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                )}
              </Box>
            )}
          </>
        );

      case 'document':
        return (
          <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            {String(data.fileType).toUpperCase()}
          </Typography>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ pb: 2 }}>
      {/* Header with Filter Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Timeline
        </Typography>
        <Badge badgeContent={activeFilterCount} color="primary">
          <IconButton
            onClick={() => setFilterOpen(true)}
            sx={{
              bgcolor: activeFilterCount > 0 ? 'primary.light' : 'action.hover',
              '&:hover': { bgcolor: activeFilterCount > 0 ? 'primary.main' : 'action.selected' },
            }}
          >
            <FilterListIcon sx={{ color: activeFilterCount > 0 ? 'white' : 'text.primary' }} />
          </IconButton>
        </Badge>
      </Box>

      {/* Filter Dialog */}
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Filter
          <IconButton onClick={() => setFilterOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Von"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Bis"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Typen</InputLabel>
                <Select
                  multiple
                  value={selectedTypes}
                  onChange={(e) => setSelectedTypes(e.target.value as string[])}
                  label="Typen"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={typeLabels[value]} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="appointment">Termine</MenuItem>
                  <MenuItem value="medication">Medikamente</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                  <MenuItem value="document">Dokumente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Arzt"
                select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="">— Alle —</MenuItem>
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Min. Schmerz"
                type="number"
                value={minPainLevel}
                onChange={(e) => setMinPainLevel(e.target.value)}
                fullWidth
                size="small"
                slotProps={{ htmlInput: { min: 0, max: 10 } }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Max. Schmerz"
                type="number"
                value={maxPainLevel}
                onChange={(e) => setMaxPainLevel(e.target.value)}
                fullWidth
                size="small"
                slotProps={{ htmlInput: { min: 0, max: 10 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={clearFilters} color="inherit">
            Zurücksetzen
          </Button>
          <Button onClick={() => setFilterOpen(false)} variant="contained">
            Anwenden
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ position: 'relative', pl: { xs: 2, sm: 3 } }}>
          {/* Timeline line */}
          <Box
            sx={{
              position: 'absolute',
              left: { xs: 6, sm: 10 },
              top: 0,
              bottom: 0,
              width: 2,
              bgcolor: 'divider',
            }}
          />

          {entries.map((entry) => (
            <Box key={entry.id} sx={{ position: 'relative', mb: 2 }}>
              {/* Timeline dot */}
              <Box
                sx={{
                  position: 'absolute',
                  left: { xs: -14, sm: -18 },
                  top: 12,
                  width: { xs: 10, sm: 12 },
                  height: { xs: 10, sm: 12 },
                  borderRadius: '50%',
                  bgcolor: `${typeColors[entry.type]}.main`,
                  border: 2,
                  borderColor: 'background.paper',
                  zIndex: 1,
                }}
              />

              <Card
                sx={{
                  ml: { xs: 1, sm: 2 },
                  borderRadius: 2,
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleCardClick(entry)}
                  sx={{ display: 'block', textAlign: 'left' }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flex: 1, minWidth: 0 }}>
                        <Box sx={{ color: `${typeColors[entry.type]}.main`, mt: 0.5, flexShrink: 0 }}>
                          {typeIcons[entry.type]}
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: '0.9rem', sm: '1rem' },
                              lineHeight: 1.3,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {entry.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          >
                            {formatDate(entry.date, entry.time)}
                            {entry.type === 'appointment' && entry.data.doctorId && (
                              <> • {getDoctorName(entry.data.doctorId as string)}</>
                            )}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Context Menu Button */}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, entry);
                        }}
                        sx={{ ml: 0.5, flexShrink: 0 }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {renderEntryDetails(entry)}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          ))}

          {entries.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">Keine Einträge gefunden.</Typography>
            </Box>
          )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Eintrag löschen?</DialogTitle>
        <DialogContent>
          <Typography>
            Möchtest du "{selectedEntry?.title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        type={drawerEntry?.type as DetailType | null}
        data={getDrawerData()}
        onEdit={handleDrawerEdit}
        doctors={doctors}
      />
    </Box>
  );
}
