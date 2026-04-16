import React, { createContext, useState, useEffect } from 'react';
import Api from '../utils/Api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const normalizeUser = (payload) => {
        const currentUser = payload?.user ?? payload ?? {};
        return {
            ...currentUser,
            username: currentUser.username ?? currentUser.name ?? '',
            role: currentUser.role ?? currentUser.role_name ?? ''
        };
    };

    // Vérification au chargement de l'app
    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        Api.defaults.headers.common.Authorization = `Bearer ${token}`;

        Api.get('/auth/current_user')
            .then((response) => {
                const normalizedUser = normalizeUser(response.data);
                setUser(normalizedUser);
            })
            .catch(() => {
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const login = (token, username, role) => {
        sessionStorage.setItem('token', token);
        Api.defaults.headers.common.Authorization = `Bearer ${token}`;
        setUser({ username, role });

        Api.get('/auth/current_user')
            .then((response) => {
                const normalizedUser = normalizeUser(response.data);
                setUser(normalizedUser);
            })
            .catch(() => {
                setUser({ username, role });
            });
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        delete Api.defaults.headers.common.Authorization;
        setUser(null);

        Api.post('/auth/logout').catch(() => {});
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
