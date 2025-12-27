import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import NotesIcon from '@mui/icons-material/Notes';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import type { Appointment, Doctor } from '../../content/config';
import type { DetailType } from '../ui/DetailDrawer'; // We'll need to export this or move it
import Section from './Section';
import { formatDate, formatShortDate } from '../../lib/formatters';
import { appointmentTypeLabels } from '../../lib/constants';

interface AppointmentDetailProps {
    data: Appointment;
    doctors?: Doctor[];
    onNavigate: (type: DetailType, id: string) => void;
}

export default function AppointmentDetail({ data, doctors, onNavigate }: AppointmentDetailProps) {
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
