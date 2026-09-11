import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Badge } from 'react-bootstrap';

export const NavigationToolbar = ({ 
    sidebarOpen, 
    setSidebarOpen, 
    dashboardPath = '/', 
    title = '',
    roleName = '' 
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isAtDashboard = location.pathname === dashboardPath;

    return (
        <div className="global-nav-toolbar d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
            <div className="d-flex align-items-center gap-2 flex-wrap">
                {/* Botón para Ocultar / Mostrar menú lateral */}
                {setSidebarOpen && (
                    <Button 
                        variant={sidebarOpen ? "light" : "primary"} 
                        size="sm" 
                        className="d-flex align-items-center gap-1 fw-medium border shadow-xs"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        title={sidebarOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
                    >
                        <i className={`bi ${sidebarOpen ? 'bi-layout-sidebar-inset' : 'bi-layout-sidebar'}`}></i>
                        <span className="d-none d-sm-inline">
                            {sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
                        </span>
                    </Button>
                )}

                {/* Botón Volver Atrás e Inicio: Solo se muestran cuando NO se está en el Dashboard */}
                {!isAtDashboard && (
                    <>
                        <span className="text-muted opacity-50">|</span>
                        <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="d-flex align-items-center gap-1 fw-medium shadow-xs"
                            onClick={() => navigate(-1)}
                            title="Regresar a la pantalla anterior"
                        >
                            <i className="bi bi-arrow-left"></i>
                            <span>Volver atrás</span>
                        </Button>

                        <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="d-flex align-items-center gap-1 fw-medium shadow-xs"
                            onClick={() => navigate(dashboardPath)}
                            title="Ir al panel principal"
                        >
                            <i className="bi bi-house-door-fill"></i>
                            <span>Inicio</span>
                        </Button>
                    </>
                )}
            </div>

            {/* Información contextual o ruta actual */}
            <div className="d-flex align-items-center gap-2 ms-auto">
                {title && (
                    <span className="text-secondary small fw-semibold d-none d-md-inline">
                        <i className="bi bi-geo-alt-fill text-primary me-1"></i>
                        {title}
                    </span>
                )}
                {roleName && (
                    <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1">
                        {roleName}
                    </Badge>
                )}
            </div>
        </div>
    );
};

export default NavigationToolbar;
