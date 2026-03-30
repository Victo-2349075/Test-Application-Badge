import React, { useState } from 'react';
import { Button } from '@mui/material';
import './ImageDropZone.css';

// zone de selection d'image par clic ou drag and drop
// inputId doit etre unique sur la page si plusieurs zones sont presentes en meme temps
export default function ImageDropZone({ onFileSelected, onDelete, hasImage, inputId }) {

    const [error, setError] = useState('');
    const [dragging, setDragging] = useState(false);

    // valide le format et la taille du fichier, puis appelle le callback parent
    const validateAndSelect = (file) => {
        if (!file) return;

        const formatValide = ['image/png', 'image/jpeg'].includes(file.type);
        const tailleValide = file.size <= 2 * 1024 * 1024;

        if (!formatValide) {
            setError('Format invalide. Utilisez PNG ou JPG.');
            return;
        }
        if (!tailleValide) {
            setError('Image trop lourde. Maximum 2 Mo.');
            return;
        }

        setError('');
        onFileSelected(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        validateAndSelect(e.dataTransfer.files[0]);
    };

    return (
        <div className="image-drop-zone-container">
            <div
                className={`image-drop-zone ${dragging ? 'image-drop-zone--active' : ''}`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onClick={() => document.getElementById(inputId).click()}
            >
                <span>
                    {hasImage
                        ? 'Image sélectionnée — cliquez pour changer'
                        : 'Cliquez ou glissez une image ici'}
                </span>
                <span className="image-drop-zone-hint">PNG ou JPG — max 2 Mo</span>

                {/* le champ file est caché, il est déclenché par le clic sur la zone */}
                <input
                    id={inputId}
                    type="file"
                    accept="image/png, image/jpeg"
                    hidden
                    onChange={(e) => validateAndSelect(e.target.files[0])}
                    onClick={(e) => { e.target.value = null; }}
                />
            </div>

            {error && <p className="image-drop-zone-error">{error}</p>}

            {hasImage && onDelete && (
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={onDelete}
                    sx={{ mt: 1 }}
                >
                    Supprimer l'image
                </Button>
            )}
        </div>
    );
}
