import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Table, Button, Modal, Form, Badge, Spinner, Alert, Card } from 'react-bootstrap';

export const UsuariosAdmin = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [formData, setFormData] = useState({ nombre: '', correo: '', password: '', rolId: 2 }); // 2 = Maestro por default

    const fetchUsuarios = async () => {
        setCargando(true);
        try {
            const response = await api.get('/usuarios');
            setUsuarios(response.data || []);
        } catch (error) {
            console.error("Error fetching usuarios", error);
            setMensaje({ tipo: 'danger', texto: 'No se pudieron cargar los usuarios. Verifica la conexión con la API.' });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setMensaje({ tipo: '', texto: '' });
        try {
            await api.post('/usuarios', formData);
            setShowModal(false);
            setFormData({ nombre: '', correo: '', password: '', rolId: 2 });
            setMensaje({ tipo: 'success', texto: 'Usuario creado exitosamente.' });
            fetchUsuarios();
        } catch (error) {
            console.error("Error creating usuario", error);
            setMensaje({ tipo: 'danger', texto: 'Error al registrar el usuario. Comprueba los campos ingresados.' });
        } finally {
            setGuardando(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
            try {
                await api.delete(`/usuarios/${id}`);
                setMensaje({ tipo: 'success', texto: 'Usuario eliminado exitosamente.' });
                fetchUsuarios();
            } catch (error) {
                console.error("Error deleting usuario", error);
                setMensaje({ tipo: 'danger', texto: 'No se pudo eliminar el usuario. Puede tener dependencias asociadas.' });
            }
        }
    };

    return (
        <div>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                        <i className="bi bi-people-fill text-primary"></i>
                        Gestión de Usuarios
                    </h2>
                    <p className="text-muted small mb-0">Crea y administra administradores, docentes y alumnos de la plataforma.</p>
                </div>
                <Button 
                    variant="primary" 
                    className="fw-bold d-flex align-items-center gap-2 shadow-sm"
                    onClick={() => setShowModal(true)}
                >
                    <i className="bi bi-person-plus-fill"></i>
                    Nuevo Usuario
                </Button>
            </div>

            {mensaje.texto && (
                <Alert 
                    variant={mensaje.tipo} 
                    dismissible 
                    onClose={() => setMensaje({ tipo: '', texto: '' })}
                    className="d-flex align-items-center gap-2"
                >
                    <i className={`bi ${mensaje.tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-5`}></i>
                    <div>{mensaje.texto}</div>
                </Alert>
            )}

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">ID</th>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Rol</th>
                                <th className="text-end pe-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargando ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <div className="text-muted mt-2 small">Cargando usuarios...</div>
                                    </td>
                                </tr>
                            ) : usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        <i className="bi bi-person-x fs-1 d-block mb-2 text-secondary"></i>
                                        No hay usuarios registrados en el sistema.
                                    </td>
                                </tr>
                            ) : (
                                usuarios.map(u => (
                                    <tr key={u.id}>
                                        <td className="ps-4 fw-semibold text-muted">#{u.id}</td>
                                        <td className="fw-medium text-dark">{u.nombre}</td>
                                        <td className="text-muted">{u.correo}</td>
                                        <td>
                                            <Badge bg={(u.rolNombre?.toLowerCase() === 'admin' || u.rolId === 1) ? 'danger' : (u.rolNombre?.toLowerCase() === 'maestro' || u.rolId === 2) ? 'primary' : 'success'} className="px-2 py-1">
                                                {u.rolNombre}
                                            </Badge>

                                        </td>
                                        <td className="text-end pe-4">
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm" 
                                                className="d-inline-flex align-items-center gap-1"
                                                onClick={() => handleDelete(u.id)}
                                                title="Eliminar usuario"
                                            >
                                                <i className="bi bi-trash"></i>
                                                <span>Eliminar</span>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => !guardando && setShowModal(false)} centered>
                <Modal.Header closeButton={!guardando} className="border-bottom-0 pb-0">
                    <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                        <span className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 d-inline-flex">
                            <i className="bi bi-person-plus-fill"></i>
                        </span>
                        Crear Nuevo Usuario
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-3">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">Nombre Completo</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Ej. Juan Pérez"
                                value={formData.nombre} 
                                onChange={e => setFormData({...formData, nombre: e.target.value})} 
                                required 
                                disabled={guardando}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">Correo Electrónico</Form.Label>
                            <Form.Control 
                                type="email" 
                                placeholder="ejemplo@correo.com"
                                value={formData.correo} 
                                onChange={e => setFormData({...formData, correo: e.target.value})} 
                                required 
                                disabled={guardando}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">Contraseña</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="••••••••"
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                required 
                                disabled={guardando}
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold small text-secondary">Rol en el Sistema</Form.Label>
                            <Form.Select 
                                value={formData.rolId} 
                                onChange={e => setFormData({...formData, rolId: Number(e.target.value)})}
                                disabled={guardando}
                            >
                                <option value={1}>Administrador</option>
                                <option value={2}>Maestro</option>
                                <option value={3}>Estudiante</option>
                            </Form.Select>
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2">
                            <Button 
                                variant="light" 
                                onClick={() => setShowModal(false)}
                                disabled={guardando}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                className="fw-bold d-flex align-items-center gap-2"
                                disabled={guardando}
                            >
                                {guardando ? (
                                    <>
                                        <Spinner animation="border" size="sm" />
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-lg"></i>
                                        <span>Guardar Usuario</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

