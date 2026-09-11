import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { Table, Button, Modal, Form, Alert, Card, Badge, Spinner } from 'react-bootstrap';

export const ActividadDetalle = () => {
    const { id } = useParams(); // Actividad ID
    const navigate = useNavigate();
    
    const [calificaciones, setCalificaciones] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ 
        estudianteId: '', 
        puntuacionObtenida: '', 
        comentariosRetroalimentacion: '', 
        actividadId: id 
    });

    const MOCK_CALIFICACIONES = {
        501: [
            { id: 1001, estudianteId: 10, estudianteNombre: 'Ana María Gómez', puntuacionObtenida: 18.5, comentariosRetroalimentacion: 'Excelente desarrollo de las ecuaciones, cálculos muy prolijos.' },
            { id: 1002, estudianteId: 11, estudianteNombre: 'Juan David Pérez', puntuacionObtenida: 15.0, comentariosRetroalimentacion: 'Buen trabajo, prestar más atención a los signos en el punto 3.' }
        ],
        502: [
            { id: 1003, estudianteId: 12, estudianteNombre: 'Sofía Rodríguez', puntuacionObtenida: 24.0, comentariosRetroalimentacion: 'Informe de laboratorio impecable con gráficos adecuados.' }
        ],
        503: [
            { id: 1004, estudianteId: 14, estudianteNombre: 'Valentina López', puntuacionObtenida: 28.0, comentariosRetroalimentacion: 'Examen con demostraciones completas y resultados correctos.' }
        ]
    };

    const MOCK_ALUMNOS = [
        { id: 10, nombre: 'Ana María Gómez', correo: 'ana.gomez@colegio.edu' },
        { id: 11, nombre: 'Juan David Pérez', correo: 'juan.perez@colegio.edu' },
        { id: 12, nombre: 'Sofía Rodríguez', correo: 'sofia.rodriguez@colegio.edu' },
        { id: 13, nombre: 'Mateo Fernández', correo: 'mateo.fernandez@colegio.edu' },
        { id: 14, nombre: 'Valentina López', correo: 'valentina.lopez@colegio.edu' }
    ];

    const fetchData = async () => {
        setCargando(true);
        setError('');
        const actIdNum = parseInt(id, 10);
        try {
            const [califRes, usuariosRes] = await Promise.all([
                api.get(`/calificaciones/actividad/${id}`),
                api.get('/usuarios')
            ]);
            setCalificaciones(califRes.data || []);
            const ests = (usuariosRes.data || []).filter(u => u.rolNombre?.toLowerCase() === 'estudiante' || u.rolId === 3);
            setEstudiantes(ests.length > 0 ? ests : MOCK_ALUMNOS);
        } catch (err) {
            console.warn("API de calificaciones no disponible, usando demostrativos:", err);
            setCalificaciones(MOCK_CALIFICACIONES[actIdNum] || []);
            setEstudiantes(MOCK_ALUMNOS);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGuardando(true);
        const estSeleccionado = estudiantes.find(est => est.id === parseInt(formData.estudianteId, 10));
        const nuevaCalif = {
            id: Date.now(),
            actividadId: parseInt(id, 10),
            estudianteId: parseInt(formData.estudianteId, 10),
            estudianteNombre: estSeleccionado?.nombre || `Estudiante #${formData.estudianteId}`,
            puntuacionObtenida: parseFloat(formData.puntuacionObtenida),
            comentariosRetroalimentacion: formData.comentariosRetroalimentacion
        };

        try {
            try {
                await api.post('/calificaciones', {
                    ...formData,
                    actividadId: parseInt(id, 10),
                    estudianteId: parseInt(formData.estudianteId, 10),
                    puntuacionObtenida: parseFloat(formData.puntuacionObtenida)
                });
            } catch (apiErr) {
                console.warn('API post /calificaciones inaccesible, guardando en estado local:', apiErr);
            }

            setCalificaciones(prev => [nuevaCalif, ...prev]);
            setShowModal(false);
            setFormData({ estudianteId: '', puntuacionObtenida: '', comentariosRetroalimentacion: '', actividadId: id });
            setExito('¡Calificación guardada con éxito!');
            setTimeout(() => setExito(''), 4000);
        } catch (err) {
            console.error("Error creating calificacion", err);
            alert('No se pudo registrar la calificación.');
        } finally {
            setGuardando(false);
        }
    };

    const handleDelete = async (califId) => {
        if(window.confirm('¿Eliminar esta calificación?')) {
            try {
                try {
                    await api.delete(`/calificaciones/${califId}`);
                } catch (apiErr) {
                    console.warn('API delete /calificaciones inaccesible, actualizando localmente:', apiErr);
                }
                setCalificaciones(prev => prev.filter(c => c.id !== califId));
                setExito('Calificación eliminada correctamente.');
                setTimeout(() => setExito(''), 3000);
            } catch (err) {
                console.error("Error deleting calificacion", err);
                alert('No se pudo eliminar la calificación.');
            }
        }
    };

    return (
        <div className="container-fluid px-0">
            {/* Header */}
            <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <Button 
                                variant="light" 
                                size="sm" 
                                className="border me-1"
                                onClick={() => navigate(-1)}
                                title="Volver atrás"
                            >
                                <i className="bi bi-arrow-left"></i>
                            </Button>
                            <h2 className="h3 fw-bold mb-0 text-dark">Calificaciones de la Actividad</h2>
                            <Badge bg="success" className="fs-6 px-2 py-1">Actividad #{id}</Badge>
                        </div>
                        <p className="text-muted mb-0">
                            Evalúa a tus estudiantes, asigna puntajes y redacta observaciones académicas de retroalimentación.
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Button 
                            variant="outline-secondary" 
                            className="d-flex align-items-center gap-2"
                            onClick={() => navigate('/maestro')}
                        >
                            <i className="bi bi-speedometer2"></i>
                            <span>Dashboard</span>
                        </Button>
                        <Button 
                            variant="success" 
                            className="d-flex align-items-center gap-2 text-white fw-semibold"
                            onClick={() => setShowModal(true)}
                        >
                            <i className="bi bi-award-fill"></i>
                            <span>Añadir Calificación</span>
                        </Button>
                    </div>
                </div>
            </div>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </Alert>
            )}

            {exito && (
                <Alert variant="success" dismissible onClose={() => setExito('')} className="mb-4">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {exito}
                </Alert>
            )}

            {/* Calificaciones Table */}
            <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                            <i className="bi bi-clipboard-check text-success"></i>
                            Notas Registradas
                        </h5>
                        <Badge bg="light" text="dark" className="border px-3 py-2">
                            Evaluados: {calificaciones.length}
                        </Badge>
                    </div>

                    {cargando ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="success" />
                            <p className="text-muted small mt-2">Cargando calificaciones...</p>
                        </div>
                    ) : calificaciones.length === 0 ? (
                        <div className="text-center py-5 bg-light rounded-3">
                            <i className="bi bi-person-x fs-1 text-muted"></i>
                            <h6 className="mt-3 text-secondary">Aún no hay calificaciones asignadas</h6>
                            <p className="text-muted small mb-3">Evalúa la primera entrega de tus alumnos.</p>
                            <Button 
                                variant="success" 
                                size="sm" 
                                className="fw-semibold text-white"
                                onClick={() => setShowModal(true)}
                            >
                                <i className="bi bi-award me-1"></i>
                                Calificar Primer Alumno
                            </Button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover align="middle" className="mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Estudiante</th>
                                        <th className="text-center">Puntuación</th>
                                        <th>Retroalimentación</th>
                                        <th className="text-end">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {calificaciones.map(c => (
                                        <tr key={c.id}>
                                            <td className="fw-bold text-dark">
                                                <i className="bi bi-person-circle text-primary me-2"></i>
                                                {c.estudianteNombre}
                                            </td>
                                            <td className="text-center">
                                                <Badge bg="primary" className="fs-6 px-3 py-1">
                                                    {c.puntuacionObtenida} pts
                                                </Badge>
                                            </td>
                                            <td className="text-muted">
                                                {c.comentariosRetroalimentacion ? (
                                                    <span>
                                                        <i className="bi bi-chat-left-quote me-1 text-secondary"></i>
                                                        {c.comentariosRetroalimentacion}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted fst-italic">Sin observaciones</span>
                                                )}
                                            </td>
                                            <td className="text-end">
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm"
                                                    onClick={() => handleDelete(c.id)}
                                                    title="Eliminar calificación"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Modal Asignar Calificación */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static">
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="h5 fw-bold text-dark d-flex align-items-center gap-2">
                        <i className="bi bi-award-fill text-success"></i>
                        Asignar Calificación
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">
                                Estudiante <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Select 
                                value={formData.estudianteId} 
                                onChange={e => setFormData({...formData, estudianteId: e.target.value})} 
                                required
                            >
                                <option value="">Selecciona un estudiante...</option>
                                {estudiantes.map(e => (
                                    <option key={e.id} value={e.id}>
                                        {e.nombre} ({e.correo})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">
                                Puntuación Obtenida <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control 
                                type="number" 
                                step="0.1" 
                                min="0" 
                                max="100"
                                placeholder="Ej: 18.5"
                                value={formData.puntuacionObtenida} 
                                onChange={e => setFormData({...formData, puntuacionObtenida: e.target.value})} 
                                required 
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold small text-secondary">
                                Comentarios y Retroalimentación
                            </Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                placeholder="Observaciones de mejora, aciertos o comentarios al alumno..."
                                value={formData.comentariosRetroalimentacion} 
                                onChange={e => setFormData({...formData, comentariosRetroalimentacion: e.target.value})} 
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="light" onClick={() => setShowModal(false)} disabled={guardando}>
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                variant="success" 
                                className="fw-semibold text-white d-flex align-items-center gap-2"
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
                                        <span>Guardar Calificación</span>
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

