import { useState, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import MedicationIcon from '@mui/icons-material/Medication';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NotesIcon from '@mui/icons-material/Notes';
import LabelIcon from '@mui/icons-material/Label';
import LanguageIcon from '@mui/icons-material/Language';
import type { Appointment, Medication, Status, Document, Doctor } from '../../content/config';

// Type labels for appointments
const appointmentTypeLabels: Record<string, string> = {
  consultation: 'Beratung',
  treatment: 'Behandlung',
  followup: 'Nachsorge',
  emergency: 'Notfall',
  surgery: 'Operation',
  imaging: 'Bildgebung',
};

const appointmentTypeColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  consultation: 'info',
  treatment: 'primary',
  followup: 'success',
  emergency: 'error',
  surgery: 'warning',
  imaging: 'secondary',
};

// Mood labels for status
const moodLabels: Record<string, string> = {
  good: 'Gut',
  okay: 'Okay',
  bad: 'Schlecht',
  terrible: 'Sehr schlecht',
};

// Document type colors
const documentTypeColors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  'Befund': 'primary',
  'Labor': 'info',
  'Rezept': 'success',
  'Rechnung': 'warning',
  'Arztbrief': 'secondary',
  'Überweisung': 'primary',
  'Bildgebung': 'info',
};

export type DetailType = 'appointment' | 'medication' | 'status' | 'document' | 'doctor';

export interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  type: DetailType | null;
  data: Appointment | Medication | Status | Document | Doctor | null;
  onEdit?: () => void;
  doctors?: Doctor[];
}

interface HistoryItem {
  type: DetailType;
  data: any;
}

// Helper to format dates
const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };
  return new Date(date).toLocaleDateString('de-DE', options || defaultOptions);
};

const formatShortDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('de-DE');
};

// Card-style section component for mobile-first design
function Section({
  title,
  children,
  icon,
  highlight = false,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: highlight ? 'primary.50' : 'grey.50',
        border: '1px solid',
        borderColor: highlight ? 'primary.100' : 'grey.200',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {icon && (
          <Box sx={{ color: 'text.secondary', display: 'flex' }}>
            {icon}
          </Box>
        )}
        <Typography
          variant="caption"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontWeight: 600,
            color: 'text.secondary',
          }}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  );
}

// Appointment Detail View
function AppointmentDetail({ data, doctors, onNavigate }: { data: Appointment; doctors?: Doctor[]; onNavigate: (type: DetailType, id: string) => void }) {
  const getDoctorName = (doctorId: string) => {
    const doctor = doctors?.find((d) => d.id === doctorId);
    return doctor?.name || 'Unbekannt';
  };

  const recommendations = Array.isArray(data.recommendations)
    ? data.recommendations
    : data.recommendations ? [data.recommendations] : [];

  return (
    <>
      {/* Hero Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          borderRadius: 3,
          p: 2.5,
          mb: 3,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <EventIcon />
          <Typography variant="h5" fontWeight="bold">
            {formatDate(data.date)}
          </Typography>
        </Box>
        {data.time && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.9 }}>
            <AccessTimeIcon fontSize="small" />
            <Typography variant="body1">{data.time} Uhr</Typography>
          </Box>
        )}
        <Box sx={{ mt: 2 }}>
          <Chip
            label={appointmentTypeLabels[data.type] || data.type}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>

      {/* Doctor Card - Clickable */}
      <Section title="Behandelnder Arzt" icon={<PersonIcon fontSize="small" />} highlight>
        <Box
          onClick={() => data.doctorId && onNavigate('doctor', data.doctorId)}
          sx={{
            cursor: data.doctorId ? 'pointer' : 'default',
            '&:hover': data.doctorId ? { opacity: 0.8 } : {}
          }}
        >
          <Typography variant="body1" fontWeight="bold" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {getDoctorName(data.doctorId)}
            {data.doctorId && <ArrowBackIcon sx={{ transform: 'rotate(180deg)', fontSize: 16 }} />}
          </Typography>
        </Box>
      </Section>

      {/* Reason */}
      <Section title="Grund des Termins" icon={<NotesIcon fontSize="small" />}>
        <Typography variant="body1">{data.reason}</Typography>
      </Section>

      {/* Findings & Diagnosis grouped */}
      {(data.findings || data.diagnosis) && (
        <Section title="Befund & Diagnose" icon={<DescriptionIcon fontSize="small" />}>
          {data.findings && (
            <Box sx={{ mb: data.diagnosis ? 2 : 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Befund
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                {data.findings}
              </Typography>
            </Box>
          )}
          {data.diagnosis && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Diagnose
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                {data.diagnosis}
              </Typography>
            </Box>
          )}
        </Section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Section title="Empfehlungen">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {recommendations.map((rec, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    mt: 0.8,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2">{rec}</Typography>
              </Box>
            ))}
          </Box>
        </Section>
      )}

      {/* Follow-up */}
      {data.followUpDate && (
        <Section title="Folgetermin" icon={<CalendarTodayIcon fontSize="small" />} highlight>
          <Typography variant="body1" fontWeight="medium">
            {formatShortDate(data.followUpDate)}
          </Typography>
        </Section>
      )}

      {/* Notes */}
      {data.notes && (
        <Section title="Notizen" icon={<NotesIcon fontSize="small" />}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
            {data.notes}
          </Typography>
        </Section>
      )}
    </>
  );
}

// Medication Detail View
function MedicationDetail({ data, doctors, onNavigate }: { data: Medication; doctors?: Doctor[]; onNavigate: (type: DetailType, id: string) => void }) {
  const getDoctorName = (doctorId?: string) => {
    if (!doctorId) return null;
    const doctor = doctors?.find((d) => d.id === doctorId);
    return doctor?.name || 'Unbekannt';
  };

  const isActive = () => {
    const today = new Date();
    const start = new Date(data.startDate);
    const end = data.endDate ? new Date(data.endDate) : null;
    return start <= today && (!end || end >= today);
  };

  const sideEffects = Array.isArray(data.sideEffects)
    ? data.sideEffects
    : data.sideEffects ? [data.sideEffects] : [];

  const active = isActive();

  return (
    <>
      {/* Hero Header */}
      <Box
        sx={{
          background: active
            ? 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'
            : 'linear-gradient(135deg, #757575 0%, #9e9e9e 100%)',
          borderRadius: 3,
          p: 2.5,
          mb: 3,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <MedicationIcon />
          <Typography variant="h5" fontWeight="bold">
            {data.name}
          </Typography>
        </Box>
        {data.genericName && (
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
            Wirkstoff: {data.genericName}
          </Typography>
        )}
        <Chip
          label={active ? 'Aktiv' : 'Beendet'}
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontWeight: 600,
          }}
        />
      </Box>

      {/* Dosierung - prominent */}
      <Section title="Dosierung & Einnahme" icon={<MedicationIcon fontSize="small" />} highlight>
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          {data.dosage}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {data.frequency}
        </Typography>
      </Section>

      {/* Zeitraum */}
      <Section title="Einnahmezeitraum" icon={<CalendarTodayIcon fontSize="small" />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1">
            {formatShortDate(data.startDate)}
          </Typography>
          <Typography variant="body2" color="text.secondary">→</Typography>
          <Typography variant="body1">
            {data.endDate ? formatShortDate(data.endDate) : 'laufend'}
          </Typography>
        </Box>
      </Section>

      {/* Prescribing Doctor - Clickable */}
      {data.prescribingDoctorId && (
        <Section title="Verschrieben von" icon={<PersonIcon fontSize="small" />}>
          <Box
            onClick={() => onNavigate('doctor', data.prescribingDoctorId!)}
            sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
          >
            <Typography variant="body1" fontWeight="medium" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {getDoctorName(data.prescribingDoctorId)}
              <ArrowBackIcon sx={{ transform: 'rotate(180deg)', fontSize: 16 }} />
            </Typography>
          </Box>
        </Section>
      )}

      {/* Purpose */}
      {data.purpose && (
        <Section title="Zweck der Einnahme">
          <Typography variant="body1">{data.purpose}</Typography>
        </Section>
      )}

      {/* Effects */}
      {data.effects && (
        <Section title="Wirkung">
          <Typography variant="body1">{data.effects}</Typography>
        </Section>
      )}

      {/* Side Effects - warning style */}
      {sideEffects.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: 'warning.50',
            border: '1px solid',
            borderColor: 'warning.200',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontWeight: 600,
              color: 'warning.dark',
              display: 'block',
              mb: 1,
            }}
          >
            Nebenwirkungen
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {sideEffects.map((effect, idx) => (
              <Chip
                key={idx}
                label={effect}
                size="small"
                sx={{
                  bgcolor: 'warning.100',
                  color: 'warning.dark',
                  fontWeight: 500,
                }}
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* Notes */}
      {data.notes && (
        <Section title="Notizen" icon={<NotesIcon fontSize="small" />}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
            {data.notes}
          </Typography>
        </Section>
      )}
    </>
  );
}

// Status Detail View
function StatusDetail({ data }: { data: Status }) {
  const getPainGradient = (level: number) => {
    if (level <= 2) return 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)';
    if (level <= 4) return 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)';
    if (level <= 6) return 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)';
    return 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)';
  };

  return (
    <>
      {/* Hero Header with Date */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          borderRadius: 3,
          p: 2.5,
          mb: 3,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <EventIcon />
          <Typography variant="h5" fontWeight="bold">
            {formatDate(data.date)}
          </Typography>
        </Box>
        {data.time && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.9 }}>
            <AccessTimeIcon fontSize="small" />
            <Typography variant="body1">{data.time} Uhr</Typography>
          </Box>
        )}
        {data.mood && (
          <Box sx={{ mt: 2 }}>
            <Chip
              label={moodLabels[data.mood] || data.mood}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Box>
        )}
      </Box>

      {/* Pain Level - Prominent Card */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: 3,
          background: getPainGradient(data.painLevel),
          color: 'white',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontWeight: 600,
            opacity: 0.9,
            display: 'block',
            mb: 1,
          }}
        >
          Schmerzlevel
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h2" fontWeight="bold">
            {data.painLevel}
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.8 }}>
            /10
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={data.painLevel * 10}
          sx={{
            height: 8,
            borderRadius: 4,
            mt: 2,
            bgcolor: 'rgba(255,255,255,0.3)',
            '& .MuiLinearProgress-bar': {
              bgcolor: 'white',
            },
          }}
        />
      </Paper>

      {/* General Condition */}
      {data.generalCondition && (
        <Section title="Allgemeinzustand">
          <Typography variant="body1" fontWeight="medium">
            {data.generalCondition}
          </Typography>
        </Section>
      )}

      {/* Symptoms */}
      {data.symptoms && data.symptoms.length > 0 && (
        <Section title="Symptome">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {data.symptoms.map((symptom, idx) => (
              <Chip
                key={idx}
                label={symptom}
                size="small"
                sx={{
                  bgcolor: 'error.50',
                  color: 'error.dark',
                  border: '1px solid',
                  borderColor: 'error.200',
                  fontWeight: 500,
                }}
              />
            ))}
          </Box>
        </Section>
      )}

      {/* Affected Areas */}
      {data.affectedAreas && data.affectedAreas.length > 0 && (
        <Section title="Betroffene Bereiche">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {data.affectedAreas.map((area, idx) => (
              <Chip
                key={idx}
                label={area}
                size="small"
                sx={{
                  bgcolor: 'warning.50',
                  color: 'warning.dark',
                  border: '1px solid',
                  borderColor: 'warning.200',
                  fontWeight: 500,
                }}
              />
            ))}
          </Box>
        </Section>
      )}

      {/* Sleep & Appetite in one row */}
      {(data.sleep || data.appetite) && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {data.sleep && (
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Schlaf
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {data.sleep}
              </Typography>
            </Paper>
          )}
          {data.appetite && (
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Appetit
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {data.appetite}
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Notes */}
      {data.notes && (
        <Section title="Notizen" icon={<NotesIcon fontSize="small" />}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
            {data.notes}
          </Typography>
        </Section>
      )}
    </>
  );
}

// Doctor Detail View
function DoctorDetail({ data, onNavigate }: { data: Doctor; onNavigate: (type: DetailType, id: string) => void }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all appointments and filter by doctor ID
    setLoading(true);
    fetch('/api/appointments')
      .then(res => res.json())
      .then((allAppointments: Appointment[]) => {
        const doctorAppointments = allAppointments.filter(apt => apt.doctorId === data.id);
        // Sort by date desc
        doctorAppointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAppointments(doctorAppointments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [data.id]);

  const formatAddress = (address: any) => {
    if (typeof address === 'string') return address;
    if (!address) return null;
    const parts = [address.street, address.zip, address.city].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <>
      {/* Hero Header */}
      <Box
        sx={{
          background: data.isActive
            ? 'linear-gradient(135deg, #7b1fa2 0%, #ab47bc 100%)'
            : 'linear-gradient(135deg, #757575 0%, #9e9e9e 100%)',
          borderRadius: 3,
          p: 2.5,
          mb: 3,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LocalHospitalIcon />
          <Typography variant="h5" fontWeight="bold">
            {data.name}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
          {data.specialty}
        </Typography>
        <Chip
          label={data.isActive ? 'Aktiv' : 'Inaktiv'}
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontWeight: 600,
          }}
        />
      </Box>

      {/* Clinic */}
      {data.clinic && (
        <Section title="Klinik / Praxis" icon={<LocalHospitalIcon fontSize="small" />} highlight>
          <Typography variant="body1" fontWeight="medium">
            {data.clinic}
          </Typography>
        </Section>
      )}

      {/* Contact Info Card */}
      {(data.phone || data.email || (data.address && formatAddress(data.address))) && (
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontWeight: 600,
              color: 'text.secondary',
              display: 'block',
              mb: 1.5,
            }}
          >
            Kontakt
          </Typography>

          {data.phone && (
            <Box
              component="a"
              href={`tel:${data.phone}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 1,
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: 'primary.50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PhoneIcon fontSize="small" color="primary" />
              </Box>
              <Typography variant="body1" fontWeight="medium">
                {data.phone}
              </Typography>
            </Box>
          )}

          {data.email && (
            <Box
              component="a"
              href={`mailto:${data.email}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 1,
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: 'primary.50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EmailIcon fontSize="small" color="primary" />
              </Box>
              <Typography variant="body1" fontWeight="medium" sx={{ wordBreak: 'break-all' }}>
                {data.email}
              </Typography>
            </Box>
          )}

          {data.website && (
            <Box
              component="a"
              href={data.website}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 1,
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: 'primary.50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LanguageIcon fontSize="small" color="primary" />
              </Box>
              <Typography variant="body1" fontWeight="medium" sx={{ wordBreak: 'break-all' }}>
                Webseite
              </Typography>
            </Box>
          )}

          {data.address && formatAddress(data.address) && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                py: 1,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: 'primary.50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <LocationOnIcon fontSize="small" color="primary" />
              </Box>
              <Typography variant="body1" sx={{ pt: 0.5 }}>
                {formatAddress(data.address)}
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* First Visit */}
      {data.firstVisit && (
        <Section title="Erster Besuch" icon={<CalendarTodayIcon fontSize="small" />}>
          <Typography variant="body1">
            {formatShortDate(data.firstVisit)}
          </Typography>
        </Section>
      )}

      {/* Appointments List */}
      <Section title="Termine" icon={<EventIcon fontSize="small" />}>
        {loading ? (
          <LinearProgress />
        ) : appointments.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {appointments.map(apt => (
              <Paper
                key={apt.id}
                onClick={() => onNavigate('appointment', apt.id)}
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'grey.100', borderColor: 'primary.200' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {formatDate(apt.date)}
                  </Typography>
                  <Chip
                    label={appointmentTypeLabels[apt.type] || apt.type}
                    size="small"
                    color={appointmentTypeColors[apt.type] || 'default'}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {apt.reason}
                </Typography>
              </Paper>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            Keine Termine gefunden.
          </Typography>
        )}
      </Section>

      {/* Notes */}
      {data.notes && (
        <Section title="Notizen" icon={<NotesIcon fontSize="small" />}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
            {data.notes}
          </Typography>
        </Section>
      )}
    </>
  );
}

// Document Detail View
function DocumentDetail({ data, doctors, onNavigate }: { data: Document; doctors?: Doctor[]; onNavigate: (type: DetailType, id: string) => void }) {
  const getDoctorName = (doctorId: string) => {
    const doctor = doctors?.find((d) => d.id === doctorId);
    return doctor?.name || 'Unbekannt';
  };

  const getTypeColor = (type: string) => {
    return documentTypeColors[type] || '#757575';
  };

  return (
    <>
      {/* Hero Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${getTypeColor(data.type)} 0%, ${getTypeColor(data.type)}cc 100%)`,
          borderRadius: 3,
          p: 2.5,
          mb: 3,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <DescriptionIcon />
          <Typography variant="h5" fontWeight="bold" sx={{ wordBreak: 'break-word' }}>
            {data.title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Chip
            label={data.type}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 600,
            }}
          />
          <Chip
            label={data.fileType.toUpperCase()}
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              color: 'white',
            }}
            size="small"
          />
        </Box>
      </Box>

      {/* Date */}
      <Section title="Dokumentdatum" icon={<CalendarTodayIcon fontSize="small" />}>
        <Typography variant="body1" fontWeight="medium">
          {formatShortDate(data.date)}
        </Typography>
      </Section>

      {/* Description */}
      {data.description && (
        <Section title="Beschreibung">
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {data.description}
          </Typography>
        </Section>
      )}

      {/* Doctor - Clickable */}
      {data.doctorId && (
        <Section title="Ausstellender Arzt" icon={<PersonIcon fontSize="small" />} highlight>
          <Box
            onClick={() => onNavigate('doctor', data.doctorId!)}
            sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
          >
            <Typography variant="body1" fontWeight="bold" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {getDoctorName(data.doctorId)}
              <ArrowBackIcon sx={{ transform: 'rotate(180deg)', fontSize: 16 }} />
            </Typography>
          </Box>
        </Section>
      )}

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <Section title="Tags" icon={<LabelIcon fontSize="small" />}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {data.tags.map((tag, index) => (
              <Chip key={index} label={tag} size="small" />
            ))}
          </Box>
        </Section>
      )}

      {/* File Info */}
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 2,
          bgcolor: 'grey.50',
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontWeight: 600,
            color: 'text.secondary',
            display: 'block',
            mb: 1.5,
          }}
        >
          Dateiinformationen
        </Typography>
        <Typography
          variant="body2"
          sx={{
            wordBreak: 'break-all',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: 'text.secondary',
          }}
        >
          {data.filePath}
        </Typography>
        {data.fileSize && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Größe: {(data.fileSize / 1024).toFixed(1)} KB
          </Typography>
        )}
      </Paper>
    </>
  );
}

// Main DetailDrawer Component
export default function DetailDrawer({ open, onClose, type, data, onEdit, doctors }: DetailDrawerProps) {
  const [localDoctors, setLocalDoctors] = useState<Doctor[]>(doctors || []);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Initialize history when opening with new data
  useEffect(() => {
    if (open && type && data) {
      setHistory(prev => {
        // Reset navigation history only if we are switching to a completely different root item
        if (prev.length === 0 || prev[0].data.id !== data.id) {
          return [{ type, data }];
        }
        return prev;
      });
    } else if (!open) {
      // Short delay to clear history after drawer closes
      const timer = setTimeout(() => setHistory([]), 300);
      return () => clearTimeout(timer);
    }
  }, [open, type, data]);

  // Fetch doctors if needed
  useEffect(() => {
    if (!doctors && open) {
      fetch('/api/doctors')
        .then(res => res.json())
        .then(setLocalDoctors)
        .catch(() => { });
    }
  }, [open, doctors]);

  const activeDoctors = doctors || localDoctors;

  // Current view is the last item in history
  const currentItem = history.length > 0 ? history[history.length - 1] : { type, data };

  if (!currentItem.data || !currentItem.type) return null;

  const handleNavigate = async (targetType: DetailType, targetId: string) => {
    try {
      let newData: any = null;
      if (targetType === 'doctor') {
        newData = activeDoctors.find(d => d.id === targetId);
        // If not in list, try fetching individually
        if (!newData) {
          const res = await fetch(`/api/doctors/${targetId}`);
          if (res.ok) newData = await res.json();
        }
      } else if (targetType === 'appointment') {
        const res = await fetch(`/api/appointments/${targetId}`);
        if (res.ok) newData = await res.json();
      } else if (targetType === 'medication') {
        const res = await fetch(`/api/medications/${targetId}`);
        if (res.ok) newData = await res.json();
      } else if (targetType === 'document') {
        const res = await fetch(`/api/documents/${targetId}`);
        if (res.ok) newData = await res.json();
      } else if (targetType === 'status') {
        const res = await fetch(`/api/status/${targetId}`);
        if (res.ok) newData = await res.json();
      }

      if (newData) {
        setHistory(prev => [...prev, { type: targetType, data: newData }]);
      }
    } catch (e) {
      console.error("Navigation failed", e);
    }
  };

  const handleBack = () => {
    if (history.length > 1) {
      setHistory(prev => prev.slice(0, -1));
    } else {
      onClose();
    }
  };

  const renderContent = () => {
    const { type: currentType, data: currentData } = currentItem;

    switch (currentType) {
      case 'appointment':
        return <AppointmentDetail data={currentData as Appointment} doctors={activeDoctors} onNavigate={handleNavigate} />;
      case 'medication':
        return <MedicationDetail data={currentData as Medication} doctors={activeDoctors} onNavigate={handleNavigate} />;
      case 'status':
        return <StatusDetail data={currentData as Status} />;
      case 'document':
        return <DocumentDetail data={currentData as Document} doctors={activeDoctors} onNavigate={handleNavigate} />;
      case 'doctor':
        return <DoctorDetail data={currentData as Doctor} onNavigate={handleNavigate} />;
      default:
        return null;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ zIndex: (theme) => theme.zIndex.modal + 10 }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420, md: 480 },
          maxWidth: '100%',
        },
      }}
      SlideProps={{
        appear: true,
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        {/* Header - sticky with blur effect */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1.5,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            borderBottom: 1,
            borderColor: 'grey.200',
          }}
        >
          {history.length > 1 ? (
            <IconButton onClick={handleBack} edge="start" sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
          ) : (
            <>
              {/* Desktop Button */}
              <Button
                onClick={onClose}
                startIcon={<ArrowBackIcon />}
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  color: 'text.primary',
                  fontWeight: 600,
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                Schließen
              </Button>
              {/* Mobile Icon Button */}
              <IconButton
                onClick={onClose}
                edge="start"
                sx={{
                  display: { xs: 'flex', sm: 'none' },
                  color: 'text.primary'
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </>
          )}

          {onEdit && history.length === 1 && (
            <Button
              startIcon={<EditIcon />}
              onClick={onEdit}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Bearbeiten
            </Button>
          )}
        </Box>

        {/* Content - scrollable with padding */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2.5,
            pb: 4,
            // Custom scrollbar for desktop
            '&::-webkit-scrollbar': {
              width: 6,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'grey.300',
              borderRadius: 3,
            },
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </Drawer>
  );
}
