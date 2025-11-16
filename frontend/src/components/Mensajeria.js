import React, { useState, useEffect } from 'react';
import VistaListaMensajes from './mensajeria/VistaListaMensajes';
import VistaMensajeIndividual from './mensajeria/VistaMensajeIndividual';
import VistaResponderMensaje from './mensajeria/VistaResponderMensaje';
import VistaNuevoMensaje from './mensajeria/VistaNuevoMensaje';
import VistaEditarMensaje from './mensajeria/VistaEditarMensaje';
import './Mensajeria.css';

const Mensajeria = ({ user }) => {
    const [mensajesRecibidos, setMensajesRecibidos] = useState([]);
    const [mensajesEnviados, setMensajesEnviados] = useState([]);
    const [vistaActual, setVistaActual] = useState('lista'); // 'lista', 'nuevo', 'ver', 'responder', 'editar'
    const [tipoVista, setTipoVista] = useState('recibidos'); // 'recibidos', 'enviados'
    const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
    const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
    const [buscandoUsuarios, setBuscandoUsuarios] = useState(false);
    const [estadisticas, setEstadisticas] = useState({
        mensajes_recibidos: 0,
        mensajes_enviados: 0,
        mensajes_no_leidos: 0
    });
    const [loading, setLoading] = useState(true);

    // Cargar mensajes y estadísticas
    useEffect(() => {
        cargarMensajes();
        cargarEstadisticas();
    }, [user.id, tipoVista]);

    const cargarMensajes = async () => {
        try {
            setLoading(true);
            if (tipoVista === 'recibidos') {
                const response = await fetch(`http://localhost:5000/api/mensajes/usuario/${user.id}?tipo=recibidos`);
                if (response.ok) {
                    const data = await response.json();
                    setMensajesRecibidos(data.data || []);
                }
            } else if (tipoVista === 'enviados') {
                const response = await fetch(`http://localhost:5000/api/mensajes/usuario/${user.id}?tipo=enviados`);
                if (response.ok) {
                    const data = await response.json();
                    setMensajesEnviados(data.data || []);
                }
            }
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarEstadisticas = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/mensajes/estadisticas/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setEstadisticas(data.data || estadisticas);
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    // Buscar usuarios para enviar mensaje
    const buscarUsuarios = async (termino) => {
        if (termino.length < 2) {
            setUsuariosDisponibles([]);
            return;
        }

        try {
            setBuscandoUsuarios(true);
            let response;
            try {
                response = await fetch(`http://localhost:5000/api/admin/usuarios`);
            } catch (e) {
                response = await fetch(`http://localhost:5000/api/usuarios`);
            }
            
            if (response && response.ok) {
                const data = await response.json();
                const usuarios = data.data || data || [];
                const usuariosFiltrados = usuarios.filter(u => 
                    u.activo !== false && 
                    u.id_usuario !== user.id &&
                    (u.nombre?.toLowerCase().includes(termino.toLowerCase()) ||
                     u.apellido?.toLowerCase().includes(termino.toLowerCase()) ||
                     u.correo?.toLowerCase().includes(termino.toLowerCase()) ||
                     (u.rol && u.rol.toLowerCase().includes(termino.toLowerCase())))
                );
                setUsuariosDisponibles(usuariosFiltrados.slice(0, 10));
            }
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
        } finally {
            setBuscandoUsuarios(false);
        }
    };

    // Marcar mensaje como leído
    const marcarComoLeido = async (idMensaje) => {
        try {
            const response = await fetch(`http://localhost:5000/api/mensajes/${idMensaje}/leido`, {
                method: 'PUT',
            });

            if (response.ok) {
                await cargarMensajes();
                await cargarEstadisticas();
            }
        } catch (error) {
            console.error('Error al marcar mensaje como leído:', error);
        }
    };

    // Ver detalles del mensaje
    const verMensaje = async (mensaje) => {
        setMensajeSeleccionado(mensaje);
        setVistaActual('ver');
        if (!mensaje.leido && tipoVista === 'recibidos') {
            await marcarComoLeido(mensaje.id_mensaje);
        }
    };

    // Enviar mensaje
    const enviarMensaje = async (formData) => {
        try {
            const response = await fetch('http://localhost:5000/api/mensajes', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Mensaje enviado exitosamente');
                setVistaActual('lista');
                setTipoVista('enviados');
                await cargarMensajes();
                await cargarEstadisticas();
                return true;
            } else {
                const error = await response.json();
                alert(`Error al enviar mensaje: ${error.message}`);
                return false;
            }
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            alert('Error de conexión al enviar el mensaje');
            return false;
        }
    };

    // Editar mensaje
    const editarMensaje = async (idMensaje, formData) => {
        try {
            const response = await fetch(`http://localhost:5000/api/mensajes/${idMensaje}`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                alert('Mensaje actualizado exitosamente');
                setVistaActual('lista');
                await cargarMensajes();
                await cargarEstadisticas();
                return true;
            } else {
                const error = await response.json();
                alert(`Error al actualizar mensaje: ${error.message}`);
                return false;
            }
        } catch (error) {
            console.error('Error al editar mensaje:', error);
            alert('Error de conexión al editar el mensaje');
            return false;
        }
    };

    const mensajesActuales = tipoVista === 'recibidos' ? mensajesRecibidos : mensajesEnviados;

    return (
        <div className="mensajeria-container">
            <div className="mensajeria-header">
                <h2>📧 Sistema de Mensajería</h2>
                <div className="mensajeria-stats">
                    <div className="stat-item">
                        <span className="stat-label">Recibidos:</span>
                        <span className="stat-value">{estadisticas.mensajes_recibidos}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Enviados:</span>
                        <span className="stat-value">{estadisticas.mensajes_enviados}</span>
                    </div>
                    <div className="stat-item unread">
                        <span className="stat-label">No leídos:</span>
                        <span className="stat-value">{estadisticas.mensajes_no_leidos}</span>
                    </div>
                </div>
            </div>

            <div className="mensajeria-content">
                {/* Barra de navegación */}
                <div className="mensajeria-nav">
                    <button
                        className={`nav-btn ${tipoVista === 'recibidos' && vistaActual === 'lista' ? 'active' : ''}`}
                        onClick={() => {
                            setTipoVista('recibidos');
                            setVistaActual('lista');
                            setMensajeSeleccionado(null);
                        }}
                    >
                        📥 Recibidos {estadisticas.mensajes_no_leidos > 0 && (
                            <span className="badge">{estadisticas.mensajes_no_leidos}</span>
                        )}
                    </button>
                    <button
                        className={`nav-btn ${tipoVista === 'enviados' && vistaActual === 'lista' ? 'active' : ''}`}
                        onClick={() => {
                            setTipoVista('enviados');
                            setVistaActual('lista');
                            setMensajeSeleccionado(null);
                        }}
                    >
                        📤 Enviados
                    </button>
                    <button
                        className={`nav-btn ${vistaActual === 'nuevo' ? 'active' : ''}`}
                        onClick={() => {
                            setVistaActual('nuevo');
                            setMensajeSeleccionado(null);
                        }}
                    >
                        ✉️ Nuevo Mensaje
                    </button>
                </div>

                {/* Contenido principal */}
                <div className="mensajeria-main">
                    {vistaActual === 'lista' && (
                        <div className="mensajeria-list-container" style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: '0 0 300px' }}>
                                <VistaListaMensajes
                                    mensajes={mensajesActuales}
                                    tipoVista={tipoVista}
                                    onSeleccionarMensaje={verMensaje}
                                    mensajeSeleccionado={mensajeSeleccionado}
                                    loading={loading}
                                />
                            </div>
                            {mensajeSeleccionado && (
                                <div style={{ flex: 1 }}>
                                    <VistaMensajeIndividual
                                        mensaje={mensajeSeleccionado}
                                        tipoVista={tipoVista}
                                        user={user}
                                        onResponder={() => setVistaActual('responder')}
                                        onEditar={() => setVistaActual('editar')}
                                        onCerrar={() => {
                                            setMensajeSeleccionado(null);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {vistaActual === 'ver' && mensajeSeleccionado && (
                        <VistaMensajeIndividual
                            mensaje={mensajeSeleccionado}
                            tipoVista={tipoVista}
                            user={user}
                            onResponder={() => setVistaActual('responder')}
                            onEditar={() => setVistaActual('editar')}
                            onCerrar={() => {
                                setMensajeSeleccionado(null);
                                setVistaActual('lista');
                            }}
                        />
                    )}

                    {vistaActual === 'responder' && mensajeSeleccionado && (
                        <VistaResponderMensaje
                            mensajeOriginal={mensajeSeleccionado}
                            user={user}
                            onEnviar={enviarMensaje}
                            onCancelar={() => {
                                setVistaActual('ver');
                            }}
                        />
                    )}

                    {vistaActual === 'nuevo' && (
                        <VistaNuevoMensaje
                            user={user}
                            usuariosDisponibles={usuariosDisponibles}
                            onBuscarUsuarios={buscarUsuarios}
                            onEnviar={enviarMensaje}
                            onCancelar={() => {
                                setVistaActual('lista');
                                setUsuariosDisponibles([]);
                            }}
                        />
                    )}

                    {vistaActual === 'editar' && mensajeSeleccionado && (
                        <VistaEditarMensaje
                            mensaje={mensajeSeleccionado}
                            user={user}
                            onGuardar={editarMensaje}
                            onCancelar={() => {
                                setVistaActual('ver');
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Mensajeria;
