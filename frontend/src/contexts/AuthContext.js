import React, { createContext, useContext, useState, useEffect } from 'react';
import './AuthContext.css';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
    const [timeoutCountdown, setTimeoutCountdown] = useState(30);

    // Timeout de inactividad: 1 hora (3600000 ms)
    const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hora
    const WARNING_TIME_BEFORE_TIMEOUT = 5 * 60 * 1000; // Mostrar advertencia cuando quedan 5 minutos
    const WARNING_RESPONSE_TIME = 30; // 30 segundos para responder

    // Función para cerrar sesión por inactividad
    const logoutPorInactividad = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('lastActivity');
        window.location.href = '/login';
    };

    // Función para verificar si el usuario existe en el backend
    const verificarUsuarioBackend = async (userData) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/verificar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_usuario: userData.id || userData.id_usuario,
                    correo: userData.correo
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    // Actualizar datos del usuario
                    const updatedUser = {
                        id: data.user.id,
                        id_usuario: data.user.id,
                        nombre: data.user.nombre,
                        apellido: data.user.apellido,
                        correo: data.user.correo,
                        rol: data.user.rol
                    };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setLastActivity(Date.now());
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error al verificar usuario:', error);
            return false;
        }
    };

    useEffect(() => {
        // Verificar si hay un usuario guardado en localStorage
        const savedUser = localStorage.getItem('user');
        const savedLastActivity = localStorage.getItem('lastActivity');
        
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            
            // Verificar si el usuario existe en el backend
            verificarUsuarioBackend(userData).then((existe) => {
                if (existe) {
                    setUser(userData);
                    // Restaurar última actividad si existe
                    if (savedLastActivity) {
                        const lastActivityTime = parseInt(savedLastActivity);
                        const timeSinceActivity = Date.now() - lastActivityTime;
                        
                        // Si han pasado más de 1 hora, cerrar sesión
                        if (timeSinceActivity > INACTIVITY_TIMEOUT) {
                            logoutPorInactividad();
                            return;
                        }
                        
                        setLastActivity(lastActivityTime);
                    } else {
                        setLastActivity(Date.now());
                        localStorage.setItem('lastActivity', Date.now().toString());
                    }
                } else {
                    // Usuario no existe, cerrar sesión
                    logoutPorInactividad();
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    // Función para extender sesión cuando el usuario confirma que está activo
    const extenderSesion = () => {
        const ahora = Date.now();
        setLastActivity(ahora);
        localStorage.setItem('lastActivity', ahora.toString());
        setShowTimeoutWarning(false);
        setTimeoutCountdown(30);
    };

    // Detectar actividad del usuario
    useEffect(() => {
        if (!user) return;

        const eventos = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        const actualizarActividad = () => {
            const ahora = Date.now();
            setLastActivity(ahora);
            localStorage.setItem('lastActivity', ahora.toString());
            // Si hay una advertencia activa, cerrarla al detectar actividad
            if (showTimeoutWarning) {
                setShowTimeoutWarning(false);
                setTimeoutCountdown(30);
            }
        };

        eventos.forEach(evento => {
            window.addEventListener(evento, actualizarActividad, { passive: true });
        });

        let ultimaVerificacion = 0;
        const INTERVALO_VERIFICACION_USUARIO = 5 * 60 * 1000; // 5 minutos

        // Verificar inactividad cada 10 segundos
        const intervaloVerificacion = setInterval(() => {
            const savedLastActivity = localStorage.getItem('lastActivity');
            const lastActivityTime = savedLastActivity ? parseInt(savedLastActivity) : Date.now();
            const tiempoInactivo = Date.now() - lastActivityTime;
            const tiempoRestante = INACTIVITY_TIMEOUT - tiempoInactivo;
            
            // Si el tiempo de inactividad supera el timeout, cerrar sesión
            if (tiempoInactivo >= INACTIVITY_TIMEOUT) {
                logoutPorInactividad();
            } 
            // Si quedan 5 minutos o menos y no hay advertencia activa, mostrar advertencia
            else if (tiempoRestante <= WARNING_TIME_BEFORE_TIMEOUT && tiempoRestante > 0 && !showTimeoutWarning) {
                setShowTimeoutWarning(true);
                setTimeoutCountdown(WARNING_RESPONSE_TIME);
            }
            // Verificar periódicamente que el usuario existe (cada 5 minutos)
            else if (user && !showTimeoutWarning) {
                const tiempoDesdeUltimaVerificacion = Date.now() - ultimaVerificacion;
                if (tiempoDesdeUltimaVerificacion >= INTERVALO_VERIFICACION_USUARIO) {
                    ultimaVerificacion = Date.now();
                    verificarUsuarioBackend(user).then((existe) => {
                        if (!existe) {
                            logoutPorInactividad();
                        }
                    });
                }
            }
        }, 10000); // Verificar cada 10 segundos

        return () => {
            eventos.forEach(evento => {
                window.removeEventListener(evento, actualizarActividad);
            });
            clearInterval(intervaloVerificacion);
        };
    }, [user, showTimeoutWarning]);

    // Countdown separado para el modal de advertencia
    useEffect(() => {
        if (!showTimeoutWarning || !user) return;

        const countdownInterval = setInterval(() => {
            setTimeoutCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    logoutPorInactividad();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(countdownInterval);
        };
    }, [showTimeoutWarning, user]);

    const login = async (correo, contrasena) => {
        // Actualizar actividad al hacer login
        const ahora = Date.now();
        setLastActivity(ahora);
        localStorage.setItem('lastActivity', ahora.toString());
        // Usuarios de prueba para desarrollo
        const mockUsers = {
            'estudiante@test.com': { 
                id: 1, 
                nombre: 'Juan', 
                apellido: 'Pérez', 
                correo: 'estudiante@test.com', 
                rol: 'Estudiante' 
            },
            'docente@test.com': { 
                id: 2, 
                nombre: 'María', 
                apellido: 'González', 
                correo: 'docente@test.com', 
                rol: 'Docente' 
            },
            'padre@test.com': { 
                id: 3, 
                nombre: 'Carlos', 
                apellido: 'Rodríguez', 
                correo: 'padre@test.com', 
                rol: 'Padre' 
            },
            'admin@test.com': { 
                id: 4, 
                nombre: 'Ana', 
                apellido: 'Administradora', 
                correo: 'admin@test.com', 
                rol: 'Administrador' 
            }
        };

        // Verificar credenciales de prueba primero
        if (mockUsers[correo] && contrasena === 'password123') {
            const userData = mockUsers[correo];
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', 'mock-token');
            return { success: true };
        }

        // Si no son credenciales de prueba, intentar con el backend
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo, contrasena }),
            });

            if (response.ok) {
                const userData = await response.json();
                const userInfo = {
                    id: userData.user.id,
                    id_usuario: userData.user.id,
                    nombre: userData.user.nombre,
                    apellido: userData.user.apellido,
                    correo: userData.user.correo,
                    rol: userData.user.rol
                };
                setUser(userInfo);
                localStorage.setItem('user', JSON.stringify(userInfo));
                localStorage.setItem('token', userData.token);
                localStorage.setItem('lastActivity', Date.now().toString());
                return { success: true };
            } else {
                const error = await response.json();
                return { success: false, message: error.message || 'Error del servidor' };
            }
        } catch (error) {
            console.log('Backend no disponible, usando usuarios de prueba');
            return { success: false, message: 'Credenciales incorrectas. Usa: admin@test.com / password123' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('lastActivity');
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            
            {/* Modal de advertencia de timeout */}
            {showTimeoutWarning && (
                <div className="timeout-warning-overlay">
                    <div className="timeout-warning-modal">
                        <div className="timeout-warning-header">
                            <h3>⚠️ ¿Sigues activo?</h3>
                        </div>
                        <div className="timeout-warning-content">
                            <p>Tu sesión se cerrará automáticamente por inactividad.</p>
                            <p className="timeout-countdown">
                                Tiempo restante: <strong>{timeoutCountdown}</strong> segundos
                            </p>
                        </div>
                        <div className="timeout-warning-actions">
                            <button 
                                className="btn-timeout-continue"
                                onClick={extenderSesion}
                            >
                                Sí, continuar sesión
                            </button>
                            <button 
                                className="btn-timeout-logout"
                                onClick={logoutPorInactividad}
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
};
