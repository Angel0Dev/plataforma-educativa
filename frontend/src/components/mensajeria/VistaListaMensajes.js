import React from 'react';
import './MensajeriaVistas.css';

const VistaListaMensajes = ({ mensajes, tipoVista, onSeleccionarMensaje, mensajeSeleccionado, loading }) => {
    if (loading) {
        return (
            <div className="mensajes-list-container">
                <div className="loading">Cargando mensajes...</div>
            </div>
        );
    }

    return (
        <div className="mensajes-list-container">
            <div className="mensajes-list">
                <h3>{tipoVista === 'recibidos' ? '📥 Mensajes Recibidos' : '📤 Mensajes Enviados'}</h3>
                {mensajes.length > 0 ? (
                    <div className="mensajes-grid">
                        {mensajes.map(mensaje => {
                            const remitenteNombre = tipoVista === 'recibidos' 
                                ? `${mensaje.remitente_nombre || ''} ${mensaje.remitente_apellido || ''}`.trim()
                                : `${mensaje.destinatario_nombre || ''} ${mensaje.destinatario_apellido || ''}`.trim();
                            const remitenteRol = tipoVista === 'recibidos'
                                ? (mensaje.remitente_rol || '')
                                : (mensaje.destinatario_rol || '');

                            return (
                                <div
                                    key={mensaje.id_mensaje}
                                    className={`mensaje-item ${!mensaje.leido && tipoVista === 'recibidos' ? 'unread' : ''} ${mensajeSeleccionado?.id_mensaje === mensaje.id_mensaje ? 'selected' : ''}`}
                                    onClick={() => onSeleccionarMensaje(mensaje)}
                                >
                                    <div className="mensaje-header">
                                        <div className="mensaje-sender">
                                            <strong>{remitenteNombre || 'Usuario desconocido'}</strong>
                                            <span className="mensaje-rol">{remitenteRol}</span>
                                        </div>
                                        <div className="mensaje-meta">
                                            <span className="mensaje-date">
                                                {new Date(mensaje.fecha_envio).toLocaleString()}
                                            </span>
                                            {!mensaje.leido && tipoVista === 'recibidos' && (
                                                <span className="badge-unread">Nuevo</span>
                                            )}
                                            {mensaje.archivo_adjunto && (
                                                <span className="badge-archivo">📎</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mensaje-subject">
                                        {mensaje.asunto || 'Sin asunto'}
                                    </div>
                                    <div className="mensaje-preview">
                                        {mensaje.contenido.substring(0, 100)}
                                        {mensaje.contenido.length > 100 && '...'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="no-messages">
                        <p>No hay mensajes {tipoVista === 'recibidos' ? 'recibidos' : 'enviados'}.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VistaListaMensajes;

