import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
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
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import EventIcon from '@mui/icons-material/Event';
import MedicationIcon from '@mui/icons-material/Medication';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import DescriptionIcon from '@mui/icons-material/Description';
import type { Doctor } from '../../content/config';

interface TimelineEntry {
  id: string;
  type: 'appointment' | 'medication' | 'status' | 'document';
  date: string;
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

export default function Timeline() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [minPainLevel, setMinPainLevel] = useState('');
  const [maxPainLevel, setMaxPainLevel] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);

      // Build query params
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDoctorName = (doctorId?: string) => {
    if (!doctorId) return null;
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor?.name;
  };

  const renderEntryDetails = (entry: TimelineEntry) => {
    const data = entry.data as Record<string, unknown>;

    switch (entry.type) {
      case 'appointment':
        return (
          <>
            {data.findings && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Befund:</strong> {String(data.findings)}
              </Typography>
            )}
            {data.diagnosis && (
              <Typography variant="body2">
                <strong>Diagnose:</strong> {String(data.diagnosis)}
              </Typography>
            )}
            {data.recommendations && (
              <Typography variant="body2">
                <strong>Empfehlung:</strong> {String(data.recommendations)}
              </Typography>
            )}
          </>
        );

      case 'medication':
        return (
          <>
            <Typography variant="body2">
              {String(data.dosage)} - {String(data.frequency)}
            </Typography>
            {data.purpose && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <strong>Zweck:</strong> {String(data.purpose)}
              </Typography>
            )}
          </>
        );

      case 'status':
        const painLevel = Number(data.painLevel || 0);
        const symptoms = (data.symptoms || []) as string[];
        return (
          <>
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">Schmerz: {painLevel}/10</Typography>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={painLevel * 10}
                    color={painLevel <= 3 ? 'success' : painLevel <= 6 ? 'warning' : 'error'}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Box>
            </Box>
            {symptoms.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {symptoms.map((symptom, idx) => (
                  <Chip key={idx} label={symptom} size="small" variant="outlined" />
                ))}
              </Box>
            )}
            {data.notes && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {String(data.notes)}
              </Typography>
            )}
          </>
        );

      case 'document':
        return (
          <>
            <Typography variant="body2">
              Typ: {String(data.fileType).toUpperCase()}
            </Typography>
            {(data.tags as string[])?.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(data.tags as string[]).map((tag, idx) => (
                  <Chip key={idx} label={tag} size="small" />
                ))}
              </Box>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Timeline
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filter
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Von"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Bis"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
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
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Arzt"
              select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              fullWidth
            >
              <MenuItem value="">— Alle —</MenuItem>
              {doctors.map((doctor) => (
                <MenuItem key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField
              label="Min. Schmerz"
              type="number"
              value={minPainLevel}
              onChange={(e) => setMinPainLevel(e.target.value)}
              fullWidth
              slotProps={{ htmlInput: { min: 0, max: 10 } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField
              label="Max. Schmerz"
              type="number"
              value={maxPainLevel}
              onChange={(e) => setMaxPainLevel(e.target.value)}
              fullWidth
              slotProps={{ htmlInput: { min: 0, max: 10 } }}
            />
          </Grid>
        </Grid>
      </Paper>

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
        <Box sx={{ position: 'relative', pl: 3 }}>
          {/* Timeline line */}
          <Box
            sx={{
              position: 'absolute',
              left: 12,
              top: 0,
              bottom: 0,
              width: 2,
              bgcolor: 'divider',
            }}
          />

          {entries.map((entry, index) => (
            <Box key={entry.id} sx={{ position: 'relative', mb: 3 }}>
              {/* Timeline dot */}
              <Box
                sx={{
                  position: 'absolute',
                  left: -19,
                  top: 16,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: `${typeColors[entry.type]}.main`,
                  border: 2,
                  borderColor: 'background.paper',
                  zIndex: 1,
                }}
              />

              <Card sx={{ ml: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ color: `${typeColors[entry.type]}.main` }}>
                        {typeIcons[entry.type]}
                      </Box>
                      <Box>
                        <Typography variant="h6" component="div">
                          {entry.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(entry.date)}
                          {entry.type === 'appointment' && entry.data.doctorId && (
                            <> • {getDoctorName(entry.data.doctorId as string)}</>
                          )}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={typeLabels[entry.type]}
                      color={typeColors[entry.type]}
                      size="small"
                    />
                  </Box>

                  {entry.description && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {entry.description}
                    </Typography>
                  )}

                  {renderEntryDetails(entry)}
                </CardContent>
              </Card>
            </Box>
          ))}

          {entries.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                Keine Einträge gefunden.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
