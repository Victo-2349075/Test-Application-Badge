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
import BadgeComponent from '../../PageProfil/BadgeComponent';
import './BadgeCreateForm.css';
import Loading from '../../Loading/LoadingComponent';
import AdminSidebar from '../../layout/AdminSidebar/AdminSidebar';

/**
 *  Fonction qui vérifie si l'url est une image
 * @param {*} url
 * @returns
 */
function isImage(url) {
    return /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/.test(url);
}

const badgeDummy = {
    title: "",
    description: "",
    imagePath: null,
    category: null
};

/**
 * Fonction qui affiche et gère la création de badge
 * @param {Object} handleClose - Ferme une fenêtre
 * @param {Object} addBadge - Popup d'ajout de badge
 * @param {Object} errorBadge - Popup de modification de badge
 * @returns Le formulaire d'ajout de badge
 * @author Vincent Houle /partiellement
 * @author Philippe-Vu Beaulieu
 */
export default function BadgeCreateForm({ handleClose, addBadge, errorBadge }) {

    const [titleError, setTitleError] = useState("");
    const [descriptionError, setDescriptionError] = useState("");
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [imageUrlField, setImageUrlField] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [badge, setBadge] = useState(badgeDummy);

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Api.get('/category/').then((response) => {
            setCategories(response.data.categories);
            setLoading(false);
        }).catch((_) => {
            setLoading(false);
        });
    }, []);

    // Gère l'ouverture et la fermeture de l'image
    const handleImageDialog = () => {
        setOpenImageDialog(!openImageDialog);
    };

    // Gère la suppression de l'image
    const handleImageDelete = () => {
        setImageFile(null);
        setImageUrlField("");
        setBadge((prevState) => (
            {
                ...prevState,
                imagePath: null
            }
        ));
        handleImageDialog();
    };

    // Gère les modifications de l'image du badge
    const handleImageModify = () => {
        if (imageFile !== null) {
            setImageUrlField("");
            setBadge((prevState) => (
                {
                    ...prevState,
                    imagePath: URL.createObjectURL(imageFile)
                }
            ));
            handleImageDialog();

        } else if (isImage(imageUrlField)) {
            setImageFile(null);
            setBadge((prevState) => (
                {
                    ...prevState,
                    imagePath: imageUrlField
                }
            ));
            handleImageDialog();
        } else {
            alert('Image invalide');
        }
    };

    // Valide le titre du badge
    const validateTitle = () => {
        setTitleError("");
        if (badge.title.length === 0) {
            setTitleError('Veuillez renseigner le titre');
            return false;
        }
        return true;
    };

    // Valide la description du badge
    const validateDescription = () => {
        setDescriptionError('');
        if (badge.description.length === 0) {
            setDescriptionError('Veuillez renseigner la description');
            return false;
        }
        return true;
    };

    // Gère l'envoi vers l'api
    const handleSubmit = (event) => {
        event.preventDefault();

        if (validateTitle() && validateDescription()) {
            const formData = new FormData();
            formData.append('title', badge.title);
            formData.append('description', badge.description);
            // Si l'image est un lien ou bien un fichier
            imageFile === null || formData.append('image', imageFile);
            badge.imagePath === null || formData.append('imagePath', badge.imagePath);
            formData.append('color', badge.color);

            if (badge.category) {
                badge.category.id === undefined || formData.append('category_id', badge.category.id);
                badge.category.name === undefined || formData.append('category_name', badge.category.name);
            }

            Api.post('/badge', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then((response) => {
                    addBadge(response.data);
                })
                .catch((_) => {
                    errorBadge('Erreur lors de la création du badge');
                });

            setBadge(badgeDummy);
            handleClose();
        }
    };

    return (
        <div className="badge-create-layout">
            {/*
                Réutilisation de la barre existante du site (même style que l'administration).
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

                    <Button
                        variant="contained"
                        color="secondary"
                        sx={{ ml: 'auto' }}
                    >
                        Assigner des badges
                    </Button>
                </Toolbar>
            </AppBar>

            <div className="badge-create-main-content">
                {/*
                    Zone réservée pour une sidebar (laissée vide à la demande).
                    @author Philippe-Vu Beaulieu
                */}
                <AdminSidebar />

                <div className="badge-create-form">
                    <h1 className="badge-create-form-title">Création d'un badge</h1>

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
                                    setBadge(prevState => ({
                                        ...prevState,
                                        category: newValue
                                    }));
                                }}
                                options={Array.isArray(categories) ? categories : []}
                                getOptionLabel={(category) => category?.name ?? ""}
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
                                        onChange={e => {
                                            setImageFile(e.target.files[0]);
                                            setImageUrlField("");
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
                            // Désactive l'animation de clic (ripple) demandée sur le bouton CRÉER.
                            // @author Philippe-Vu Beaulieu
                            disableRipple
                        >
                            CRÉER
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setBadge(badgeDummy);
                                handleClose();
                            }}
                            className="badge-create-secondary-action"
                        >
                            ANNULER
                        </Button>
                    </div>
                </form>

                <div className="badge-create-form-preview">
                    <h2 className="badge-create-form-preview-title">Prévisualisation</h2>
                    <div className="badge-create-form-preview-content">
                        <div className="badge-create-form-preview-badge">
                            <BadgeComponent badge={badge} />
                            {/*
                                Centre le titre directement dans l'image de prévisualisation du badge.
                                @author Philippe-Vu Beaulieu
                            */}
                            <div className="badge-create-form-preview-badge-title">
                                {badge.title || "Badge sans titre"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
                </div>
            </div>
        </div>
    );
}
