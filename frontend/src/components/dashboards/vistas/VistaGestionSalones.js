import React, { useState, useEffect } from 'react';
import './VistasAdmin.css';

const VistaGestionSalones = ({ onVolver }) => {
    const [salones, setSalones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCrearSalon, setShowCrearSalon] = useState(false);
    const [showEstudiantesSalon, setShowEstudiantesSalon] = useState(false);
    const [salonSeleccionado, setSalonSeleccionado] = useState(null);
    const [estudiantesConPadres, setEstudiantesConPadres] = useState([]);
    const [nuevoSalon, setNuevoSalon] = useState({
        nombre_salon: '',
        descripcion: '',
        capacidad_maxima: 40,
        grado: '',
        seccion: '',
        anio_academico: new Date().getFullYear().toString(),
        turno: '',
        id_docente_titular: ''
    });
    const [docentes, setDocentes] = useState([]);

    useEffect(() => {
        cargarSalones();
        cargarDocentes();
    }, []);

    const cargarSalones = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/salones');
            if (response.ok) {
                const data = await response.json();
                setSalones(data.data || []);
            }
        } catch (error) {
            console.error('Error al cargar salones:', error);
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

    const handleCrearSalon = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/salones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre_salon: nuevoSalon.nombre_salon,
                    descripcion: nuevoSalon.descripcion,
                    capacidad_maxima: parseInt(nuevoSalon.capacidad_maxima),
                    grado: nuevoSalon.grado || null,
                    seccion: nuevoSalon.seccion || null,
                    anio_academico: nuevoSalon.anio_academico || null,
                    turno: nuevoSalon.turno || null,
                    id_docente_titular: nuevoSalon.id_docente_titular ? parseInt(nuevoSalon.id_docente_titular) : null
                })
            });

            if (response.ok) {
                alert('Salón creado exitosamente');
                setShowCrearSalon(false);
                setNuevoSalon({
                    nombre_salon: '',
                    descripcion: '',
                    capacidad_maxima: 40,
                    grado: '',
                    seccion: '',
                    anio_academico: new Date().getFullYear().toString(),
                    turno: '',
                    id_docente_titular: ''
                });
                await cargarSalones();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al crear salón:', error);
            alert('Error de conexión');
        }
    };

    const cargarEstudiantesSalon = async (idSalon) => {
        try {
            const response = await fetch(`http://localhost:5000/api/salones/${idSalon}/estudiantes-con-padres`);
            if (response.ok) {
                const data = await response.json();
                setEstudiantesConPadres(data.data || []);
            }
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
        }
    };

    return (
        <div className="vista-admin">
            <div className="vista-header">
                <button className="btn-volver" onClick={onVolver}>← Volver</button>
                <h2>🏫 Gestión de Salones</h2>
                <button className="btn-primary" onClick={() => setShowCrearSalon(true)}>
                    + Crear Salón
                </button>
            </div>

            {loading ? (
                <div className="loading">Cargando salones...</div>
            ) : (
                <div className="vista-content">
                    <div className="salones-grid">
                        {salones.map(salon => (
                            <div key={salon.id_salon} className="salon-card">
                                <div className="salon-header">
                                    <h3>{salon.nombre_salon}</h3>
                                    <span className={`status-badge ${salon.activo ? 'activo' : 'inactivo'}`}>
                                        {salon.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <div className="salon-info">
                                    {salon.grado && salon.seccion && (
                                        <p><strong>Grado y Sección:</strong> {salon.grado} {salon.seccion}</p>
                                    )}
                                    {salon.turno && (
                                        <p><strong>Turno:</strong> {salon.turno}</p>
                                    )}
                                    <p><strong>Capacidad:</strong> {parseInt(salon.estudiantes_matriculados) || 0} / {salon.capacidad_maxima}</p>
                                    {salon.docente_nombre && (
                                        <p><strong>Docente Titular:</strong> {salon.docente_nombre} {salon.docente_apellido}</p>
                                    )}
                                </div>
                                <div className="salon-actions">
                                    <button
                                        className="btn-primary"
                                        onClick={async () => {
                                            setSalonSeleccionado(salon);
                                            await cargarEstudiantesSalon(salon.id_salon);
                                            setShowEstudiantesSalon(true);
                                        }}
                                    >
                                        👥 Ver Estudiantes
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal para crear salón */}
            {showCrearSalon && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Crear Nuevo Salón</h3>
                            <button className="modal-close" onClick={() => setShowCrearSalon(false)}>×</button>
                        </div>
                        <form onSubmit={handleCrearSalon} className="modal-content">
                            <div className="form-group">
                                <label>Nombre del Salón: *</label>
                                <input
                                    type="text"
                                    value={nuevoSalon.nombre_salon}
                                    onChange={(e) => setNuevoSalon({...nuevoSalon, nombre_salon: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción:</label>
                                <textarea
                                    value={nuevoSalon.descripcion}
                                    onChange={(e) => setNuevoSalon({...nuevoSalon, descripcion: e.target.value})}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Grado:</label>
                                <input
                                    type="text"
                                    value={nuevoSalon.grado}
                                    onChange={(e) => setNuevoSalon({...nuevoSalon, grado: e.target.value})}
                                    placeholder="Ej: 1ro, 2do, 3ro"
                                />
                            </div>
                            <div className="form-group">
                                <label>Sección:</label>
                                <input
                                    type="text"
                                    value={nuevoSalon.seccion}
                                    onChange={(e) => setNuevoSalon({...nuevoSalon, seccion: e.target.value})}
                                    placeholder="Ej: A, B, C"
                                />
                            </div>
                            <div className="form-group">
                                <label>Turno: *</label>
                                <select
                                    value={nuevoSalon.turno}
                                    onChange={(e) => setNuevoSalon({...nuevoSalon, turno: e.target.value})}
                                    required
                                >
                                    <option value="">Seleccionar turno</option>
                                    <option value="Mañana">Mañana</option>
                                    <option value="Tarde">Tarde</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Capacidad Máxima:</label>
                                <input
                                    type="number"
                                    value={nuevoSalon.capacidad_maxima}
                                    onChange={(e) => setNuevoSalon({...nuevoSalon, capacidad_maxima: parseInt(e.target.value) || 40})}
                                    min="1"
                                />
                            </div>
                            <div className="form-group">
                                <label>Docente Titular (Opcional):</label>
                                <select
                                    value={nuevoSalon.id_docente_titular}
                                    onChange={(e) => setNuevoSalon({...nuevoSalon, id_docente_titular: e.target.value})}
                                >
                                    <option value="">Seleccionar docente</option>
                                    {docentes.map(docente => (
                                        <option key={docente.id_usuario} value={docente.id_usuario}>
                                            {docente.nombre} {docente.apellido}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">Crear Salón</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowCrearSalon(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para ver estudiantes */}
            {showEstudiantesSalon && salonSeleccionado && (
                <div className="modal-overlay">
                    <div className="modal large">
                        <div className="modal-header">
                            <h3>Estudiantes del Salón: {salonSeleccionado.nombre_salon}</h3>
                            <button className="modal-close" onClick={() => {
                                setShowEstudiantesSalon(false);
                                setSalonSeleccionado(null);
                            }}>×</button>
                        </div>
                        <div className="modal-content">
                            <div className="salon-info-header">
                                <p><strong>Capacidad:</strong> {parseInt(salonSeleccionado.estudiantes_matriculados) || 0} / {salonSeleccionado.capacidad_maxima}</p>
                                {salonSeleccionado.grado && salonSeleccionado.seccion && (
                                    <p><strong>Grado y Sección:</strong> {salonSeleccionado.grado} {salonSeleccionado.seccion}</p>
                                )}
                                {salonSeleccionado.turno && (
                                    <p><strong>Turno:</strong> {salonSeleccionado.turno}</p>
                                )}
                            </div>

                            {estudiantesConPadres.length > 0 ? (
                                <div className="estudiantes-list">
                                    {estudiantesConPadres.map((item, index) => (
                                        <div key={index} className="estudiante-item">
                                            <div className="estudiante-info">
                                                <h4>👨‍🎓 {item.nombre} {item.apellido}</h4>
                                                <p>Correo: {item.correo}</p>
                                                {item.dni && <p>DNI: {item.dni}</p>}
                                                {item.turno && <p>Turno: {item.turno}</p>}
                                            </div>
                                            {item.padres && item.padres.length > 0 && (
                                                <div className="padres-info">
                                                    <strong>Padres/Tutores:</strong>
                                                    {item.padres.map((padre, idx) => (
                                                        <div key={idx} className="padre-item">
                                                            <p>👨‍👩‍👧‍👦 {padre.nombre} {padre.apellido} ({padre.relacion})</p>
                                                            <p>Correo: {padre.correo}</p>
                                                            {padre.turno && <p>Turno: {padre.turno}</p>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-data">
                                    <p>No hay estudiantes matriculados en este salón.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VistaGestionSalones;

