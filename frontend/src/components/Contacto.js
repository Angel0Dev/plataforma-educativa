import React, { useState } from 'react';
import './Contacto.css';

const Contacto = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        telefono: '',
        asunto: '',
        mensaje: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Simular envío del formulario
        setTimeout(() => {
            setMessage('¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.');
            setFormData({
                nombre: '',
                correo: '',
                telefono: '',
                asunto: '',
                mensaje: ''
            });
            setLoading(false);
        }, 2000);
    };

    return (
        <div className="contacto">
            <div className="container">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">Contáctanos</h1>
                        <p className="hero-subtitle">
                            Estamos aquí para ayudarte. Envíanos tu consulta y te responderemos pronto.
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <section className="main-content">
                    <div className="contacto-grid">
                        {/* Información de Contacto */}
                        <div className="contacto-info">
                            <h2>Información de Contacto</h2>
                            
                            <div className="info-cards">
                                <div className="info-card">
                                    <div className="info-icon">📍</div>
                                    <div className="info-content">
                                        <h3>Dirección</h3>
                                        <p>Av. Principal 123<br />Ciudad, País 12345</p>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon">📞</div>
                                    <div className="info-content">
                                        <h3>Teléfono</h3>
                                        <p>+1 (555) 123-4567<br />+1 (555) 987-6543</p>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon">✉️</div>
                                    <div className="info-content">
                                        <h3>Email</h3>
                                        <p>info@plataformaeducativa.com<br />soporte@plataformaeducativa.com</p>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon">🕒</div>
                                    <div className="info-content">
                                        <h3>Horarios</h3>
                                        <p>Lunes - Viernes: 8:00 AM - 6:00 PM<br />Sábados: 9:00 AM - 2:00 PM</p>
                                    </div>
                                </div>
                            </div>

                            {/* Redes Sociales */}
                            <div className="redes-sociales">
                                <h3>Síguenos en nuestras redes</h3>
                                <div className="social-links">
                                    <a href="https://facebook.com" className="social-link facebook">📘 Facebook</a>
                                    <a href="https://twitter.com" className="social-link twitter">🐦 Twitter</a>
                                    <a href="https://instagram.com" className="social-link instagram">📷 Instagram</a>
                                    <a href="https://linkedin.com" className="social-link linkedin">💼 LinkedIn</a>
                                </div>
                            </div>
                        </div>

                        {/* Formulario de Contacto */}
                        <div className="contacto-form">
                            <h2>Enviar Mensaje</h2>
                            
                            {message && (
                                <div className="success-message">
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="nombre">Nombre Completo *</label>
                                        <input
                                            type="text"
                                            id="nombre"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            required
                                            className="form-input"
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
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="telefono">Teléfono</label>
                                        <input
                                            type="tel"
                                            id="telefono"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="asunto">Asunto *</label>
                                        <select
                                            id="asunto"
                                            name="asunto"
                                            value={formData.asunto}
                                            onChange={handleChange}
                                            required
                                            className="form-select"
                                        >
                                            <option value="">Seleccionar asunto</option>
                                            <option value="consulta-general">Consulta General</option>
                                            <option value="soporte-tecnico">Soporte Técnico</option>
                                            <option value="informacion-cursos">Información de Cursos</option>
                                            <option value="registro-usuario">Registro de Usuario</option>
                                            <option value="otros">Otros</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="mensaje">Mensaje *</label>
                                    <textarea
                                        id="mensaje"
                                        name="mensaje"
                                        value={formData.mensaje}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        className="form-textarea"
                                        placeholder="Escribe tu mensaje aquí..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-enviar"
                                >
                                    {loading ? 'Enviando...' : 'Enviar Mensaje'}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Contacto;
