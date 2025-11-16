import React, { useState, useEffect } from 'react';
import './VistasAdmin.css';

const VistaGestionUsuarios = ({ onVolver }) => {
    const [usuarios, setUsuarios] = useState([]);
    const [filtroRol, setFiltroRol] = useState('Todos');
    const [loading, setLoading] = useState(true);
    const [showEditarCredenciales, setShowEditarCredenciales] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [credencialesEdit, setCredencialesEdit] = useState({
        nuevo_correo: '',
        nueva_contrasena: '',
        confirmar_contrasena: ''
    });

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/admin/usuarios');
            if (response.ok) {
                const data = await response.json();
                setUsuarios(data.data || []);
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCambiarRol = async (idUsuario, nuevoRol) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/usuarios/${idUsuario}/rol`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nuevo_rol: nuevoRol })
            });

            if (response.ok) {
                alert('Rol actualizado exitosamente');
                await cargarUsuarios();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al cambiar rol:', error);
            alert('Error de conexión');
        }
    };

    const handleEliminarUsuario = async (idUsuario) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/usuarios/${idUsuario}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Usuario eliminado exitosamente');
                await cargarUsuarios();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            alert('Error de conexión');
        }
    };

    const handleActualizarCredenciales = async (e) => {
        e.preventDefault();
        
        if (credencialesEdit.nueva_contrasena && credencialesEdit.nueva_contrasena !== credencialesEdit.confirmar_contrasena) {
            alert('Las contraseñas no coinciden');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/admin/actualizar-credenciales', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: usuarioSeleccionado.id_usuario,
                    nuevo_correo: credencialesEdit.nuevo_correo,
                    nueva_contrasena: credencialesEdit.nueva_contrasena || null
                })
            });

            if (response.ok) {
                alert('Credenciales actualizadas exitosamente');
                setShowEditarCredenciales(false);
                setUsuarioSeleccionado(null);
                await cargarUsuarios();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al actualizar credenciales:', error);
            alert('Error de conexión');
        }
    };

    const usuariosFiltrados = filtroRol === 'Todos' 
        ? usuarios 
        : usuarios.filter(u => u.rol === filtroRol);

    return (
        <div className="vista-admin">
            <div className="vista-header">
                <button className="btn-volver" onClick={onVolver}>← Volver</button>
                <h2>👥 Gestión Completa de Usuarios</h2>
            </div>

            <div className="vista-filtros">
                <label>Filtrar por rol:</label>
                <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
                    <option value="Todos">Todos</option>
                    <option value="Docente">Docente</option>
                    <option value="Padre">Padre</option>
                    <option value="Estudiante">Estudiante</option>
                </select>
                <span className="contador-filtro">
                    {usuariosFiltrados.length} usuario(s) encontrado(s)
                </span>
            </div>

            {loading ? (
                <div className="loading">Cargando usuarios...</div>
            ) : (
                <div className="vista-content">
                    <table className="tabla-usuarios">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Fecha Registro</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuariosFiltrados.map(usuario => (
                                <tr key={usuario.id_usuario}>
                                    <td>{usuario.id_usuario}</td>
                                    <td>{usuario.nombre} {usuario.apellido}</td>
                                    <td>{usuario.correo}</td>
                                    <td>
                                        <select 
                                            value={usuario.rol}
                                            onChange={(e) => handleCambiarRol(usuario.id_usuario, e.target.value)}
                                            className="rol-select-small"
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
                                        <div className="acciones-tabla">
                                            <button
                                                className="btn-small btn-secondary"
                                                onClick={() => {
                                                    setUsuarioSeleccionado(usuario);
                                                    setCredencialesEdit({
                                                        nuevo_correo: usuario.correo,
                                                        nueva_contrasena: '',
                                                        confirmar_contrasena: ''
                                                    });
                                                    setShowEditarCredenciales(true);
                                                }}
                                            >
                                                ✏️ Editar
                                            </button>
                                            {usuario.rol !== 'Administrador' && (
                                                <button
                                                    className="btn-small btn-danger"
                                                    onClick={() => handleEliminarUsuario(usuario.id_usuario)}
                                                >
                                                    🗑️ Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal para editar credenciales */}
            {showEditarCredenciales && usuarioSeleccionado && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Editar Credenciales</h3>
                            <button className="modal-close" onClick={() => {
                                setShowEditarCredenciales(false);
                                setUsuarioSeleccionado(null);
                            }}>×</button>
                        </div>
                        <form onSubmit={handleActualizarCredenciales} className="modal-content">
                            <div className="form-group">
                                <label>Usuario:</label>
                                <p><strong>{usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}</strong></p>
                            </div>
                            <div className="form-group">
                                <label>Nuevo Correo:</label>
                                <input
                                    type="email"
                                    value={credencialesEdit.nuevo_correo}
                                    onChange={(e) => setCredencialesEdit({...credencialesEdit, nuevo_correo: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Nueva Contraseña (dejar vacío para no cambiar):</label>
                                <input
                                    type="password"
                                    value={credencialesEdit.nueva_contrasena}
                                    onChange={(e) => setCredencialesEdit({...credencialesEdit, nueva_contrasena: e.target.value})}
                                />
                            </div>
                            {credencialesEdit.nueva_contrasena && (
                                <div className="form-group">
                                    <label>Confirmar Contraseña:</label>
                                    <input
                                        type="password"
                                        value={credencialesEdit.confirmar_contrasena}
                                        onChange={(e) => setCredencialesEdit({...credencialesEdit, confirmar_contrasena: e.target.value})}
                                    />
                                </div>
                            )}
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">Guardar</button>
                                <button type="button" className="btn-secondary" onClick={() => {
                                    setShowEditarCredenciales(false);
                                    setUsuarioSeleccionado(null);
                                }}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VistaGestionUsuarios;

