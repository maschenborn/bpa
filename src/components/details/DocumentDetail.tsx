import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import LabelIcon from '@mui/icons-material/Label';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import type { Document, Doctor } from '../../content/config';
import type { DetailType } from '../ui/DetailDrawer';
import Section from './Section';
import { formatShortDate } from '../../lib/formatters';
import { documentTypeColors } from '../../lib/constants';

interface DocumentDetailProps {
    data: Document;
    doctors?: Doctor[];
    onNavigate: (type: DetailType, id: string) => void;
}

export default function DocumentDetail({ data, doctors, onNavigate }: DocumentDetailProps) {
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
