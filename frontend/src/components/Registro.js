import React, { useState } from 'react';
import axios from 'axios';
import './Registro.css';

const Registro = () => {
    // Estados para manejar los datos del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        contrasena: '',
        confirmarContrasena: '',
        rol: 'Estudiante',
        dni: '',
        telefono: '',
        direccion: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

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
        const { nombre, apellido, correo, contrasena, confirmarContrasena, rol, dni } = formData;

        if (!nombre.trim() || !apellido.trim() || !correo.trim() || !contrasena || !rol) {
            setError('Todos los campos son obligatorios');
            return false;
        }

        // Validar DNI obligatorio para padres
        if (rol === 'Padre' && !dni.trim()) {
            setError('El DNI es obligatorio para padres de familia');
            return false;
        }

        if (contrasena.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        if (contrasena !== confirmarContrasena) {
            setError('Las contraseñas no coinciden');
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
            // Preparar datos para enviar (sin confirmarContrasena)
            const { confirmarContrasena, ...datosEnvio } = formData;

            const response = await axios.post(
                'http://localhost:5000/api/usuarios/registro',
                datosEnvio,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setMessage('¡Usuario registrado exitosamente!');
                // Limpiar formulario después del registro exitoso
                setFormData({
                    nombre: '',
                    apellido: '',
                    correo: '',
                    contrasena: '',
                    confirmarContrasena: '',
                    rol: 'Estudiante',
                    dni: '',
                    telefono: '',
                    direccion: ''
                });
            }

        } catch (error) {
            console.error('Error en el registro:', error);
            
            if (error.response) {
                // El servidor respondió con un código de error
                setError(error.response.data.message || 'Error en el servidor');
            } else if (error.request) {
                // La petición se hizo pero no se recibió respuesta
                setError('No se pudo conectar con el servidor. Verifique que esté ejecutándose.');
            } else {
                // Algo más pasó
                setError('Error inesperado. Por favor, intente nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registro-container">
            <div className="registro-card">
                <h2 className="registro-title">Registro de Usuario</h2>
                <p className="registro-subtitle">Únete a la plataforma educativa</p>

                <form onSubmit={handleSubmit} className="registro-form">
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre *</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Ingrese su nombre"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="apellido">Apellido *</label>
                        <input
                            type="text"
                            id="apellido"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Ingrese su apellido"
                            disabled={loading}
                        />
                    </div>

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
                        <label htmlFor="rol">Tipo de Usuario *</label>
                        <select
                            id="rol"
                            name="rol"
                            value={formData.rol}
                            onChange={handleChange}
                            className="form-select"
                            disabled={loading}
                        >
                            <option value="Estudiante">Estudiante</option>
                            <option value="Docente">Docente</option>
                            <option value="Padre">Padre de Familia</option>
                        </select>
                    </div>

                    {/* Campos específicos para Padres */}
                    {formData.rol === 'Padre' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="dni">DNI *</label>
                                <input
                                    type="text"
                                    id="dni"
                                    name="dni"
                                    value={formData.dni}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Ingrese su DNI"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="telefono">Teléfono</label>
                                <input
                                    type="tel"
                                    id="telefono"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Ingrese su teléfono de contacto"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="direccion">Dirección</label>
                                <textarea
                                    id="direccion"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Ingrese su dirección de contacto"
                                    disabled={loading}
                                    rows="3"
                                />
                            </div>
                        </>
                    )}

                    {/* Campo DNI opcional para Estudiantes */}
                    {formData.rol === 'Estudiante' && (
                        <div className="form-group">
                            <label htmlFor="dni">DNI (Opcional)</label>
                            <input
                                type="text"
                                id="dni"
                                name="dni"
                                value={formData.dni}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Ingrese su DNI (opcional, ayuda a los padres a encontrarte)"
                                disabled={loading}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="contrasena">Contraseña *</label>
                        <input
                            type="password"
                            id="contrasena"
                            name="contrasena"
                            value={formData.contrasena}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Mínimo 6 caracteres"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmarContrasena">Confirmar Contraseña *</label>
                        <input
                            type="password"
                            id="confirmarContrasena"
                            name="confirmarContrasena"
                            value={formData.confirmarContrasena}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Confirme su contraseña"
                            disabled={loading}
                        />
                    </div>

                    {/* Mostrar mensajes de éxito o error */}
                    {message && (
                        <div className="message success">
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
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <div className="login-link">
                    <p>¿Ya tienes una cuenta? <a href="/login">Inicia sesión aquí</a></p>
                </div>
            </div>
        </div>
    );
};

export default Registro;
