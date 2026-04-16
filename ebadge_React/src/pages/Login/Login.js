import React, { useState, useEffect } from 'react';
import './Login.css';
import { Button, TextField } from '@mui/material';
import Api from '../../utils/Api';
import Loading from '../../composant/Loading/LoadingComponent';
import PoliciesHelper from '../../policies/PoliciesHelper';
import { getUserFriendlyErrorMessage } from '../../utils/ErrorHandler';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [identifierError, setIdentifierError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, user, loading } = useAuth();
    const navigate = useNavigate();

    // Redirection si déjà connecté
    useEffect(() => {
    if (!loading && user) {
        const policiesHelper = new PoliciesHelper(user?.role);
        navigate(policiesHelper.getDefaultRoute(), { replace: true });
    }
    }, [user, loading, navigate]);

    const validateIdentifier = () => {
        if (!identifier) {
            setIdentifierError('Veuillez renseigner votre identifiant');
            return false;
        }
        if (!identifier.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) {
            setIdentifierError("Le format de l'adresse courriel est invalide");
            return false;
        }
        setIdentifierError('');
        return true;
    };

    const validatePassword = () => {
        if (!password) {
            setPasswordError('Veuillez renseigner votre mot de passe');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!validateIdentifier() || !validatePassword()) return;

        setIsLoading(true);

        Api.post('/auth/login', {
            email: identifier,
            password
        })
            .then((response) => {
                login(
                response.data.access_token,
                response.data.username,
                response.data.role
            );

                const policiesHelper = new PoliciesHelper(response.data.role);
                navigate(policiesHelper.getDefaultRoute(), { replace: true });
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 401) {
                        setIdentifierError('Identifiant ou mot de passe incorrect');
                        setPasswordError('Identifiant ou mot de passe incorrect');
                    } else {
                        setIdentifierError('Une erreur est survenue');
                        setPasswordError('Une erreur est survenue');
                    }
                } else {
                    const message = error?.userFriendlyMessage || getUserFriendlyErrorMessage(error);
                    setIdentifierError(message);
                    setPasswordError('');
                }
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <div className="login">
            {isLoading && <Loading />}
            <div className="login-container">
                <div className="login-background"></div>
                <div className="login-right">
                    <div className="login-right-content">
                        <h1>E-Badge</h1>

                        <form onSubmit={handleSubmit} className="form-login">
                            <TextField
                                label="Adresse courriel"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                onBlur={validateIdentifier}
                                error={!!identifierError}
                                helperText={identifierError}
                                fullWidth
                                margin="normal"
                            />

                            <TextField
                                label="Mot de passe"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={validatePassword}
                                error={!!passwordError}
                                helperText={passwordError}
                                fullWidth
                                margin="normal"
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!identifier || !password}
                                sx={{ mt: 2, width: '60%' }}
                            >
                                Connexion →
                            </Button>
                        </form>

                        <p>
                            Pas de compte ? <Link to="/auth/signup">Créer un compte</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
