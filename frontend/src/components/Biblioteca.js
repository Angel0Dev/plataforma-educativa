import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Biblioteca.css';

const Biblioteca = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="biblioteca-container">
                <div className="access-denied">
                    <h2>Acceso Restringido</h2>
                    <p>Debes iniciar sesión para acceder a la biblioteca.</p>
                    <a href="/login" className="btn-primary">Iniciar Sesión</a>
                </div>
            </div>
        );
    }

    // Datos de ejemplo para la biblioteca
    const recursos = [
        {
            id: 1,
            titulo: 'Matemáticas Avanzadas - Libro de Texto',
            tipo: 'Libro',
            materia: 'Matemáticas',
            descripcion: 'Libro completo de matemáticas para estudiantes de secundaria.',
            autor: 'Prof. Juan Pérez',
            fecha: '2024-01-01',
            formato: 'PDF',
            tamaño: '15.2 MB',
            disponible: true
        },
        {
            id: 2,
            titulo: 'Historia Universal - Documental',
            tipo: 'Video',
            materia: 'Historia',
            descripcion: 'Documental completo sobre la historia universal.',
            autor: 'Canal Educativo',
            fecha: '2024-01-02',
            formato: 'MP4',
            tamaño: '2.1 GB',
            disponible: true
        },
        {
            id: 3,
            titulo: 'Ciencias Naturales - Presentación',
            tipo: 'Presentación',
            materia: 'Ciencias',
            descripcion: 'Presentación interactiva sobre ciencias naturales.',
            autor: 'Prof. María González',
            fecha: '2024-01-03',
            formato: 'PPTX',
            tamaño: '45.8 MB',
            disponible: false
        },
        {
            id: 4,
            titulo: 'Literatura Universal - Audio Libro',
            tipo: 'Audio',
            materia: 'Literatura',
            descripcion: 'Audio libro de clásicos de la literatura universal.',
            autor: 'Varios Autores',
            fecha: '2024-01-04',
            formato: 'MP3',
            tamaño: '120.5 MB',
            disponible: true
        }
    ];

    const getTipoIcono = (tipo) => {
        switch (tipo) {
            case 'Libro': return '📚';
            case 'Video': return '🎥';
            case 'Presentación': return '📊';
            case 'Audio': return '🎵';
            default: return '📄';
        }
    };

    const getFormatoColor = (formato) => {
        switch (formato) {
            case 'PDF': return 'formato-pdf';
            case 'MP4': return 'formato-video';
            case 'PPTX': return 'formato-presentacion';
            case 'MP3': return 'formato-audio';
            default: return 'formato-default';
        }
    };

    return (
        <div className="biblioteca-container">
            <div className="biblioteca-header">
                <h1>📚 Biblioteca Digital</h1>
                <p>Accede a recursos educativos y materiales de estudio</p>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="biblioteca-stats">
                <div className="stat-card">
                    <h3>Total de Recursos</h3>
                    <div className="stat-number">{recursos.length}</div>
                    <p>Materiales disponibles</p>
                </div>
                <div className="stat-card">
                    <h3>Recursos Disponibles</h3>
                    <div className="stat-number">{recursos.filter(r => r.disponible).length}</div>
                    <p>Acceso inmediato</p>
                </div>
                <div className="stat-card">
                    <h3>Materias Cubiertas</h3>
                    <div className="stat-number">{new Set(recursos.map(r => r.materia)).size}</div>
                    <p>Áreas de estudio</p>
                </div>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="biblioteca-filters">
                <div className="search-box">
                    <input type="text" placeholder="Buscar recursos..." />
                    <button className="btn-search">🔍</button>
                </div>
                <div className="filter-group">
                    <label>Filtrar por materia:</label>
                    <select>
                        <option value="todas">Todas las Materias</option>
                        <option value="matematicas">Matemáticas</option>
                        <option value="historia">Historia</option>
                        <option value="ciencias">Ciencias</option>
                        <option value="literatura">Literatura</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Filtrar por tipo:</label>
                    <select>
                        <option value="todos">Todos los Tipos</option>
                        <option value="libro">Libros</option>
                        <option value="video">Videos</option>
                        <option value="presentacion">Presentaciones</option>
                        <option value="audio">Audio Libros</option>
                    </select>
                </div>
            </div>

            {/* Lista de Recursos */}
            <div className="recursos-list">
                {recursos.map(recurso => (
                    <div key={recurso.id} className={`recurso-card ${!recurso.disponible ? 'no-disponible' : ''}`}>
                        <div className="recurso-header">
                            <div className="recurso-tipo">
                                <span className="tipo-icono">{getTipoIcono(recurso.tipo)}</span>
                                <span className="tipo-texto">{recurso.tipo}</span>
                            </div>
                            <div className="recurso-disponibilidad">
                                {recurso.disponible ? (
                                    <span className="disponible-badge">✅ Disponible</span>
                                ) : (
                                    <span className="no-disponible-badge">❌ No Disponible</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="recurso-content">
                            <h3>{recurso.titulo}</h3>
                            <p className="recurso-materia">📚 {recurso.materia}</p>
                            <p className="recurso-descripcion">{recurso.descripcion}</p>
                            <p className="recurso-autor">👤 Autor: {recurso.autor}</p>
                            <div className="recurso-details">
                                <span className="recurso-fecha">📅 {recurso.fecha}</span>
                                <span className={`formato-badge ${getFormatoColor(recurso.formato)}`}>
                                    {recurso.formato}
                                </span>
                                <span className="recurso-tamaño">💾 {recurso.tamaño}</span>
                            </div>
                        </div>
                        
                        <div className="recurso-actions">
                            {recurso.disponible ? (
                                <>
                                    <button className="btn-primary">📥 Descargar</button>
                                    <button className="btn-secondary">👁️ Ver Online</button>
                                </>
                            ) : (
                                <button className="btn-disabled" disabled>
                                    ⏳ Próximamente
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {recursos.length === 0 && (
                <div className="no-recursos">
                    <h3>📚 No hay recursos disponibles</h3>
                    <p>Los recursos aparecerán aquí cuando estén disponibles.</p>
                </div>
            )}
        </div>
    );
};

export default Biblioteca;
