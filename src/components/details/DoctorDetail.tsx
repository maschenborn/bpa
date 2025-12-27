import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventIcon from '@mui/icons-material/Event';
import NotesIcon from '@mui/icons-material/Notes';
import LinearProgress from '@mui/material/LinearProgress';

import type { Doctor, Appointment } from '../../content/config';
import type { DetailType } from '../ui/DetailDrawer';
import Section from './Section';
import { formatDate, formatShortDate } from '../../lib/formatters';
import { appointmentTypeLabels, appointmentTypeColors } from '../../lib/constants';

interface DoctorDetailProps {
    data: Doctor;
    onNavigate: (type: DetailType, id: string) => void;
}

export default function DoctorDetail({ data, onNavigate }: DoctorDetailProps) {
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
