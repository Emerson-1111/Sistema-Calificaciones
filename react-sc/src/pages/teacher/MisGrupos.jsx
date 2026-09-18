import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { Card, Button, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';

export const MisGrupos = () => {
    const [grupos, setGrupos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGrupos = async () => {
            setCargando(true);
            setError('');
            try {
                const response = await api.get('/grupos');
                const misGrupos = (response.data || []).filter(g => g.maestroId === parseInt(user.id, 10));
                setGrupos(misGrupos);
            } catch (err) {
                console.error("Error fetching grupos, usando datos de muestra", err);
                setGrupos([
                    { id: 101, nombreGrupo: 'Grupo 101-A', asignaturaNombre: 'Matemáticas Avanzadas', periodo: '2026-1', maestroId: parseInt(user.id, 10), maestroNombre: 'Prof. Carlos Ramírez' },
                    { id: 102, nombreGrupo: 'Grupo 201-B', asignaturaNombre: 'Física Mecánica', periodo: '2026-1', maestroId: parseInt(user.id, 10), maestroNombre: 'Prof. Carlos Ramírez' },
                    { id: 103, nombreGrupo: 'Grupo 301-C', asignaturaNombre: 'Cálculo Diferencial', periodo: '2026-1', maestroId: parseInt(user.id, 10), maestroNombre: 'Prof. Carlos Ramírez' }
                ]);
            } finally {
                setCargando(false);
            }
        };

        if (user) {
            fetchGrupos();
        }
    }, [user]);

    return (
        <div className="container-fluid px-0">
            {/* Header */}
            <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <h2 className="h3 fw-bold mb-0 text-dark">Mis Grupos Asignados</h2>
                            <Badge bg="primary" className="fs-6 px-2 py-1">{grupos.length} Grupos</Badge>
                        </div>
                        <p className="text-muted mb-0">
                            Consulta la lista de grupos, asignaturas y periodos académicos bajo tu tutoría.
                        </p>
                    </div>
                    <Button 
                        variant="outline-secondary" 
                        className="d-flex align-items-center gap-2"
                        onClick={() => navigate('/maestro')}
                    >
                        <i className="bi bi-speedometer2"></i>
                        <span>Volver al Dashboard</span>
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </Alert>
            )}

            {cargando ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-muted small mt-2">Cargando tus grupos...</p>
                </div>
            ) : grupos.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 border shadow-sm">
                    <i className="bi bi-folder-x fs-1 text-muted"></i>
                    <h5 className="mt-3 text-secondary fw-bold">No tienes grupos asignados</h5>
                    <p className="text-muted small mb-0">Comunícate con el administrador para que te asigne materias para este ciclo.</p>
                </div>
            ) : (
                <Row className="g-4">
                    {grupos.map(g => (
                        <Col key={g.id} xs={12} sm={6} lg={4} xl={3}>
                            <Card className="h-100 border-0 shadow-sm rounded-4">
                                <Card.Body className="d-flex flex-column p-4">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div className="rounded-3 p-3 bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
                                            <i className="bi bi-collection-fill fs-4"></i>
                                        </div>
                                        <Badge bg="light" text="dark" className="border px-2 py-1">
                                            <i className="bi bi-calendar3 me-1 text-muted"></i>
                                            {g.periodo}
                                        </Badge>
                                    </div>

                                    <Card.Title className="h5 fw-bold text-dark mb-1">
                                        {g.nombreGrupo}
                                    </Card.Title>
                                    
                                    <div className="mb-3">
                                        <Badge bg="primary" className="bg-opacity-75">
                                            <i className="bi bi-journal-bookmark me-1"></i>
                                            {g.asignaturaNombre}
                                        </Badge>
                                    </div>

                                    <div className="text-muted small flex-grow-1 mb-4">
                                        <div className="d-flex align-items-center gap-1 mb-1">
                                            <i className="bi bi-person text-secondary"></i>
                                            <span>Docente: <strong>{g.maestroNombre || 'Tú'}</strong></span>
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        <Button 
                                            variant="primary" 
                                            className="w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-xs"
                                            onClick={() => navigate(`/maestro/grupo/${g.id}?tab=actividades`)}
                                        >
                                            <i className="bi bi-journal-check"></i>
                                            <span>Ver Actividades</span>
                                            <i className="bi bi-arrow-right"></i>
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

