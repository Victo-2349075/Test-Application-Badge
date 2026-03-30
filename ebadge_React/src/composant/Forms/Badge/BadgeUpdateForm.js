import React, { useEffect, useState } from 'react';
import '@mui/material';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    TextField,
    Autocomplete,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogContentText,
    Alert
} from '@mui/material';
import { PhotoCamera, Check } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';
import Api from '../../../utils/Api';
import './BadgeCreateForm.css';
import BadgeComponent from '../../PageProfil/BadgeComponent';
import Loading from '../../Loading/LoadingComponent';
import AdminSidebar from '../../layout/AdminSidebar/AdminSidebar';

function isImage(url) {
    return /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/.test(url);
}

/**
 * Formulaire de modification de badge.
 * @author Vincent Houle /partiellement
 * @author Philippe-Vu Beaulieu
 */
export default function BadgeUpdateForm({ handleClose, editBadge, selectedBadge, errorBadge }) {
    const badgeDummy = structuredClone(selectedBadge);
    const [titleError, setTitleError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [imageUrlField, setImageUrlField] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [badge, setBadge] = useState(badgeDummy);

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Api.get('/category/').then((response) => {
            setCategories(response.data.categories);

            Api.get(`/badge/category/name/${selectedBadge.id}`).then((categoryResponse) => {
                setLoading(false);
                if (categoryResponse.data !== null) {
                    setBadge((prevState) => ({
                        ...prevState,
                        category: categoryResponse.data
                    }));
                }
            }).catch((_) => {
                setLoading(false);
                errorBadge("Erreur lors de la sélection de la catégorie du badge.");
            });
        }).catch((_) => {
            setLoading(false);
            errorBadge('Erreur lors de la recherche des catégories.');
        });
    }, [selectedBadge.id, errorBadge]);

    const handleImageDialog = () => {
        setOpenImageDialog(!openImageDialog);
    };

    const handleImageDelete = () => {
        setImageFile(null);
        setImageUrlField('');
        setBadge((prevState) => ({
            ...prevState,
            imagePath: null
        }));
        handleImageDialog();
    };

    const handleImageModify = () => {
        if (imageFile !== null) {
            setImageUrlField('');
            setBadge((prevState) => ({
                ...prevState,
                imagePath: URL.createObjectURL(imageFile)
            }));
            handleImageDialog();
        } else if (isImage(imageUrlField)) {
            setImageFile(null);
            setBadge((prevState) => ({
                ...prevState,
                imagePath: imageUrlField
            }));
            handleImageDialog();
        } else {
            alert('Image invalide');
        }
    };

    const validateTitle = () => {
        setTitleError('');
        if (badge.title.length === 0) {
            setTitleError('Veuillez renseigner le titre');
            return false;
        }
        return true;
    };

    const validateDescription = () => {
        setDescriptionError('');
        if (badge.description.length === 0) {
            setDescriptionError('Veuillez renseigner la description');
            return false;
        }
        return true;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (validateTitle() && validateDescription()) {
            const formData = new FormData();
            formData.append('id', badge.id);
            formData.append('title', badge.title);
            formData.append('description', badge.description);
            imageFile === null || formData.append('image', imageFile);
            badge.imagePath === null || formData.append('imagePath', badge.imagePath);

            if (badge.category) {
                badge.category.id === undefined || formData.append('category_id', badge.category.id);
                badge.category.name === undefined || formData.append('category_name', badge.category.name);
            }

            Api.post('/badge/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then((response) => {
                editBadge(response.data);
            }).catch((_) => {
                errorBadge('Erreur lors de la modification du badge');
            });

            handleClose();
        }
    };

    return (
        <div className="badge-create-layout">
            {/*
                Barre réutilisée et même structure que l'écran de création.
                @author Philippe-Vu Beaulieu
            */}
            <AppBar position="static" className="badge-create-existing-topbar">
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

            <div className="badge-create-main-content">
                <AdminSidebar />

                <div className="badge-create-form">
                    <h1 className="badge-create-form-title">Modifier un badge</h1>

                    <div className="badge-create-form-card">
                        <form className='create-badge'>
                            <TextField
                                id="title"
                                name="title"
                                placeholder="Titre *"
                                variant="outlined"
                                value={badge.title}
                                onChange={(e) => {
                                    setBadge((prevState) => ({
                                        ...prevState,
                                        title: e.target.value
                                    }));
                                }}
                                onBlur={validateTitle}
                                error={titleError.length > 0}
                                helperText={titleError}
                                inputProps={{ maxLength: 45 }}
                                required
                                fullWidth
                            />

                            <TextField
                                id="description"
                                name="description"
                                placeholder="Descriptions *"
                                variant="outlined"
                                multiline
                                rows={3}
                                value={badge.description}
                                inputProps={{ maxLength: 255 }}
                                onChange={(e) => {
                                    setBadge((prevState) => ({
                                        ...prevState,
                                        description: e.target.value
                                    }));
                                }}
                                onBlur={validateDescription}
                                error={descriptionError.length > 0}
                                helperText={descriptionError}
                                required
                                fullWidth
                            />

                            <div className='badge-create-form-category-selector'>
                                {loading ? <Loading /> :
                                    <Autocomplete
                                        value={badge.category}
                                        onChange={(_, newValue) => {
                                            setBadge((prevState) => ({
                                                ...prevState,
                                                category: newValue
                                            }));
                                        }}
                                        options={Array.isArray(categories) ? categories : []}
                                        getOptionLabel={(category) => category?.name ?? ''}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        renderInput={(params) => <TextField {...params} placeholder="Catégories" />}
                                    />
                                }
                            </div>

                            <Button
                                variant="outlined"
                                color='secondary'
                                onClick={handleImageDialog}
                                className="badge-create-image-button"
                                startIcon={<PhotoCamera />}
                            >
                                AJOUTER UNE IMAGE
                            </Button>

                            <Dialog open={openImageDialog} onClose={handleImageDialog}>
                                <DialogTitle>Modifier l'image du badge</DialogTitle>
                                <DialogContent>
                                    <DialogContentText>
                                        Pour changer l'image du badge, veuillez entrer l'URL de l'image.
                                    </DialogContentText>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        name='imagePath'
                                        label="URL"
                                        type="url"
                                        fullWidth
                                        variant="standard"
                                        defaultValue={imageUrlField}
                                        inputProps={{ maxLength: 2048 }}
                                        onChange={(e) => {
                                            setImageUrlField(e.target.value);
                                            setImageFile(null);
                                        }}
                                    />
                                    <br />
                                    <br />
                                    <DialogContentText>
                                        Vous pouvez également importer une image.
                                    </DialogContentText>
                                    <br />
                                    <div className="rowButtons">
                                        <Button variant="contained" component="label">
                                            Importer une image
                                            <input
                                                type="file"
                                                accept="image/png, image/jpeg"
                                                hidden
                                                onChange={(e) => {
                                                    setImageFile(e.target.files[0]);
                                                    setImageUrlField('');
                                                }}
                                            />
                                        </Button>
                                        <Button className="deleteButton" variant="contained" component="label" onClick={handleImageDelete}>
                                            Supprimer l'image
                                        </Button>
                                    </div>
                                    <div hidden={imageFile === null}>
                                        <Check /> Image importée
                                    </div>
                                    <div className="hiddenAlert">
                                        <Alert variant="filled" severity="error">
                                            L'url de l'image n'est pas valide.
                                        </Alert>
                                    </div>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={handleImageModify}>Modifier</Button>
                                    <Button onClick={handleImageDialog}>Annuler</Button>
                                </DialogActions>
                            </Dialog>

                            <div className="badge-create-form-button-submit">
                                <Button
                                    onClick={handleSubmit}
                                    variant="contained"
                                    className="badge-create-primary-action"
                                    // Désactive l'animation de clic (ripple) demandée sur le bouton MODIFIER.
                                    // @author Philippe-Vu Beaulieu
                                    disableRipple
                                >
                                    MODIFIER
                                </Button>
                                <Button variant="outlined" onClick={handleClose} className="badge-create-secondary-action">
                                    ANNULER
                                </Button>
                            </div>
                        </form>

                        <div className="badge-create-form-preview">
                            <h2 className="badge-create-form-preview-title">Prévisualisation</h2>
                            <div className="badge-create-form-preview-content">
                                <BadgeComponent badge={badge} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
