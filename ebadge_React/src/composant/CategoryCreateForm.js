import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';
import Api from '../utils/Api';
import './CategoryCreateForm.css';
import AdminSidebar from './layout/AdminSidebar/AdminSidebar';

/**
 * Composant du formulaire de création de catégorie
 * 
 * @author Alexandre del Fabbro
 * D'après le code du projet E-Badge
 * Inspiré du code de OpenAi - ChatGPT - [Modèle massif de langage] - chatpgt.com - [Consulté le 27 mars 2025]
 * Inspiré de code de Google - Gemini 2.0 Flash - [Modèle massif de langage] - VSCode Copilot chat - [Consulté le 6 avril 2025]
 */
export default function CategoryCreateForm({ addCategory, errorCategory, handleClose }) {

    // État pour stocker le nom de la catégorie
    const [categoryName, setCategoryName] = useState('');

    // État pour gérer les erreurs de validation du nom de la catégorie
    const [nameError, setNameError] = useState('');

    // État pour gérer la couleur de la catégorie
    const [categoryColor, setCategoryColor] = useState('#FFFFFF');

    /**
     * Fonction qui change la valeur du champ quand on tape dedans
     * @param {*} event 
     */
    const handleCategoryChange = (event) => {
        setCategoryName(event.target.value);
    };

    /**
     * Fonction qui change la couleur de la catégorie
     * @param {*} color 
     */
    const handleColorChange = (event) => {
        setCategoryColor(event.target.value);
    };

    /**
     * Fonction qui vérifie si le nom est valide
     * @returns boolean 
     */
    const validateName = () => {
        if (categoryName.trim().length === 0) {
            setNameError('Veuillez donner un nom à la catégorie');
            return false;
        }
        setNameError('');
        return true;
    };

    /**
     * fonction qui envoie les données au serveur
     * @param {*} event 
     */
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateName()) return;

        try {

            const formData = new FormData();
            formData.append('name', categoryName);
            formData.append('color', categoryColor);

            const response = await Api.post('/category', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            addCategory(response.data);
            handleClose();
        } catch (error) {
            errorCategory('Erreur lors de la création de la catégorie');
            console.error(error);
        }
    };

    return (
        <div className="category-create-layout">
            <AppBar position="static" className="category-create-existing-topbar">
                <Toolbar>
                    <Button
                        variant="outlined"
                        color="secondary"
                        component={Link}
                        to="/"
                        sx={{ mr: 3 }}
                        startIcon={<ArrowBackIcon />}
                    >
                        Retour au site
                    </Button>

                    <Typography variant="h6" noWrap component="div">
                        E-Badge | Administration
                    </Typography>

                    <Button variant="contained" color="secondary" sx={{ ml: 'auto' }}>
                        Assigner des badges
                    </Button>
                </Toolbar>
            </AppBar>

            <div className="category-create-main-content">
                <AdminSidebar />

                <div className="category-create-form">
                    <h1 className="category-create-form-title">Création d'une catégorie</h1>
                    <div className="category-create-form-card">
                        <form className="create-category" onSubmit={handleSubmit}>
                            <TextField
                                name="name"
                                placeholder="Nom *"
                                variant="outlined"
                                value={categoryName}
                                onChange={handleCategoryChange}
                                onBlur={validateName}
                                error={Boolean(nameError)}
                                helperText={nameError}
                                inputProps={{ maxLength: 45 }}
                                required
                                fullWidth
                            />

                            <label className="category-create-color-picker">
                                <span>Choix de couleur</span>
                                <input
                                    type="color"
                                    value={categoryColor}
                                    onChange={handleColorChange}
                                    aria-label="Choix de couleur"
                                />
                            </label>

                            <div className="category-create-form-button-submit">
                                <Button type="submit" variant="contained" className="category-create-primary-action">
                                    CRÉER
                                </Button>
                                <Button type="button" variant="outlined" onClick={handleClose} className="category-create-secondary-action">
                                    ANNULER
                                </Button>
                            </div>
                        </form>

                        <div className="category-create-preview">
                            <h2 className="category-create-preview-title">Prévisualisation</h2>
                            <div
                                className="category-create-preview-circle"
                                style={{ backgroundColor: categoryColor }}
                                aria-label="Aperçu catégorie"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
