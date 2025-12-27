import { useState, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import type { Appointment, Medication, Status, Document, Doctor } from '../../content/config';

// Import extracted components
import AppointmentDetail from '../details/AppointmentDetail';
import MedicationDetail from '../details/MedicationDetail';
import StatusDetail from '../details/StatusDetail';
import DocumentDetail from '../details/DocumentDetail';
import DoctorDetail from '../details/DoctorDetail';

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
