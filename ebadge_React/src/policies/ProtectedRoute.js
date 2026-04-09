import React from 'react';
import PoliciesHelper from './PoliciesHelper';
import { Outlet } from 'react-router-dom';
import NotAuthorized from '../pages/Errors/NotAuthorized';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = (minimumRole) => {
    const { user, loading } = useAuth();
    const policiesHelper = new PoliciesHelper(user?.role);

    if (loading) {
        return null;
    }

    // le mot-clé return était manquantla fonction retournait toujours undefined et les routes admin
    
    return policiesHelper.hasRole(minimumRole)
        ? <Outlet />
        : <NotAuthorized />;
}

export default ProtectedRoute;
