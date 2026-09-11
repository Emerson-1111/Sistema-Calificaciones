import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Table, Button, Modal, Form, Spinner, Alert, Card } from 'react-bootstrap';

export const GruposAdmin = () => {
    const [grupos, setGrupos] = useState([]);
    const [asignaturas, setAsignaturas] = useState([]);
    const [maestros, setMaestros] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [formData, setFormData] = useState({ nombreGrupo: '', periodo: '', asignaturaId: '', maestroId: '' });

    const fetchData = async () => {
        setCargando(true);
        try {
            const [gruposRes, asignaturasRes, usuariosRes] = await Promise.all([
                api.get('/grupos'),
                api.get('/Asignaturas'), // Endpoint en plural en ASP.NET Core
                api.get('/usuarios')
            ]);
            setGrupos(gruposRes.data || []);
            setAsignaturas(asignaturasRes.data || []);
            setMaestros((usuariosRes.data || []).filter(u => u.rolNombre?.toLowerCase() === 'maestro' || u.rolId === 2));

        } catch (error) {
            console.error("Error fetching data", error);
            setMensaje({ tipo: 'danger', texto: 'No se pudo cargar la información de grupos. Comprueba la conexión con la API.' });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setMensaje({ tipo: '', texto: '' });
        try {
            await api.post('/grupos', {
                nombreGrupo: formData.nombreGrupo.trim(),
                periodo: formData.periodo.trim(),
                asignaturaId: Number(formData.asignaturaId),
                maestroId: Number(formData.maestroId)
            });
            setShowModal(false);
            setFormData({ nombreGrupo: '', periodo: '', asignaturaId: '', maestroId: '' });
            setMensaje({ tipo: 'success', texto: 'Grupo creado exitosamente.' });
            fetchData();
        } catch (error) {
            console.error("Error creating grupo", error);
            setMensaje({ tipo: 'danger', texto: 'Error al crear el grupo. Verifica que todos los campos sean correctos.' });
        } finally {
            setGuardando(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este grupo? Esta acción no se puede deshacer.')) {
            try {
                await api.delete(`/grupos/${id}`);
                setMensaje({ tipo: 'success', texto: 'Grupo eliminado correctamente.' });
                fetchData();
            } catch (error) {
                console.error("Error deleting grupo", error);
                setMensaje({ tipo: 'danger', texto: 'No se pudo eliminar el grupo. Puede contener actividades o alumnos asignados.' });
            }
        }
    };

    return (
        <div>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                        <i className="bi bi-collection-fill text-warning"></i>
                        Gestión de Grupos
                    </h2>
                    <p className="text-muted small mb-0">Crea y administra secciones académicas con sus asignaturas y docentes.</p>
                </div>
                <Button 
                    variant="warning" 
                    className="text-dark fw-bold d-flex align-items-center gap-2 shadow-sm"
                    onClick={() => setShowModal(true)}
                >
                    <i className="bi bi-plus-lg"></i>
                    Nuevo Grupo
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
                                <th>Nombre Grupo</th>
                                <th>Periodo</th>
                                <th>Asignatura</th>
                                <th>Docente</th>
                                <th className="text-end pe-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargando ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <div className="text-muted mt-2 small">Cargando grupos...</div>
                                    </td>
                                </tr>
                            ) : grupos.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        <i className="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                                        No hay grupos registrados en este momento. Haz clic en "Nuevo Grupo" para comenzar.
                                    </td>
                                </tr>
                            ) : (
                                grupos.map(g => (
                                    <tr key={g.id}>
                                        <td className="ps-4 fw-semibold text-muted">#{g.id}</td>
                                        <td>
                                            <span className="badge bg-light text-dark border px-2 py-1 fw-bold fs-6">
                                                {g.nombreGrupo}
                                            </span>
                                        </td>
                                        <td>{g.periodo}</td>
                                        <td>
                                            <i className="bi bi-book me-1 text-primary"></i>
                                            {g.asignaturaNombre}
                                        </td>
                                        <td>
                                            <i className="bi bi-person me-1 text-secondary"></i>
                                            {g.maestroNombre}
                                        </td>
                                        <td className="text-end pe-4">
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm" 
                                                className="d-inline-flex align-items-center gap-1"
                                                onClick={() => handleDelete(g.id)}
                                                title="Eliminar grupo"
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
                        <span className="bg-warning bg-opacity-25 text-dark p-2 rounded-3 d-inline-flex">
                            <i className="bi bi-collection-fill"></i>
                        </span>
                        Crear Nuevo Grupo
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-3">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">Nombre del Grupo</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Ej. 101-A, MAT-G1"
                                value={formData.nombreGrupo} 
                                onChange={e => setFormData({...formData, nombreGrupo: e.target.value})} 
                                required 
                                disabled={guardando}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">Periodo Académico</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Ej. 2026-1, 2026-2"
                                value={formData.periodo} 
                                onChange={e => setFormData({...formData, periodo: e.target.value})} 
                                required 
                                disabled={guardando}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">Asignatura</Form.Label>
                            <Form.Select 
                                value={formData.asignaturaId} 
                                onChange={e => setFormData({...formData, asignaturaId: e.target.value})} 
                                required
                                disabled={guardando}
                            >
                                <option value="">Seleccione una asignatura...</option>
                                {asignaturas.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.nombre} ({a.codigo} - {a.creditos} cr.)
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold small text-secondary">Docente / Maestro</Form.Label>
                            <Form.Select 
                                value={formData.maestroId} 
                                onChange={e => setFormData({...formData, maestroId: e.target.value})} 
                                required
                                disabled={guardando}
                            >
                                <option value="">Seleccione un maestro...</option>
                                {maestros.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.nombre} ({m.correo})
                                    </option>
                                ))}
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
                                variant="warning" 
                                className="text-dark fw-bold d-flex align-items-center gap-2"
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
                                        <span>Guardar Grupo</span>
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

