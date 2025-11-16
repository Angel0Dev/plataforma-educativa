import React, { useState } from 'react';
import './MensajeriaVistas.css';

const VistaResponderMensaje = ({ mensajeOriginal, user, onEnviar, onCancelar }) => {
    const [formData, setFormData] = useState({
        asunto: `Re: ${mensajeOriginal?.asunto || ''}`,
        contenido: '',
        archivo: null
    });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.contenido.trim()) {
            alert('El mensaje no puede estar vacío');
            return;
        }

        setEnviando(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('id_remitente', user.id);
            formDataToSend.append('id_destinatario', mensajeOriginal.id_emisor);
            formDataToSend.append('asunto', formData.asunto);
            formDataToSend.append('contenido', formData.contenido);
            if (formData.archivo) {
                formDataToSend.append('archivo', formData.archivo);
            }

            await onEnviar(formDataToSend);
            
            // Reset form
            setFormData({
                asunto: `Re: ${mensajeOriginal?.asunto || ''}`,
                contenido: '',
                archivo: null
            });
            setPreviewImagen(null);
        } catch (error) {
            console.error('Error al enviar respuesta:', error);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="vista-responder">
            <div className="vista-header">
                <h3>📧 Responder Mensaje</h3>
                <button className="btn-close" onClick={onCancelar}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="mensaje-form">
                <div className="form-group">
                    <label>Para:</label>
                    <div className="destinatario-info">
                        <strong>{mensajeOriginal?.remitente_nombre} {mensajeOriginal?.remitente_apellido}</strong>
                        <span className="rol-badge">({mensajeOriginal?.remitente_rol})</span>
                    </div>
                </div>
                <div className="form-group">
                    <label>Asunto:</label>
                    <input
                        type="text"
                        value={formData.asunto}
                        onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Mensaje: *</label>
                    <textarea
                        value={formData.contenido}
                        onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                        placeholder="Escribe tu respuesta aquí..."
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
                            <img src={previewImagen} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }} />
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
                        {enviando ? 'Enviando...' : '📤 Enviar Respuesta'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={onCancelar}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VistaResponderMensaje;

