import React from 'react';
import './SobreNosotros.css';

const SobreNosotros = () => {
    return (
        <div className="sobre-nosotros">
            <div className="container">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">Sobre Nosotros</h1>
                        <p className="hero-subtitle">
                            Construyendo el futuro de la educación digital
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <section className="main-content">
                    <div className="content-grid">
                        {/* Nuestra Misión */}
                        <div className="content-card">
                            <div className="card-icon">🎯</div>
                            <h3>Nuestra Misión</h3>
                            <p>
                                Transformar la experiencia educativa mediante tecnología innovadora, 
                                conectando estudiantes, docentes y familias en una plataforma integral 
                                que facilita el aprendizaje y el crecimiento académico.
                            </p>
                        </div>

                        {/* Nuestra Visión */}
                        <div className="content-card">
                            <div className="card-icon">🔮</div>
                            <h3>Nuestra Visión</h3>
                            <p>
                                Ser la plataforma educativa líder que revolucione la forma de enseñar 
                                y aprender, creando un ecosistema digital inclusivo y accesible para 
                                todas las comunidades educativas.
                            </p>
                        </div>

                        {/* Nuestros Valores */}
                        <div className="content-card">
                            <div className="card-icon">💎</div>
                            <h3>Nuestros Valores</h3>
                            <ul>
                                <li><strong>Innovación:</strong> Siempre buscando nuevas formas de mejorar la educación</li>
                                <li><strong>Accesibilidad:</strong> Educación para todos, sin barreras</li>
                                <li><strong>Colaboración:</strong> Trabajo en equipo entre todos los actores educativos</li>
                                <li><strong>Excelencia:</strong> Compromiso con la calidad educativa</li>
                            </ul>
                        </div>
                    </div>

                    {/* Historia */}
                    <div className="historia-section">
                        <h2>Nuestra Historia</h2>
                        <div className="timeline">
                            <div className="timeline-item">
                                <div className="timeline-year">2024</div>
                                <div className="timeline-content">
                                    <h4>Fundación</h4>
                                    <p>Nacimos con la visión de revolucionar la educación digital, 
                                    conectando todos los aspectos del proceso educativo en una sola plataforma.</p>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-year">2024</div>
                                <div className="timeline-content">
                                    <h4>Desarrollo</h4>
                                    <p>Desarrollamos nuestra primera versión con funcionalidades 
                                    de registro, gestión de usuarios y base de datos robusta.</p>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-year">2025</div>
                                <div className="timeline-content">
                                    <h4>Expansión</h4>
                                    <p>Continuamos expandiendo nuestras funcionalidades para incluir 
                                    gestión de cursos, tareas, calificaciones y comunicación.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Equipo */}
                    <div className="equipo-section">
                        <h2>Nuestro Equipo</h2>
                        <div className="equipo-grid">
                            <div className="equipo-card">
                                <div className="equipo-avatar">👨‍💻</div>
                                <h4>Desarrolladores</h4>
                                <p>Expertos en tecnología educativa y desarrollo de software</p>
                            </div>
                            <div className="equipo-card">
                                <div className="equipo-avatar">👩‍🏫</div>
                                <h4>Educadores</h4>
                                <p>Profesionales con experiencia en pedagogía y diseño curricular</p>
                            </div>
                            <div className="equipo-card">
                                <div className="equipo-avatar">👨‍🎨</div>
                                <h4>Diseñadores</h4>
                                <p>Especialistas en experiencia de usuario y diseño de interfaces</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SobreNosotros;
