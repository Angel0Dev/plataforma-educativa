import React from 'react';
import './MensajeriaVistas.css';

const VistaMensajeIndividual = ({ mensaje, tipoVista, user, onResponder, onEditar, onCerrar }) => {
    if (!mensaje) return null;

    const remitenteNombre = tipoVista === 'recibidos'
        ? `${mensaje.remitente_nombre} ${mensaje.remitente_apellido}`
        : `${mensaje.destinatario_nombre} ${mensaje.destinatario_apellido}`;
    const remitenteRol = tipoVista === 'recibidos'
        ? mensaje.remitente_rol
        : mensaje.destinatario_rol;

    const esRemitente = mensaje.id_emisor === user.id;
    const puedeEditar = esRemitente && !mensaje.leido;

    const esImagen = mensaje.archivo_adjunto && /\.(jpg|jpeg|png|gif|webp)$/i.test(mensaje.archivo_adjunto);
    const urlArchivo = mensaje.archivo_adjunto 
        ? `http://localhost:5000${mensaje.archivo_adjunto}`
        : null;

    return (
        <div className="mensaje-detail">
            <div className="mensaje-detail-header">
                <button className="btn-close" onClick={onCerrar}>×</button>
            </div>
            <div className="mensaje-detail-content">
                <div className="mensaje-detail-meta">
                    <div>
                        <strong>{remitenteNombre}</strong>
                        <span className="mensaje-rol">({remitenteRol})</span>
                    </div>
                    <div className="mensaje-detail-date">
                        {new Date(mensaje.fecha_envio).toLocaleString()}
                    </div>
                </div>
                <div className="mensaje-detail-subject">
                    <strong>Asunto:</strong> {mensaje.asunto || 'Sin asunto'}
                </div>
                <div className="mensaje-detail-body">
                    <div className="mensaje-contenido">
                        {mensaje.contenido}
                    </div>
                    {urlArchivo && (
                        <div className="mensaje-archivo">
                            <strong>📎 Archivo adjunto:</strong>
                            {esImagen ? (
                                <div className="archivo-imagen">
                                    <img 
                                        src={urlArchivo} 
                                        alt="Adjunto" 
                                        style={{ maxWidth: '100%', maxHeight: '400px', marginTop: '10px', borderRadius: '8px' }}
                                    />
                                    <a 
                                        href={urlArchivo} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="btn-download"
                                    >
                                        📥 Descargar imagen
                                    </a>
                                </div>
                            ) : (
                                <div className="archivo-documento">
                                    <a 
                                        href={urlArchivo} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="btn-download"
                                    >
                                        📥 Descargar archivo
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="mensaje-detail-actions">
                    {tipoVista === 'recibidos' && (
                        <button className="btn-primary" onClick={onResponder}>
                            📧 Responder
                        </button>
                    )}
                    {puedeEditar && (
                        <button className="btn-secondary" onClick={onEditar}>
                            ✏️ Editar Mensaje
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VistaMensajeIndividual;

