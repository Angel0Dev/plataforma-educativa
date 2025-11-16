import React from 'react';
import './Cursos.css';

const Cursos = () => {
    const cursos = [
        {
            id: 1,
            titulo: "Matemáticas Avanzadas",
            descripcion: "Curso completo de matemáticas para estudiantes de secundaria",
            docente: "Prof. Juan Pérez",
            duracion: "6 meses",
            nivel: "Intermedio",
            imagen: "📐"
        },
        {
            id: 2,
            titulo: "Ciencias Naturales",
            descripcion: "Exploración del mundo natural y sus fenómenos",
            docente: "Prof. María González",
            duracion: "4 meses",
            nivel: "Básico",
            imagen: "🔬"
        },
        {
            id: 3,
            titulo: "Literatura Universal",
            descripcion: "Análisis de obras maestras de la literatura mundial",
            docente: "Prof. Carlos Rodríguez",
            duracion: "8 meses",
            nivel: "Avanzado",
            imagen: "📚"
        },
        {
            id: 4,
            titulo: "Historia Contemporánea",
            descripcion: "Estudio de los principales eventos del siglo XX",
            docente: "Prof. Ana Martínez",
            duracion: "5 meses",
            nivel: "Intermedio",
            imagen: "🏛️"
        },
        {
            id: 5,
            titulo: "Programación Básica",
            descripcion: "Introducción al mundo de la programación",
            docente: "Prof. Luis García",
            duracion: "3 meses",
            nivel: "Principiante",
            imagen: "💻"
        },
        {
            id: 6,
            titulo: "Arte y Creatividad",
            descripcion: "Desarrollo de habilidades artísticas y creativas",
            docente: "Prof. Carmen López",
            duracion: "6 meses",
            nivel: "Básico",
            imagen: "🎨"
        }
    ];

    return (
        <div className="cursos">
            <div className="container">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">Nuestros Cursos</h1>
                        <p className="hero-subtitle">
                            Descubre una amplia variedad de cursos diseñados para tu crecimiento académico
                        </p>
                    </div>
                </section>

                {/* Filtros */}
                <section className="filtros-section">
                    <div className="filtros-container">
                        <div className="filtro-group">
                            <label>Nivel:</label>
                            <select>
                                <option value="">Todos los niveles</option>
                                <option value="Principiante">Principiante</option>
                                <option value="Básico">Básico</option>
                                <option value="Intermedio">Intermedio</option>
                                <option value="Avanzado">Avanzado</option>
                            </select>
                        </div>
                        <div className="filtro-group">
                            <label>Duración:</label>
                            <select>
                                <option value="">Cualquier duración</option>
                                <option value="1-3">1-3 meses</option>
                                <option value="4-6">4-6 meses</option>
                                <option value="7+">7+ meses</option>
                            </select>
                        </div>
                        <div className="filtro-group">
                            <label>Área:</label>
                            <select>
                                <option value="">Todas las áreas</option>
                                <option value="Matemáticas">Matemáticas</option>
                                <option value="Ciencias">Ciencias</option>
                                <option value="Literatura">Literatura</option>
                                <option value="Historia">Historia</option>
                                <option value="Tecnología">Tecnología</option>
                                <option value="Arte">Arte</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Grid de Cursos */}
                <section className="cursos-grid">
                    {cursos.map(curso => (
                        <div key={curso.id} className="curso-card">
                            <div className="curso-header">
                                <div className="curso-imagen">{curso.imagen}</div>
                                <div className="curso-nivel">{curso.nivel}</div>
                            </div>
                            <div className="curso-content">
                                <h3 className="curso-titulo">{curso.titulo}</h3>
                                <p className="curso-descripcion">{curso.descripcion}</p>
                                <div className="curso-info">
                                    <div className="info-item">
                                        <span className="info-label">Docente:</span>
                                        <span className="info-value">{curso.docente}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Duración:</span>
                                        <span className="info-value">{curso.duracion}</span>
                                    </div>
                                </div>
                                <div className="curso-actions">
                                    <button className="btn-inscribirse">Inscribirse</button>
                                    <button className="btn-detalles">Ver Detalles</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* CTA Section */}
                <section className="cta-section">
                    <div className="cta-content">
                        <h2>¿No encuentras lo que buscas?</h2>
                        <p>Contáctanos para más información sobre cursos personalizados</p>
                        <button className="btn-contacto">Contactar</button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Cursos;
