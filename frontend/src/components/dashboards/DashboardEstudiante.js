import React, { useState, useEffect } from 'react';

const DashboardEstudiante = ({ user }) => {
    const [mensajes, setMensajes] = useState([]);
    const [tareas, setTareas] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [calificaciones, setCalificaciones] = useState([]);
    const [padreInfo, setPadreInfo] = useState(null);
    const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMensajeModal, setShowMensajeModal] = useState(false);
    const [showEntregarTarea, setShowEntregarTarea] = useState(false);
    const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
    const [nuevaEntrega, setNuevaEntrega] = useState({
        archivo_adjunto: '',
        comentario: ''
    });
    const [nuevoMensaje, setNuevoMensaje] = useState({
        destinatario: '',
        asunto: '',
        contenido: ''
    });

    // Función para determinar el color de la tarea según proximidad
    const getTareaColor = (fechaLimite, estadoEntrega) => {
        if (estadoEntrega === 'Entregado' || estadoEntrega === 'Calificado') {
            return '#28a745'; // Verde - completada
        }

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const limite = new Date(fechaLimite);
        limite.setHours(0, 0, 0, 0);
        const diasRestantes = Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24));

        if (diasRestantes < 0) {
            return '#dc3545'; // Rojo - vencida
        } else if (diasRestantes <= 3) {
            return '#dc3545'; // Rojo - muy próxima
        } else if (diasRestantes <= 7) {
            return '#ff9800'; // Naranja - próxima
        } else {
            return '#28a745'; // Verde - tiempo suficiente
        }
    };

    // Función para obtener el estado de la tarea
    const getTareaEstado = (fechaLimite, estadoEntrega) => {
        if (estadoEntrega === 'Entregado' || estadoEntrega === 'Calificado') {
            return 'Entregado';
        }

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const limite = new Date(fechaLimite);
        limite.setHours(0, 0, 0, 0);
        const diasRestantes = Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24));

        if (diasRestantes < 0) {
            return 'Vencida';
        } else if (diasRestantes <= 3) {
            return 'Urgente';
        } else if (diasRestantes <= 7) {
            return 'Próxima';
        } else {
            return 'Pendiente';
        }
    };

    // Cargar datos del estudiante
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                
                // Cargar tareas del estudiante
                const tareasRes = await fetch(`http://localhost:5000/api/tareas/estudiante/${user.id}`);
                if (tareasRes.ok) {
                    const tareasData = await tareasRes.json();
                    setTareas(tareasData.data || []);
                }

                // Cargar cursos del estudiante (a través de matrículas)
                const matriculasRes = await fetch(`http://localhost:5000/api/matriculas/estudiante/${user.id}`);
                if (matriculasRes.ok) {
                    const matriculasData = await matriculasRes.json();
                    const cursosIds = [...new Set((matriculasData.data || []).map(m => m.id_curso))];
                    
                    // Cargar información de cada curso
                    const cursosData = await Promise.all(
                        cursosIds.map(async (idCurso) => {
                            const cursoRes = await fetch(`http://localhost:5000/api/cursos/${idCurso}`);
                            if (cursoRes.ok) {
                                const cursoData = await cursoRes.json();
                                return cursoData.data;
                            }
                            return null;
                        })
                    );
                    setCursos(cursosData.filter(c => c !== null));
                }

                // Cargar calificaciones (desde entregas calificadas)
                const tareasConCalificaciones = await fetch(`http://localhost:5000/api/tareas/estudiante/${user.id}`);
                if (tareasConCalificaciones.ok) {
                    const tareasData = await tareasConCalificaciones.json();
                    const calificacionesData = (tareasData.data || [])
                        .filter(t => t.calificacion !== null)
                        .map(t => ({
                            id: t.id_tarea,
                            tarea: t.titulo,
                            materia: t.nombre_curso,
                            calificacion: t.calificacion,
                            fecha: t.fecha_entrega,
                            feedback: t.feedback_docente
                        }));
                    setCalificaciones(calificacionesData.slice(0, 5)); // Últimas 5
                }

                // Cargar mensajes
                const mensajesRes = await fetch(`http://localhost:5000/api/mensajes/usuario/${user.id}?tipo=recibidos`);
                if (mensajesRes.ok) {
                    const mensajesData = await mensajesRes.json();
                    setMensajes(mensajesData.data.slice(0, 5));
                }

                // Cargar usuarios disponibles para mensajes
                const usuariosRes = await fetch('http://localhost:5000/api/usuarios');
                if (usuariosRes.ok) {
                    const usuariosData = await usuariosRes.json();
                    setUsuariosDisponibles(usuariosData.data.filter(u => u.id_usuario !== user.id));
                }

                // Cargar información del padre
                const padreRes = await fetch(`http://localhost:5000/api/usuarios/estudiante/${user.id}/padre`);
                if (padreRes.ok) {
                    const padreData = await padreRes.json();
                    if (padreData.data && padreData.data.length > 0) {
                        setPadreInfo(padreData.data[0]);
                    }
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [user.id]);

    // Enviar mensaje
    const enviarMensaje = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:5000/api/mensajes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_remitente: user.id,
                    id_destinatario: parseInt(nuevoMensaje.destinatario),
                    asunto: nuevoMensaje.asunto,
                    contenido: nuevoMensaje.contenido
                }),
            });

            if (response.ok) {
                alert('Mensaje enviado exitosamente');
                setNuevoMensaje({ destinatario: '', asunto: '', contenido: '' });
                setShowMensajeModal(false);
            } else {
                const error = await response.json();
                alert(`Error al enviar mensaje: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            alert('Error de conexión al enviar el mensaje');
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    // Ordenar tareas por fecha límite (más próximas primero)
    const tareasOrdenadas = [...tareas].sort((a, b) => {
        const fechaA = new Date(a.fecha_limite);
        const fechaB = new Date(b.fecha_limite);
        return fechaA - fechaB;
    });

    // Calcular estadísticas
    const tareasPendientes = tareasOrdenadas.filter(t => !t.id_entrega || t.estado_entrega !== 'Entregado');
    const tareasVencidas = tareasOrdenadas.filter(t => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const limite = new Date(t.fecha_limite);
        limite.setHours(0, 0, 0, 0);
        return limite < hoy && (!t.id_entrega || t.estado_entrega !== 'Entregado');
    });
    const tareasUrgentes = tareasOrdenadas.filter(t => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const limite = new Date(t.fecha_limite);
        limite.setHours(0, 0, 0, 0);
        const diasRestantes = Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24));
        return diasRestantes <= 3 && diasRestantes >= 0 && (!t.id_entrega || t.estado_entrega !== 'Entregado');
    });

    // Calcular promedio de calificaciones
    const promedioCalificaciones = calificaciones.length > 0
        ? (calificaciones.reduce((sum, cal) => sum + parseFloat(cal.calificacion), 0) / calificaciones.length).toFixed(1)
        : 'N/A';

    return (
        <>
        <div className="dashboard-container">
            {/* Header del Dashboard */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Dashboard Estudiante</h1>
                    <p className="dashboard-subtitle">Bienvenido a tu panel de control</p>
                </div>
                <div className="user-info">
                    <p className="user-name">{user.nombre} {user.apellido}</p>
                    <p className="user-role">🎓 Estudiante</p>
                </div>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div className="card-header">
                        <div className="card-icon">📚</div>
                        <h3 className="card-title">Cursos Activos</h3>
                    </div>
                    <div className="card-content">
                        <p><strong>{cursos.length}</strong> cursos inscritos</p>
                        <p>Promedio general: <strong>{promedioCalificaciones}</strong></p>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <div className="card-icon">📝</div>
                        <h3 className="card-title">Tareas Pendientes</h3>
                    </div>
                    <div className="card-content">
                        <p><strong>{tareasPendientes.length}</strong> tareas por entregar</p>
                        <p><strong style={{ color: '#dc3545' }}>{tareasUrgentes.length}</strong> urgentes</p>
                        {tareasVencidas.length > 0 && (
                            <p><strong style={{ color: '#dc3545' }}>{tareasVencidas.length}</strong> vencidas</p>
                        )}
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <div className="card-icon">📊</div>
                        <h3 className="card-title">Calificaciones</h3>
                    </div>
                    <div className="card-content">
                        <p>Promedio actual: <strong>{promedioCalificaciones}</strong></p>
                        <p>Calificaciones: <strong>{calificaciones.length}</strong></p>
                    </div>
                </div>
            </div>

            {/* Tareas Pendientes */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-icon">⏰</div>
                    <h3 className="card-title">Tareas Próximas a Vencer</h3>
                </div>
                <div className="card-content">
                    {tareasOrdenadas.length > 0 ? (
                        <div className="tareas-list">
                            {tareasOrdenadas.map(tarea => {
                                const colorTarea = getTareaColor(tarea.fecha_limite, tarea.estado_entrega);
                                const estadoTarea = getTareaEstado(tarea.fecha_limite, tarea.estado_entrega);
                                const diasRestantes = Math.ceil((new Date(tarea.fecha_limite) - new Date()) / (1000 * 60 * 60 * 24));
                                
                                return (
                                    <div 
                                        key={tarea.id_tarea} 
                                        className="tarea-item"
                                        style={{
                                            borderLeft: `5px solid ${colorTarea}`,
                                            backgroundColor: colorTarea === '#dc3545' ? '#fff5f5' : 
                                                          colorTarea === '#ff9800' ? '#fff8e1' : '#f0f9ff'
                                        }}
                                    >
                                        <div className="tarea-info">
                                            <h4 style={{ color: '#333', marginBottom: '5px' }}>{tarea.titulo}</h4>
                                            <p style={{ color: '#666', margin: '3px 0' }}>
                                                <strong>Curso:</strong> {tarea.nombre_curso}
                                            </p>
                                            {tarea.descripcion && (
                                                <p style={{ color: '#666', margin: '3px 0', fontSize: '0.9rem' }}>
                                                    {tarea.descripcion}
                                                </p>
                                            )}
                                            <p style={{ color: '#666', margin: '3px 0' }}>
                                                <strong>Vence:</strong> {new Date(tarea.fecha_limite).toLocaleDateString()}
                                                {diasRestantes >= 0 && (
                                                    <span style={{ 
                                                        marginLeft: '10px', 
                                                        color: colorTarea,
                                                        fontWeight: 'bold'
                                                    }}>
                                                        ({diasRestantes} {diasRestantes === 1 ? 'día' : 'días'} restantes)
                                                    </span>
                                                )}
                                                {diasRestantes < 0 && (
                                                    <span style={{ 
                                                        marginLeft: '10px', 
                                                        color: '#dc3545',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        (Vencida hace {Math.abs(diasRestantes)} {Math.abs(diasRestantes) === 1 ? 'día' : 'días'})
                                                    </span>
                                                )}
                                            </p>
                                            <p style={{ color: '#666', margin: '3px 0' }}>
                                                <strong>Puntos máximos:</strong> {tarea.puntos_maximos}
                                            </p>
                                            {tarea.calificacion !== null && (
                                                <p style={{ color: '#28a745', margin: '5px 0', fontWeight: 'bold' }}>
                                                    Calificación: {tarea.calificacion} / {tarea.puntos_maximos}
                                                </p>
                                            )}
                                        </div>
                                        <div className="tarea-status">
                                            <span 
                                                className="status-badge"
                                                style={{
                                                    backgroundColor: colorTarea,
                                                    color: 'white',
                                                    padding: '5px 12px',
                                                    borderRadius: '15px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {estadoTarea}
                                            </span>
                                        </div>
                                        <div className="tarea-actions">
                                            {tarea.id_entrega ? (
                                                <button className="btn-secondary" disabled>
                                                    ✓ Entregado
                                                </button>
                                            ) : (
                                                <button 
                                                    className="btn-primary"
                                                    onClick={() => {
                                                        setTareaSeleccionada(tarea);
                                                        setShowEntregarTarea(true);
                                                    }}
                                                >
                                                    Entregar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="no-data">
                            <p>No tienes tareas asignadas.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Calificaciones Recientes */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-icon">🎯</div>
                    <h3 className="card-title">Calificaciones Recientes</h3>
                </div>
                <div className="card-content">
                    {calificaciones.length > 0 ? (
                        <div className="calificaciones-list">
                            {calificaciones.map(cal => (
                                <div key={cal.id} className="calificacion-item">
                                    <div className="cal-info">
                                        <h4>{cal.tarea}</h4>
                                        <p>{cal.materia} - {new Date(cal.fecha).toLocaleDateString()}</p>
                                        {cal.feedback && (
                                            <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>
                                                Feedback: {cal.feedback}
                                            </p>
                                        )}
                                    </div>
                                    <div className="cal-nota">
                                        <span className={`nota-badge ${cal.calificacion >= 80 ? 'excelente' : cal.calificacion >= 60 ? 'buena' : 'regular'}`}>
                                            {cal.calificacion}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-data">
                            <p>No tienes calificaciones aún.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Cursos Inscritos */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-icon">📖</div>
                    <h3 className="card-title">Mis Cursos</h3>
                </div>
                <div className="card-content">
                    {cursos.length > 0 ? (
                        <div className="cursos-list">
                            {cursos.map(curso => (
                                <div key={curso.id_curso} className="curso-item">
                                    <div className="curso-info">
                                        <h4>{curso.nombre_curso}</h4>
                                        {curso.descripcion && <p>{curso.descripcion}</p>}
                                        {curso.docente_nombre && (
                                            <p>Profesor: {curso.docente_nombre} {curso.docente_apellido}</p>
                                        )}
                                    </div>
                                    <div className="curso-actions">
                                        <button className="btn-secondary">Ver Detalles</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-data">
                            <p>No estás inscrito en ningún curso.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Información del Padre */}
            {padreInfo && (
                <div className="dashboard-card">
                    <div className="card-header">
                        <div className="card-icon">👨‍👩‍👧‍👦</div>
                        <h3 className="card-title">Información del Padre/Madre</h3>
                    </div>
                    <div className="card-content">
                        <div className="padre-info">
                            <div className="info-row">
                                <strong>Nombre:</strong> {padreInfo.nombre} {padreInfo.apellido}
                            </div>
                            {padreInfo.dni && (
                                <div className="info-row">
                                    <strong>DNI:</strong> {padreInfo.dni}
                                </div>
                            )}
                            <div className="info-row">
                                <strong>Correo:</strong> {padreInfo.correo}
                            </div>
                            {padreInfo.telefono && (
                                <div className="info-row">
                                    <strong>Teléfono:</strong> {padreInfo.telefono}
                                </div>
                            )}
                            {padreInfo.direccion && (
                                <div className="info-row">
                                    <strong>Dirección:</strong> {padreInfo.direccion}
                                </div>
                            )}
                            <div className="info-row">
                                <strong>Relación:</strong> {padreInfo.relacion || 'Padre/Madre'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mensajes Recientes */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-icon">📧</div>
                    <h3 className="card-title">Mensajes Recientes</h3>
                    <button 
                        className="btn-primary"
                        onClick={() => setShowMensajeModal(true)}
                    >
                        Enviar Mensaje
                    </button>
                </div>
                <div className="card-content">
                    <div className="messages-list">
                        {mensajes.length > 0 ? (
                            mensajes.map(mensaje => (
                                <div key={mensaje.id_mensaje} className="message-item">
                                    <div className="message-header">
                                        <h4 className="message-sender">
                                            {mensaje.remitente_nombre} {mensaje.remitente_apellido}
                                        </h4>
                                        <span className="message-date">
                                            {new Date(mensaje.fecha_envio).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h5 className="message-subject">{mensaje.asunto || 'Sin asunto'}</h5>
                                    <p className="message-content">{mensaje.contenido}</p>
                                    {mensaje.nombre_curso && (
                                        <span className="message-course">Curso: {mensaje.nombre_curso}</span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="no-data">
                                <p>No tienes mensajes recientes.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Modal para Enviar Mensaje */}
        {showMensajeModal && (
            <div className="modal-overlay">
                <div className="modal">
                    <div className="modal-header">
                        <h3>Enviar Mensaje</h3>
                        <button 
                            className="modal-close"
                            onClick={() => {
                                setShowMensajeModal(false);
                                setNuevoMensaje({ destinatario: '', asunto: '', contenido: '' });
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <form onSubmit={enviarMensaje} className="modal-content">
                        <div className="form-group">
                            <label>Destinatario:</label>
                            <select 
                                value={nuevoMensaje.destinatario}
                                onChange={(e) => setNuevoMensaje({...nuevoMensaje, destinatario: e.target.value})}
                                required
                            >
                                <option value="">Seleccionar destinatario</option>
                                {usuariosDisponibles.map(usuario => (
                                    <option key={usuario.id_usuario} value={usuario.id_usuario}>
                                        {usuario.nombre} {usuario.apellido} ({usuario.rol})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Asunto:</label>
                            <input 
                                type="text" 
                                value={nuevoMensaje.asunto}
                                onChange={(e) => setNuevoMensaje({...nuevoMensaje, asunto: e.target.value})}
                                placeholder="Asunto del mensaje"
                            />
                        </div>
                        <div className="form-group">
                            <label>Mensaje:</label>
                            <textarea 
                                value={nuevoMensaje.contenido}
                                onChange={(e) => setNuevoMensaje({...nuevoMensaje, contenido: e.target.value})}
                                placeholder="Escribe tu mensaje aquí..."
                                rows="4"
                                required
                            />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowMensajeModal(false)}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn-primary">
                                Enviar Mensaje
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    );
};

export default DashboardEstudiante;
