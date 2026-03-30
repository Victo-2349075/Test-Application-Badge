import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../composant/Loading/LoadingComponent";
import { useAuth } from "../hooks/useAuth";

export default function Logout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        logout();
        navigate('/auth/login');
    }, [logout, navigate]);

    return <Loading />;
}
