import React, { useState, useEffect, useRef } from 'react';
import { Fab, CircularProgress, Snackbar, Alert, Box, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';

export default function VoiceAssistant() {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSupported, setIsSupported] = useState(true); // Assume supported initially
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Initialize Speech Recognition
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition) {
                setIsSupported(false);
                return;
            }
            const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.lang = 'de-DE';
                recognition.interimResults = false;
                recognition.maxAlternatives = 1;

                recognition.onstart = () => {
                    setIsListening(true);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognition.onresult = async (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    console.log('Recognized:', transcript);
                    handleVoiceInput(transcript);
                };

                recognition.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    setFeedback({ message: 'Spracherkennung fehlgeschlagen: ' + event.error, type: 'error' });
                    setIsListening(false);
                };

            recognitionRef.current = recognition;
        }
    }, []);

    const handleVoiceInput = async (text: string) => {
        setIsProcessing(true);
        setFeedback({ message: 'Verarbeite: "' + text + '"...', type: 'info' });

        try {
            const response = await fetch('/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setFeedback({ message: result.message, type: 'success' });
                // Optional: Refresh page or data after a short delay
                if (result.action) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            } else {
                setFeedback({ message: result.message || 'Konnte die Anfrage nicht verarbeiten.', type: 'error' });
            }
        } catch (error) {
            setFeedback({ message: 'Verbindungsfehler zum Assistenten.', type: 'error' });
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            setFeedback({ message: 'Spracherkennung in diesem Browser nicht verfügbar.', type: 'error' });
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    // Don't render if speech recognition is not supported
    if (!isSupported) {
        return null;
    }

    return (
        <>
            <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 9999 }}>
                <Fab
                    color={isListening ? "error" : "primary"}
                    aria-label="voice assistant"
                    onClick={toggleListening}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : isListening ? (
                        <StopIcon />
                    ) : (
                        <MicIcon />
                    )}
                </Fab>
            </Box>

            <Snackbar
                open={!!feedback}
                autoHideDuration={6000}
                onClose={() => setFeedback(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setFeedback(null)}
                    severity={feedback?.type || 'info'}
                    sx={{ width: '100%' }}
                >
                    {feedback?.message}
                </Alert>
            </Snackbar>
        </>
    );
}
