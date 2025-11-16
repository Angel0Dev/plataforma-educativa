import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardEstudiante from './dashboards/DashboardEstudiante';
import DashboardDocente from './dashboards/DashboardDocente';
import DashboardPadre from './dashboards/DashboardPadre';
import DashboardAdministrador from './dashboards/DashboardAdministrador';
import Sidebar from './dashboards/Sidebar';
import './Dashboard.css';
import './dashboards/DashboardSpecific.css';
import './dashboards/Sidebar.css';

const Dashboard = () => {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Redirigir al login si no hay usuario
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    // Cerrar sidebar en móvil por defecto
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Cargando...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="dashboard-error">
                <h2>Acceso Denegado</h2>
                <p>Debes iniciar sesión para acceder al dashboard.</p>
            </div>
        );
    }

    // Renderizar dashboard según el rol del usuario
    const renderDashboard = () => {
        switch (user.rol) {
            case 'Estudiante':
                return <DashboardEstudiante user={user} />;
            case 'Docente':
                return <DashboardDocente user={user} />;
            case 'Padre':
                return <DashboardPadre user={user} />;
            case 'Administrador':
                return <DashboardAdministrador user={user} />;
            default:
                return (
                    <div className="dashboard-error">
                        <h2>Rol no reconocido</h2>
                        <p>El rol "{user.rol}" no está soportado.</p>
                    </div>
                );
        }
    };

    return (
        <div className="dashboard-wrapper">
            <Sidebar user={user} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <div className={`dashboard ${sidebarOpen ? 'sidebar-open' : ''}`}>
                {renderDashboard()}
            </div>
        </div>
    );
};

export default Dashboard;
