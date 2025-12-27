import { useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

interface EditDrawerProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function EditDrawer({ open, onClose, title, children }: EditDrawerProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Reset scroll on close
    useEffect(() => {
        if (!open) {
            window.scrollTo(0, 0);
        }
    }, [open]);

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{ zIndex: (theme) => theme.zIndex.modal + 10 }}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 500, md: 600 }, // Slightly wider than detail drawer for forms
                    maxWidth: '100vw',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                }}
            >
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                    {title}
                </Typography>
                <IconButton
                    onClick={onClose}
                    edge="end"
                    sx={{ color: 'inherit' }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
                {children}
            </Box>
        </Drawer>
    );
}
