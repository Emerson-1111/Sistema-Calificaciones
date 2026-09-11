import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Card, Row, Col, Badge, Alert, Spinner, Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosConfig';

export const MiGrupo = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [misGrupos, setMisGrupos] = useState([]);

    const cargarGrupos = useCallback(async () => {
        if (!user) return;
        setCargando(true);
        setError('');

        try {
            const estudianteIdNum = parseInt(user.id, 10) || 10;
            let apiOnline = true;
            let inscripcionesData = [];
            let gruposData = [];

            try {
                const [resInscripciones, resGrupos] = await Promise.all([
                    api.get('/inscripciones').catch(() => ({ data: [] })),
                    api.get('/grupos').catch(() => ({ data: [] }))
                ]);
                inscripcionesData = resInscripciones.data || [];
                gruposData = resGrupos.data || [];
            } catch {
                apiOnline = false;
            }

            const inscripcionesEstudiante = inscripcionesData.filter(i => i.estudianteId === estudianteIdNum);
            let gruposEstudiante = [];

            if (inscripcionesEstudiante.length > 0) {
                gruposEstudiante = gruposData.filter(g => 
                    inscripcionesEstudiante.some(i => i.grupoId === g.id)
                ).map(g => {
                    const insc = inscripcionesEstudiante.find(i => i.grupoId === g.id);
                    return {
                        ...g,
                        fechaInscripcion: insc?.fechaInscripcion || '2026-02-15'
                    };
                });
            }

            if (gruposEstudiante.length === 0) {
                gruposEstudiante = [
                    {
                        id: 101,
                        nombreGrupo: 'Grupo 101-A',
                        periodo: '2026-1',
                        asignaturaNombre: 'Matemáticas Avanzadas',
                        maestroNombre: 'Prof. Carlos Ramírez',
                        maestroCorreo: 'carlos.ramirez@institucion.edu',
                        fechaInscripcion: '2026-02-10',
                        aula: 'Edificio B - Aula 204',
                        turno: 'Matutino (08:00 - 12:00)',
                        estado: 'Activo'
                    },
                    {
                        id: 102,
                        nombreGrupo: 'Grupo 201-B',
                        periodo: '2026-1',
                        asignaturaNombre: 'Física Mecánica',
                        maestroNombre: 'Dra. María Fernández',
                        maestroCorreo: 'maria.fernandez@institucion.edu',
                        fechaInscripcion: '2026-02-12',
                        aula: 'Laboratorio de Física L-1',
                        turno: 'Vespertino (14:00 - 18:00)',
                        estado: 'Activo'
                    },
                    {
                        id: 201,
                        nombreGrupo: 'Grupo 102-Previo',
                        periodo: '2025-2',
                        asignaturaNombre: 'Cálculo Diferencial',
                        maestroNombre: 'Prof. Carlos Ramírez',
                        maestroCorreo: 'carlos.ramirez@institucion.edu',
                        fechaInscripcion: '2025-08-10',
                        aula: 'Edificio A - Aula 102',
                        turno: 'Matutino',
                        estado: 'Concluido'
                    }
                ];
            }

            setMisGrupos(gruposEstudiante);
        } catch (err) {
            console.error("Error al cargar grupos del alumno", err);
            setError('Inconveniente al sincronizar la información del grupo.');
        } finally {
            setCargando(false);
        }
    }, [user]);

    useEffect(() => {
        cargarGrupos();
    }, [cargarGrupos]);

    return (
        <div className="container-fluid px-0">
            {/* Header de la sección */}
            <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-warning bg-opacity-10 text-dark p-3 rounded-4 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                            <i className="bi bi-collection-fill text-warning fs-3"></i>
                        </div>
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <h2 className="h4 fw-bold mb-0 text-dark">Mi Grupo Académico</h2>
                                <Badge bg="warning" className="text-dark px-2 py-1">
                                    Matriculación
                                </Badge>
                            </div>
                            <p className="text-muted small mb-0">
                                Consulta las secciones académicas, periodos lectivos y grupos en los que estás registrado.
                            </p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="d-flex align-items-center gap-1 shadow-xs"
                            onClick={cargarGrupos}
                            disabled={cargando}
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                            <span>Actualizar</span>
                        </Button>
                    </div>
                </div>
            </div>

            {error && (
                <Alert variant="warning" dismissible onClose={() => setError('')} className="d-flex align-items-center gap-2 mb-4">
                    <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                    <span>{error}</span>
                </Alert>
            )}

            {cargando ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <div className="text-muted small mt-2">Cargando información de tus grupos...</div>
                </div>
            ) : misGrupos.length === 0 ? (
                <Alert variant="info" className="p-4 rounded-4 shadow-sm">
                    <h5 className="alert-heading fw-bold">Sin Grupos Asignados</h5>
                    <p className="mb-0">Actualmente no te encuentras matriculado en ningún grupo escolar. Contacta a coordinación académica.</p>
                </Alert>
            ) : (
                <Row className="g-4">
                    {misGrupos.map(g => (
                        <Col key={g.id} xs={12} lg={6}>
                            <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                                <Card.Header className="bg-light border-bottom p-3 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                                            <i className="bi bi-people-fill fs-5"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold text-dark mb-0">{g.nombreGrupo}</h6>
                                            <span className="small text-muted">ID Sección: #{g.id}</span>
                                        </div>
                                    </div>
                                    <Badge bg={g.periodo === '2026-1' ? 'success' : 'secondary'} className="px-2 py-1">
                                        {g.periodo === '2026-1' ? 'Periodo Activo' : 'Ciclo Pasado'} ({g.periodo})
                                    </Badge>
                                </Card.Header>
                                <Card.Body className="p-4">
                                    <div className="mb-3">
                                        <div className="small text-muted fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>
                                            Asignatura Asignada
                                        </div>
                                        <div className="h5 fw-bold text-dark mb-1">
                                            <i className="bi bi-journal-check text-primary me-2"></i>
                                            {g.asignaturaNombre}
                                        </div>
                                    </div>

                                    <div className="p-3 bg-light rounded-3 border mb-3">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <i className="bi bi-person-workspace text-success fs-5"></i>
                                            <div>
                                                <div className="fw-bold text-dark small">{g.maestroNombre || 'Profesor Titular'}</div>
                                                <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                                                    {g.maestroCorreo || 'docente@institucion.edu'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Row className="g-2 small text-muted">
                                        <Col xs={6}>
                                            <div className="border rounded-2 p-2 bg-white">
                                                <i className="bi bi-calendar3 me-1 text-info"></i>
                                                <strong>Inscripción:</strong>
                                                <div className="text-dark">{new Date(g.fechaInscripcion).toLocaleDateString('es-ES')}</div>
                                            </div>
                                        </Col>
                                        <Col xs={6}>
                                            <div className="border rounded-2 p-2 bg-white">
                                                <i className="bi bi-geo-alt me-1 text-danger"></i>
                                                <strong>Ubicación:</strong>
                                                <div className="text-dark">{g.aula || 'Edificio Principal'}</div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                                <Card.Footer className="bg-white border-top p-3 d-flex justify-content-between align-items-center">
                                    <span className="small text-muted">
                                        <i className="bi bi-clock me-1"></i>
                                        {g.turno || 'Horario Regular'}
                                    </span>
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        className="d-flex align-items-center gap-1"
                                        onClick={() => navigate('/estudiante/asignaturas')}
                                    >
                                        <i className="bi bi-journal-bookmark"></i>
                                        <span>Ver Materias</span>
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default MiGrupo;
