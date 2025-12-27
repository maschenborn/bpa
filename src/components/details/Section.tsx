import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React from 'react';

// Card-style section component for mobile-first design
export default function Section({
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
