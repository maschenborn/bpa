import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import type { Document, Doctor } from '../../content/config';
import DocumentForm from './DocumentForm';

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingDocument(null);
    setFormOpen(true);
  };

  const handleEdit = (doc: Document) => {
    setEditingDocument(doc);
    setFormOpen(true);
  };

  const handleDeleteClick = (doc: Document) => {
    setDocumentToDelete(doc);
    setDeleteConfirmOpen(true);
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
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionIcon color="action" />
                    <Typography variant="h6" component="h2" sx={{ fontSize: '1.1rem' }}>
                      {doc.title}
                    </Typography>
                  </Box>
                  <Chip
                    label={doc.type}
                    size="small"
                    color={TYPE_COLORS[doc.type] || 'default'}
                  />
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

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <IconButton size="small" onClick={() => handleEdit(doc)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteClick(doc)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
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
    </Box>
  );
}
