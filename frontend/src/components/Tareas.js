import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Tareas.css';

const Tareas = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="tareas-container">
                <div className="access-denied">
                    <h2>Acceso Restringido</h2>
                    <p>Debes iniciar sesión para acceder a las tareas.</p>
                    <a href="/login" className="btn-primary">Iniciar Sesión</a>
                </div>
            </div>
        );
    }

    // Datos de ejemplo para las tareas
    const tareas = [
        {
            id: 1,
            titulo: 'Tarea de Matemáticas',
            materia: 'Matemáticas',
            descripcion: 'Resolver los ejercicios de la página 45 del libro de texto.',
            fechaLimite: '2024-01-15',
            estado: 'Pendiente',
            prioridad: 'Alta'
        },
        {
            id: 2,
            titulo: 'Ensayo de Literatura',
            materia: 'Literatura',
            descripcion: 'Escribir un ensayo de 500 palabras sobre el tema asignado.',
            fechaLimite: '2024-01-18',
            estado: 'En Progreso',
            prioridad: 'Media'
        },
        {
            id: 3,
            titulo: 'Proyecto de Ciencias',
            materia: 'Ciencias',
            descripcion: 'Crear un modelo del sistema solar con materiales reciclados.',
            fechaLimite: '2024-01-20',
            estado: 'Pendiente',
            prioridad: 'Baja'
        }
    ];

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Pendiente': return 'estado-pendiente';
            case 'En Progreso': return 'estado-progreso';
            case 'Completado': return 'estado-completado';
            default: return 'estado-default';
        }
    };

    const getPrioridadColor = (prioridad) => {
        switch (prioridad) {
            case 'Alta': return 'prioridad-alta';
            case 'Media': return 'prioridad-media';
            case 'Baja': return 'prioridad-baja';
            default: return 'prioridad-default';
        }
    };

    return (
        <div className="tareas-container">
            <div className="tareas-header">
                <h1>📝 Mis Tareas</h1>
                <p>Gestiona tus tareas y asignaciones académicas</p>
            </div>

            <div className="tareas-filters">
                <div className="filter-group">
                    <label>Filtrar por estado:</label>
                    <select>
                        <option value="todos">Todas</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="progreso">En Progreso</option>
                        <option value="completado">Completadas</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Filtrar por materia:</label>
                    <select>
                        <option value="todas">Todas</option>
                        <option value="matematicas">Matemáticas</option>
                        <option value="literatura">Literatura</option>
                        <option value="ciencias">Ciencias</option>
                    </select>
                </div>
            </div>

            <div className="tareas-list">
                {tareas.map(tarea => (
                    <div key={tarea.id} className="tarea-card">
                        <div className="tarea-header">
                            <h3>{tarea.titulo}</h3>
                            <div className="tarea-badges">
                                <span className={`estado-badge ${getEstadoColor(tarea.estado)}`}>
                                    {tarea.estado}
                                </span>
                                <span className={`prioridad-badge ${getPrioridadColor(tarea.prioridad)}`}>
                                    {tarea.prioridad}
                                </span>
                            </div>
                        </div>
                        
                        <div className="tarea-content">
                            <p className="tarea-materia">📚 {tarea.materia}</p>
                            <p className="tarea-descripcion">{tarea.descripcion}</p>
                            <p className="tarea-fecha">📅 Vence: {tarea.fechaLimite}</p>
                        </div>
                        
                        <div className="tarea-actions">
                            <button className="btn-primary">Ver Detalles</button>
                            <button className="btn-secondary">Entregar</button>
                        </div>
                    </div>
                ))}
            </div>

            {tareas.length === 0 && (
                <div className="no-tareas">
                    <h3>🎉 ¡No tienes tareas pendientes!</h3>
                    <p>Mantente al día con tus asignaciones.</p>
                </div>
            )}
        </div>
    );
};

export default Tareas;
