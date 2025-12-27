export const appointmentTypeLabels: Record<string, string> = {
    consultation: 'Beratung',
    treatment: 'Behandlung',
    followup: 'Nachsorge',
    emergency: 'Notfall',
    surgery: 'Operation',
    imaging: 'Bildgebung',
    phone: 'Telefon-Kontakt',
    email: 'E-Mail-Kontakt',
};

export const appointmentTypeColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    consultation: 'info',
    treatment: 'primary',
    followup: 'success',
    emergency: 'error',
    surgery: 'warning',
    imaging: 'secondary',
    phone: 'info',
    email: 'info',
};

export const moodLabels: Record<string, string> = {
    good: 'Gut',
    okay: 'Okay',
    bad: 'Schlecht',
    terrible: 'Sehr schlecht',
};

export const documentTypeColors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
    'Befund': 'primary',
    'Labor': 'info',
    'Rezept': 'success',
    'Rechnung': 'warning',
    'Arztbrief': 'secondary',
    'Überweisung': 'primary',
    'Bildgebung': 'info',
};
