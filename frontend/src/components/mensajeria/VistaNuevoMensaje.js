import React, { useState } from 'react';
import './MensajeriaVistas.css';

const VistaNuevoMensaje = ({ user, usuariosDisponibles, onBuscarUsuarios, onEnviar, onCancelar, destinatarioInicial }) => {
    const [formData, setFormData] = useState({
        destinatario: destinatarioInicial?.id || '',
        destinatarioNombre: destinatarioInicial?.nombre || '',
        asunto: '',
        contenido: '',
        archivo: null
    });
    const [busquedaUsuario, setBusquedaUsuario] = useState('');
    const [previewImagen, setPreviewImagen] = useState(null);
    const [enviando, setEnviando] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, archivo: file });
            // Preview para imágenes
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImagen(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setPreviewImagen(null);
            }
        }
    };

    const handleBuscarUsuario = (termino) => {
        setBusquedaUsuario(termino);
        if (onBuscarUsuarios) {
            onBuscarUsuarios(termino);
        }
    };

    const seleccionarDestinatario = (usuario) => {
        setFormData({
            ...formData,
            destinatario: usuario.id_usuario,
            destinatarioNombre: `${usuario.nombre} ${usuario.apellido} (${usuario.rol})`
        });
        setBusquedaUsuario('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.destinatario || !formData.contenido.trim()) {
            alert('Debe seleccionar un destinatario y escribir un mensaje');
            return;
        }

        setEnviando(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('id_remitente', user.id);
            formDataToSend.append('id_destinatario', formData.destinatario);
            formDataToSend.append('asunto', formData.asunto || 'Sin asunto');
            formDataToSend.append('contenido', formData.contenido);
            if (formData.archivo) {
                formDataToSend.append('archivo', formData.archivo);
            }

            await onEnviar(formDataToSend);
            
            // Reset form
            setFormData({
                destinatario: '',
                destinatarioNombre: '',
                asunto: '',
                contenido: '',
                archivo: null
            });
            setPreviewImagen(null);
            setBusquedaUsuario('');
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="vista-nuevo-mensaje">
            <div className="vista-header">
                <h3>✉️ Nuevo Mensaje</h3>
                <button className="btn-close" onClick={onCancelar}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="mensaje-form">
                <div className="form-group">
                    <label>Destinatario: *</label>
                    {formData.destinatarioNombre ? (
                        <div className="destinatario-selected">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '18px' }}>👤</span>
                                <strong>{formData.destinatarioNombre}</strong>
                            </div>
                            <button
                                type="button"
                                className="btn-remove"
                                onClick={() => {
                                    setFormData({ ...formData, destinatario: '', destinatarioNombre: '' });
                                    setBusquedaUsuario('');
                                }}
                            >
                                ✏️ Cambiar
                            </button>
                        </div>
                    ) : (
                        <div className="destinatario-search">
                            <input
                                type="text"
                                value={busquedaUsuario}
                                onChange={(e) => handleBuscarUsuario(e.target.value)}
                                placeholder="Buscar por nombre, apellido, correo o rol..."
                                className="search-input"
                            />
                            {usuariosDisponibles.length > 0 && (
                                <div className="usuarios-dropdown">
                                    {usuariosDisponibles.map(usuario => (
                                        <div
                                            key={usuario.id_usuario}
                                            className="usuario-option"
                                            onClick={() => seleccionarDestinatario(usuario)}
                                        >
                                            <div className="usuario-info">
                                                <strong>{usuario.nombre} {usuario.apellido}</strong>
                                                <span className="usuario-rol">{usuario.rol}</span>
                                            </div>
                                            <div className="usuario-email">{usuario.correo}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="form-group">
                    <label>Asunto:</label>
                    <input
                        type="text"
                        value={formData.asunto}
                        onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                        placeholder="Asunto del mensaje (opcional)"
                    />
                </div>
                <div className="form-group">
                    <label>Mensaje: *</label>
                    <textarea
                        value={formData.contenido}
                        onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                        placeholder="Escribe tu mensaje aquí..."
                        rows="8"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Adjuntar archivo (opcional):</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                    {previewImagen && (
                        <div className="preview-imagen">
                            <img src={previewImagen} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px', borderRadius: '8px' }} />
                        </div>
                    )}
                    {formData.archivo && !previewImagen && (
                        <div className="archivo-seleccionado">
                            📎 {formData.archivo.name}
                        </div>
                    )}
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={enviando}>
                        {enviando ? 'Enviando...' : '📤 Enviar Mensaje'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={onCancelar}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VistaNuevoMensaje;

