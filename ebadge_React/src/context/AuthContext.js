import React, { createContext, useState, useEffect } from 'react';
import Api from '../utils/Api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Vérification au chargement de l'app
    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('role');

        if (token && username && role) {
            Api.get('/auth/current_user')
                .then(() => {
                    setUser({ username, role });
                    setLoading(false);
                })
                .catch(() => {
                    logout();
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = (token, username, role) => {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('role', role);
        setUser({ username, role });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
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