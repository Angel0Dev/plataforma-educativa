import React, { useState, useEffect } from 'react';

const DashboardPadre = ({ user }) => {
    const [mensajes, setMensajes] = useState([]);
    const [mensajesEnviados, setMensajesEnviados] = useState([]);
    const [showMensajeModal, setShowMensajeModal] = useState(false);
    const [showTodosMensajes, setShowTodosMensajes] = useState(false);
    const [tipoMensajes, setTipoMensajes] = useState('recibidos'); // 'recibidos' o 'enviados'
    const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState({
        destinatario: '',
        asunto: '',
        contenido: ''
    });
    const [loading, setLoading] = useState(true);
    const [hijos, setHijos] = useState([]);
    const [showBuscarHijo, setShowBuscarHijo] = useState(false);
    const [showRegistrarHijo, setShowRegistrarHijo] = useState(false);
    const [busquedaHijo, setBusquedaHijo] = useState('');
    const [estudiantesEncontrados, setEstudiantesEncontrados] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [matriculasHijos, setMatriculasHijos] = useState([]);
    const [nuevoHijo, setNuevoHijo] = useState({
        nombre: '',
        apellido: '',
        dni: ''
    });
    const [credencialesGeneradas, setCredencialesGeneradas] = useState(null);
    const [showEditarCredenciales, setShowEditarCredenciales] = useState(false);
    const [hijoSeleccionadoCredenciales, setHijoSeleccionadoCredenciales] = useState(null);
    const [credencialesEdit, setCredencialesEdit] = useState({
        nuevo_correo: '',
        nueva_contrasena: '',
        confirmar_contrasena: ''
    });

    // Cargar mensajes y hijos del padre
    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                // Cargar mensajes recibidos y enviados
                const [recibidosRes, enviadosRes, usuariosRes, hijosRes, matriculasRes] = await Promise.all([
                    fetch(`http://localhost:5000/api/mensajes/usuario/${user.id}?tipo=recibidos`),
                    fetch(`http://localhost:5000/api/mensajes/usuario/${user.id}?tipo=enviados`),
                    fetch('http://localhost:5000/api/usuarios'),
                    fetch(`http://localhost:5000/api/usuarios/padre/${user.id}/hijos`),
                    fetch(`http://localhost:5000/api/usuarios/padre/${user.id}/hijos/matriculas`)
                ]);

                if (recibidosRes.ok) {
                    const data = await recibidosRes.json();
                    setMensajes(data.data);
                }
                if (enviadosRes.ok) {
                    const data = await enviadosRes.json();
                    setMensajesEnviados(data.data);
                }
                if (usuariosRes.ok) {
                    const data = await usuariosRes.json();
                    setUsuariosDisponibles(data.data.filter(u => u.id_usuario !== user.id));
                }
                if (hijosRes.ok) {
                    const data = await hijosRes.json();
                    setHijos(data.data || []);
                }
                if (matriculasRes.ok) {
                    const data = await matriculasRes.json();
                    setMatriculasHijos(data.data || []);
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

    // Función para buscar estudiantes por nombre o DNI
    const buscarEstudiantes = async () => {
        if (!busquedaHijo.trim()) {
            alert('Por favor ingrese un nombre o DNI para buscar');
            return;
        }

        setBuscando(true);
        try {
            const response = await fetch(`http://localhost:5000/api/usuarios/buscar-estudiantes?q=${encodeURIComponent(busquedaHijo)}`);
            if (response.ok) {
                const data = await response.json();
                setEstudiantesEncontrados(data.data || []);
            } else {
                const error = await response.json();
                alert(`Error al buscar: ${error.message}`);
                setEstudiantesEncontrados([]);
            }
        } catch (error) {
            console.error('Error al buscar estudiantes:', error);
            alert('Error de conexión al buscar estudiantes');
            setEstudiantesEncontrados([]);
        } finally {
            setBuscando(false);
        }
    };

    // Función para vincular un hijo
    const vincularHijo = async (idEstudiante, relacion = 'Padre/Madre') => {
        try {
            const response = await fetch('http://localhost:5000/api/usuarios/vincular-padre', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_padre: user.id,
                    id_estudiante: idEstudiante,
                    relacion: relacion
                }),
            });

            if (response.ok) {
                const data = await response.json();
                alert('Hijo vinculado exitosamente');
                
                // Recargar la lista de hijos
                const hijosRes = await fetch(`http://localhost:5000/api/usuarios/padre/${user.id}/hijos`);
                if (hijosRes.ok) {
                    const hijosData = await hijosRes.json();
                    setHijos(hijosData.data || []);
                }
                
                // Cerrar modal y limpiar búsqueda
                setShowBuscarHijo(false);
                setBusquedaHijo('');
                setEstudiantesEncontrados([]);
            } else {
                const error = await response.json();
                alert(`Error al vincular hijo: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al vincular hijo:', error);
            alert('Error de conexión al vincular el hijo');
        }
    };

    // Función para registrar un nuevo hijo
    const registrarHijo = async (e) => {
        e.preventDefault();
        
        if (!nuevoHijo.nombre || !nuevoHijo.apellido) {
            alert('Nombre y apellido son obligatorios');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/usuarios/padre/registrar-hijo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_padre: user.id,
                    nombre: nuevoHijo.nombre,
                    apellido: nuevoHijo.apellido,
                    dni: nuevoHijo.dni || null,
                    cursos: [] // Los padres no pueden matricular cursos
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setCredencialesGeneradas(data.data);
                
                // Recargar la lista de hijos
                const hijosRes = await fetch(`http://localhost:5000/api/usuarios/padre/${user.id}/hijos`);
                if (hijosRes.ok) {
                    const hijosData = await hijosRes.json();
                    setHijos(hijosData.data || []);
                }

                // Recargar matrículas
                const matriculasRes = await fetch(`http://localhost:5000/api/usuarios/padre/${user.id}/hijos/matriculas`);
                if (matriculasRes.ok) {
                    const matriculasData = await matriculasRes.json();
                    setMatriculasHijos(matriculasData.data || []);
                }
            } else {
                const error = await response.json();
                alert(`Error al registrar hijo: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al registrar hijo:', error);
            alert('Error de conexión al registrar el hijo');
        }
    };

    // Función para actualizar credenciales del hijo
    const actualizarCredencialesHijo = async (e) => {
        e.preventDefault();
        
        if (!hijoSeleccionadoCredenciales) {
            alert('Debe seleccionar un hijo');
            return;
        }

        // Validar que al menos se proporcione correo o contraseña
        if (!credencialesEdit.nuevo_correo && !credencialesEdit.nueva_contrasena) {
            alert('Debe proporcionar al menos un nuevo correo o una nueva contraseña');
            return;
        }

        // Validar que las contraseñas coincidan si se proporcionan
        if (credencialesEdit.nueva_contrasena && credencialesEdit.nueva_contrasena !== credencialesEdit.confirmar_contrasena) {
            alert('Las contraseñas no coinciden');
            return;
        }

        // Validar longitud mínima de contraseña
        if (credencialesEdit.nueva_contrasena && credencialesEdit.nueva_contrasena.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/usuarios/padre/actualizar-credenciales', {
                method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                    id_padre: user.id,
                    id_estudiante: hijoSeleccionadoCredenciales,
                    nuevo_correo: credencialesEdit.nuevo_correo || null,
                    nueva_contrasena: credencialesEdit.nueva_contrasena || null
                }),
            });

            if (response.ok) {
                const data = await response.json();
                alert('Credenciales actualizadas exitosamente');
                
                // Recargar la lista de hijos
                const hijosRes = await fetch(`http://localhost:5000/api/usuarios/padre/${user.id}/hijos`);
                if (hijosRes.ok) {
                    const hijosData = await hijosRes.json();
                    setHijos(hijosData.data || []);
                }
                
                // Cerrar modal y limpiar formulario
                setShowEditarCredenciales(false);
                setHijoSeleccionadoCredenciales(null);
                setCredencialesEdit({
                    nuevo_correo: '',
                    nueva_contrasena: '',
                    confirmar_contrasena: ''
                });
            } else {
                const error = await response.json();
                alert(`Error al actualizar credenciales: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al actualizar credenciales:', error);
            alert('Error de conexión al actualizar las credenciales');
        }
    };


    const alertasRecientes = [
        { id: 1, tipo: 'Tarea Pendiente', mensaje: 'Ana tiene una tarea de Matemáticas pendiente', fecha: '2024-01-12', prioridad: 'alta' },
        { id: 2, tipo: 'Falta de Asistencia', mensaje: 'Carlos faltó a la clase de Ciencias', fecha: '2024-01-11', prioridad: 'media' },
        { id: 3, tipo: 'Nueva Calificación', mensaje: 'Ana obtuvo 95 en el examen de Literatura', fecha: '2024-01-10', prioridad: 'baja' }
    ];

    const proximosEventos = [
        { id: 1, evento: 'Reunión de Padres', fecha: '2024-01-20', hora: '10:00', tipo: 'Reunión' },
        { id: 2, evento: 'Entrega de Calificaciones', fecha: '2024-01-25', hora: '14:00', tipo: 'Académico' },
        { id: 3, evento: 'Actividad Cultural', fecha: '2024-01-30', hora: '09:00', tipo: 'Evento' }
    ];

    const comunicaciones = [
        { id: 1, remitente: 'Prof. Juan Pérez', asunto: 'Progreso de Ana en Matemáticas', fecha: '2024-01-12', leido: false },
        { id: 2, remitente: 'Prof. María González', asunto: 'Tarea pendiente de Carlos', fecha: '2024-01-11', leido: true },
        { id: 3, remitente: 'Administración', asunto: 'Recordatorio de pago de matrícula', fecha: '2024-01-10', leido: true }
    ];

    return (
        <>
        <div className="dashboard-container">
            {/* Header del Dashboard */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Dashboard Padre de Familia</h1>
                    <p className="dashboard-subtitle">Seguimiento académico de tus hijos</p>
                </div>
                <div className="user-info">
                    <p className="user-name">{user.nombre} {user.apellido}</p>
                    <p className="user-role">👨‍👩‍👧‍👦 Padre de Familia</p>
                </div>
            </div>

            {/* Resumen de Hijos */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-icon">👨‍🎓</div>
                    <h3 className="card-title">Mis Hijos</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            className="btn-primary"
                            onClick={() => setShowRegistrarHijo(true)}
                        >
                            + Registrar Nuevo Hijo
                        </button>
                        <button 
                            className="btn-secondary"
                            onClick={() => setShowBuscarHijo(true)}
                        >
                            🔍 Buscar y Vincular
                        </button>
                    </div>
                </div>
                <div className="card-content">
                    {hijos.length > 0 ? (
            <div className="dashboard-grid">
                {hijos.map(hijo => (
                                <div key={hijo.id_estudiante} className="dashboard-card">
                        <div className="card-header">
                            <div className="card-icon">👨‍🎓</div>
                                        <h3 className="card-title">{hijo.nombre} {hijo.apellido}</h3>
                                    </div>
                                    <div className="card-content">
                                        {hijo.dni && <p><strong>DNI:</strong> {hijo.dni}</p>}
                                        <p><strong>Correo:</strong> {hijo.correo}</p>
                                        <p><strong>Relación:</strong> {hijo.relacion || 'Padre'}</p>
                                        <p><strong>Vinculado desde:</strong> {new Date(hijo.fecha_relacion).toLocaleDateString()}</p>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                                        <button 
                                                className="btn-secondary"
                                            onClick={() => {
                                                    setHijoSeleccionadoCredenciales(hijo.id_estudiante);
                                                    setCredencialesEdit({
                                                        nuevo_correo: hijo.correo,
                                                        nueva_contrasena: '',
                                                        confirmar_contrasena: ''
                                                    });
                                                    setShowEditarCredenciales(true);
                                                }}
                                            >
                                                Editar Credenciales
                                        </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-data">
                            <p>No tienes hijos vinculados. Haz clic en "Agregar Hijo" para buscar y vincular a tu hijo.</p>
                        </div>
                    )}
                    </div>
            </div>

            {/* Alertas Importantes */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-icon">🚨</div>
                    <h3 className="card-title">Alertas y Notificaciones</h3>
                </div>
                <div className="card-content">
                    <div className="alertas-list">
                        {alertasRecientes.map(alerta => (
                            <div key={alerta.id} className={`alerta-item ${alerta.prioridad}`}>
                                <div className="alerta-info">
                                    <h4>{alerta.tipo}</h4>
                                    <p>{alerta.mensaje}</p>
                                    <span className="alerta-fecha">{alerta.fecha}</span>
                                </div>
                                <div className="alerta-prioridad">
                                    <span className={`prioridad-badge ${alerta.prioridad}`}>
                                        {alerta.prioridad.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Próximos Eventos */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-icon">📅</div>
                    <h3 className="card-title">Próximos Eventos</h3>
                </div>
                <div className="card-content">
                    <div className="eventos-list">
                        {proximosEventos.map(evento => (
                            <div key={evento.id} className="evento-item">
                                <div className="evento-info">
                                    <h4>{evento.evento}</h4>
                                    <p>{evento.fecha} a las {evento.hora}</p>
                                </div>
                                <div className="evento-tipo">
                                    <span className={`tipo-badge ${evento.tipo.toLowerCase()}`}>
                                        {evento.tipo}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Comunicaciones */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-icon">💬</div>
                    <h3 className="card-title">Comunicaciones Recientes</h3>
                </div>
                <div className="card-content">
                    <div className="comunicaciones-list">
                        {comunicaciones.map(com => (
                            <div key={com.id} className={`comunicacion-item ${com.leido ? 'leido' : 'no-leido'}`}>
                                <div className="com-info">
                                    <h4>{com.asunto}</h4>
                                    <p>De: {com.remitente}</p>
                                    <span className="com-fecha">{com.fecha}</span>
                                </div>
                                <div className="com-status">
                                    {!com.leido && <span className="no-leido-badge">NUEVO</span>}
                                    <button className="btn-secondary">Leer</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Matrículas de Hijos */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-icon">📚</div>
                    <h3 className="card-title">Matrículas de Mis Hijos</h3>
                </div>
                <div className="card-content">
                    {matriculasHijos.length > 0 ? (
                        <div className="table-container">
                                    {matriculasHijos.map(matricula => (
                                <div key={matricula.id_matricula} style={{ 
                                    marginBottom: '20px', 
                                    padding: '15px', 
                                    border: '1px solid #ddd', 
                                    borderRadius: '8px',
                                    backgroundColor: '#f9f9f9'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                                                {matricula.estudiante_nombre} {matricula.estudiante_apellido}
                                            </h4>
                                            {matricula.estudiante_dni && (
                                                <small style={{ color: '#666' }}>DNI: {matricula.estudiante_dni}</small>
                                            )}
                                        </div>
                                                <span style={{ 
                                            padding: '4px 12px', 
                                                    borderRadius: '4px',
                                                    backgroundColor: matricula.estado === 'Activo' ? '#d4edda' : '#f8d7da',
                                            color: matricula.estado === 'Activo' ? '#155724' : '#721c24',
                                            fontSize: '0.9rem'
                                                }}>
                                                    {matricula.estado}
                                                </span>
                                    </div>
                                    
                                    <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
                                        <h5 style={{ margin: '0 0 8px 0', color: '#667eea' }}>
                                            📚 {matricula.nombre_curso}
                                        </h5>
                                        {matricula.curso_descripcion && (
                                            <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '0.9rem' }}>
                                                {matricula.curso_descripcion}
                                            </p>
                                        )}
                                        {matricula.curso_turno && (
                                            <span style={{ 
                                                display: 'inline-block',
                                                padding: '2px 8px',
                                                backgroundColor: matricula.curso_turno === 'Mañana' ? '#fff3cd' : '#d1ecf1',
                                                color: matricula.curso_turno === 'Mañana' ? '#856404' : '#0c5460',
                                                borderRadius: '4px',
                                                fontSize: '0.85rem',
                                                marginTop: '5px'
                                            }}>
                                                Turno: {matricula.curso_turno}
                                            </span>
                                        )}
                                    </div>

                                    {/* Docentes asignados */}
                                    {matricula.docentes && matricula.docentes.length > 0 && (
                                        <div style={{ marginBottom: '15px' }}>
                                            <h5 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '0.95rem' }}>
                                                👨‍🏫 Docente{matricula.docentes.length > 1 ? 's' : ''}:
                                            </h5>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                {matricula.docentes.map((docente, idx) => (
                                                    <div key={docente.id_docente || idx} style={{
                                                        padding: '8px 12px',
                                                        backgroundColor: '#e7f3ff',
                                                        borderRadius: '6px',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        <strong>{docente.nombre} {docente.apellido}</strong>
                                                        {docente.docente_turno && (
                                                            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '3px' }}>
                                                                Turno: {docente.docente_turno}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Horarios */}
                                    {matricula.horarios && matricula.horarios.length > 0 && (
                                        <div style={{ marginBottom: '10px' }}>
                                            <h5 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '0.95rem' }}>
                                                ⏰ Horario:
                                            </h5>
                                            <div style={{ display: 'grid', gap: '8px' }}>
                                                {matricula.horarios.map((horario, idx) => (
                                                    <div key={horario.id_horario || idx} style={{
                                                        padding: '10px',
                                                        backgroundColor: 'white',
                                                        borderRadius: '6px',
                                                        border: '1px solid #e0e0e0',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                                            <div>
                                                                <strong>{horario.dia_semana}</strong>
                                                                <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                                                                <span>{horario.hora_inicio} - {horario.hora_fin}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                                {horario.turno && (
                                                                    <span style={{
                                                                        padding: '2px 8px',
                                                                        backgroundColor: horario.turno === 'Mañana' ? '#fff3cd' : '#d1ecf1',
                                                                        color: horario.turno === 'Mañana' ? '#856404' : '#0c5460',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.85rem'
                                                                    }}>
                                                                        {horario.turno}
                                                                    </span>
                                                                )}
                                                                {horario.nombre_salon && (
                                                                    <span style={{ color: '#666', fontSize: '0.85rem' }}>
                                                                        🏫 {horario.nombre_salon}
                                                                        {horario.grado && horario.seccion && ` (${horario.grado} ${horario.seccion})`}
                                                                    </span>
                                                                )}
                                                                {horario.docente_nombre && horario.docente_apellido && (
                                                                    <span style={{ color: '#667eea', fontSize: '0.85rem' }}>
                                                                        👨‍🏫 {horario.docente_nombre} {horario.docente_apellido}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(!matricula.docentes || matricula.docentes.length === 0) && (!matricula.horarios || matricula.horarios.length === 0) && (
                                        <div style={{ padding: '10px', backgroundColor: '#fff3cd', borderRadius: '6px', fontSize: '0.9rem', color: '#856404' }}>
                                            ℹ️ Este curso aún no tiene docentes asignados ni horarios configurados.
                                        </div>
                                    )}

                                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd', fontSize: '0.85rem', color: '#666' }}>
                                        Fecha de matrícula: {new Date(matricula.fecha_matricula).toLocaleDateString('es-ES', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-data">
                            <p>No hay matrículas registradas para tus hijos.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-icon">⚡</div>
                    <h3 className="card-title">Acciones Rápidas</h3>
                </div>
                <div className="card-content">
                    <div className="acciones-grid">
                        <button className="btn-primary">Contactar Profesor</button>
                        <button className="btn-primary">Ver Calificaciones</button>
                        <button className="btn-primary">Programar Cita</button>
                        <button className="btn-primary">Descargar Reportes</button>
                    </div>
                </div>
            </div>

            {/* Mensajes */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-icon">📧</div>
                    <h3 className="card-title">Mensajes</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            className="btn-primary"
                            onClick={() => setShowTodosMensajes(true)}
                        >
                            Ver Todos los Mensajes
                        </button>
                    <button 
                        className="btn-primary"
                        onClick={() => setShowMensajeModal(true)}
                    >
                        Enviar Mensaje
                    </button>
                    </div>
                </div>
                <div className="card-content">
                    <div className="messages-list">
                        {loading ? (
                            <div className="no-data">
                                <p>Cargando mensajes...</p>
                            </div>
                        ) : mensajes.length > 0 ? (
                            mensajes.slice(0, 5).map(mensaje => (
                                <div key={mensaje.id_mensaje} className={`message-item ${!mensaje.leido ? 'no-leido' : ''}`}>
                                    <div className="message-header">
                                        <h4 className="message-sender">
                                            {mensaje.remitente_nombre} {mensaje.remitente_apellido}
                                            {!mensaje.leido && <span className="no-leido-badge">NUEVO</span>}
                                        </h4>
                                        <span className="message-date">
                                            {new Date(mensaje.fecha_envio).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h5 className="message-subject">{mensaje.asunto || 'Sin asunto'}</h5>
                                    <p className="message-content">{mensaje.contenido}</p>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">
                                <p>No tienes mensajes recibidos.</p>
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
                                        {usuario.nombre} {usuario.apellido} ({usuario.rol}) - {usuario.correo}
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

        {/* Modal para Ver Todos los Mensajes */}
        {showTodosMensajes && (
            <div className="modal-overlay">
                <div className="modal large">
                    <div className="modal-header">
                        <h3>Todos los Mensajes</h3>
                        <button 
                            className="modal-close"
                            onClick={() => setShowTodosMensajes(false)}
                        >
                            ×
                        </button>
                    </div>
                    <div className="modal-content">
                        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                            <button 
                                className={tipoMensajes === 'recibidos' ? 'btn-primary' : 'btn-secondary'}
                                onClick={() => setTipoMensajes('recibidos')}
                            >
                                Recibidos ({mensajes.length})
                            </button>
                            <button 
                                className={tipoMensajes === 'enviados' ? 'btn-primary' : 'btn-secondary'}
                                onClick={() => setTipoMensajes('enviados')}
                            >
                                Enviados ({mensajesEnviados.length})
                            </button>
                        </div>
                        <div className="messages-list">
                            {(tipoMensajes === 'recibidos' ? mensajes : mensajesEnviados).length > 0 ? (
                                (tipoMensajes === 'recibidos' ? mensajes : mensajesEnviados).map(mensaje => (
                                    <div key={mensaje.id_mensaje} className={`message-item ${!mensaje.leido && tipoMensajes === 'recibidos' ? 'no-leido' : ''}`}>
                                        <div className="message-header">
                                            <h4 className="message-sender">
                                                {tipoMensajes === 'recibidos' 
                                                    ? `${mensaje.remitente_nombre} ${mensaje.remitente_apellido}`
                                                    : `${mensaje.destinatario_nombre} ${mensaje.destinatario_apellido}`
                                                }
                                                {!mensaje.leido && tipoMensajes === 'recibidos' && (
                                                    <span className="no-leido-badge">NUEVO</span>
                                                )}
                                            </h4>
                                            <span className="message-date">
                                                {new Date(mensaje.fecha_envio).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h5 className="message-subject">{mensaje.asunto || 'Sin asunto'}</h5>
                                        <p className="message-content">{mensaje.contenido}</p>
                                        <div style={{ marginTop: '10px' }}>
                                            <span className="message-label">
                                                {tipoMensajes === 'recibidos' ? 'De' : 'Para'}: {tipoMensajes === 'recibidos' 
                                                    ? `${mensaje.remitente_rol}`
                                                    : `${mensaje.destinatario_rol}`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">
                                    <p>No tienes mensajes {tipoMensajes}.</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button 
                                type="button" 
                                className="btn-secondary" 
                                onClick={() => setShowTodosMensajes(false)}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            )}

        {/* Modal para Buscar y Agregar Hijo */}
        {showBuscarHijo && (
            <div className="modal-overlay">
                <div className="modal">
                    <div className="modal-header">
                        <h3>Buscar y Agregar Hijo</h3>
                        <button 
                            className="modal-close"
                            onClick={() => {
                                setShowBuscarHijo(false);
                                setBusquedaHijo('');
                                setEstudiantesEncontrados([]);
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <div className="modal-content">
                        <div className="form-group">
                            <label>Buscar por Nombre o DNI:</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input 
                                    type="text" 
                                    value={busquedaHijo}
                                    onChange={(e) => setBusquedaHijo(e.target.value)}
                                    placeholder="Ingrese nombre o DNI del estudiante"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            buscarEstudiantes();
                                        }
                                    }}
                                />
                                <button 
                                    type="button"
                                    className="btn-primary"
                                    onClick={buscarEstudiantes}
                                    disabled={buscando || !busquedaHijo.trim()}
                                >
                                    {buscando ? 'Buscando...' : 'Buscar'}
                                </button>
                            </div>
                        </div>

                        {estudiantesEncontrados.length > 0 && (
                            <div className="estudiantes-encontrados">
                                <h4>Estudiantes Encontrados:</h4>
                                <div className="estudiantes-list">
                                    {estudiantesEncontrados.map(estudiante => {
                                        // Verificar si ya está vinculado
                                        const yaVinculado = hijos.some(h => h.id_estudiante === estudiante.id_usuario);
                                        
                                        return (
                                            <div key={estudiante.id_usuario} className="estudiante-item">
                                                <div className="estudiante-info">
                                                    <h5>{estudiante.nombre} {estudiante.apellido}</h5>
                                                    {estudiante.dni && <p><strong>DNI:</strong> {estudiante.dni}</p>}
                                                    <p><strong>Correo:</strong> {estudiante.correo}</p>
                                                </div>
                                                <div className="estudiante-actions">
                                                    {yaVinculado ? (
                                                        <span className="status-badge activo">Ya vinculado</span>
                                                    ) : (
                                                        <button 
                                                            className="btn-primary"
                                                            onClick={() => vincularHijo(estudiante.id_usuario)}
                                                        >
                                                            Vincular
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {busquedaHijo && !buscando && estudiantesEncontrados.length === 0 && (
                            <div className="no-data">
                                <p>No se encontraron estudiantes con ese nombre o DNI.</p>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button 
                                type="button" 
                                className="btn-secondary" 
                                onClick={() => {
                                    setShowBuscarHijo(false);
                                    setBusquedaHijo('');
                                    setEstudiantesEncontrados([]);
                                }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Modal para Registrar Nuevo Hijo */}
        {showRegistrarHijo && (
            <div className="modal-overlay">
                <div className="modal">
                    <div className="modal-header">
                        <h3>Registrar Nuevo Hijo</h3>
                        <button 
                            className="modal-close"
                            onClick={() => {
                                setShowRegistrarHijo(false);
                                setNuevoHijo({ nombre: '', apellido: '', dni: '', cursos: [] });
                                setCredencialesGeneradas(null);
                            }}
                        >
                            ×
                        </button>
                    </div>
                    {!credencialesGeneradas ? (
                        <form onSubmit={registrarHijo} className="modal-content">
                            <div className="form-group">
                                <label>Nombre: *</label>
                                <input 
                                    type="text" 
                                    value={nuevoHijo.nombre}
                                    onChange={(e) => setNuevoHijo({...nuevoHijo, nombre: e.target.value})}
                                    placeholder="Nombre del estudiante"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Apellido: *</label>
                                <input 
                                    type="text" 
                                    value={nuevoHijo.apellido}
                                    onChange={(e) => setNuevoHijo({...nuevoHijo, apellido: e.target.value})}
                                    placeholder="Apellido del estudiante"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>DNI (Opcional):</label>
                                <input 
                                    type="text" 
                                    value={nuevoHijo.dni}
                                    onChange={(e) => setNuevoHijo({...nuevoHijo, dni: e.target.value})}
                                    placeholder="DNI del estudiante"
                                />
                            </div>
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={() => {
                                        setShowRegistrarHijo(false);
                                        setNuevoHijo({ nombre: '', apellido: '', dni: '' });
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Registrar Hijo
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="modal-content">
                            <div style={{ padding: '20px', backgroundColor: '#d4edda', borderRadius: '8px', marginBottom: '20px' }}>
                                <h4 style={{ color: '#155724', marginBottom: '15px' }}>✅ Hijo registrado exitosamente</h4>
                                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '4px', border: '2px solid #28a745' }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <h5 style={{ color: '#155724', marginBottom: '10px' }}>Información del Estudiante</h5>
                                        <p><strong>Nombre completo:</strong> {credencialesGeneradas.estudiante.nombre} {credencialesGeneradas.estudiante.apellido}</p>
                                        {credencialesGeneradas.estudiante.dni && (
                                            <p><strong>DNI:</strong> {credencialesGeneradas.estudiante.dni}</p>
                                        )}
                                    </div>
                                    
                                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                                        <h5 style={{ color: '#155724', marginBottom: '15px' }}>🔐 Credenciales de Acceso</h5>
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#495057' }}>Correo Electrónico:</label>
                                            <div style={{ 
                                            fontFamily: 'monospace', 
                                                backgroundColor: 'white', 
                                                padding: '10px', 
                                            borderRadius: '4px',
                                                border: '1px solid #ced4da',
                                                fontSize: '16px',
                                                color: '#007bff',
                                                fontWeight: 'bold'
                                            }}>
                                                {credencialesGeneradas.credenciales.correo}
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#495057' }}>Contraseña:</label>
                                            <div style={{ 
                                                fontFamily: 'monospace', 
                                                backgroundColor: 'white', 
                                                padding: '10px', 
                                                borderRadius: '4px',
                                                border: '1px solid #ced4da',
                                                fontSize: '18px',
                                                color: '#dc3545',
                                                fontWeight: 'bold',
                                                letterSpacing: '2px'
                                        }}>
                                            {credencialesGeneradas.credenciales.contrasena}
                                        </div>
                                </div>
                                    </div>

                                </div>
                                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
                                    <p style={{ color: '#856404', margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                                        ⚠️ <strong>IMPORTANTE:</strong> Guarda estas credenciales de forma segura. El estudiante las necesitará para iniciar sesión en la plataforma.
                                    </p>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="btn-primary" 
                                    onClick={() => {
                                        setShowRegistrarHijo(false);
                                        setNuevoHijo({ nombre: '', apellido: '', dni: '' });
                                        setCredencialesGeneradas(null);
                                    }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}


        {/* Modal para Editar Credenciales del Hijo */}
        {showEditarCredenciales && (
            <div className="modal-overlay">
                <div className="modal">
                    <div className="modal-header">
                        <h3>Editar Credenciales del Hijo</h3>
                        <button 
                            className="modal-close"
                            onClick={() => {
                                setShowEditarCredenciales(false);
                                setHijoSeleccionadoCredenciales(null);
                                setCredencialesEdit({
                                    nuevo_correo: '',
                                    nueva_contrasena: '',
                                    confirmar_contrasena: ''
                                });
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <form onSubmit={actualizarCredencialesHijo} className="modal-content">
                        {hijoSeleccionadoCredenciales && (
                        <div className="form-group">
                            <label>Hijo:</label>
                                <p style={{ padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                    {hijos.find(h => h.id_estudiante === hijoSeleccionadoCredenciales)?.nombre} {hijos.find(h => h.id_estudiante === hijoSeleccionadoCredenciales)?.apellido}
                                </p>
                        </div>
                        )}
                            <div className="form-group">
                            <label>Nuevo Correo Electrónico:</label>
                                                <input 
                                type="email" 
                                value={credencialesEdit.nuevo_correo}
                                onChange={(e) => setCredencialesEdit({...credencialesEdit, nuevo_correo: e.target.value})}
                                placeholder="nuevo@jma.com"
                            />
                            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                                Deje vacío si no desea cambiar el correo
                            </small>
                                </div>
                        <div className="form-group">
                            <label>Nueva Contraseña:</label>
                            <input 
                                type="password" 
                                value={credencialesEdit.nueva_contrasena}
                                onChange={(e) => setCredencialesEdit({...credencialesEdit, nueva_contrasena: e.target.value})}
                                placeholder="Nueva contraseña (mínimo 6 caracteres)"
                            />
                            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                                Deje vacío si no desea cambiar la contraseña
                            </small>
                        </div>
                        {credencialesEdit.nueva_contrasena && (
                            <div className="form-group">
                                <label>Confirmar Nueva Contraseña:</label>
                                <input 
                                    type="password" 
                                    value={credencialesEdit.confirmar_contrasena}
                                    onChange={(e) => setCredencialesEdit({...credencialesEdit, confirmar_contrasena: e.target.value})}
                                    placeholder="Confirme la nueva contraseña"
                                />
                            </div>
                        )}
                        <div className="modal-actions">
                            <button 
                                type="button" 
                                className="btn-secondary" 
                                onClick={() => {
                                    setShowEditarCredenciales(false);
                                    setHijoSeleccionadoCredenciales(null);
                                    setCredencialesEdit({
                                        nuevo_correo: '',
                                        nueva_contrasena: '',
                                        confirmar_contrasena: ''
                                    });
                                }}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn-primary"
                                disabled={!credencialesEdit.nuevo_correo && !credencialesEdit.nueva_contrasena}
                            >
                                Actualizar Credenciales
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    );
};

export default DashboardPadre;
