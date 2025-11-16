import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = ({ user, isOpen, toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Funciones según el rol
    const getMenuItems = () => {
        if (!user) return [];

        switch (user.rol) {
            case 'Administrador':
                return [
                    { icon: '📊', label: 'Dashboard', path: '/dashboard', section: 'Inicio' },
                    { icon: '👥', label: 'Gestión de Usuarios', path: '/dashboard', action: 'usuarios', section: 'Gestión' },
                    { icon: '📚', label: 'Gestión de Cursos', path: '/dashboard', action: 'cursos', section: 'Gestión' },
                    { icon: '🏫', label: 'Gestión de Salones', path: '/dashboard', action: 'salones', section: 'Gestión' },
                    { icon: '👨‍👩‍👧‍👦', label: 'Crear Padre e Hijo', path: '/dashboard', action: 'crear-padre-hijo', section: 'Gestión' },
                    { icon: '📧', label: 'Mensajería', path: '/mensajeria', section: 'Comunicación' },
                ];
            case 'Docente':
                return [
                    { icon: '📊', label: 'Dashboard', path: '/dashboard', section: 'Inicio' },
                    { icon: '📚', label: 'Mis Cursos', path: '/dashboard', action: 'cursos', section: 'Académico' },
                    { icon: '🏫', label: 'Mis Salones', path: '/dashboard', action: 'salones', section: 'Académico' },
                    { icon: '📝', label: 'Tareas', path: '/dashboard', action: 'tareas', section: 'Académico' },
                    { icon: '📅', label: 'Horarios', path: '/dashboard', action: 'horarios', section: 'Académico' },
                    { icon: '📧', label: 'Mensajería', path: '/mensajeria', section: 'Comunicación' },
                ];
            case 'Estudiante':
                return [
                    { icon: '📊', label: 'Dashboard', path: '/dashboard', section: 'Inicio' },
                    { icon: '📚', label: 'Mis Cursos', path: '/dashboard', action: 'cursos', section: 'Académico' },
                    { icon: '📝', label: 'Tareas', path: '/tareas', section: 'Académico' },
                    { icon: '📊', label: 'Calificaciones', path: '/calificaciones', section: 'Académico' },
                    { icon: '📧', label: 'Mensajería', path: '/mensajeria', section: 'Comunicación' },
                ];
            case 'Padre':
                return [
                    { icon: '📊', label: 'Dashboard', path: '/dashboard', section: 'Inicio' },
                    { icon: '👨‍👩‍👧‍👦', label: 'Mis Hijos', path: '/dashboard', action: 'hijos', section: 'Familiar' },
                    { icon: '📚', label: 'Cursos de Hijos', path: '/dashboard', action: 'cursos-hijos', section: 'Familiar' },
                    { icon: '📊', label: 'Calificaciones', path: '/dashboard', action: 'calificaciones-hijos', section: 'Familiar' },
                    { icon: '📧', label: 'Mensajería', path: '/mensajeria', section: 'Comunicación' },
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenuItems();
    const groupedItems = menuItems.reduce((acc, item) => {
        if (!acc[item.section]) {
            acc[item.section] = [];
        }
        acc[item.section].push(item);
        return acc;
    }, {});

    const handleItemClick = (item) => {
        if (item.action) {
            // Si tiene una acción, emitir evento personalizado
            window.dispatchEvent(new CustomEvent('dashboard-action', { detail: { action: item.action } }));
        }
        // Cerrar sidebar en móvil después de hacer clic
        if (window.innerWidth < 768) {
            toggleSidebar();
        }
    };

    return (
        <>
            {/* Overlay para móvil */}
            {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar} />}
            
            {/* Sidebar */}
            <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    {isOpen && <h3>Menú</h3>}
                    <button className="sidebar-toggle" onClick={toggleSidebar} title={isOpen ? 'Ocultar menú' : 'Mostrar menú'}>
                        {isOpen ? '←' : '→'}
                    </button>
                </div>

                {/* Información del usuario */}
                {user && isOpen && (
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-avatar">
                            {user.rol === 'Administrador' && '👨‍💼'}
                            {user.rol === 'Docente' && '👨‍🏫'}
                            {user.rol === 'Estudiante' && '👨‍🎓'}
                            {user.rol === 'Padre' && '👨‍👩‍👧‍👦'}
                        </div>
                        <div className="sidebar-user-details">
                            <div className="sidebar-user-name">{user.nombre} {user.apellido}</div>
                            <div className="sidebar-user-role">{user.rol}</div>
                            {user.correo && (
                                <div className="sidebar-user-email">{user.correo}</div>
                            )}
                        </div>
                    </div>
                )}

                {user && !isOpen && (
                    <div className="sidebar-user-info-collapsed">
                        <div className="sidebar-user-avatar">
                            {user.rol === 'Administrador' && '👨‍💼'}
                            {user.rol === 'Docente' && '👨‍🏫'}
                            {user.rol === 'Estudiante' && '👨‍🎓'}
                            {user.rol === 'Padre' && '👨‍👩‍👧‍👦'}
                        </div>
                    </div>
                )}
                
                <nav className="sidebar-nav">
                    {Object.entries(groupedItems).map(([section, items]) => (
                        <div key={section} className="sidebar-section">
                            {isOpen && <h4 className="sidebar-section-title">{section}</h4>}
                            <ul className="sidebar-menu">
                                {items.map((item, index) => {
                                    const isActive = location.pathname === item.path && !item.action;
                                    return (
                                        <li key={index} className={`sidebar-item ${isActive ? 'active' : ''}`}>
                                            {item.path ? (
                                                <Link 
                                                    to={item.path} 
                                                    className="sidebar-link"
                                                    onClick={() => handleItemClick(item)}
                                                    title={!isOpen ? item.label : ''}
                                                >
                                                    <span className="sidebar-icon">{item.icon}</span>
                                                    {isOpen && <span className="sidebar-label">{item.label}</span>}
                                                </Link>
                                            ) : (
                                                <button 
                                                    className="sidebar-link"
                                                    onClick={() => handleItemClick(item)}
                                                    title={!isOpen ? item.label : ''}
                                                >
                                                    <span className="sidebar-icon">{item.icon}</span>
                                                    {isOpen && <span className="sidebar-label">{item.label}</span>}
                                                </button>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Botón de cerrar sesión */}
                {user && (
                    <div className="sidebar-footer">
                        <button 
                            className="sidebar-logout-btn"
                            onClick={handleLogout}
                            title="Cerrar Sesión"
                        >
                            <span className="sidebar-icon">🚪</span>
                            {isOpen && <span className="sidebar-label">Cerrar Sesión</span>}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Sidebar;

