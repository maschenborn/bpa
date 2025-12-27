import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import type { Document, Doctor } from '../../content/config';
import DocumentForm from './DocumentForm';
import DetailDrawer from '../ui/DetailDrawer';

// Icon mapping for document types
const TYPE_COLORS: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  'Befund': 'primary',
  'Labor': 'info',
  'Rezept': 'success',
  'Rechnung': 'warning',
  'Arztbrief': 'secondary',
  'Überweisung': 'primary',
  'Bildgebung': 'info',
  'Sonstiges': 'default' as any,
};

export default function DocumentsList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  // Context menu state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Detail drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDocument, setDrawerDocument] = useState<Document | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [docsRes, doctorsRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/doctors'),
      ]);
      if (!docsRes.ok) throw new Error('Fehler beim Laden der Dokumente');
      const [docs, docs2] = await Promise.all([docsRes.json(), doctorsRes.json()]);
      setDocuments(docs);
      setDoctors(docs2);
      setError(null);
      return docs;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData().then((data) => {
      // Check for edit query param
      const params = new URLSearchParams(window.location.search);
      const editId = params.get('edit');
      if (editId && data.length > 0) {
        const toEdit = data.find((d: Document) => d.id === editId);
        if (toEdit) {
          setEditingDocument(toEdit);
          setFormOpen(true);
          // Clean URL without reload
          window.history.replaceState({}, '', '/documents');
        }
      }
    });
  }, []);

  const handleAdd = () => {
    setEditingDocument(null);
    setFormOpen(true);
  };

  // Context menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, doc: Document) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedDocument(doc);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    if (selectedDocument) {
      setEditingDocument(selectedDocument);
      setFormOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedDocument) {
      setDocumentToDelete(selectedDocument);
      setDeleteConfirmOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;
    try {
      const response = await fetch(`/api/documents/${documentToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Fehler beim Löschen');
      await fetchData();
      setDeleteConfirmOpen(false);
      setDocumentToDelete(null);
      setSelectedDocument(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingDocument(null);
  };

  const handleFormSuccess = () => {
    fetchData();
    handleFormClose();
  };

  // Detail drawer handlers
  const handleCardClick = (doc: Document) => {
    setDrawerDocument(doc);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleDrawerEdit = () => {
    if (drawerDocument) {
      setEditingDocument(drawerDocument);
      setFormOpen(true);
      setDrawerOpen(false);
    }
  };

  const getDoctorName = (doctorId?: string) => {
    if (!doctorId) return null;
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.name || 'Unbekannt';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('de-DE');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dokumente
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Dokument hinzufügen
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {documents.map((doc) => (
          <Grid key={doc.id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, transform 0.2s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <CardActionArea onClick={() => handleCardClick(doc)}>
                <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                    <DescriptionIcon color="action" />
                    <Typography variant="h6" component="h2" sx={{ fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.title}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip
                      label={doc.type}
                      size="small"
                      color={TYPE_COLORS[doc.type] || 'default'}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, doc);
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                  {formatDate(doc.date)} | {doc.fileType.toUpperCase()}
                </Typography>

                {doc.description && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {doc.description}
                  </Typography>
                )}

                {doc.doctorId && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {getDoctorName(doc.doctorId)}
                    </Typography>
                  </Box>
                )}

                {doc.appointmentId && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <EventIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Verknüpft mit Termin
                    </Typography>
                  </Box>
                )}

                {doc.tags && doc.tags.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                    {doc.tags.map((tag, i) => (
                      <Chip key={i} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                )}

                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
                  {doc.filePath}
                </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {documents.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Noch keine Dokumente eingetragen.
          </Typography>
        </Box>
      )}

      {/* Context Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Bearbeiten
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Löschen
        </MenuItem>
      </Menu>

      {/* Form Dialog */}
      <Dialog open={formOpen} onClose={handleFormClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDocument ? 'Dokument bearbeiten' : 'Neues Dokument'}
        </DialogTitle>
        <DialogContent>
          <DocumentForm
            document={editingDocument}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Dokument löschen?</DialogTitle>
        <DialogContent>
          <Typography>
            Möchten Sie "{documentToDelete?.title}" wirklich löschen?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Abbrechen</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Drawer */}
      <DetailDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        type="document"
        data={drawerDocument}
        onEdit={handleDrawerEdit}
        doctors={doctors}
      />
    </Box>
  );
}
