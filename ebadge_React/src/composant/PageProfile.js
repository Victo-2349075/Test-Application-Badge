import React, { useContext, useEffect, useMemo, useState } from 'react';
import './PageProfile.css';
import {
  FormControl,
  Button,
  Autocomplete,
  Avatar,
  Typography,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import Api from '../utils/Api';
import Loading from './Loading/LoadingComponent';
import { Check, Edit, Lock, LockOpen, Add } from '@mui/icons-material';
import ConfirmationPopup from './Dashboard/Popups/ConfirmationPopup/ConfirmationPopup';
import { TRANSITION_DURATION } from '../theme';
import { RoleIds } from '../policies/Role';
import { DataGrid } from '@mui/x-data-grid';
import { BadgeListContext } from '../context/BadgeListContext';

function isImage(url) {
  return /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/.test(url);
}

export const badgeQuantity = 3;

export default function PageProfile() {
  const [badgeIdToFavorite, setBadgeIdToFavorite] = useState(0);
  const [badgeIdToFavoriteErrorMessage, setBadgeIdToFavoriteErrorMessage] =
    useState('');
  // Quel slot de badge est en cours de modification (0, 1 ou 2)
  const [editingBadgeSlot, setEditingBadgeSlot] = useState(null);

  const { currentFavoriteBadges, updateFavoriteBadges } =
    useContext(BadgeListContext);
  const { userContext, setUserContext } = useContext(BadgeListContext);
  const [otherBadges, setOtherBadges] = useState([]);
  const [openBackground, setOpenBackground] = useState(false);
  const [openBadges, setOpenBadges] = useState(false);
  const [openConfirmationPopup, setOpenConfirmationPopup] = useState(false);
  const [confirmPrivacyMessage, setConfirmPrivacyMessage] = useState(null);
  const [openAvatar, setOpenAvatar] = useState(false);
  const [avatarUrlField, setAvatarUrlField] = useState('');
  const [avatarImageFile, setAvatarImageFile] = useState(null);
  const [user, setUser] = useState({});
  const [backgroundUrlField, setBackgroundUrlField] = useState('');
  const [backgroundImageFile, setBackgroundImageFile] = useState(null);
  const [loadingBadge, setLoadingBadge] = useState(false);
  const { loaded, setLoaded } = useContext(BadgeListContext);

  // Citation modifiable
  const [citation, setCitation] = useState(
    () =>
      localStorage.getItem('profile_citation') ||
      'La persévérance vient à bout de tout.',
  );
  const [editingCitation, setEditingCitation] = useState(false);
  const [citationDraft, setCitationDraft] = useState('');

  const columns = useMemo(
    () => [
      {
        field: 'imagePath',
        headerName: 'Image',
        width: 70,
        renderCell: (params) => (
          <Avatar alt={params.row.title} src={params.row.imagePath} />
        ),
      },
      { field: 'title', headerName: 'Titre', flex: 1 },
      {
        field: 'removeBadgeAction',
        minWidth: 200,
        headerName: '',
        sortable: false,
        renderCell: (params) => {
          const onClick = () => {
            setLoadingBadge(false);
            Api.put(
              '/user/changeFavoriteBadge',
              { badge_id: params.row.id, user_id: user.id, favorite: 0 },
              { headers: { 'Content-Type': 'application/json' } },
            )
              .then(() => refreshBadges())
              .catch(console.error);
          };
          return (
            <Button variant="outlined" onClick={onClick}>
              retirer le badge
            </Button>
          );
        },
      },
    ],
    [user],
  );

  useEffect(() => {
    setLoaded(true);
    Api.get('/auth/current_user')
      .then((response) => {
        if (response.data.avatarImagePath == null)
          response.data.avatarImagePath = '/images/basicAvatar.webp';
        if (response.data.backgroundImagePath == null)
          response.data.backgroundImagePath = '/images/background.webp';
        setUser(response.data);
        setUserContext(response.data.id);
        updatePrivacyMessage();
        updateFavoriteBadges();
        Api.get('/user/' + response.data.id + '/notFavoriteBadges')
          .then((res) => {
            setOtherBadges(res.data.badges);
            setLoadingBadge(true);
          })
          .catch(console.error);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    updateFavoriteBadges();
  }, [userContext]);

  function updatePrivacyMessage() {
    setConfirmPrivacyMessage(
      <p id="privacyMessage">
        Un compte privé ne sera pas visible dans les classements et ne sera pas
        accessible par les autres utilisateurs.
        <br />
        <br />
        Voulez-vous vraiment rendre votre compte{' '}
        {user.privacy ? 'public' : 'privé'} ?
      </p>,
    );
  }

  function handleOpenPrivacyConfirmationPopup() {
    setOpenConfirmationPopup(true);
  }

  function handleClosePrivacyConfirmationPopup() {
    setOpenConfirmationPopup(false);
  }

  function handleConfirmPrivacyChange() {
    const isAnonymous = !user.privacy;
    setOpenConfirmationPopup(false);
    setUser({ ...user, privacy: isAnonymous });
    setTimeout(updatePrivacyMessage, TRANSITION_DURATION);
    Api.post('/user/edit-privacy', { privacy: isAnonymous }).catch(
      console.error,
    );
  }

  function handleClickOpen() {
    setOpenBackground(true);
  }
  function handleClose() {
    setOpenBackground(false);
  }

  // Ouvre le popup badge en mémorisant quel slot est cliqué
  function handleClickBadgeSlot(slotIndex) {
    setEditingBadgeSlot(slotIndex);
    setOpenBadges(true);
  }

  function handleCloseBadge() {
    setBadgeIdToFavorite(0);
    setEditingBadgeSlot(null);
    setOpenBadges(false);
  }

  function handleModify() {
    if (backgroundImageFile != null) {
      let formData = new FormData();
      formData.append('background', backgroundImageFile);
      Api.post('/user/edit-background', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
        .then((response) => {
          setOpenBackground(false);
          setUser({ ...user, backgroundImagePath: response.data.url });
        })
        .catch(console.error);
      setBackgroundImageFile(null);
    } else if (isImage(backgroundUrlField)) {
      setOpenBackground(false);
      setUser({ ...user, backgroundImagePath: backgroundUrlField });
      Api.post('/user/edit-background', {
        backgroundUrl: user.backgroundImagePath,
      }).catch(console.error);
    }
    setBackgroundImageFile(null);
  }

  function handleDelete() {
    setUser({ ...user, backgroundImagePath: '/images/background.webp' });
    setOpenBackground(false);
  }

  function handleClickOpenAvatar() {
    setOpenAvatar(true);
  }
  function handleCloseAvatar() {
    setOpenAvatar(false);
  }

  function handleModifyAvatar() {
    if (avatarImageFile != null) {
      let formData = new FormData();
      formData.append('avatar', avatarImageFile);
      Api.post('/user/edit-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
        .then((response) => {
          setUser({ ...user, avatarImagePath: response.data.url });
          setOpenAvatar(false);
        })
        .catch(console.error);
    } else if (isImage(avatarUrlField)) {
      setUser({ ...user, avatarImagePath: avatarUrlField });
      setOpenAvatar(false);
      Api.post('/user/edit-avatar', { avatarUrl: avatarUrlField }).catch(
        console.error,
      );
    }
    setAvatarImageFile(null);
  }

  function handleDeleteAvatar() {
    setUser({ ...user, avatarImagePath: '/images/basicAvatar.webp' });
    setOpenAvatar(false);
  }

  function handleOpenPrivacy() {
    setOpenConfirmationPopup(true);
  }

  function handleSubmit() {
    if (badgeIdToFavorite === 0) {
      setBadgeIdToFavoriteErrorMessage('Veuillez sélectionner un badge');
      return;
    }
    setBadgeIdToFavoriteErrorMessage('');
    Api.put(
      '/user/changeFavoriteBadge',
      { badge_id: badgeIdToFavorite, user_id: user.id, favorite: 1 },
      { headers: { 'Content-Type': 'application/json' } },
    )
      .then(() => refreshBadges())
      .catch(console.error);
    setBadgeIdToFavorite(0);
    setLoadingBadge(false);
  }

  function refreshBadges() {
    updateFavoriteBadges();
    Api.get('/user/' + user.id + '/notFavoriteBadges')
      .then((res) => {
        setOtherBadges(res.data.badges);
        setLoadingBadge(true);
      })
      .catch(console.error);
  }

  // Gestion de la citation
  function handleStartEditCitation() {
    setCitationDraft(citation);
    setEditingCitation(true);
  }

  function handleSaveCitation() {
    setCitation(citationDraft);
    localStorage.setItem('profile_citation', citationDraft);
    setEditingCitation(false);
  }

  function handleCancelCitation() {
    setEditingCitation(false);
  }

  // Génère les 3 slots de badges (remplis ou vides)
  const badgeSlots = Array.from({ length: badgeQuantity }, (_, i) => {
    return currentFavoriteBadges?.[i] || null;
  });

  return (
    <div
      className="profile-background"
      style={{ backgroundImage: `url(${user.backgroundImagePath})` }}
    >
      {/* Bouton modifier l'arrière-plan (discret, coin haut droit) */}
      <button
        className="edit-background-btn"
        onClick={handleClickOpen}
        title="Modifier l'arrière-plan"
      >
        <Edit fontSize="small" />
      </button>

      {/* Carte profil principale */}
      <div className="profile-card">
        {/* Section haute : avatar + infos */}
        <div className="profile-header">
          {/* Avatar cliquable */}
          <div
            className="avatar-wrapper"
            onClick={handleClickOpenAvatar}
            title="Modifier l'avatar"
          >
            <img
              className="profile-avatar"
              src={user?.avatarImagePath || '/images/basicAvatar.webp'}
              alt="avatar"
            />
            <div className="avatar-overlay">
              <Edit className="avatar-edit-icon" />
            </div>
          </div>

          {/* Nom + citation */}
          <div className="profile-info">
            <h2 className="profile-name">
              {user.first_name} {user.last_name}
            </h2>

            {editingCitation ? (
              <div className="citation-edit">
                <TextField
                  variant="standard"
                  value={citationDraft}
                  onChange={(e) => setCitationDraft(e.target.value)}
                  inputProps={{ maxLength: 120 }}
                  fullWidth
                  autoFocus
                  className="citation-input"
                />
                <div className="citation-actions">
                  <Button
                    size="small"
                    onClick={handleSaveCitation}
                    variant="contained"
                  >
                    Enregistrer
                  </Button>
                  <Button size="small" onClick={handleCancelCitation}>
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="citation-display"
                onClick={handleStartEditCitation}
                title="Modifier la citation"
              >
                <span className="citation-text">« {citation} »</span>
                <Edit className="citation-edit-icon" fontSize="small" />
              </div>
            )}
          </div>
        </div>

        {/* Pied de carte : bouton privé */}
        {user.role_id === RoleIds.Student && (
          <div className="profile-footer">
            <button
              className={`privacy-btn ${user.privacy ? 'privacy-btn--private' : 'privacy-btn--public'}`}
              onClick={handleOpenPrivacy}
            >
              {user.privacy ? (
                <Lock fontSize="small" />
              ) : (
                <LockOpen fontSize="small" />
              )}
              {user.privacy ? 'Profil privé' : 'Mettre le profil privé'}
            </button>
          </div>
        )}
      </div>

      {/* Badges épinglés */}
      {user.role_id === RoleIds.Student && (
        <div className="BadgeArray">
          <div className="pinned-badges-section">
            <p className="pinned-badges-label">Badges épinglés</p>
            <div className="pinned-badges-row">
              {badgeSlots.map((badge, index) => (
                <div key={index} className="badge-slot">
                  {badge ? (
                    <>
                      <div className="badge-avatar-wrapper">
                        <Avatar
                          alt={badge.title}
                          src={badge.imagePath}
                          className="badge-avatar"
                          sx={{ width: 100, height: 100 }}
                        />
                        <div className="badge-tooltip">
                          <strong>{badge.title}</strong>
                          {badge.description && <p>{badge.description}</p>}
                        </div>
                      </div>
                      <span className="badge-title">{badge.title}</span>
                    </>
                  ) : (
                    <div className="badge-empty" />
                  )}
                  <button
                    className="badge-add-btn"
                    onClick={() => handleClickBadgeSlot(index)}
                    title={badge ? 'Modifier ce badge' : 'Épingler un badge'}
                  >
                    <Add fontSize="small" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Dialogs (inchangés dans leur logique) ── */}

      {/* Dialog arrière-plan */}
      <Dialog open={openBackground} onClose={handleClose}>
        <DialogTitle>Modifier l'arrière plan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Pour changer l'arrière-plan, veuillez entrer l'URL de l'image.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="bg-url"
            label="URL"
            type="url"
            fullWidth
            variant="standard"
            onChange={(e) => setBackgroundUrlField(e.target.value)}
          />
          <br />
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
                onChange={(e) => setBackgroundImageFile(e.target.files[0])}
              />
            </Button>
            <Button
              className="deleteButton"
              variant="contained"
              onClick={handleDelete}
            >
              Supprimer l'arrière plan
            </Button>
          </div>
          {backgroundImageFile && (
            <div>
              <Check /> Image importée
            </div>
          )}
          <div className="hiddenAlert">
            <Alert variant="filled" severity="error">
              L'url de l'image n'est pas valide.
            </Alert>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModify}>Enregistrer</Button>
          <Button onClick={handleClose}>Annuler</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog avatar */}
      <Dialog open={openAvatar} onClose={handleCloseAvatar}>
        <DialogTitle>Modifier l'avatar</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Pour changer l'avatar, veuillez entrer l'URL de l'image.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="avatar-url"
            label="URL"
            type="url"
            fullWidth
            variant="standard"
            onChange={(e) => setAvatarUrlField(e.target.value)}
          />
          <br />
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
                onChange={(e) => setAvatarImageFile(e.target.files[0])}
              />
            </Button>
            <Button
              className="deleteButton"
              variant="contained"
              onClick={handleDeleteAvatar}
            >
              Supprimer l'avatar
            </Button>
          </div>
          {avatarImageFile && (
            <div>
              <Check /> Image importée
            </div>
          )}
          <div className="hiddenAlert">
            <Alert variant="filled" severity="error">
              L'url de l'image n'est pas valide.
            </Alert>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModifyAvatar}>Enregistrer</Button>
          <Button onClick={handleCloseAvatar}>Annuler</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog badges épinglés */}
      <Dialog
        open={openBadges}
        onClose={handleCloseBadge}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Badges à épingler</DialogTitle>
        {(!loadingBadge || loaded) && <Loading />}
        <DialogContent className="badge-popup">
          <Autocomplete
            id="badge-select"
            className="badge-selector"
            options={Array.isArray(otherBadges) ? otherBadges : []}
            getOptionLabel={(option) => option.title}
            value={
              (Array.isArray(otherBadges) ? otherBadges : []).find(
                (badge) => badge.id === badgeIdToFavorite,
              ) || null
            }
            onChange={(event, newValue) =>
              setBadgeIdToFavorite(newValue ? newValue.id : null)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Badge à épingler"
                variant="outlined"
                error={!!badgeIdToFavoriteErrorMessage}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Avatar
                  alt={option.title}
                  src={option.imagePath}
                  sx={{ marginRight: 1 }}
                />
                {option.title}
              </li>
            )}
            noOptionsText="Aucun badge disponible"
          />
          <p>{badgeIdToFavoriteErrorMessage}</p>
          <FormControl fullWidth>
            {currentFavoriteBadges.length >= badgeQuantity && (
              <Typography>
                Vous épinglez le maximum possible de badges.
              </Typography>
            )}
            <Button
              variant="contained"
              className="mt-2"
              onClick={handleSubmit}
              disabled={currentFavoriteBadges.length >= badgeQuantity}
            >
              Épingler le badge
            </Button>
          </FormControl>
          <hr />
          Liste des badges épinglés
          <DataGrid
            className="listFavorite"
            autoHeight
            rows={currentFavoriteBadges ?? []}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBadge}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <ConfirmationPopup
        isOpen={openConfirmationPopup}
        onCancel={handleClosePrivacyConfirmationPopup}
        onConfirm={handleConfirmPrivacyChange}
        message={confirmPrivacyMessage}
      />
    </div>
  );
}
