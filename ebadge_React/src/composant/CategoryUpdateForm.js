import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';
import Api from '../utils/Api.js';
import './CategoryCreateForm.css';
import AdminSidebar from './layout/AdminSidebar/AdminSidebar';
import BadgeComponent from './PageProfil/BadgeComponent';

/**
 * Composant du formulaire de modification d'une catégorie
 */
export default function CategoryUpdateForm({ selectedCategory, editCategory, errorCategory, handleClose }) {
    const [category, setCategory] = useState({
        id: 0,
        name: '',
        color: '#FFFFFF'
    });

    const [nameError, setNameError] = useState('');

    useEffect(() => {
        if (selectedCategory) {
            setCategory(selectedCategory);
        }
    }, [selectedCategory]);

    const handleCategoryChange = (event) => {
        const { name, value } = event.target;
        setCategory((prev) => ({ ...prev, [name]: value }));
    };

    const handleColorChange = (event) => {
        setCategory((prev) => ({ ...prev, color: event.target.value }));
    };

    const validateName = () => {
        if (!category.name.trim()) {
            setNameError('Veuillez donner un nom à la catégorie.');
            return false;
        }
        setNameError('');
        return true;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!validateName()) return;

        Api.put('/category', category)
            .then((response) => {
                editCategory(response.data);
                handleClose();
            })
            .catch((error) => {
                console.error(error);
                errorCategory('Une erreur est survenue');
            });
    };

    const isUnchanged = category.name === selectedCategory?.name && category.color === selectedCategory?.color;

    const categoryPreviewBadge = {
        title: category.name || 'Catégorie',
        description: '',
        category_color: category.color,
        imagePath: null,
        creator_name: '',
        creator_last_name: ''
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
                    <h1 className="category-create-form-title">Modifier une catégorie</h1>
                    <div className="category-create-form-card">
                        <form className="create-category" onSubmit={handleSubmit}>
                            <TextField
                                id="name"
                                name="name"
                                placeholder="Nom *"
                                variant="outlined"
                                value={category.name}
                                onChange={handleCategoryChange}
                                onBlur={validateName}
                                error={!!nameError}
                                helperText={nameError}
                                inputProps={{ maxLength: 45 }}
                                required
                                fullWidth
                            />

                            <label className="category-create-color-picker">
                                <span>Choix de couleur</span>
                                <input
                                    type="color"
                                    value={category.color}
                                    onChange={handleColorChange}
                                    aria-label="Choix de couleur"
                                />
                            </label>

                            <div className="category-create-form-button-submit">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    className="category-create-primary-action"
                                    disabled={isUnchanged}
                                >
                                    MODIFIER
                                </Button>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={handleClose}
                                    className="category-create-secondary-action"
                                >
                                    ANNULER
                                </Button>
                            </div>
                        </form>

                        <div className="category-create-preview">
                            <h2 className="category-create-preview-title">Prévisualisation</h2>
                            <div className="category-create-preview-content">
                                <div className="category-create-preview-badge">
                                    <BadgeComponent badge={categoryPreviewBadge} showDetails={false} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
