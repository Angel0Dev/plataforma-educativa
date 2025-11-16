import React, { useState, useEffect } from 'react';
import VistaGestionUsuarios from './vistas/VistaGestionUsuarios';
import VistaGestionCursos from './vistas/VistaGestionCursos';
import VistaGestionSalones from './vistas/VistaGestionSalones';
import VistaCrearPadreHijo from './vistas/VistaCrearPadreHijo';

const DashboardAdministrador = ({ user }) => {
    // Estado para la vista actual (null = dashboard principal)
    const [vistaActual, setVistaActual] = useState(null);
    
    // Estados para los modales y formularios
    const [showAgregarCurso, setShowAgregarCurso] = useState(false);
    const [showEditarCurso, setShowEditarCurso] = useState(false);
    const [cursoEdit, setCursoEdit] = useState({ id_curso: null, nombre: '', descripcion: '', turno: '', activo: true });
    const [showHorariosCurso, setShowHorariosCurso] = useState(false);
    const [cursoSeleccionadoHorarios, setCursoSeleccionadoHorarios] = useState(null);
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
    const [showGestionUsuarios, setShowGestionUsuarios] = useState(false);
    const [filtroRolUsuarios, setFiltroRolUsuarios] = useState('Todos'); // Filtro para gestión de usuarios
    const [showGestionCalificaciones, setShowGestionCalificaciones] = useState(false);
    const [showGestionMatriculas, setShowGestionMatriculas] = useState(false);
    const [showMatricularEstudiante, setShowMatricularEstudiante] = useState(false);
    const [showCrearUsuario, setShowCrearUsuario] = useState(false);
    const [showCrearPadreHijo, setShowCrearPadreHijo] = useState(false);
    const [showEstudiantesCurso, setShowEstudiantesCurso] = useState(false);
    const [showGestionSalones, setShowGestionSalones] = useState(false);
    const [showCrearSalon, setShowCrearSalon] = useState(false);
    const [showEstudiantesSalon, setShowEstudiantesSalon] = useState(false);
    const [estudiantesConPadres, setEstudiantesConPadres] = useState([]);
    const [salonSeleccionadoEstudiantes, setSalonSeleccionadoEstudiantes] = useState(null);
    const [showEditarCredenciales, setShowEditarCredenciales] = useState(false);
    const [usuarioSeleccionadoCredenciales, setUsuarioSeleccionadoCredenciales] = useState(null);
    const [credencialesEdit, setCredencialesEdit] = useState({
        nuevo_correo: '',
        nueva_contrasena: '',
        confirmar_contrasena: ''
    });
    const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
    const [nuevoCurso, setNuevoCurso] = useState({ nombre: '', descripcion: '', turno: '' });
    const [calificacionEdit, setCalificacionEdit] = useState({ id: null, nota: '', estudiante: '', curso: '' });
    const [nuevaMatricula, setNuevaMatricula] = useState({ estudiante: '', curso: '' });
    const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', apellido: '', correo: '', contrasena: '', rol: 'Estudiante', dni: '', telefono: '', direccion: '' });
    const [nuevoPadreHijo, setNuevoPadreHijo] = useState({
        padre_nombre: '', padre_apellido: '', padre_correo: '', padre_contrasena: '', padre_dni: '', padre_telefono: '', padre_direccion: '',
        hijo_nombre: '', hijo_apellido: '', hijo_dni: '',
        seccion: '', turno: '', id_salon: '', id_cursos: [], relacion: 'Padre'
    });
    const [credencialesHijoGeneradas, setCredencialesHijoGeneradas] = useState(null);
    const [estudiantesMatriculados, setEstudiantesMatriculados] = useState([]);
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
    
    // Estados para datos de la base de datos
    const [estadisticas, setEstadisticas] = useState(null);
    const [usuarios, setUsuarios] = useState([]);
    const [matriculas, setMatriculas] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [salones, setSalones] = useState([]);
    const [estudiantesNoMatriculados, setEstudiantesNoMatriculados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para cargar estadísticas desde la base de datos
    const cargarEstadisticas = async () => {
        try {
            console.log('Cargando estadísticas...');
            const response = await fetch('http://localhost:5000/api/admin/estadisticas', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            console.log('Respuesta de estadísticas:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Datos de estadísticas recibidos:', data);
                setEstadisticas(data.data);
                setError(null);
            } else {
                const errorData = await response.json();
                console.error('Error al cargar estadísticas:', errorData);
                setError(`Error al cargar estadísticas: ${errorData.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error de conexión al cargar estadísticas:', error);
            setError(`Error de conexión con el servidor: ${error.message}`);
        }
    };

    // Función para cargar usuarios desde la base de datos
    const cargarUsuarios = async () => {
        try {
            console.log('Cargando usuarios...');
            const response = await fetch('http://localhost:5000/api/admin/usuarios', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            console.log('Respuesta de usuarios:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Datos de usuarios recibidos:', data);
                console.log('Total de usuarios:', data.data?.length || 0);
                console.log('Docentes encontrados:', data.data?.filter(u => u.rol === 'Docente' && u.activo)?.length || 0);
                setUsuarios(data.data);
                setError(null);
            } else {
                const errorData = await response.json();
                console.error('Error al cargar usuarios:', errorData);
                setError(`Error al cargar usuarios: ${errorData.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error de conexión al cargar usuarios:', error);
            setError(`Error de conexión con el servidor: ${error.message}`);
        }
    };

    // Función para cargar matrículas desde la base de datos
    const cargarMatriculas = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/matriculas', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                setMatriculas(data.data);
            } else {
                console.error('Error al cargar matrículas');
            }
        } catch (error) {
            console.error('Error de conexión al cargar matrículas:', error);
        }
    };

    // Función para cargar cursos desde la base de datos
    const cargarCursos = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/cursos', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                setCursos(data.data);
            } else {
                console.error('Error al cargar cursos');
            }
        } catch (error) {
            console.error('Error de conexión al cargar cursos:', error);
        }
    };

    // Función para cargar docentes
    const cargarDocentes = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/usuarios', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                const docentesData = data.data.filter(u => u.rol === 'Docente' && u.activo);
                setDocentes(docentesData);
            }
        } catch (error) {
            console.error('Error al cargar docentes:', error);
        }
    };

    // Función para cargar salones desde la base de datos
    const cargarSalones = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/salones', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                setSalones(data.data);
            } else {
                console.error('Error al cargar salones');
            }
        } catch (error) {
            console.error('Error de conexión al cargar salones:', error);
        }
    };

    // Función para crear padre e hijo con salón
    const handleCrearPadreHijo = async (e) => {
        e.preventDefault();
        
        // Validar datos requeridos
        if (!nuevoPadreHijo.padre_nombre || !nuevoPadreHijo.padre_apellido || !nuevoPadreHijo.padre_correo || 
            !nuevoPadreHijo.padre_contrasena || !nuevoPadreHijo.padre_dni) {
            alert('Todos los datos del padre son obligatorios (nombre, apellido, correo, contraseña, DNI)');
            return;
        }

        if (!nuevoPadreHijo.hijo_nombre || !nuevoPadreHijo.hijo_apellido) {
            alert('Nombre y apellido del hijo son obligatorios');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:5000/api/admin/crear-padre-hijo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
                setCredencialesHijoGeneradas(data.data);
                
                // Recargar datos
                cargarUsuarios();
                cargarSalones();
                
                // Limpiar formulario
                setNuevoPadreHijo({
                    padre_nombre: '', padre_apellido: '', padre_correo: '', padre_contrasena: '', 
                    padre_dni: '', padre_telefono: '', padre_direccion: '',
                    hijo_nombre: '', hijo_apellido: '', hijo_dni: '',
                    seccion: '', turno: '', id_salon: '', id_cursos: [], relacion: 'Padre'
                });
            } else {
                const error = await response.json();
                alert(`Error al crear padre e hijo: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al crear padre e hijo:', error);
            alert('Error de conexión al crear padre e hijo');
        }
    };

    // Función para crear salón
    const handleCrearSalon = async (e) => {
        e.preventDefault();
        
        // Validar datos requeridos
        if (!nuevoSalon.nombre_salon) {
            alert('El nombre del salón es obligatorio');
            return;
        }

        if (nuevoSalon.capacidad_maxima <= 0 || nuevoSalon.capacidad_maxima > 100) {
            alert('La capacidad máxima debe estar entre 1 y 100');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:5000/api/salones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre_salon: nuevoSalon.nombre_salon,
                    descripcion: nuevoSalon.descripcion || null,
                    capacidad_maxima: parseInt(nuevoSalon.capacidad_maxima),
                    grado: nuevoSalon.grado || null,
                    seccion: nuevoSalon.seccion || null,
                    anio_academico: nuevoSalon.anio_academico || null,
                    turno: nuevoSalon.turno || null,
                    id_docente_titular: nuevoSalon.id_docente_titular ? parseInt(nuevoSalon.id_docente_titular) : null
                }),
            });

            if (response.ok) {
                alert('Salón creado exitosamente');
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
                setShowCrearSalon(false);
                await cargarSalones(); // Recargar la lista de salones
            } else {
                const error = await response.json();
                alert(`Error al crear salón: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al crear salón:', error);
            alert('Error de conexión al crear el salón');
        }
    };

    // Función para actualizar credenciales de un usuario
    const handleActualizarCredenciales = async (e) => {
        e.preventDefault();
        
        if (!usuarioSeleccionadoCredenciales) {
            alert('No se ha seleccionado un usuario');
            return;
        }

        if (credencialesEdit.nueva_contrasena && credencialesEdit.nueva_contrasena !== credencialesEdit.confirmar_contrasena) {
            alert('Las contraseñas no coinciden');
            return;
        }

        if (credencialesEdit.nueva_contrasena && credencialesEdit.nueva_contrasena.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:5000/api/admin/actualizar-credenciales', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_usuario: usuarioSeleccionadoCredenciales.id_usuario,
                    nuevo_correo: credencialesEdit.nuevo_correo || null,
                    nueva_contrasena: credencialesEdit.nueva_contrasena || null
                }),
            });

            if (response.ok) {
                alert('Credenciales actualizadas exitosamente');
                setCredencialesEdit({
                    nuevo_correo: '',
                    nueva_contrasena: '',
                    confirmar_contrasena: ''
                });
                setUsuarioSeleccionadoCredenciales(null);
                setShowEditarCredenciales(false);
                await cargarUsuarios(); // Recargar usuarios
            } else {
                const error = await response.json();
                alert(`Error al actualizar credenciales: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al actualizar credenciales:', error);
            alert('Error de conexión al actualizar las credenciales');
        }
    };

    // Función para cargar docentes y horarios de un curso
    const cargarDocentesYHorarios = async (idCurso) => {
        try {
            const [docentesRes, horariosRes] = await Promise.all([
                fetch(`http://localhost:5000/api/horarios/curso/${idCurso}/docentes`),
                fetch(`http://localhost:5000/api/horarios/curso/${idCurso}/horarios`)
            ]);

            if (docentesRes.ok) {
                const docentesData = await docentesRes.json();
                setDocentesCurso(docentesData.data || []);
            }

            if (horariosRes.ok) {
                const horariosData = await horariosRes.json();
                setHorariosCurso(horariosData.data || []);
            }
        } catch (error) {
            console.error('Error al cargar docentes y horarios:', error);
        }
    };

    // Función para agregar docente a un curso
    const agregarDocenteACurso = async (idCurso, idDocente) => {
        try {
            const response = await fetch(`http://localhost:5000/api/horarios/curso/${idCurso}/docentes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_docente: idDocente }),
            });

            if (response.ok) {
                await cargarDocentesYHorarios(idCurso);
                alert('Docente agregado al curso exitosamente');
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al agregar docente:', error);
            alert('Error de conexión');
        }
    };

    // Función para eliminar docente de un curso
    const eliminarDocenteDeCurso = async (idCurso, idDocente) => {
        if (!window.confirm('¿Está seguro de eliminar este docente del curso?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/horarios/curso/${idCurso}/docentes/${idDocente}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await cargarDocentesYHorarios(idCurso);
                alert('Docente eliminado del curso exitosamente');
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al eliminar docente:', error);
            alert('Error de conexión');
        }
    };

    // Función para crear horario
    const crearHorario = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/horarios/horarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_curso: nuevoHorario.id_curso,
                    id_docente: parseInt(nuevoHorario.id_docente),
                    id_salon: nuevoHorario.id_salon ? parseInt(nuevoHorario.id_salon) : null,
                    dia_semana: nuevoHorario.dia_semana,
                    hora_inicio: nuevoHorario.hora_inicio,
                    hora_fin: nuevoHorario.hora_fin,
                    turno: nuevoHorario.turno || null
                }),
            });

            if (response.ok) {
                alert('Horario creado exitosamente');
                const idCurso = nuevoHorario.id_curso;
                setNuevoHorario({
                    id_curso: null,
                    id_docente: '',
                    id_salon: '',
                    dia_semana: '',
                    hora_inicio: '',
                    hora_fin: '',
                    turno: ''
                });
                setShowAgregarHorario(false);
                if (cursoSeleccionadoHorarios) {
                    await cargarDocentesYHorarios(cursoSeleccionadoHorarios.id_curso);
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

    // Función para eliminar horario
    const eliminarHorario = async (idHorario, idCurso) => {
        if (!window.confirm('¿Está seguro de eliminar este horario?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/horarios/horarios/${idHorario}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await cargarDocentesYHorarios(idCurso);
                alert('Horario eliminado exitosamente');
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al eliminar horario:', error);
            alert('Error de conexión');
        }
    };

    // Función para cargar estudiantes no matriculados en un curso
    const cargarEstudiantesNoMatriculados = async (idCurso) => {
        try {
            const response = await fetch(`http://localhost:5000/api/matriculas/curso/${idCurso}/estudiantes-no-matriculados`);
            if (response.ok) {
                const data = await response.json();
                setEstudiantesNoMatriculados(data.data);
            }
        } catch (error) {
            console.error('Error al cargar estudiantes no matriculados:', error);
        }
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Cargar estadísticas, usuarios, matrículas, cursos y salones en paralelo
                await Promise.all([cargarEstadisticas(), cargarUsuarios(), cargarMatriculas(), cargarCursos(), cargarSalones(), cargarDocentes()]);
            } catch (error) {
                console.error('Error general al cargar datos:', error);
                setError('Error al cargar los datos del sistema');
            } finally {
                setLoading(false);
            }
        };
        
        cargarDatos();
    }, []);

    // Filtrar solo docentes
    const docentesDisponibles = usuarios.filter(usuario => usuario.rol === 'Docente' && usuario.activo);
    
    // Debug: verificar docentes disponibles
    if (docentesDisponibles.length === 0 && usuarios.length > 0) {
        console.warn('No se encontraron docentes activos. Usuarios disponibles:', usuarios.map(u => ({ id: u.id_usuario, nombre: u.nombre, apellido: u.apellido, rol: u.rol, activo: u.activo })));
    }

    const cursosActivos = [
        { id: 1, nombre: 'Matemáticas Avanzadas', docente: 'Prof. Juan Pérez', estudiantes: 25, estado: 'Activo' },
        { id: 2, nombre: 'Literatura Universal', docente: 'Prof. María González', estudiantes: 18, estado: 'Activo' },
        { id: 3, nombre: 'Ciencias Naturales', docente: 'Prof. Carlos Rodríguez', estudiantes: 22, estado: 'Activo' },
        { id: 4, nombre: 'Historia del Arte', docente: 'Prof. Ana López', estudiantes: 15, estado: 'Inactivo' }
    ];

    const calificacionesRecientes = [
        { id: 1, estudiante: 'Ana García', curso: 'Matemáticas Avanzadas', tarea: 'Examen Parcial', nota: 85, fecha: '2024-01-10' },
        { id: 2, estudiante: 'Carlos López', curso: 'Literatura Universal', tarea: 'Ensayo de Poesía', nota: 92, fecha: '2024-01-09' },
        { id: 3, estudiante: 'María Rodríguez', curso: 'Ciencias Naturales', tarea: 'Proyecto de Laboratorio', nota: 78, fecha: '2024-01-08' },
        { id: 4, estudiante: 'Pedro Sánchez', curso: 'Historia del Arte', tarea: 'Análisis de Obra', nota: 88, fecha: '2024-01-07' }
    ];

    const alertasSistema = [
        { id: 1, tipo: 'Sistema', mensaje: 'Backup automático completado exitosamente', fecha: '2024-01-12', prioridad: 'baja' },
        { id: 2, tipo: 'Usuario', mensaje: '3 nuevos usuarios registrados hoy', fecha: '2024-01-12', prioridad: 'media' },
        { id: 3, tipo: 'Curso', mensaje: 'Curso "Historia del Arte" necesita asignación de docente', fecha: '2024-01-11', prioridad: 'alta' }
    ];

    // Funciones para manejar formularios
    const handleAgregarCurso = async (e) => {
        e.preventDefault();
        
        try {
            console.log('Agregando curso:', nuevoCurso);

            const response = await fetch('http://localhost:5000/api/cursos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre_curso: nuevoCurso.nombre,
                    descripcion: nuevoCurso.descripcion || null,
                    turno: nuevoCurso.turno || null
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Curso creado exitosamente:', data);
                alert(`Curso "${data.data.nombre_curso}" agregado exitosamente`);
                
                // Limpiar formulario y cerrar modal
                setNuevoCurso({ nombre: '', descripcion: '', turno: '' });
                setShowAgregarCurso(false);
                
                // Recargar estadísticas para mostrar el nuevo curso
                cargarEstadisticas();
            } else {
                const error = await response.json();
                console.error('Error al crear curso:', error);
                alert(`Error al crear curso: ${error.message}`);
            }
        } catch (error) {
            console.error('Error de conexión al crear curso:', error);
            alert('Error de conexión al crear el curso');
        }
    };


    // Función para eliminar usuario (soft delete)
    const handleEliminarUsuario = async (usuarioId, nombreCompleto) => {
        if (!window.confirm(`¿Está seguro de eliminar al usuario "${nombreCompleto}"?\n\nEsta acción desactivará la cuenta del usuario.`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/usuarios/${usuarioId}`, {
                method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                alert('Usuario eliminado exitosamente');
                cargarUsuarios();
                } else {
                    const error = await response.json();
                alert(`Error al eliminar usuario: ${error.message}`);
                }
            } catch (error) {
            console.error('Error al eliminar usuario:', error);
            alert('Error de conexión al eliminar el usuario');
        }
    };

    const handleCambiarRol = async (usuarioId, nuevoRol) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/usuarios/${usuarioId}/rol`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nuevoRol }),
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                // Recargar usuarios para reflejar el cambio
                cargarUsuarios();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al cambiar rol:', error);
            alert('Error al cambiar el rol del usuario');
        }
    };

    // Funciones para manejar matrículas
    const handleMatricularEstudiante = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:5000/api/matriculas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_estudiante: parseInt(nuevaMatricula.estudiante),
                    id_curso: parseInt(nuevaMatricula.curso)
                }),
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Estudiante matriculado exitosamente en el curso`);
                
                // Limpiar formulario y cerrar modal
                setNuevaMatricula({ estudiante: '', curso: '' });
                setShowMatricularEstudiante(false);
                
                // Recargar matrículas
                cargarMatriculas();
            } else {
                const error = await response.json();
                alert(`Error al matricular estudiante: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al matricular estudiante:', error);
            alert('Error de conexión al matricular el estudiante');
        }
    };

    const handleCambiarEstadoMatricula = async (idMatricula, nuevoEstado) => {
        try {
            const response = await fetch(`http://localhost:5000/api/matriculas/${idMatricula}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: nuevoEstado }),
            });

            if (response.ok) {
                alert(`Estado de matrícula actualizado a ${nuevoEstado}`);
                cargarMatriculas();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al cambiar estado de matrícula:', error);
            alert('Error al cambiar el estado de la matrícula');
        }
    };

    const handleEditarCalificacion = (calificacion) => {
        setCalificacionEdit(calificacion);
        setShowGestionCalificaciones(true);
    };

    const handleGuardarCalificacion = (e) => {
        e.preventDefault();
        // Aquí iría la lógica para guardar la calificación
        console.log('Guardando calificación:', calificacionEdit);
        setShowGestionCalificaciones(false);
        alert('Calificación actualizada exitosamente');
    };

    // Función para crear un nuevo usuario
    const handleCrearUsuario = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:5000/api/admin/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nuevoUsuario),
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Usuario ${data.data.rol} creado exitosamente`);
                
                // Limpiar formulario y cerrar modal
                setNuevoUsuario({ nombre: '', apellido: '', correo: '', contrasena: '', rol: 'Estudiante', dni: '', telefono: '', direccion: '' });
                setShowCrearUsuario(false);
                
                // Recargar usuarios
                cargarUsuarios();
            } else {
                const error = await response.json();
                alert(`Error al crear usuario: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al crear usuario:', error);
            alert('Error de conexión al crear el usuario');
        }
    };

    // Función para cargar estudiantes matriculados en un curso
    const cargarEstudiantesMatriculados = async (idCurso) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/cursos/${idCurso}/estudiantes`);
            if (response.ok) {
                const data = await response.json();
                setEstudiantesMatriculados(data.data);
            } else {
                console.error('Error al cargar estudiantes matriculados');
                setEstudiantesMatriculados([]);
            }
        } catch (error) {
            console.error('Error de conexión al cargar estudiantes matriculados:', error);
            setEstudiantesMatriculados([]);
        }
    };

    // Mostrar loading mientras se cargan los datos
    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Cargando estadísticas...</p>
                </div>
            </div>
        );
    }

    // Mostrar error si hay problemas
    if (error) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-error">
                    <h2>Error al cargar datos</h2>
                    <p>{error}</p>
                    <div className="error-actions">
                        <button 
                            className="btn-primary" 
                            onClick={() => {
                                setError(null);
                                setLoading(true);
                                cargarEstadisticas();
                                cargarUsuarios();
                                setLoading(false);
                            }}
                        >
                            Reintentar
                        </button>
                        <button 
                            className="btn-secondary" 
                            onClick={() => window.location.reload()}
                        >
                            Recargar Página
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Si hay una vista activa, renderizarla
    if (vistaActual === 'usuarios') {
        return <VistaGestionUsuarios onVolver={() => setVistaActual(null)} />;
    }
    if (vistaActual === 'cursos') {
        return <VistaGestionCursos onVolver={() => setVistaActual(null)} />;
    }
    if (vistaActual === 'salones') {
        return <VistaGestionSalones onVolver={() => setVistaActual(null)} />;
    }
    if (vistaActual === 'crear-padre-hijo') {
        return <VistaCrearPadreHijo onVolver={() => setVistaActual(null)} />;
    }

    return (
        <div className="dashboard-container">
            {/* Header del Dashboard */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Dashboard Administrador</h1>
                    <p className="dashboard-subtitle">Panel de control administrativo</p>
                </div>
                <div className="user-info">
                    <p className="user-name">{user.nombre} {user.apellido}</p>
                    <p className="user-role">👑 Administrador</p>
                </div>
            </div>

            {/* Estadísticas Generales */}
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div className="card-header">
                        <div className="card-icon">👥</div>
                        <h3 className="card-title">Total Usuarios</h3>
                    </div>
                    <div className="card-content">
                        <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #e9ecef' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '1.1rem', color: '#333' }}>👨‍🎓 Estudiantes:</span>
                                <strong style={{ fontSize: '1.5rem', color: '#007bff' }}>
                                    {Math.floor(Number(estadisticas?.usuarios?.estudiantes) || 0)}
                                </strong>
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #e9ecef' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '1.1rem', color: '#333' }}>👨‍🏫 Docentes:</span>
                                <strong style={{ fontSize: '1.5rem', color: '#28a745' }}>
                                    {Math.floor(Number(estadisticas?.usuarios?.docentes) || 0)}
                                </strong>
                            </div>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.1rem', color: '#333' }}>👨‍👩‍👧‍👦 Padres de Familia:</span>
                                <strong style={{ fontSize: '1.5rem', color: '#ffc107' }}>
                                    {Math.floor(Number(estadisticas?.usuarios?.padres) || 0)}
                                </strong>
                            </div>
                        </div>
                        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #e9ecef', textAlign: 'center' }}>
                            <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>
                                Total: <strong style={{ fontSize: '1.2rem', color: '#333' }}>
                                    {Math.floor(Number(estadisticas?.usuarios?.total) || 0)}
                                </strong> usuarios
                            </p>
                            <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>
                                Activos: <strong style={{ fontSize: '1.2rem', color: '#28a745' }}>
                                    {Math.floor(Number(estadisticas?.usuarios?.activos) || 0)}
                                </strong>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <div className="card-icon">📚</div>
                        <h3 className="card-title">Cursos Activos</h3>
                    </div>
                    <div className="card-content">
                        <p><strong>{estadisticas?.cursos?.total || 0}</strong> cursos en el sistema</p>
                        <p>Activos: {estadisticas?.cursos?.activos || 0}</p>
                        <p>Inactivos: {estadisticas?.cursos?.inactivos || 0}</p>
                        <p>Matrículas: {estadisticas?.matriculas?.activas || 0}</p>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <div className="card-icon">📊</div>
                        <h3 className="card-title">Estadísticas</h3>
                    </div>
                    <div className="card-content">
                        <p>Promedio general: <strong>{estadisticas?.calificaciones?.promedio_general?.toFixed(1) || 0}%</strong></p>
                        <p>Entregas totales: <strong>{estadisticas?.calificaciones?.total_entregas || 0}</strong></p>
                        <p>Excelentes: <strong>{estadisticas?.calificaciones?.excelentes || 0}</strong></p>
                        <p>Buenas: <strong>{estadisticas?.calificaciones?.buenas || 0}</strong></p>
                    </div>
                </div>
            </div>

            {/* Gestión de Cursos */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-icon">📚</div>
                    <h3 className="card-title">Gestión de Cursos</h3>
                    <button 
                        className="btn-primary"
                        onClick={() => setVistaActual('cursos')}
                    >
                        Ver Todos
                    </button>
                </div>
                <div className="card-content">
                    <div className="cursos-list">
                        {estadisticas?.cursos_activos?.map(curso => (
                            <div key={curso.id_curso} className="curso-item">
                                <div className="curso-info">
                                    <h4>{curso.nombre_curso}</h4>
                                    {curso.total_docentes > 0 && (
                                        <p>Docentes: {curso.total_docentes}</p>
                                    )}
                                    {curso.turno && (
                                        <p style={{ color: '#007bff', fontWeight: 'bold' }}>
                                            Turno: {curso.turno}
                                        </p>
                                    )}
                                    <p>Estudiantes: {parseInt(curso.total_estudiantes) || 0}</p>
                                    {curso.descripcion && <p>Descripción: {curso.descripcion}</p>}
                                </div>
                                <div className="curso-status">
                                    <span className={`status-badge ${curso.activo ? 'activo' : 'inactivo'}`}>
                                        {curso.activo ? 'Activo' : 'Inactivo'}
                                    </span>
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
                                        Editar
                                    </button>
                                    <button 
                                        className="btn-primary"
                                        onClick={async () => {
                                            setCursoSeleccionadoHorarios(curso);
                                            await cargarDocentesYHorarios(curso.id_curso);
                                            setShowHorariosCurso(true);
                                        }}
                                    >
                                        Ver Horarios
                                    </button>
                                    <button 
                                        className="btn-secondary"
                                        onClick={() => {
                                            setCursoSeleccionado(curso);
                                            cargarEstudiantesMatriculados(curso.id_curso);
                                            setShowEstudiantesCurso(true);
                                        }}
                                    >
                                        Ver Estudiantes
                                    </button>
                                    <button className="btn-danger">Eliminar</button>
                                </div>
                            </div>
                        )) || (
                            <div className="no-data">
                                <p>No hay cursos registrados en el sistema.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Gestión de Usuarios */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-icon">👥</div>
                    <h3 className="card-title">Gestión de Usuarios</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            className="btn-primary"
                            onClick={() => setShowCrearUsuario(true)}
                        >
                            + Crear Usuario
                        </button>
                        <button 
                            className="btn-primary"
                            onClick={() => setVistaActual('crear-padre-hijo')}
                        >
                            + Crear Padre e Hijo
                        </button>
                        <button 
                            className="btn-primary"
                            onClick={() => setVistaActual('usuarios')}
                        >
                            Ver Todos
                        </button>
                    </div>
                </div>
                <div className="card-content">
                    <div className="usuarios-list">
                        {usuarios.slice(0, 5).map(usuario => (
                            <div key={usuario.id_usuario} className="usuario-item">
                                <div className="usuario-info">
                                    <h4>{usuario.nombre} {usuario.apellido}</h4>
                                    <p>{usuario.correo}</p>
                                    <p>Registrado: {new Date(usuario.fecha_creacion).toLocaleDateString()}</p>
                                </div>
                                <div className="usuario-rol">
                                    <select 
                                        value={usuario.rol}
                                        onChange={(e) => handleCambiarRol(usuario.id_usuario, e.target.value)}
                                        className="rol-select"
                                    >
                                        <option value="Estudiante">Estudiante</option>
                                        <option value="Docente">Docente</option>
                                        <option value="Padre">Padre</option>
                                        <option value="Administrador">Administrador</option>
                                    </select>
                                </div>
                                <div className="usuario-status">
                                    <span className={`status-badge ${usuario.activo ? 'activo' : 'inactivo'}`}>
                                        {usuario.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <div className="usuario-actions">
                                    <button 
                                        className="btn-secondary"
                                        onClick={() => {
                                            setUsuarioSeleccionadoCredenciales(usuario);
                                            setCredencialesEdit({
                                                nuevo_correo: usuario.correo,
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
                        ))}
                    </div>
                </div>
            </div>

            {/* Gestión de Salones */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-icon">🏫</div>
                    <h3 className="card-title">Gestión de Salones</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            className="btn-primary"
                            onClick={() => {
                                setShowCrearSalon(true);
                                setNuevoSalon({
                                    nombre_salon: '',
                                    descripcion: '',
                                    capacidad_maxima: 40,
                                    grado: '',
                                    seccion: '',
                                    anio_academico: new Date().getFullYear().toString(),
                                    id_docente_titular: ''
                                });
                            }}
                        >
                            + Crear Salón
                        </button>
                        <button 
                            className="btn-secondary"
                            onClick={() => setVistaActual('salones')}
                        >
                            Ver Todos
                        </button>
                    </div>
                </div>
                <div className="card-content">
                    <div className="salones-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                        {salones.slice(0, 6).map(salon => (
                            <div key={salon.id_salon} className="salon-item" style={{ 
                                padding: '15px', 
                                border: '1px solid #ddd', 
                                borderRadius: '8px',
                                backgroundColor: salon.activo ? '#fff' : '#f5f5f5'
                            }}>
                                <div style={{ marginBottom: '10px' }}>
                                    <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{salon.nombre_salon}</h4>
                                    {salon.grado && salon.seccion && (
                                        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                                            {salon.grado} {salon.seccion}
                                        </p>
                                    )}
                                    {salon.turno && (
                                        <p style={{ margin: '5px 0', color: '#007bff', fontSize: '13px', fontWeight: 'bold' }}>
                                            Turno: {salon.turno}
                                        </p>
                                    )}
                                    {salon.docente_nombre && (
                                        <p style={{ margin: '5px 0', color: '#666', fontSize: '13px' }}>
                                            Docente: {salon.docente_nombre} {salon.docente_apellido}
                                        </p>
                                    )}
                                </div>
                                <div style={{ 
                                    padding: '10px', 
                                    backgroundColor: salon.cupos_disponibles > 0 ? '#d4edda' : '#f8d7da',
                                    borderRadius: '4px',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px' }}>
                                        {salon.estudiantes_matriculados || 0} / {salon.capacidad_maxima}
                                    </p>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                                        {salon.cupos_disponibles || salon.capacidad_maxima} cupos disponibles
                                    </p>
                                </div>
                                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className={`status-badge ${salon.activo ? 'activo' : 'inactivo'}`}>
                                        {salon.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                    <button 
                                        className="btn-primary"
                                        style={{ fontSize: '12px', padding: '5px 10px' }}
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(`http://localhost:5000/api/salones/${salon.id_salon}/estudiantes-con-padres`);
                                                if (response.ok) {
                                                    const data = await response.json();
                                                    setEstudiantesConPadres(data.data);
                                                    setSalonSeleccionadoEstudiantes(salon);
                                                    setShowEstudiantesSalon(true);
                                                } else {
                                                    alert('Error al cargar estudiantes del salón');
                                                }
                                            } catch (error) {
                                                console.error('Error:', error);
                                                alert('Error al cargar estudiantes del salón');
                                            }
                                        }}
                                    >
                                        Ver Estudiantes y Padres
                                    </button>
                                </div>
                            </div>
                        ))}
                        {salones.length === 0 && (
                            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666' }}>
                                No hay salones registrados
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Gestión de Matrículas */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-icon">🎓</div>
                    <h3 className="card-title">Gestión de Matrículas</h3>
                    <button 
                        className="btn-primary"
                        onClick={() => setShowMatricularEstudiante(true)}
                    >
                        + Matricular Estudiante
                    </button>
                </div>
                <div className="card-content">
                    <div className="matriculas-list">
                        {matriculas.length > 0 ? (
                            matriculas.slice(0, 10).map(matricula => (
                                <div key={matricula.id_matricula} className="matricula-item">
                                    <div className="matricula-info">
                                        <h4>{matricula.estudiante_nombre} {matricula.estudiante_apellido}</h4>
                                        <p>Curso: {matricula.nombre_curso}</p>
                                        <p>Docente: {matricula.docente_nombre ? `${matricula.docente_nombre} ${matricula.docente_apellido}` : 'Sin asignar'}</p>
                                        <p>Fecha: {new Date(matricula.fecha_matricula).toLocaleDateString()}</p>
                                    </div>
                                    <div className="matricula-status">
                                        <select 
                                            value={matricula.estado}
                                            onChange={(e) => handleCambiarEstadoMatricula(matricula.id_matricula, e.target.value)}
                                            className="status-select"
                                        >
                                            <option value="Activo">Activo</option>
                                            <option value="Inactivo">Inactivo</option>
                                            <option value="Suspendido">Suspendido</option>
                                        </select>
                                    </div>
                                    <div className="matricula-actions">
                                        <button 
                                            className="btn-secondary"
                                            onClick={() => {
                                                setNuevaMatricula({
                                                    estudiante: matricula.id_estudiante,
                                                    curso: matricula.id_curso
                                                });
                                                setShowMatricularEstudiante(true);
                                            }}
                                        >
                                            Editar
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">
                                <p>No hay matrículas registradas.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Gestión de Calificaciones */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-icon">📝</div>
                    <h3 className="card-title">Gestión de Calificaciones</h3>
                </div>
                <div className="card-content">
                    <div className="calificaciones-list">
                        {estadisticas?.calificaciones_recientes?.map(cal => (
                            <div key={cal.id_entrega} className="calificacion-item">
                                <div className="cal-info">
                                    <h4>{cal.estudiante_nombre} {cal.estudiante_apellido}</h4>
                                    <p>{cal.nombre_curso} - {cal.tarea_titulo}</p>
                                    <p>Fecha: {new Date(cal.fecha_entrega).toLocaleDateString()}</p>
                                </div>
                                <div className="cal-nota">
                                    <input 
                                        type="number" 
                                        value={cal.calificacion}
                                        onChange={(e) => {
                                            const updatedCal = { ...cal, calificacion: e.target.value };
                                            setCalificacionEdit(updatedCal);
                                        }}
                                        className="nota-input"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                                <div className="cal-actions">
                                    <button 
                                        className="btn-primary"
                                        onClick={() => handleEditarCalificacion(cal)}
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        )) || (
                            <div className="no-data">
                                <p>No hay calificaciones registradas en el sistema.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Alertas del Sistema */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-icon">🚨</div>
                    <h3 className="card-title">Alertas del Sistema</h3>
                </div>
                <div className="card-content">
                    <div className="alertas-list">
                        {alertasSistema.map(alerta => (
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

            {/* Acciones Rápidas */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-icon">⚡</div>
                    <h3 className="card-title">Acciones Rápidas</h3>
                </div>
                <div className="card-content">
                    <div className="acciones-grid">
                        <button className="btn-primary">Generar Reportes</button>
                        <button className="btn-primary">Backup de Datos</button>
                        <button className="btn-primary">Configurar Sistema</button>
                        <button className="btn-primary">Enviar Notificaciones</button>
                    </div>
                </div>
            </div>

            {/* Modal para Agregar Curso */}
            {showAgregarCurso && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Agregar Nuevo Curso</h3>
                            <button 
                                className="modal-close"
                                onClick={() => setShowAgregarCurso(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleAgregarCurso} className="modal-content">
                            <div className="form-group">
                                <label>Nombre del Curso:</label>
                                <input 
                                    type="text" 
                                    value={nuevoCurso.nombre}
                                    onChange={(e) => setNuevoCurso({...nuevoCurso, nombre: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción (opcional):</label>
                                <textarea 
                                    value={nuevoCurso.descripcion}
                                    onChange={(e) => setNuevoCurso({...nuevoCurso, descripcion: e.target.value})}
                                    placeholder="Descripción del curso..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Turno:</label>
                                <select 
                                    value={nuevoCurso.turno}
                                    onChange={(e) => setNuevoCurso({...nuevoCurso, turno: e.target.value})}
                                >
                                    <option value="">Seleccionar turno (opcional)</option>
                                    <option value="Mañana">Mañana</option>
                                    <option value="Tarde">Tarde</option>
                                </select>
                                <small style={{ color: '#666', fontSize: '12px' }}>
                                    Los docentes se asignan desde "Ver Horarios" después de crear el curso
                                </small>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowAgregarCurso(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Agregar Curso
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Editar Curso */}
            {showEditarCurso && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Editar Curso</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowEditarCurso(false);
                                    setCursoEdit({ id_curso: null, nombre: '', descripcion: '', docente: '', turno: '', activo: true });
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const response = await fetch(`http://localhost:5000/api/cursos/${cursoEdit.id_curso}`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        nombre_curso: cursoEdit.nombre,
                                        descripcion: cursoEdit.descripcion || null,
                                        turno: cursoEdit.turno || null,
                                        activo: cursoEdit.activo
                                    }),
                                });

                                if (response.ok) {
                                    const data = await response.json();
                                    alert(`Curso "${data.data.nombre_curso}" actualizado exitosamente`);
                                    setShowEditarCurso(false);
                                    setCursoEdit({ id_curso: null, nombre: '', descripcion: '', turno: '', activo: true });
                                    cargarEstadisticas();
                                } else {
                                    const error = await response.json();
                                    alert(`Error al actualizar curso: ${error.message}`);
                                }
                            } catch (error) {
                                console.error('Error al actualizar curso:', error);
                                alert('Error de conexión al actualizar el curso');
                            }
                        }} className="modal-content">
                            <div className="form-group">
                                <label>Nombre del Curso:</label>
                                <input 
                                    type="text" 
                                    value={cursoEdit.nombre}
                                    onChange={(e) => setCursoEdit({...cursoEdit, nombre: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción (opcional):</label>
                                <textarea 
                                    value={cursoEdit.descripcion}
                                    onChange={(e) => setCursoEdit({...cursoEdit, descripcion: e.target.value})}
                                    placeholder="Descripción del curso..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Turno:</label>
                                <select 
                                    value={cursoEdit.turno}
                                    onChange={(e) => setCursoEdit({...cursoEdit, turno: e.target.value})}
                                >
                                    <option value="">Seleccionar turno (opcional)</option>
                                    <option value="Mañana">Mañana</option>
                                    <option value="Tarde">Tarde</option>
                                </select>
                                <small style={{ color: '#666', fontSize: '12px' }}>
                                    Los docentes se gestionan desde "Ver Horarios"
                                </small>
                            </div>
                            <div className="form-group">
                                <label>
                                    <input 
                                        type="checkbox" 
                                        checked={cursoEdit.activo}
                                        onChange={(e) => setCursoEdit({...cursoEdit, activo: e.target.checked})}
                                    />
                                    Curso Activo
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={() => {
                                        setShowEditarCurso(false);
                                        setCursoEdit({ id_curso: null, nombre: '', descripcion: '', turno: '', activo: true });
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Actualizar Curso
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Matricular Estudiante */}
            {showMatricularEstudiante && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Matricular Estudiante</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowMatricularEstudiante(false);
                                    setNuevaMatricula({ estudiante: '', curso: '' });
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleMatricularEstudiante} className="modal-content">
                            <div className="form-group">
                                <label>Estudiante:</label>
                                <select 
                                    value={nuevaMatricula.estudiante}
                                    onChange={(e) => setNuevaMatricula({...nuevaMatricula, estudiante: e.target.value})}
                                    required
                                >
                                    <option value="">Seleccionar estudiante</option>
                                    {usuarios.filter(u => u.rol === 'Estudiante' && u.activo).map(estudiante => (
                                        <option key={estudiante.id_usuario} value={estudiante.id_usuario}>
                                            {estudiante.nombre} {estudiante.apellido} - {estudiante.correo}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Curso:</label>
                                <select 
                                    value={nuevaMatricula.curso}
                                    onChange={(e) => setNuevaMatricula({...nuevaMatricula, curso: e.target.value})}
                                    required
                                >
                                    <option value="">Seleccionar curso</option>
                                    {cursos.filter(c => c.activo).map(curso => (
                                        <option key={curso.id_curso} value={curso.id_curso}>
                                            {curso.nombre_curso}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowMatricularEstudiante(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Matricular Estudiante
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Gestión de Usuarios */}
            {showGestionUsuarios && (
                <div className="modal-overlay">
                    <div className="modal large">
                        <div className="modal-header">
                            <h3>Gestión Completa de Usuarios</h3>
                            <button 
                                className="modal-close"
                                onClick={() => setShowGestionUsuarios(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-content">
                            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label style={{ fontWeight: 'bold', marginRight: '5px' }}>Filtrar por rol:</label>
                                    <select 
                                        value={filtroRolUsuarios}
                                        onChange={(e) => setFiltroRolUsuarios(e.target.value)}
                                        style={{ 
                                            padding: '8px 12px', 
                                            borderRadius: '4px', 
                                            border: '1px solid #ddd',
                                            fontSize: '14px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="Todos">Todos</option>
                                        <option value="Docente">Docentes</option>
                                        <option value="Padre">Padres</option>
                                        <option value="Estudiante">Estudiantes</option>
                                        <option value="Administrador">Administradores</option>
                                    </select>
                                </div>
                                <div style={{ fontSize: '14px', color: '#666' }}>
                                    Total: {usuarios.filter(u => filtroRolUsuarios === 'Todos' || u.rol === filtroRolUsuarios).length} usuario(s)
                                </div>
                            </div>
                            <div className="usuarios-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Correo</th>
                                            <th>Rol</th>
                                            <th>Estado</th>
                                            <th>Fecha Registro</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios
                                            .filter(usuario => filtroRolUsuarios === 'Todos' || usuario.rol === filtroRolUsuarios)
                                            .map(usuario => (
                                            <tr key={usuario.id_usuario}>
                                                <td>{usuario.nombre} {usuario.apellido}</td>
                                                <td>{usuario.correo}</td>
                                                <td>
                                                    <select 
                                                        value={usuario.rol}
                                                        onChange={(e) => handleCambiarRol(usuario.id_usuario, e.target.value)}
                                                    >
                                                        <option value="Estudiante">Estudiante</option>
                                                        <option value="Docente">Docente</option>
                                                        <option value="Padre">Padre</option>
                                                        <option value="Administrador">Administrador</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${usuario.activo ? 'activo' : 'inactivo'}`}>
                                                        {usuario.activo ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td>{new Date(usuario.fecha_creacion).toLocaleDateString()}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            <button 
                                                            className="btn-secondary"
                                onClick={() => {
                                                                setUsuarioSeleccionadoCredenciales(usuario);
                                                                setCredencialesEdit({
                                                                    nuevo_correo: usuario.correo,
                                                                    nueva_contrasena: '',
                                                                    confirmar_contrasena: ''
                                                                });
                                                                setShowEditarCredenciales(true);
                                                            }}
                                                            style={{ fontSize: '12px', padding: '5px 10px' }}
                                                        >
                                                            Editar
                            </button>
                                            <button 
                                                            className="btn-danger"
                                                            onClick={() => handleEliminarUsuario(usuario.id_usuario, `${usuario.nombre} ${usuario.apellido}`)}
                                                            style={{ 
                                                                fontSize: '12px', 
                                                                padding: '5px 10px',
                                                                backgroundColor: '#dc3545',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                            disabled={usuario.rol === 'Administrador'}
                                                            title={usuario.rol === 'Administrador' ? 'No se puede eliminar un administrador' : 'Eliminar usuario'}
                                                        >
                                                            Eliminar
                                </button>
                                                    </div>
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


            {/* Modal para Crear Usuario */}
            {showCrearUsuario && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Crear Nuevo Usuario</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowCrearUsuario(false);
                                    setNuevoUsuario({ nombre: '', apellido: '', correo: '', contrasena: '', rol: 'Estudiante', dni: '', telefono: '', direccion: '' });
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCrearUsuario} className="modal-content">
                            <div className="form-group">
                                <label>Nombre:</label>
                                <input 
                                    type="text" 
                                    value={nuevoUsuario.nombre}
                                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Apellido:</label>
                                <input 
                                    type="text" 
                                    value={nuevoUsuario.apellido}
                                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, apellido: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Correo Electrónico:</label>
                                <input 
                                    type="email" 
                                    value={nuevoUsuario.correo}
                                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, correo: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Contraseña:</label>
                                <input 
                                    type="password" 
                                    value={nuevoUsuario.contrasena}
                                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, contrasena: e.target.value})}
                                    required
                                    minLength="6"
                                />
                            </div>
                            <div className="form-group">
                                <label>Rol:</label>
                                <select 
                                    value={nuevoUsuario.rol}
                                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})}
                                    required
                                >
                                    <option value="Estudiante">Estudiante</option>
                                    <option value="Docente">Docente</option>
                                    <option value="Padre">Padre</option>
                                    <option value="Administrador">Administrador</option>
                                </select>
                            </div>
                            
                            {/* Campos específicos para Padres */}
                            {nuevoUsuario.rol === 'Padre' && (
                                <>
                                    <div className="form-group">
                                        <label>DNI *:</label>
                                        <input 
                                            type="text" 
                                            value={nuevoUsuario.dni}
                                            onChange={(e) => setNuevoUsuario({...nuevoUsuario, dni: e.target.value})}
                                            required
                                            placeholder="Ingrese el DNI"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Teléfono:</label>
                                        <input 
                                            type="tel" 
                                            value={nuevoUsuario.telefono}
                                            onChange={(e) => setNuevoUsuario({...nuevoUsuario, telefono: e.target.value})}
                                            placeholder="Ingrese el teléfono de contacto"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Dirección:</label>
                                        <textarea 
                                            value={nuevoUsuario.direccion}
                                            onChange={(e) => setNuevoUsuario({...nuevoUsuario, direccion: e.target.value})}
                                            placeholder="Ingrese la dirección de contacto"
                                            rows="3"
                                        />
                                    </div>
                                </>
                            )}
                            
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowCrearUsuario(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Crear Usuario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Ver Estudiantes Matriculados */}
            {showEstudiantesCurso && cursoSeleccionado && (
                <div className="modal-overlay">
                    <div className="modal large">
                        <div className="modal-header">
                            <h3>Estudiantes Matriculados en {cursoSeleccionado.nombre_curso}</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowEstudiantesCurso(false);
                                    setCursoSeleccionado(null);
                                    setEstudiantesMatriculados([]);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-content">
                            {estudiantesMatriculados.length > 0 ? (
                                <div className="estudiantes-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Apellido</th>
                                                <th>Correo</th>
                                                <th>Fecha Matrícula</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {estudiantesMatriculados.map(estudiante => (
                                                <tr key={estudiante.id_matricula}>
                                                    <td>{estudiante.nombre}</td>
                                                    <td>{estudiante.apellido}</td>
                                                    <td>{estudiante.correo}</td>
                                                    <td>{new Date(estudiante.fecha_matricula).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`status-badge ${estudiante.estado === 'Activo' ? 'activo' : 'inactivo'}`}>
                                                            {estudiante.estado}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="no-data">
                                    <p>No hay estudiantes matriculados en este curso.</p>
                                </div>
                            )}
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={() => {
                                        setShowEstudiantesCurso(false);
                                        setCursoSeleccionado(null);
                                        setEstudiantesMatriculados([]);
                                    }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para Crear Padre e Hijo */}
            {showCrearPadreHijo && (
                <div className="modal-overlay">
                    <div className="modal large">
                        <div className="modal-header">
                            <h3>Crear Padre e Hijo con Salón</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowCrearPadreHijo(false);
                                    setCredencialesHijoGeneradas(null);
                                    setNuevoPadreHijo({
                                        padre_nombre: '', padre_apellido: '', padre_correo: '', padre_contrasena: '', 
                                        padre_dni: '', padre_telefono: '', padre_direccion: '',
                                        hijo_nombre: '', hijo_apellido: '', hijo_dni: '',
                                        id_salon: '', id_curso: '', relacion: 'Padre', turno: ''
                                    });
                                }}
                            >
                                ×
                            </button>
                        </div>
                        {!credencialesHijoGeneradas ? (
                            <form onSubmit={handleCrearPadreHijo} className="modal-content">
                                <h4 style={{ marginBottom: '20px', color: '#333' }}>Datos del Padre</h4>
                                <div className="form-group">
                                    <label>Nombre del Padre: *</label>
                                    <input 
                                        type="text" 
                                        value={nuevoPadreHijo.padre_nombre}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, padre_nombre: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Apellido del Padre: *</label>
                                    <input 
                                        type="text" 
                                        value={nuevoPadreHijo.padre_apellido}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, padre_apellido: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Correo del Padre: *</label>
                                    <input 
                                        type="email" 
                                        value={nuevoPadreHijo.padre_correo}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, padre_correo: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contraseña del Padre: *</label>
                                    <input 
                                        type="password" 
                                        value={nuevoPadreHijo.padre_contrasena}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, padre_contrasena: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>DNI del Padre: *</label>
                                    <input 
                                        type="text" 
                                        value={nuevoPadreHijo.padre_dni}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, padre_dni: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono del Padre:</label>
                                    <input 
                                        type="text" 
                                        value={nuevoPadreHijo.padre_telefono}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, padre_telefono: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Dirección del Padre:</label>
                                    <input 
                                        type="text" 
                                        value={nuevoPadreHijo.padre_direccion}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, padre_direccion: e.target.value})}
                                    />
                                </div>

                                <h4 style={{ marginTop: '30px', marginBottom: '20px', color: '#333' }}>Datos del Hijo</h4>
                                <div className="form-group">
                                    <label>Nombre del Hijo: *</label>
                                    <input 
                                        type="text" 
                                        value={nuevoPadreHijo.hijo_nombre}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, hijo_nombre: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Apellido del Hijo: *</label>
                                    <input 
                                        type="text" 
                                        value={nuevoPadreHijo.hijo_apellido}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, hijo_apellido: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>DNI del Hijo (Opcional):</label>
                                    <input 
                                        type="text" 
                                        value={nuevoPadreHijo.hijo_dni}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, hijo_dni: e.target.value})}
                                    />
                                </div>

                                <h4 style={{ marginTop: '30px', marginBottom: '20px', color: '#333' }}>Asignación</h4>
                                
                                {/* Filtros de sección y turno */}
                                <div className="form-group">
                                    <label>Sección (Opcional):</label>
                                    <input
                                        type="text"
                                        value={nuevoPadreHijo.seccion}
                                        onChange={(e) => {
                                            setNuevoPadreHijo({
                                                ...nuevoPadreHijo,
                                                seccion: e.target.value,
                                                id_salon: '' // Limpiar salón seleccionado al cambiar sección
                                            });
                                        }}
                                        placeholder="Ej: A, B, C"
                                    />
                                    <small style={{ color: '#666', fontSize: '12px' }}>
                                        Filtra los salones por sección
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label>Turno (Opcional):</label>
                                    <select
                                        value={nuevoPadreHijo.turno}
                                        onChange={(e) => {
                                            setNuevoPadreHijo({
                                                ...nuevoPadreHijo,
                                                turno: e.target.value,
                                                id_salon: '' // Limpiar salón seleccionado al cambiar turno
                                            });
                                        }}
                                    >
                                        <option value="">Todos los turnos</option>
                                        <option value="Mañana">Mañana</option>
                                        <option value="Tarde">Tarde</option>
                                    </select>
                                    <small style={{ color: '#666', fontSize: '12px' }}>
                                        Filtra los salones por turno
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label>Salón:</label>
                                    <select 
                                        value={nuevoPadreHijo.id_salon}
                                        onChange={(e) => {
                                            setNuevoPadreHijo({
                                                ...nuevoPadreHijo, 
                                                id_salon: e.target.value
                                            });
                                        }}
                                    >
                                        <option value="">Seleccionar salón (opcional)</option>
                                        {salones
                                            .filter(s => s.activo)
                                            .filter(s => {
                                                // Filtrar por sección si se especifica
                                                if (nuevoPadreHijo.seccion && s.seccion) {
                                                    if (s.seccion.toLowerCase() !== nuevoPadreHijo.seccion.toLowerCase()) {
                                                        return false;
                                                    }
                                                }
                                                // Filtrar por turno si se especifica
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
                                    {nuevoPadreHijo.seccion || nuevoPadreHijo.turno ? (
                                        <small style={{ color: '#007bff', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                                            Mostrando salones filtrados por: {nuevoPadreHijo.seccion ? `Sección: ${nuevoPadreHijo.seccion}` : ''} {nuevoPadreHijo.seccion && nuevoPadreHijo.turno ? ' y ' : ''} {nuevoPadreHijo.turno ? `Turno: ${nuevoPadreHijo.turno}` : ''}
                                        </small>
                                    ) : null}
                                </div>
                                <div className="form-group">
                                    <label>Cursos (Opcional - Selecciona todos los que desees):</label>
                                    <div style={{ 
                                        maxHeight: '200px', 
                                        overflowY: 'auto', 
                                        border: '1px solid #ddd', 
                                        borderRadius: '4px', 
                                        padding: '10px',
                                        backgroundColor: '#f9f9f9'
                                    }}>
                                        {cursos.filter(c => c.activo).length > 0 ? (
                                            cursos.filter(c => c.activo).map(curso => (
                                                <div key={curso.id_curso} style={{ marginBottom: '8px' }}>
                                                    <label style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        cursor: 'pointer',
                                                        padding: '5px',
                                                        borderRadius: '4px',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                    >
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
                                                            style={{ marginRight: '8px', cursor: 'pointer' }}
                                                        />
                                                        <span>
                                                            {curso.nombre_curso}
                                                            {curso.turno && (
                                                                <span style={{ color: '#666', fontSize: '12px', marginLeft: '8px' }}>
                                                                    ({curso.turno})
                                                                </span>
                                                            )}
                                                        </span>
                                                    </label>
                                                </div>
                                            ))
                                        ) : (
                                            <p style={{ color: '#666', fontSize: '14px', fontStyle: 'italic' }}>
                                                No hay cursos activos disponibles
                                            </p>
                                        )}
                                    </div>
                                    <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                                        {nuevoPadreHijo.id_cursos.length > 0 
                                            ? `${nuevoPadreHijo.id_cursos.length} curso(s) seleccionado(s)`
                                            : 'Puedes seleccionar múltiples cursos para el estudiante'
                                        }
                                    </small>
                                </div>
                                <div className="form-group">
                                    <label>Relación:</label>
                                    <select 
                                        value={nuevoPadreHijo.relacion}
                                        onChange={(e) => setNuevoPadreHijo({...nuevoPadreHijo, relacion: e.target.value})}
                                    >
                                        <option value="Padre">Padre</option>
                                        <option value="Madre">Madre</option>
                                        <option value="Tutor">Tutor</option>
                                        <option value="Representante">Representante</option>
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button 
                                        type="button" 
                                        className="btn-secondary" 
                                        onClick={() => {
                                            setShowCrearPadreHijo(false);
                                            setCredencialesHijoGeneradas(null);
                                            setNuevoPadreHijo({
                                                padre_nombre: '', padre_apellido: '', padre_correo: '', padre_contrasena: '', 
                                                padre_dni: '', padre_telefono: '', padre_direccion: '',
                                                hijo_nombre: '', hijo_apellido: '', hijo_dni: '',
                                                seccion: '', turno: '', id_salon: '', id_cursos: [], relacion: 'Padre'
                                            });
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Crear Padre e Hijo
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="modal-content">
                                <div style={{ padding: '20px', backgroundColor: '#d4edda', borderRadius: '8px', marginBottom: '20px' }}>
                                    <h4 style={{ color: '#155724', marginBottom: '15px' }}>✅ Padre e Hijo creados exitosamente</h4>
                                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '4px', border: '2px solid #28a745' }}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <h5 style={{ color: '#155724', marginBottom: '10px' }}>Información del Padre</h5>
                                            <p><strong>Nombre completo:</strong> {credencialesHijoGeneradas.padre.nombre} {credencialesHijoGeneradas.padre.apellido}</p>
                                            <p><strong>Correo:</strong> {credencialesHijoGeneradas.padre.correo}</p>
                                            <p><strong>DNI:</strong> {credencialesHijoGeneradas.padre.dni}</p>
                                        </div>
                                        
                                        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                                            <h5 style={{ color: '#155724', marginBottom: '15px' }}>🔐 Credenciales del Hijo</h5>
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
                                                    {credencialesHijoGeneradas.credenciales_hijo.correo}
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
                                                    {credencialesHijoGeneradas.credenciales_hijo.contrasena}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <h5 style={{ color: '#155724', marginBottom: '10px' }}>Información del Hijo</h5>
                                            <p><strong>Nombre completo:</strong> {credencialesHijoGeneradas.hijo.nombre} {credencialesHijoGeneradas.hijo.apellido}</p>
                                            {credencialesHijoGeneradas.hijo.dni && (
                                                <p><strong>DNI:</strong> {credencialesHijoGeneradas.hijo.dni}</p>
                                            )}
                                        </div>

                                        {(credencialesHijoGeneradas.asignacion.salon || (credencialesHijoGeneradas.asignacion.cursos && credencialesHijoGeneradas.asignacion.cursos.length > 0)) && (
                                            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
                                                {credencialesHijoGeneradas.asignacion.salon && (
                                                    <div style={{ marginBottom: '10px' }}>
                                                        <p><strong>Salón asignado:</strong></p>
                                                        <p style={{ marginLeft: '15px', fontSize: '16px', fontWeight: 'bold', color: '#007bff' }}>
                                                            {credencialesHijoGeneradas.asignacion.salon.nombre_completo || 
                                                             `${credencialesHijoGeneradas.asignacion.salon.nombre_salon}${credencialesHijoGeneradas.asignacion.salon.grado && credencialesHijoGeneradas.asignacion.salon.seccion ? ` - ${credencialesHijoGeneradas.asignacion.salon.grado} ${credencialesHijoGeneradas.asignacion.salon.seccion}` : ''}${credencialesHijoGeneradas.asignacion.salon.turno ? ` (${credencialesHijoGeneradas.asignacion.salon.turno})` : ''}`}
                                                        </p>
                                                        {credencialesHijoGeneradas.asignacion.salon.grado && credencialesHijoGeneradas.asignacion.salon.seccion && (
                                                            <p style={{ marginLeft: '15px', color: '#666', fontSize: '14px' }}>
                                                                Grado: {credencialesHijoGeneradas.asignacion.salon.grado} | Sección: {credencialesHijoGeneradas.asignacion.salon.seccion}
                                                            </p>
                                                        )}
                                                        {credencialesHijoGeneradas.asignacion.salon.turno && (
                                                            <p style={{ marginLeft: '15px', color: '#666', fontSize: '14px' }}>
                                                                Turno: <strong>{credencialesHijoGeneradas.asignacion.salon.turno}</strong>
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                {credencialesHijoGeneradas.asignacion.cursos && credencialesHijoGeneradas.asignacion.cursos.length > 0 && (
                                                    <div>
                                                        <p><strong>Cursos asignados ({credencialesHijoGeneradas.asignacion.cursos.length}):</strong></p>
                                                        <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                                            {credencialesHijoGeneradas.asignacion.cursos.map((curso, index) => (
                                                                <li key={index}>{curso.nombre_curso}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#d1ecf1', borderRadius: '4px', border: '1px solid #bee5eb' }}>
                                                    <p style={{ margin: 0, fontSize: '13px', color: '#0c5460' }}>
                                                        📧 <strong>Nota:</strong> Se ha enviado un correo electrónico a <strong>{credencialesHijoGeneradas.padre.correo}</strong> con toda esta información.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
                                        <p style={{ color: '#856404', margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                                            ⚠️ <strong>IMPORTANTE:</strong> Guarda las credenciales del hijo de forma segura. El estudiante las necesitará para iniciar sesión.
                                        </p>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button 
                                        type="button" 
                                        className="btn-primary" 
                                        onClick={() => {
                                            setShowCrearPadreHijo(false);
                                            setCredencialesHijoGeneradas(null);
                                            setNuevoPadreHijo({
                                                padre_nombre: '', padre_apellido: '', padre_correo: '', padre_contrasena: '', 
                                                padre_dni: '', padre_telefono: '', padre_direccion: '',
                                                hijo_nombre: '', hijo_apellido: '', hijo_dni: '',
                                                seccion: '', turno: '', id_salon: '', id_cursos: [], relacion: 'Padre'
                                            });
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

            {/* Modal para Crear Salón */}
            {showCrearSalon && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Crear Nuevo Salón</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowCrearSalon(false);
                                    setNuevoSalon({
                                        nombre_salon: '',
                                        descripcion: '',
                                        capacidad_maxima: 40,
                                        grado: '',
                                        seccion: '',
                                        anio_academico: new Date().getFullYear().toString(),
                                        id_docente_titular: ''
                                    });
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCrearSalon} className="modal-content">
                            <div className="form-group">
                                <label>Nombre del Salón: *</label>
                                <input 
                                    type="text" 
                                    value={nuevoSalon.nombre_salon}
                                    onChange={(e) => setNuevoSalon({...nuevoSalon, nombre_salon: e.target.value})}
                                    placeholder="Ej: Aula 101, Primero A, etc."
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción:</label>
                                <textarea 
                                    value={nuevoSalon.descripcion}
                                    onChange={(e) => setNuevoSalon({...nuevoSalon, descripcion: e.target.value})}
                                    placeholder="Descripción del salón (opcional)"
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Capacidad Máxima: *</label>
                                <input 
                                    type="number" 
                                    value={nuevoSalon.capacidad_maxima}
                                    onChange={(e) => setNuevoSalon({...nuevoSalon, capacidad_maxima: e.target.value})}
                                    min="1"
                                    max="100"
                                    required
                                />
                                <small style={{ color: '#666', fontSize: '12px' }}>Máximo 100 estudiantes</small>
                            </div>
                            <div className="form-group">
                                <label>Grado:</label>
                                <input 
                                    type="text" 
                                    value={nuevoSalon.grado}
                                    onChange={(e) => setNuevoSalon({...nuevoSalon, grado: e.target.value})}
                                    placeholder="Ej: Primero, Segundo, etc."
                                />
                            </div>
                            <div className="form-group">
                                <label>Sección:</label>
                                <input 
                                    type="text" 
                                    value={nuevoSalon.seccion}
                                    onChange={(e) => setNuevoSalon({...nuevoSalon, seccion: e.target.value})}
                                    placeholder="Ej: A, B, C, etc."
                                />
                            </div>
                            <div className="form-group">
                                <label>Año Académico:</label>
                                <input 
                                    type="text" 
                                    value={nuevoSalon.anio_academico}
                                    onChange={(e) => setNuevoSalon({...nuevoSalon, anio_academico: e.target.value})}
                                    placeholder="Ej: 2024"
                                />
                            </div>
                            <div className="form-group">
                                <label>Turno:</label>
                                <select 
                                    value={nuevoSalon.turno}
                                    onChange={(e) => setNuevoSalon({...nuevoSalon, turno: e.target.value})}
                                >
                                    <option value="">Seleccionar turno (opcional)</option>
                                    <option value="Mañana">Mañana</option>
                                    <option value="Tarde">Tarde</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Docente Titular (Opcional):</label>
                                <select 
                                    value={nuevoSalon.id_docente_titular}
                                    onChange={(e) => setNuevoSalon({...nuevoSalon, id_docente_titular: e.target.value})}
                                >
                                    <option value="">Seleccionar docente (opcional)</option>
                                    {docentes.map(docente => (
                                        <option key={docente.id_usuario} value={docente.id_usuario}>
                                            {docente.nombre} {docente.apellido}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={() => {
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
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Crear Salón
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Ver Estudiantes y Padres de un Salón */}
            {showEstudiantesSalon && salonSeleccionadoEstudiantes && (
                <div className="modal-overlay">
                    <div className="modal large">
                        <div className="modal-header">
                            <h3>Estudiantes y Padres - {salonSeleccionadoEstudiantes.nombre_salon}</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowEstudiantesSalon(false);
                                    setEstudiantesConPadres([]);
                                    setSalonSeleccionadoEstudiantes(null);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-content">
                            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
                                <p><strong>Capacidad:</strong> {salonSeleccionadoEstudiantes.estudiantes_matriculados || 0} / {salonSeleccionadoEstudiantes.capacidad_maxima}</p>
                                {salonSeleccionadoEstudiantes.turno && (
                                    <p><strong>Turno:</strong> {salonSeleccionadoEstudiantes.turno}</p>
                                )}
                                {salonSeleccionadoEstudiantes.grado && salonSeleccionadoEstudiantes.seccion && (
                                    <p><strong>Grado y Sección:</strong> {salonSeleccionadoEstudiantes.grado} {salonSeleccionadoEstudiantes.seccion}</p>
                                )}
                            </div>
                            {estudiantesConPadres.length > 0 ? (
                                <div className="estudiantes-list">
                                    {estudiantesConPadres.map((item, index) => (
                                        <div key={item.estudiante.id_usuario} style={{ 
                                            padding: '15px', 
                                            border: '1px solid #ddd', 
                                            borderRadius: '8px',
                                            marginBottom: '15px',
                                            backgroundColor: '#f8f9fa'
                                        }}>
                                            <div style={{ marginBottom: '10px' }}>
                                                <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                                                    {item.estudiante.nombre} {item.estudiante.apellido}
                                                </h4>
                                                <p style={{ margin: '3px 0', color: '#666' }}>
                                                    <strong>Correo:</strong> {item.estudiante.correo}
                                                </p>
                                                {item.estudiante.dni && (
                                                    <p style={{ margin: '3px 0', color: '#666' }}>
                                                        <strong>DNI:</strong> {item.estudiante.dni}
                                                    </p>
                                                )}
                                                {item.estudiante.turno && (
                                                    <p style={{ margin: '3px 0', color: '#007bff', fontWeight: 'bold' }}>
                                                        <strong>Turno:</strong> {item.estudiante.turno}
                                                    </p>
                                                )}
                                            </div>
                                            {item.padres.length > 0 ? (
                                                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
                                                    <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Padres de Familia:</h5>
                                                    {item.padres.map((padre, pIndex) => (
                                                        <div key={padre.id_usuario} style={{ 
                                                            padding: '10px', 
                                                            border: '1px solid #e0e0e0', 
                                                            borderRadius: '4px',
                                                            marginBottom: pIndex < item.padres.length - 1 ? '10px' : '0',
                                                            backgroundColor: '#fafafa'
                                                        }}>
                                                            <p style={{ margin: '3px 0', fontWeight: 'bold' }}>
                                                                {padre.nombre} {padre.apellido} ({padre.relacion})
                                                            </p>
                                                            <p style={{ margin: '3px 0', color: '#666', fontSize: '13px' }}>
                                                                <strong>Correo:</strong> {padre.correo}
                                                            </p>
                                                            {padre.dni && (
                                                                <p style={{ margin: '3px 0', color: '#666', fontSize: '13px' }}>
                                                                    <strong>DNI:</strong> {padre.dni}
                                                                </p>
                                                            )}
                                                            {padre.telefono && (
                                                                <p style={{ margin: '3px 0', color: '#666', fontSize: '13px' }}>
                                                                    <strong>Teléfono:</strong> {padre.telefono}
                                                                </p>
                                                            )}
                                                            {padre.turno && (
                                                                <p style={{ margin: '3px 0', color: '#007bff', fontWeight: 'bold', fontSize: '13px' }}>
                                                                    <strong>Turno:</strong> {padre.turno}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p style={{ margin: '10px 0', color: '#999', fontStyle: 'italic' }}>
                                                    No hay padres registrados para este estudiante
                                                </p>
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

            {/* Modal para Editar Credenciales */}
            {showEditarCredenciales && usuarioSeleccionadoCredenciales && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Editar Credenciales - {usuarioSeleccionadoCredenciales.nombre} {usuarioSeleccionadoCredenciales.apellido}</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowEditarCredenciales(false);
                                    setUsuarioSeleccionadoCredenciales(null);
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
                        <form onSubmit={handleActualizarCredenciales} className="modal-content">
                            <div className="form-group">
                                <label>Nuevo Correo Electrónico:</label>
                                <input 
                                    type="email" 
                                    value={credencialesEdit.nuevo_correo}
                                    onChange={(e) => setCredencialesEdit({...credencialesEdit, nuevo_correo: e.target.value})}
                                    placeholder="Dejar vacío para no cambiar"
                                />
                            </div>
                            <div className="form-group">
                                <label>Nueva Contraseña:</label>
                                <input 
                                    type="password" 
                                    value={credencialesEdit.nueva_contrasena}
                                    onChange={(e) => setCredencialesEdit({...credencialesEdit, nueva_contrasena: e.target.value})}
                                    placeholder="Dejar vacío para no cambiar (mínimo 6 caracteres)"
                                    minLength="6"
                                />
                            </div>
                            {credencialesEdit.nueva_contrasena && (
                                <div className="form-group">
                                    <label>Confirmar Nueva Contraseña:</label>
                                    <input 
                                        type="password" 
                                        value={credencialesEdit.confirmar_contrasena}
                                        onChange={(e) => setCredencialesEdit({...credencialesEdit, confirmar_contrasena: e.target.value})}
                                        placeholder="Confirmar nueva contraseña"
                                        minLength="6"
                                    />
                                </div>
                            )}
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={() => {
                                        setShowEditarCredenciales(false);
                                        setUsuarioSeleccionadoCredenciales(null);
                                        setCredencialesEdit({
                                            nuevo_correo: '',
                                            nueva_contrasena: '',
                                            confirmar_contrasena: ''
                                        });
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Actualizar Credenciales
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Ver Horarios del Curso */}
            {showHorariosCurso && cursoSeleccionadoHorarios && (
                <div className="modal-overlay">
                    <div className="modal large" style={{ maxWidth: '1200px' }}>
                        <div className="modal-header">
                            <h3>Horarios - {cursoSeleccionadoHorarios.nombre_curso}</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowHorariosCurso(false);
                                    setCursoSeleccionadoHorarios(null);
                                    setDocentesCurso([]);
                                    setHorariosCurso([]);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-content">
                            {/* Sección de Docentes */}
                            <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h4>Docentes del Curso</h4>
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                agregarDocenteACurso(cursoSeleccionadoHorarios.id_curso, parseInt(e.target.value));
                                                e.target.value = '';
                                            }
                                        }}
                                        style={{ padding: '5px 10px' }}
                                    >
                                        <option value="">+ Agregar Docente</option>
                                        {docentesDisponibles && docentesDisponibles.length > 0 ? (
                                            docentesDisponibles
                                                .filter(d => !docentesCurso.find(cd => cd.id_docente === d.id_usuario))
                                                .map(docente => (
                                                <option key={docente.id_usuario} value={docente.id_usuario}>
                                                    {docente.nombre} {docente.apellido} {docente.turno ? `(${docente.turno})` : ''}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No hay docentes disponibles</option>
                                        )}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {docentesCurso.map(docente => (
                                        <div key={docente.id_docente} style={{
                                            padding: '10px 15px',
                                            backgroundColor: 'white',
                                            border: '1px solid #ddd',
                                            borderRadius: '5px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <span>{docente.nombre} {docente.apellido}</span>
                                            {docente.docente_turno && (
                                                <span style={{ color: '#007bff', fontSize: '12px' }}>({docente.docente_turno})</span>
                                            )}
                                            <button
                                                className="btn-danger"
                                                style={{ padding: '2px 8px', fontSize: '12px' }}
                                                onClick={() => eliminarDocenteDeCurso(cursoSeleccionadoHorarios.id_curso, docente.id_docente)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Botón para agregar horario */}
                            <div style={{ marginBottom: '20px' }}>
                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        setNuevoHorario({
                                            id_curso: cursoSeleccionadoHorarios.id_curso,
                                            id_docente: '',
                                            id_salon: '',
                                            dia_semana: '',
                                            hora_inicio: '',
                                            hora_fin: '',
                                            turno: ''
                                        });
                                        setShowAgregarHorario(true);
                                    }}
                                >
                                    + Agregar Horario
                                </button>
                            </div>

                            {/* Tabla de Horarios */}
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Día</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Hora Inicio</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Hora Fin</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Docente</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Salón</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Turno</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {horariosCurso.map(horario => (
                                            <tr key={horario.id_horario}>
                                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{horario.dia_semana}</td>
                                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{horario.hora_inicio}</td>
                                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{horario.hora_fin}</td>
                                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                    {horario.docente_nombre} {horario.docente_apellido}
                                                </td>
                                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                    {horario.nombre_salon || 'Sin asignar'}
                                                    {horario.grado && horario.seccion && ` (${horario.grado} ${horario.seccion})`}
                                                </td>
                                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                    {horario.turno || '-'}
                                                </td>
                                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                                    <button
                                                        className="btn-danger"
                                                        style={{ padding: '5px 10px', fontSize: '12px' }}
                                                        onClick={() => eliminarHorario(horario.id_horario, cursoSeleccionadoHorarios.id_curso)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {horariosCurso.length === 0 && (
                                            <tr>
                                                <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                                                    No hay horarios asignados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para Agregar Horario */}
            {showAgregarHorario && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Agregar Horario</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
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
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={crearHorario} className="modal-content">
                            <div className="form-group">
                                <label>Docente: *</label>
                                <select
                                    value={nuevoHorario.id_docente}
                                    onChange={(e) => setNuevoHorario({...nuevoHorario, id_docente: e.target.value})}
                                    required
                                >
                                    <option value="">Seleccionar docente</option>
                                    {docentesDisponibles.map(docente => (
                                        <option key={docente.id_usuario} value={docente.id_usuario}>
                                            {docente.nombre} {docente.apellido} {docente.turno ? `(${docente.turno})` : ''}
                                        </option>
                                    ))}
                                </select>
                                <small style={{ color: '#666', fontSize: '12px' }}>
                                    Si el docente no está asignado al curso, se agregará automáticamente
                                </small>
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
                                    <option value="">Seleccionar turno (opcional)</option>
                                    <option value="Mañana">Mañana</option>
                                    <option value="Tarde">Tarde</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Salón (opcional):</label>
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
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
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
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Crear Horario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardAdministrador;
