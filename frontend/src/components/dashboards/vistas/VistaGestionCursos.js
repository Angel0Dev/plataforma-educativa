import React, { useState, useEffect } from 'react';
import './VistasAdmin.css';

const VistaGestionCursos = ({ onVolver }) => {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAgregarCurso, setShowAgregarCurso] = useState(false);
    const [showEditarCurso, setShowEditarCurso] = useState(false);
    const [showHorariosCurso, setShowHorariosCurso] = useState(false);
    const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
    const [nuevoCurso, setNuevoCurso] = useState({ nombre: '', descripcion: '', turno: '' });
    const [cursoEdit, setCursoEdit] = useState({ id_curso: null, nombre: '', descripcion: '', turno: '', activo: true });
    const [docentesCurso, setDocentesCurso] = useState([]);
    const [horariosCurso, setHorariosCurso] = useState([]);
    const [showAgregarHorario, setShowAgregarHorario] = useState(false);
    const [nuevoHorario, setNuevoHorario] = useState({
        id_curso: null,
        id_docente: '',
        id_salon: '',
        dia_semana: '',
        hora_inicio: '',
        hora_fin: '',
        turno: ''
    });
    const [docentes, setDocentes] = useState([]);
    const [salones, setSalones] = useState([]);

    useEffect(() => {
        cargarCursos();
        cargarDocentes();
        cargarSalones();
    }, []);

    const cargarCursos = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/cursos');
            if (response.ok) {
                const data = await response.json();
                setCursos(data.data || []);
            }
        } catch (error) {
            console.error('Error al cargar cursos:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarDocentes = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/usuarios');
            if (response.ok) {
                const data = await response.json();
                const docentesData = (data.data || []).filter(u => u.rol === 'Docente' && u.activo);
                setDocentes(docentesData);
            }
        } catch (error) {
            console.error('Error al cargar docentes:', error);
        }
    };

    const cargarSalones = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/salones');
            if (response.ok) {
                const data = await response.json();
                setSalones(data.data || []);
            }
        } catch (error) {
            console.error('Error al cargar salones:', error);
        }
    };

    const cargarDocentesYHorarios = async (idCurso) => {
        try {
            // Cargar docentes del curso
            const docentesResponse = await fetch(`http://localhost:5000/api/horarios/curso/${idCurso}/docentes`);
            if (docentesResponse.ok) {
                const docentesData = await docentesResponse.json();
                setDocentesCurso(docentesData.data || []);
            }

            // Cargar horarios del curso
            const horariosResponse = await fetch(`http://localhost:5000/api/horarios/curso/${idCurso}/horarios`);
            if (horariosResponse.ok) {
                const horariosData = await horariosResponse.json();
                setHorariosCurso(horariosData.data || []);
            }
        } catch (error) {
            console.error('Error al cargar docentes y horarios:', error);
        }
    };

    const handleCrearCurso = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/cursos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre_curso: nuevoCurso.nombre,
                    descripcion: nuevoCurso.descripcion,
                    turno: nuevoCurso.turno || null
                })
            });

            if (response.ok) {
                alert('Curso creado exitosamente');
                setShowAgregarCurso(false);
                setNuevoCurso({ nombre: '', descripcion: '', turno: '' });
                await cargarCursos();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al crear curso:', error);
            alert('Error de conexión');
        }
    };

    const handleEditarCurso = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/cursos/${cursoEdit.id_curso}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre_curso: cursoEdit.nombre,
                    descripcion: cursoEdit.descripcion,
                    turno: cursoEdit.turno || null,
                    activo: cursoEdit.activo
                })
            });

            if (response.ok) {
                alert('Curso actualizado exitosamente');
                setShowEditarCurso(false);
                await cargarCursos();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al editar curso:', error);
            alert('Error de conexión');
        }
    };

    const handleCrearHorario = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/horarios/horarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_curso: nuevoHorario.id_curso,
                    id_docente: parseInt(nuevoHorario.id_docente),
                    id_salon: nuevoHorario.id_salon ? parseInt(nuevoHorario.id_salon) : null,
                    dia_semana: nuevoHorario.dia_semana,
                    hora_inicio: nuevoHorario.hora_inicio,
                    hora_fin: nuevoHorario.hora_fin,
                    turno: nuevoHorario.turno || null
                })
            });

            if (response.ok) {
                alert('Horario creado exitosamente');
                setShowAgregarHorario(false);
                setNuevoHorario({
                    id_curso: null,
                    id_docente: '',
                    id_salon: '',
                    dia_semana: '',
                    hora_inicio: '',
                    hora_fin: '',
                    turno: ''
                });
                if (cursoSeleccionado) {
                    await cargarDocentesYHorarios(cursoSeleccionado.id_curso);
                }
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al crear horario:', error);
            alert('Error de conexión');
        }
    };

    const handleEliminarHorario = async (idHorario) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este horario?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/horarios/horarios/${idHorario}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Horario eliminado exitosamente');
                if (cursoSeleccionado) {
                    await cargarDocentesYHorarios(cursoSeleccionado.id_curso);
                }
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al eliminar horario:', error);
            alert('Error de conexión');
        }
    };

    return (
        <div className="vista-admin">
            <div className="vista-header">
                <button className="btn-volver" onClick={onVolver}>← Volver</button>
                <h2>📚 Gestión de Cursos</h2>
                <button className="btn-primary" onClick={() => setShowAgregarCurso(true)}>
                    + Agregar Curso
                </button>
            </div>

            {loading ? (
                <div className="loading">Cargando cursos...</div>
            ) : (
                <div className="vista-content">
                    <div className="cursos-grid">
                        {cursos.map(curso => (
                            <div key={curso.id_curso} className="curso-card">
                                <div className="curso-header">
                                    <h3>{curso.nombre_curso}</h3>
                                    <span className={`status-badge ${curso.activo ? 'activo' : 'inactivo'}`}>
                                        {curso.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <div className="curso-info">
                                    <p>{curso.descripcion || 'Sin descripción'}</p>
                                    {curso.turno && (
                                        <p><strong>Turno:</strong> {curso.turno}</p>
                                    )}
                                    <p><strong>Docentes:</strong> {curso.total_docentes || 0}</p>
                                    <p><strong>Estudiantes:</strong> {parseInt(curso.total_estudiantes) || 0}</p>
                                </div>
                                <div className="curso-actions">
                                    <button
                                        className="btn-secondary"
                                        onClick={() => {
                                            setCursoEdit({
                                                id_curso: curso.id_curso,
                                                nombre: curso.nombre_curso,
                                                descripcion: curso.descripcion || '',
                                                turno: curso.turno || '',
                                                activo: curso.activo
                                            });
                                            setShowEditarCurso(true);
                                        }}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        className="btn-primary"
                                        onClick={async () => {
                                            setCursoSeleccionado(curso);
                                            await cargarDocentesYHorarios(curso.id_curso);
                                            setShowHorariosCurso(true);
                                        }}
                                    >
                                        📅 Horarios
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal para agregar curso */}
            {showAgregarCurso && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Agregar Nuevo Curso</h3>
                            <button className="modal-close" onClick={() => setShowAgregarCurso(false)}>×</button>
                        </div>
                        <form onSubmit={handleCrearCurso} className="modal-content">
                            <div className="form-group">
                                <label>Nombre del Curso: *</label>
                                <input
                                    type="text"
                                    value={nuevoCurso.nombre}
                                    onChange={(e) => setNuevoCurso({...nuevoCurso, nombre: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción:</label>
                                <textarea
                                    value={nuevoCurso.descripcion}
                                    onChange={(e) => setNuevoCurso({...nuevoCurso, descripcion: e.target.value})}
                                    rows="4"
                                />
                            </div>
                            <div className="form-group">
                                <label>Turno:</label>
                                <select
                                    value={nuevoCurso.turno}
                                    onChange={(e) => setNuevoCurso({...nuevoCurso, turno: e.target.value})}
                                >
                                    <option value="">Sin turno específico</option>
                                    <option value="Mañana">Mañana</option>
                                    <option value="Tarde">Tarde</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">Crear Curso</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowAgregarCurso(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para editar curso */}
            {showEditarCurso && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Editar Curso</h3>
                            <button className="modal-close" onClick={() => setShowEditarCurso(false)}>×</button>
                        </div>
                        <form onSubmit={handleEditarCurso} className="modal-content">
                            <div className="form-group">
                                <label>Nombre del Curso: *</label>
                                <input
                                    type="text"
                                    value={cursoEdit.nombre}
                                    onChange={(e) => setCursoEdit({...cursoEdit, nombre: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción:</label>
                                <textarea
                                    value={cursoEdit.descripcion}
                                    onChange={(e) => setCursoEdit({...cursoEdit, descripcion: e.target.value})}
                                    rows="4"
                                />
                            </div>
                            <div className="form-group">
                                <label>Turno:</label>
                                <select
                                    value={cursoEdit.turno}
                                    onChange={(e) => setCursoEdit({...cursoEdit, turno: e.target.value})}
                                >
                                    <option value="">Sin turno específico</option>
                                    <option value="Mañana">Mañana</option>
                                    <option value="Tarde">Tarde</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={cursoEdit.activo}
                                        onChange={(e) => setCursoEdit({...cursoEdit, activo: e.target.checked})}
                                    />
                                    Activo
                                </label>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">Guardar Cambios</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowEditarCurso(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Vista de horarios del curso */}
            {showHorariosCurso && cursoSeleccionado && (
                <div className="modal-overlay">
                    <div className="modal large">
                        <div className="modal-header">
                            <h3>Horarios del Curso: {cursoSeleccionado.nombre_curso}</h3>
                            <button className="modal-close" onClick={() => {
                                setShowHorariosCurso(false);
                                setCursoSeleccionado(null);
                            }}>×</button>
                        </div>
                        <div className="modal-content">
                            <div className="horarios-section">
                                <h4>Docentes Asignados ({docentesCurso.length})</h4>
                                <div className="docentes-list">
                                    {docentesCurso.map(docente => (
                                        <div key={docente.id_docente} className="docente-item">
                                            <span>{docente.nombre} {docente.apellido}</span>
                                            {docente.turno && <span className="badge-turno">{docente.turno}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="horarios-section">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h4>Horarios Semanales</h4>
                                    <button
                                        className="btn-primary"
                                        onClick={() => {
                                            setNuevoHorario({
                                                ...nuevoHorario,
                                                id_curso: cursoSeleccionado.id_curso
                                            });
                                            setShowAgregarHorario(true);
                                        }}
                                    >
                                        + Agregar Horario
                                    </button>
                                </div>

                                <table className="tabla-horarios">
                                    <thead>
                                        <tr>
                                            <th>Día</th>
                                            <th>Hora Inicio</th>
                                            <th>Hora Fin</th>
                                            <th>Docente</th>
                                            <th>Salón</th>
                                            <th>Turno</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {horariosCurso.map(horario => (
                                            <tr key={horario.id_horario}>
                                                <td>{horario.dia_semana}</td>
                                                <td>{horario.hora_inicio}</td>
                                                <td>{horario.hora_fin}</td>
                                                <td>{horario.docente_nombre} {horario.docente_apellido}</td>
                                                <td>{horario.salon_nombre || 'Sin salón'}</td>
                                                <td>{horario.turno || '-'}</td>
                                                <td>
                                                    <button
                                                        className="btn-small btn-danger"
                                                        onClick={() => handleEliminarHorario(horario.id_horario)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para agregar horario */}
            {showAgregarHorario && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Agregar Horario</h3>
                            <button className="modal-close" onClick={() => setShowAgregarHorario(false)}>×</button>
                        </div>
                        <form onSubmit={handleCrearHorario} className="modal-content">
                            <div className="form-group">
                                <label>Docente: *</label>
                                <select
                                    value={nuevoHorario.id_docente}
                                    onChange={(e) => setNuevoHorario({...nuevoHorario, id_docente: e.target.value})}
                                    required
                                >
                                    <option value="">Seleccionar docente</option>
                                    {docentes.map(docente => (
                                        <option key={docente.id_usuario} value={docente.id_usuario}>
                                            {docente.nombre} {docente.apellido} {docente.turno ? `(${docente.turno})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Día de la Semana: *</label>
                                <select
                                    value={nuevoHorario.dia_semana}
                                    onChange={(e) => setNuevoHorario({...nuevoHorario, dia_semana: e.target.value})}
                                    required
                                >
                                    <option value="">Seleccionar día</option>
                                    <option value="Lunes">Lunes</option>
                                    <option value="Martes">Martes</option>
                                    <option value="Miércoles">Miércoles</option>
                                    <option value="Jueves">Jueves</option>
                                    <option value="Viernes">Viernes</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Hora Inicio: *</label>
                                <input
                                    type="time"
                                    value={nuevoHorario.hora_inicio}
                                    onChange={(e) => setNuevoHorario({...nuevoHorario, hora_inicio: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Hora Fin: *</label>
                                <input
                                    type="time"
                                    value={nuevoHorario.hora_fin}
                                    onChange={(e) => setNuevoHorario({...nuevoHorario, hora_fin: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Turno:</label>
                                <select
                                    value={nuevoHorario.turno}
                                    onChange={(e) => setNuevoHorario({...nuevoHorario, turno: e.target.value})}
                                >
                                    <option value="">Sin turno específico</option>
                                    <option value="Mañana">Mañana</option>
                                    <option value="Tarde">Tarde</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Salón (Opcional):</label>
                                <select
                                    value={nuevoHorario.id_salon}
                                    onChange={(e) => setNuevoHorario({...nuevoHorario, id_salon: e.target.value})}
                                >
                                    <option value="">Seleccionar salón (opcional)</option>
                                    {salones.filter(s => s.activo).map(salon => (
                                        <option key={salon.id_salon} value={salon.id_salon}>
                                            {salon.nombre_salon} {salon.grado && salon.seccion ? `(${salon.grado} ${salon.seccion})` : ''} {salon.turno ? `- ${salon.turno}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">Crear Horario</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowAgregarHorario(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VistaGestionCursos;

