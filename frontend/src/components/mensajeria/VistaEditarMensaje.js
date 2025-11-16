import React, { useState, useEffect } from 'react';
import './MensajeriaVistas.css';

const VistaEditarMensaje = ({ mensaje, user, onGuardar, onCancelar }) => {
    const [formData, setFormData] = useState({
        asunto: mensaje?.asunto || '',
        contenido: mensaje?.contenido || '',
        archivo: null
    });
    const [previewImagen, setPreviewImagen] = useState(null);
    const [archivoActual, setArchivoActual] = useState(mensaje?.archivo_adjunto || null);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (mensaje) {
            setFormData({
                asunto: mensaje.asunto || '',
                contenido: mensaje.contenido || '',
                archivo: null
            });
            setArchivoActual(mensaje.archivo_adjunto || null);
        }
    }, [mensaje]);

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

        setGuardando(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('id_remitente', user.id);
            formDataToSend.append('asunto', formData.asunto);
            formDataToSend.append('contenido', formData.contenido);
            if (formData.archivo) {
                formDataToSend.append('archivo', formData.archivo);
            }

            await onGuardar(mensaje.id_mensaje, formDataToSend);
        } catch (error) {
            console.error('Error al guardar mensaje:', error);
        } finally {
            setGuardando(false);
        }
    };

    const urlArchivoActual = archivoActual 
        ? `http://localhost:5000${archivoActual}`
        : null;
    const esImagenActual = archivoActual && /\.(jpg|jpeg|png|gif|webp)$/i.test(archivoActual);

    return (
        <div className="vista-editar-mensaje">
            <div className="vista-header">
                <h3>✏️ Editar Mensaje</h3>
                <button className="btn-close" onClick={onCancelar}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="mensaje-form">
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
                        rows="8"
                        required
                    />
                </div>
                {archivoActual && !formData.archivo && (
                    <div className="form-group">
                        <label>Archivo actual:</label>
                        <div className="archivo-actual">
                            {esImagenActual ? (
                                <div>
                                    <img 
                                        src={urlArchivoActual} 
                                        alt="Archivo actual" 
                                        style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px', borderRadius: '8px' }}
                                    />
                                    <a 
                                        href={urlArchivoActual} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="btn-download"
                                    >
                                        📥 Ver archivo actual
                                    </a>
                                </div>
                            ) : (
                                <a 
                                    href={urlArchivoActual} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn-download"
                                >
                                    📎 Ver archivo actual
                                </a>
                            )}
                        </div>
                    </div>
                )}
                <div className="form-group">
                    <label>{archivoActual ? 'Reemplazar archivo:' : 'Adjuntar archivo (opcional):'}</label>
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
                    <button type="submit" className="btn-primary" disabled={guardando}>
                        {guardando ? 'Guardando...' : '💾 Guardar Cambios'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={onCancelar}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VistaEditarMensaje;

