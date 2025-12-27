import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotesIcon from '@mui/icons-material/Notes';

import type { Status } from '../../content/config';
import Section from './Section';
import { formatDate } from '../../lib/formatters';
import { moodLabels } from '../../lib/constants';

interface StatusDetailProps {
    data: Status;
}

export default function StatusDetail({ data }: StatusDetailProps) {
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
