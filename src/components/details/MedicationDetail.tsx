import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import MedicationIcon from '@mui/icons-material/Medication';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import NotesIcon from '@mui/icons-material/Notes';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import type { Medication, Doctor } from '../../content/config';
import type { DetailType } from '../ui/DetailDrawer';
import Section from './Section';
import { formatShortDate } from '../../lib/formatters';

interface MedicationDetailProps {
    data: Medication;
    doctors?: Doctor[];
    onNavigate: (type: DetailType, id: string) => void;
}

export default function MedicationDetail({ data, doctors, onNavigate }: MedicationDetailProps) {
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
