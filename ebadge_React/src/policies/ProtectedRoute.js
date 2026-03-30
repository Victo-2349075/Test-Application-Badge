import React from 'react';
import PoliciesHelper from './PoliciesHelper';
import { Outlet } from 'react-router-dom';
import NotAuthorized from '../pages/Errors/NotAuthorized';

const ProtectedRoute = (minimumRole) => {

    const policiesHelper = new PoliciesHelper();

    // le mot-clé return était manquantla fonction retournait toujours undefined et les routes admin
    
    return policiesHelper.hasRole(minimumRole)
        ? <Outlet />
        : <NotAuthorized />;
}

export default ProtectedRoute;
