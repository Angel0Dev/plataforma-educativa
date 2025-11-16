import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    // Estados para manejar los datos del formulario
    const [formData, setFormData] = useState({
        correo: '',
        contrasena: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Función para manejar cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        // Limpiar mensajes de error al escribir
        if (error) setError('');
        if (message) setMessage('');
    };

    // Función para validar el formulario
    const validarFormulario = () => {
        const { correo, contrasena } = formData;

        if (!correo.trim() || !contrasena) {
            setError('Todos los campos son obligatorios');
            return false;
        }

        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            setError('Por favor ingrese un correo electrónico válido');
            return false;
        }

        return true;
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validarFormulario()) {
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            // Limpiar la contraseña antes de enviarla (eliminar espacios)
            const contrasenaLimpia = formData.contrasena.trim();
            console.log('🔍 Frontend - Contraseña a enviar:', contrasenaLimpia);
            console.log('🔍 Frontend - Longitud:', contrasenaLimpia.length);
            console.log('🔍 Frontend - Códigos ASCII:', Array.from(contrasenaLimpia).map(c => c.charCodeAt(0)).join(', '));
            
            const result = await login(formData.correo, contrasenaLimpia);
            
            if (result.success) {
                setMessage('¡Inicio de sesión exitoso! Redirigiendo...');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                setError(result.message || 'Error al iniciar sesión');
            }

        } catch (error) {
            console.error('Error en el login:', error);
            setError('Error al iniciar sesión. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Iniciar Sesión</h2>
                <p className="login-subtitle">Accede a tu cuenta</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="correo">Correo Electrónico *</label>
                        <input
                            type="email"
                            id="correo"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="ejemplo@correo.com"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contrasena">Contraseña *</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="contrasena"
                                name="contrasena"
                                value={formData.contrasena}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Ingrese su contraseña"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className={`password-toggle-btn ${showPassword ? 'show' : 'hide'}`}
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                tabIndex={0}
                                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                <svg 
                                    className="password-icon" 
                                    width="20" 
                                    height="20" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                >
                                    {showPassword ? (
                                        <>
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </>
                                    ) : (
                                        <>
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </>
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mostrar mensajes de éxito o error */}
                    {message && (
                        <div className="message info">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="message error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                {/* Información de prueba */}
                <div className="demo-info">
                    <h4>🧪 Cuentas de Prueba:</h4>
                    <p><strong>Estudiante:</strong> estudiante@test.com / password123</p>
                    <p><strong>Docente:</strong> docente@test.com / password123</p>
                    <p><strong>Padre:</strong> padre@test.com / password123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
