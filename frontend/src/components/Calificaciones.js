import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Calificaciones.css';

const Calificaciones = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="calificaciones-container">
                <div className="access-denied">
                    <h2>Acceso Restringido</h2>
                    <p>Debes iniciar sesión para acceder a las calificaciones.</p>
                    <a href="/login" className="btn-primary">Iniciar Sesión</a>
                </div>
            </div>
        );
    }

    // Datos de ejemplo para las calificaciones
    const calificaciones = [
        {
            id: 1,
            materia: 'Matemáticas',
            tarea: 'Examen Parcial',
            calificacion: 85,
            fecha: '2024-01-10',
            observaciones: 'Buen trabajo, sigue así.'
        },
        {
            id: 2,
            materia: 'Literatura',
            tarea: 'Ensayo de Poesía',
            calificacion: 92,
            fecha: '2024-01-08',
            observaciones: 'Excelente análisis literario.'
        },
        {
            id: 3,
            materia: 'Historia',
            tarea: 'Proyecto de Investigación',
            calificacion: 78,
            fecha: '2024-01-05',
            observaciones: 'Necesitas mejorar la investigación.'
        },
        {
            id: 4,
            materia: 'Ciencias',
            tarea: 'Laboratorio de Química',
            calificacion: 90,
            fecha: '2024-01-03',
            observaciones: 'Muy buen trabajo en el laboratorio.'
        }
    ];

    // Calcular promedio
    const promedio = calificaciones.reduce((acc, cal) => acc + cal.calificacion, 0) / calificaciones.length;

    const getCalificacionColor = (calificacion) => {
        if (calificacion >= 90) return 'calificacion-excelente';
        if (calificacion >= 80) return 'calificacion-buena';
        if (calificacion >= 70) return 'calificacion-regular';
        return 'calificacion-baja';
    };

    const getCalificacionTexto = (calificacion) => {
        if (calificacion >= 90) return 'Excelente';
        if (calificacion >= 80) return 'Buena';
        if (calificacion >= 70) return 'Regular';
        return 'Necesita Mejorar';
    };

    return (
        <div className="calificaciones-container">
            <div className="calificaciones-header">
                <h1>📊 Mis Calificaciones</h1>
                <p>Revisa tu rendimiento académico</p>
            </div>

            {/* Resumen General */}
            <div className="resumen-general">
                <div className="resumen-card">
                    <h3>Promedio General</h3>
                    <div className="promedio-numero">{promedio.toFixed(1)}</div>
                    <p className="promedio-texto">{getCalificacionTexto(promedio)}</p>
                </div>
                <div className="resumen-card">
                    <h3>Total de Evaluaciones</h3>
                    <div className="promedio-numero">{calificaciones.length}</div>
                    <p className="promedio-texto">Evaluaciones</p>
                </div>
                <div className="resumen-card">
                    <h3>Calificación Más Alta</h3>
                    <div className="promedio-numero">{Math.max(...calificaciones.map(c => c.calificacion))}</div>
                    <p className="promedio-texto">Puntos</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="calificaciones-filters">
                <div className="filter-group">
                    <label>Filtrar por materia:</label>
                    <select>
                        <option value="todas">Todas las Materias</option>
                        <option value="matematicas">Matemáticas</option>
                        <option value="literatura">Literatura</option>
                        <option value="historia">Historia</option>
                        <option value="ciencias">Ciencias</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Ordenar por:</label>
                    <select>
                        <option value="fecha">Fecha (Más Reciente)</option>
                        <option value="calificacion">Calificación (Mayor a Menor)</option>
                        <option value="materia">Materia (A-Z)</option>
                    </select>
                </div>
            </div>

            {/* Lista de Calificaciones */}
            <div className="calificaciones-list">
                {calificaciones.map(calificacion => (
                    <div key={calificacion.id} className="calificacion-card">
                        <div className="calificacion-header">
                            <div className="calificacion-info">
                                <h3>{calificacion.tarea}</h3>
                                <p className="calificacion-materia">📚 {calificacion.materia}</p>
                                <p className="calificacion-fecha">📅 {calificacion.fecha}</p>
                            </div>
                            <div className="calificacion-nota">
                                <div className={`nota-numero ${getCalificacionColor(calificacion.calificacion)}`}>
                                    {calificacion.calificacion}
                                </div>
                                <p className="nota-texto">{getCalificacionTexto(calificacion.calificacion)}</p>
                            </div>
                        </div>
                        
                        <div className="calificacion-content">
                            <p className="calificacion-observaciones">
                                <strong>Observaciones:</strong> {calificacion.observaciones}
                            </p>
                        </div>
                        
                        <div className="calificacion-actions">
                            <button className="btn-secondary">Ver Detalles</button>
                            <button className="btn-primary">Descargar</button>
                        </div>
                    </div>
                ))}
            </div>

            {calificaciones.length === 0 && (
                <div className="no-calificaciones">
                    <h3>📝 No hay calificaciones disponibles</h3>
                    <p>Las calificaciones aparecerán aquí cuando estén disponibles.</p>
                </div>
            )}
        </div>
    );
};

export default Calificaciones;
