import { useState, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
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

const moodColors: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
  good: 'success',
  okay: 'info',
  bad: 'warning',
  terrible: 'error',
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

// Compact info row for key-value display
function InfoRow({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        py: 1,
        '&:not(:last-child)': {
          borderBottom: '1px solid',
          borderColor: 'grey.200',
        },
      }}
    >
      {icon && (
        <Box sx={{ color: 'text.secondary', mt: 0.2, flexShrink: 0 }}>
          {icon}
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

// Appointment Detail View
function AppointmentDetail({ data, doctors }: { data: Appointment; doctors?: Doctor[] }) {
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
          background: 'linear-gradient(135deg, #fa5f46 0%, #ff8a75 100%)',
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

      {/* Doctor Card */}
      <Section title="Behandelnder Arzt" icon={<PersonIcon fontSize="small" />} highlight>
        <Typography variant="body1" fontWeight="bold" color="primary.main">
          {getDoctorName(data.doctorId)}
        </Typography>
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
function MedicationDetail({ data, doctors }: { data: Medication; doctors?: Doctor[] }) {
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

      {/* Prescribing Doctor */}
      {data.prescribingDoctorId && (
        <Section title="Verschrieben von" icon={<PersonIcon fontSize="small" />}>
          <Typography variant="body1" fontWeight="medium" color="primary.main">
            {getDoctorName(data.prescribingDoctorId)}
          </Typography>
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
  const getPainColor = (level: number): 'success' | 'info' | 'warning' | 'error' => {
    if (level <= 2) return 'success';
    if (level <= 4) return 'info';
    if (level <= 6) return 'warning';
    return 'error';
  };

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

// Document Detail View
function DocumentDetail({ data, doctors }: { data: Document; doctors?: Doctor[] }) {
  const getDoctorName = (doctorId?: string) => {
    if (!doctorId) return null;
    const doctor = doctors?.find((d) => d.id === doctorId);
    return doctor?.name || 'Unbekannt';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Befund': '#1976d2',
      'Labor': '#0288d1',
      'Rezept': '#2e7d32',
      'Rechnung': '#ed6c02',
      'Arztbrief': '#9c27b0',
      'Überweisung': '#1976d2',
      'Bildgebung': '#00838f',
    };
    return colors[type] || '#757575';
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

      {/* Doctor */}
      {data.doctorId && (
        <Section title="Ausstellender Arzt" icon={<PersonIcon fontSize="small" />} highlight>
          <Typography variant="body1" fontWeight="bold" color="primary.main">
            {getDoctorName(data.doctorId)}
          </Typography>
        </Section>
      )}

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <Section title="Tags">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {data.tags.map((tag, idx) => (
              <Chip
                key={idx}
                label={tag}
                size="small"
                sx={{
                  bgcolor: 'primary.50',
                  color: 'primary.dark',
                  border: '1px solid',
                  borderColor: 'primary.200',
                  fontWeight: 500,
                }}
              />
            ))}
          </Box>
        </Section>
      )}

      {/* File Info */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: 'grey.100',
          border: '1px solid',
          borderColor: 'grey.300',
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
            mb: 1,
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

// Doctor Detail View
function DoctorDetail({ data }: { data: Doctor }) {
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

// Main DetailDrawer Component
export default function DetailDrawer({ open, onClose, type, data, onEdit, doctors }: DetailDrawerProps) {
  const [localDoctors, setLocalDoctors] = useState<Doctor[]>(doctors || []);

  // Fetch doctors if not provided and needed
  useEffect(() => {
    if (!doctors && open && (type === 'appointment' || type === 'medication' || type === 'document')) {
      fetch('/api/doctors')
        .then(res => res.json())
        .then(setLocalDoctors)
        .catch(() => {});
    }
  }, [open, type, doctors]);

  const activeDoctors = doctors || localDoctors;

  if (!data || !type) return null;

  const renderContent = () => {
    switch (type) {
      case 'appointment':
        return <AppointmentDetail data={data as Appointment} doctors={activeDoctors} />;
      case 'medication':
        return <MedicationDetail data={data as Medication} doctors={activeDoctors} />;
      case 'status':
        return <StatusDetail data={data as Status} />;
      case 'document':
        return <DocumentDetail data={data as Document} doctors={activeDoctors} />;
      case 'doctor':
        return <DoctorDetail data={data as Doctor} />;
      default:
        return null;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
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
          <Button
            onClick={onClose}
            startIcon={<ArrowBackIcon />}
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            Zurück
          </Button>
          {onEdit && (
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
