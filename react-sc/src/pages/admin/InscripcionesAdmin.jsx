import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Table, Button, Modal, Form, Spinner, Alert, Card } from 'react-bootstrap';

export const InscripcionesAdmin = () => {
    const [inscripciones, setInscripciones] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [formData, setFormData] = useState({ estudianteId: '', grupoId: '' });

    const fetchData = async () => {
        setCargando(true);
        try {
            const [inscripcionesRes, usuariosRes, gruposRes] = await Promise.all([
                api.get('/inscripciones'),
                api.get('/usuarios'),
                api.get('/grupos')
            ]);
            setInscripciones(inscripcionesRes.data || []);
            setEstudiantes((usuariosRes.data || []).filter(u => u.rolNombre?.toLowerCase() === 'estudiante' || u.rolId === 3));
            setGrupos(gruposRes.data || []);

        } catch (error) {
            console.error("Error fetching data", error);
            setMensaje({ tipo: 'danger', texto: 'No se pudieron cargar las matrículas. Comprueba la conexión con la API.' });
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
            await api.post('/inscripciones', {
                estudianteId: Number(formData.estudianteId),
                grupoId: Number(formData.grupoId)
            });
            setShowModal(false);
            setFormData({ estudianteId: '', grupoId: '' });
            setMensaje({ tipo: 'success', texto: 'Estudiante matriculado con éxito.' });
            fetchData();
        } catch (error) {
            console.error("Error creating inscripcion", error);
            setMensaje({ tipo: 'danger', texto: 'Error al matricular estudiante. Verifica que no esté ya registrado en este grupo.' });
        } finally {
            setGuardando(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Desmatricular estudiante del grupo?')) {
            try {
                await api.delete(`/inscripciones/${id}`);
                setMensaje({ tipo: 'success', texto: 'Matrícula cancelada correctamente.' });
                fetchData();
            } catch (error) {
                console.error("Error deleting inscripcion", error);
                setMensaje({ tipo: 'danger', texto: 'No se pudo desmatricular al estudiante.' });
            }
        }
    };

    return (
        <div>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                        <i className="bi bi-person-check-fill text-info"></i>
                        Gestión de Matriculaciones
                    </h2>
                    <p className="text-muted small mb-0">Inscribe alumnos en las asignaturas y grupos académicos vigentes.</p>
                </div>
                <Button 
                    variant="info" 
                    className="fw-bold d-flex align-items-center gap-2 text-dark shadow-sm"
                    onClick={() => setShowModal(true)}
                >
                    <i className="bi bi-plus-lg"></i>
                    Nueva Inscripción
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
                                <th>Fecha de Inscripción</th>
                                <th>Estudiante</th>
                                <th>Grupo y Materia</th>
                                <th className="text-end pe-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargando ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <div className="text-muted mt-2 small">Cargando matrículas...</div>
                                    </td>
                                </tr>
                            ) : inscripciones.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        <i className="bi bi-person-lines-fill fs-1 d-block mb-2 text-secondary"></i>
                                        No hay matrículas registradas aún. Haz clic en "Nueva Inscripción" para asignar un alumno.
                                    </td>
                                </tr>
                            ) : (
                                inscripciones.map(i => (
                                    <tr key={i.id}>
                                        <td className="ps-4 fw-semibold text-muted">#{i.id}</td>
                                        <td>
                                            <i className="bi bi-calendar3 me-1 text-secondary"></i>
                                            {i.fechaInscripcion ? new Date(i.fechaInscripcion).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="fw-medium text-dark">
                                            <i className="bi bi-person me-1 text-primary"></i>
                                            {i.estudianteNombre}
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark border px-2 py-1">
                                                {i.grupoNombre}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm" 
                                                className="d-inline-flex align-items-center gap-1"
                                                onClick={() => handleDelete(i.id)}
                                                title="Desmatricular alumno"
                                            >
                                                <i className="bi bi-person-x"></i>
                                                <span>Desmatricular</span>
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
                        <span className="bg-info bg-opacity-25 text-dark p-2 rounded-3 d-inline-flex">
                            <i className="bi bi-person-plus-fill"></i>
                        </span>
                        Matricular Estudiante
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-3">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">Estudiante</Form.Label>
                            <Form.Select 
                                value={formData.estudianteId} 
                                onChange={e => setFormData({...formData, estudianteId: e.target.value})} 
                                required
                                disabled={guardando}
                            >
                                <option value="">Seleccione un estudiante...</option>
                                {estudiantes.map(e => (
                                    <option key={e.id} value={e.id}>
                                        {e.nombre} ({e.correo})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold small text-secondary">Grupo</Form.Label>
                            <Form.Select 
                                value={formData.grupoId} 
                                onChange={e => setFormData({...formData, grupoId: e.target.value})} 
                                required
                                disabled={guardando}
                            >
                                <option value="">Seleccione un grupo...</option>
                                {grupos.map(g => (
                                    <option key={g.id} value={g.id}>
                                        {g.nombreGrupo} - {g.asignaturaNombre} (Periodo: {g.periodo})
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
                                variant="info" 
                                className="text-dark fw-bold d-flex align-items-center gap-2"
                                disabled={guardando}
                            >
                                {guardando ? (
                                    <>
                                        <Spinner animation="border" size="sm" />
                                        <span>Matriculando...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-lg"></i>
                                        <span>Guardar Matrícula</span>
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

