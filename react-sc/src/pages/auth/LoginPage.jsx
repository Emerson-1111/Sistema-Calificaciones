import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../../context/AuthContext';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';

export const LoginPage = () => {
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7137/api';
            const response = await axios.post(`${apiUrl}/auth/login`, { correo, password });
            const token = response.data.token;
            login(token);
            
            // Decodificar rol del token para redirección inmediata
            const decoded = jwtDecode(token);
            const role = (decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || '').toString().toLowerCase();
            const rolId = decoded.RolId ? parseInt(decoded.RolId, 10) : null;
            
            if (role === 'admin' || rolId === 1) {
                navigate('/admin', { replace: true });
            } else if (role === 'maestro' || rolId === 2) {
                navigate('/maestro', { replace: true });
            } else if (role === 'estudiante' || rolId === 3) {
                navigate('/estudiante', { replace: true });
            } else {
                navigate('/', { replace: true });
            }

        } catch (err) {
            console.error("Error en login", err);
            if (err.response && err.response.data) {
                setError(typeof err.response.data === 'string' ? err.response.data : 'Credenciales incorrectas');
            } else {
                setError('No se pudo conectar con el servidor. Verifica que la API esté corriendo.');
            }
        } finally {
            setCargando(false);
        }
    };

    const handleDemoLogin = (rolNombre, rolId, id, email) => {
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payload = btoa(JSON.stringify({
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": id.toString(),
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": email,
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": rolNombre,
            "RolId": rolId.toString(),
            "exp": Math.floor(Date.now() / 1000) + 7200
        }));
        const token = `${header}.${payload}.mockSignature`;
        login(token);
        if (rolNombre.toLowerCase() === 'admin' || rolId === 1) {
            navigate('/admin', { replace: true });
        } else if (rolNombre.toLowerCase() === 'maestro' || rolId === 2) {
            navigate('/maestro', { replace: true });
        } else if (rolNombre.toLowerCase() === 'estudiante' || rolId === 3) {
            navigate('/estudiante', { replace: true });
        } else {
            navigate('/', { replace: true });
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '85vh' }}>
            <Card className="shadow-lg border-0 rounded-4" style={{ width: '420px', maxWidth: '100%' }}>
                <Card.Body className="p-4 p-sm-5">
                    <div className="text-center mb-4">
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                            <i className="bi bi-mortarboard-fill fs-2"></i>
                        </div>
                        <h3 className="fw-bold text-dark mb-1">Iniciar Sesión</h3>
                        <p className="text-muted small">Sistema de Calificaciones Académico</p>
                    </div>

                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError('')} className="py-2 px-3 small d-flex align-items-center gap-2">
                            <i className="bi bi-exclamation-circle-fill fs-5 flex-shrink-0"></i>
                            <div>{error}</div>
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold text-secondary small">
                                Correo Electrónico
                            </Form.Label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="bi bi-envelope text-muted"></i>
                                </span>
                                <Form.Control 
                                    type="email" 
                                    className="border-start-0 ps-0"
                                    value={correo} 
                                    onChange={(e) => setCorreo(e.target.value)} 
                                    placeholder="ejemplo@correo.com"
                                    required 
                                    autoFocus
                                    disabled={cargando}
                                />
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold text-secondary small">
                                Contraseña
                            </Form.Label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="bi bi-lock text-muted"></i>
                                </span>
                                <Form.Control 
                                    type="password" 
                                    className="border-start-0 ps-0"
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="••••••••"
                                    required 
                                    disabled={cargando}
                                />
                            </div>
                        </Form.Group>

                        <Button 
                            variant="primary" 
                            type="submit" 
                            className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                            disabled={cargando}
                        >
                            {cargando ? (
                                <>
                                    <Spinner animation="border" size="sm" />
                                    <span>Verificando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Ingresar al Sistema</span>
                                    <i className="bi bi-box-arrow-in-right"></i>
                                </>
                            )}
                        </Button>
                    </Form>

                    <div className="mt-4 pt-3 border-top text-center">
                        <p className="text-muted small mb-2 fw-semibold">
                            <i className="bi bi-person-badge me-1 text-primary"></i>
                            Acceso Rápido por Rol
                        </p>
                        <div className="d-flex gap-2 flex-wrap">
                            <Button 
                                variant="outline-info" 
                                size="sm" 
                                className="flex-fill d-flex align-items-center justify-content-center gap-1 fw-medium text-dark shadow-xs"
                                onClick={() => handleDemoLogin('Estudiante', 3, 10, 'estudiante@colegio.edu')}
                            >
                                <i className="bi bi-mortarboard-fill text-info"></i>
                                <span>Estudiante</span>
                            </Button>
                            <Button 
                                variant="outline-success" 
                                size="sm" 
                                className="flex-fill d-flex align-items-center justify-content-center gap-1 fw-medium shadow-xs"
                                onClick={() => handleDemoLogin('Maestro', 2, 2, 'maestro@colegio.edu')}
                            >
                                <i className="bi bi-person-workspace"></i>
                                <span>Maestro</span>
                            </Button>
                            <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="flex-fill d-flex align-items-center justify-content-center gap-1 fw-medium shadow-xs"
                                onClick={() => handleDemoLogin('Admin', 1, 1, 'admin@colegio.edu')}
                            >
                                <i className="bi bi-shield-lock"></i>
                                <span>Admin</span>
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

