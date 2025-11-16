import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo del Colegio - Izquierda */}
                <div className="navbar-logo">
                    <Link to="/" className="logo-link">
                        <img 
                            src="/logo-colegio.png" 
                            alt="Logo del Colegio" 
                            className="logo-image"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <div className="logo-placeholder" style={{display: 'none'}}>
                            🏫
                        </div>
                        <span className="logo-text">Jose Maria Arguedas</span>
                    </Link>
                </div>

                {/* Menú Principal - Centro */}
                <div className="navbar-menu">
                    <ul className={`menu-list ${isMenuOpen ? 'active' : ''}`}>
                        <li className="menu-item">
                            <Link to="/" className="menu-link">
                                Inicio
                            </Link>
                        </li>
                        <li className="menu-item">
                            <Link to="/sobre-nosotros" className="menu-link">
                                Sobre Nosotros
                            </Link>
                        </li>
                        <li className="menu-item">
                            <Link to="/cursos" className="menu-link">
                                Cursos
                            </Link>
                        </li>
                        <li className="menu-item">
                            <Link to="/contacto" className="menu-link">
                                Contacto
                            </Link>
                        </li>
                        {isAuthenticated && (
                            <li className="menu-item dropdown">
                                <span className="menu-link dropdown-toggle">
                                    Servicios
                                </span>
                                <ul className="dropdown-menu">
                                    <li><Link to="/tareas" className="dropdown-link">Tareas</Link></li>
                                    <li><Link to="/calificaciones" className="dropdown-link">Calificaciones</Link></li>
                                    <li><Link to="/biblioteca" className="dropdown-link">Biblioteca</Link></li>
                                    <li><Link to="/mensajeria" className="dropdown-link">📧 Mensajería</Link></li>
                                </ul>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Sección de Usuario - Derecha */}
                <div className="navbar-user">
                    {isAuthenticated ? (
                        <div className="user-menu">
                            <div className="user-info">
                                <span className="user-name">{user.nombre}</span>
                                <span className="user-role">{user.rol}</span>
                            </div>
                            <div className="user-actions">
                                <Link to="/dashboard" className="btn-dashboard">
                                    Dashboard
                                </Link>
                                <button onClick={logout} className="btn-logout">
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="user-buttons">
                            <Link to="/login" className="btn-login">
                                Iniciar Sesión
                            </Link>
                        </div>
                    )}
                </div>

                {/* Botón de menú móvil */}
                <div className="mobile-menu-toggle" onClick={toggleMenu}>
                    <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
