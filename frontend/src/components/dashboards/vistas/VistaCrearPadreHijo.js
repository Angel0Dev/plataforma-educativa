import React, { useState, useEffect } from 'react';
import './VistasAdmin.css';

const VistaCrearPadreHijo = ({ onVolver }) => {
    const [nuevoPadreHijo, setNuevoPadreHijo] = useState({
        padre_nombre: '', padre_apellido: '', padre_correo: '', padre_contrasena: '', padre_dni: '', padre_telefono: '', padre_direccion: '',
        hijo_nombre: '', hijo_apellido: '', hijo_dni: '',
        seccion: '', turno: '', id_salon: '', id_cursos: [], relacion: 'Padre'
    });
    const [cursos, setCursos] = useState([]);
    const [salones, setSalones] = useState([]);
    const [credencialesGeneradas, setCredencialesGeneradas] = useState(null);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        cargarCursos();
        cargarSalones();
    }, []);

    const cargarCursos = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/cursos');
            if (response.ok) {
                const data = await response.json();
                setCursos(data.data || []);
            }
        } catch (error) {
            console.error('Error al cargar cursos:', error);
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

    const handleCrearPadreHijo = async (e) => {
        e.preventDefault();
        
        if (!nuevoPadreHijo.padre_nombre || !nuevoPadreHijo.padre_apellido || !nuevoPadreHijo.padre_correo || 
            !nuevoPadreHijo.padre_contrasena || !nuevoPadreHijo.padre_dni) {
            alert('Todos los datos del padre son obligatorios');
            return;
        }

        if (!nuevoPadreHijo.hijo_nombre || !nuevoPadreHijo.hijo_apellido) {
            alert('Nombre y apellido del hijo son obligatorios');
            return;
        }

        setEnviando(true);
        try {
            const response = await fetch('http://localhost:5000/api/admin/crear-padre-hijo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...nuevoPadreHijo,
                    seccion: nuevoPadreHijo.seccion || null,
                    turno: nuevoPadreHijo.turno || null,
                    id_salon: nuevoPadreHijo.id_salon ? parseInt(nuevoPadreHijo.id_salon) : null,
                    id_cursos: nuevoPadreHijo.id_cursos.map(id => parseInt(id))
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setCredencialesGeneradas(data.data);
                alert('Padre e hijo creados exitosamente');
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al crear padre e hijo:', error);
            alert('Error de conexión');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="vista-admin">
            <div className="vista-header">
                <button className="btn-volver" onClick={onVolver}>← Volver</button>
                <h2>👨‍👩‍👧‍👦 Crear Padre e Hijo</h2>
            </div>

            <div className="vista-content">
                {credencialesGeneradas ? (
                    <div className="credenciales-generadas">
                        <div className="success-message">
                            <h3>✅ Cuentas creadas exitosamente</h3>
                            <div className="credenciales-box">
                                <h4>Información del Estudiante</h4>
                                <p><strong>Nombre:</strong> {credencialesGeneradas.hijo.nombre} {credencialesGeneradas.hijo.apellido}</p>
                                <p><strong>Correo:</strong> {credencialesGeneradas.credenciales_hijo.correo}</p>
                                <p><strong>Contraseña:</strong> {credencialesGeneradas.credenciales_hijo.contrasena}</p>
                                {credencialesGeneradas.asignacion.salon && (
                                    <div>
                                        <h4>Salón Asignado</h4>
                                        <p>{credencialesGeneradas.asignacion.salon.nombre_completo}</p>
                                    </div>
                                )}
                                {credencialesGeneradas.asignacion.cursos.length > 0 && (
                                    <div>
                                        <h4>Cursos Asignados</h4>
                                        <ul>
                                            {credencialesGeneradas.asignacion.cursos.map(curso => (
                                                <li key={curso.id_curso}>{curso.nombre_curso}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <button className="btn-primary" onClick={() => {
                                setCredencialesGeneradas(null);
                                setNuevoPadreHijo({
                                    padre_nombre: '', padre_apellido: '', padre_correo: '', padre_contrasena: '', padre_dni: '', padre_telefono: '', padre_direccion: '',
                                    hijo_nombre: '', hijo_apellido: '', hijo_dni: '',
                                    seccion: '', turno: '', id_salon: '', id_cursos: [], relacion: 'Padre'
                                });
                            }}>
                                Crear Otro
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleCrearPadreHijo} className="form-crear-padre-hijo">
                        <div className="form-section">
                            <h3>Datos del Padre</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombre: *</label>
                                    <input
                                        type="text"
                                        value={nuevoPadreHijo.padre_nombre}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, padre_nombre: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Apellido: *</label>
                                    <input
                                        type="text"
                                        value={nuevoPadreHijo.padre_apellido}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, padre_apellido: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Correo: *</label>
                                    <input
                                        type="email"
                                        value={nuevoPadreHijo.padre_correo}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, padre_correo: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contraseña: *</label>
                                    <input
                                        type="password"
                                        value={nuevoPadreHijo.padre_contrasena}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, padre_contrasena: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>DNI: *</label>
                                    <input
                                        type="text"
                                        value={nuevoPadreHijo.padre_dni}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, padre_dni: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono:</label>
                                    <input
                                        type="text"
                                        value={nuevoPadreHijo.padre_telefono}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, padre_telefono: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Dirección:</label>
                                <input
                                    type="text"
                                    value={nuevoPadreHijo.padre_direccion}
                                    onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, padre_direccion: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Datos del Hijo</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombre: *</label>
                                    <input
                                        type="text"
                                        value={nuevoPadreHijo.hijo_nombre}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, hijo_nombre: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Apellido: *</label>
                                    <input
                                        type="text"
                                        value={nuevoPadreHijo.hijo_apellido}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, hijo_apellido: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>DNI (Opcional):</label>
                                <input
                                    type="text"
                                    value={nuevoPadreHijo.hijo_dni}
                                    onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, hijo_dni: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Asignación</h3>
                            <div className="form-group">
                                <label>Sección (Opcional):</label>
                                <input
                                    type="text"
                                    value={nuevoPadreHijo.seccion}
                                    onChange={(e) => {
                                        setNuevoPadreHijo({
                                            ...nuevoPadreHijo,
                                            seccion: e.target.value,
                                            id_salon: ''
                                        });
                                    }}
                                    placeholder="Ej: A, B, C"
                                />
                            </div>
                            <div className="form-group">
                                <label>Turno (Opcional):</label>
                                <select
                                    value={nuevoPadreHijo.turno}
                                    onChange={(e) => {
                                        setNuevoPadreHijo({
                                            ...nuevoPadreHijo,
                                            turno: e.target.value,
                                            id_salon: ''
                                        });
                                    }}
                                >
                                    <option value="">Todos los turnos</option>
                                    <option value="Mañana">Mañana</option>
                                    <option value="Tarde">Tarde</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Salón:</label>
                                <select
                                    value={nuevoPadreHijo.id_salon}
                                    onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, id_salon: e.target.value})}
                                >
                                    <option value="">Seleccionar salón (opcional)</option>
                                    {salones
                                        .filter(s => s.activo)
                                        .filter(s => {
                                            if (nuevoPadreHijo.seccion && s.seccion) {
                                                if (s.seccion.toLowerCase() !== nuevoPadreHijo.seccion.toLowerCase()) {
                                                    return false;
                                                }
                                            }
                                            if (nuevoPadreHijo.turno && s.turno) {
                                                if (s.turno !== nuevoPadreHijo.turno) {
                                                    return false;
                                                }
                                            }
                                            return true;
                                        })
                                        .map(salon => (
                                            <option key={salon.id_salon} value={salon.id_salon}>
                                                {salon.nombre_salon} ({salon.estudiantes_matriculados || 0}/{salon.capacidad_maxima})
                                                {salon.grado && salon.seccion && ` - ${salon.grado} ${salon.seccion}`}
                                                {salon.turno && ` - Turno: ${salon.turno}`}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Cursos (Selecciona todos los que desees):</label>
                                <div className="cursos-checkbox-list">
                                    {cursos.filter(c => c.activo).map(curso => (
                                        <label key={curso.id_curso} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={nuevoPadreHijo.id_cursos.includes(curso.id_curso.toString())}
                                                onChange={(e) => {
                                                    const cursoId = curso.id_curso.toString();
                                                    if (e.target.checked) {
                                                        setNuevoPadreHijo({
                                                            ...nuevoPadreHijo,
                                                            id_cursos: [...nuevoPadreHijo.id_cursos, cursoId]
                                                        });
                                                    } else {
                                                        setNuevoPadreHijo({
                                                            ...nuevoPadreHijo,
                                                            id_cursos: nuevoPadreHijo.id_cursos.filter(id => id !== cursoId)
                                                        });
                                                    }
                                                }}
                                            />
                                            {curso.nombre_curso} {curso.turno && `(${curso.turno})`}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={enviando}>
                                {enviando ? 'Creando...' : 'Crear Padre e Hijo'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={onVolver}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default VistaCrearPadreHijo;

