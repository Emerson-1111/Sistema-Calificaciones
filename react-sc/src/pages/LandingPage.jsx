function LandingPage({ onCrearAsignatura }) {
  return (
    <section className="page-shell">
      <header className="page-header">
        <p className="eyebrow">Sistema académico</p>
        <h1 className="page-title">Sistema de Calificaciones</h1>
        <p className="page-description">Gestiona la información académica desde un solo lugar. Selecciona un módulo para comenzar.</p>
      </header>
      <div className="navigation-grid">
        <article className="navigation-card navigation-card--active">
          <h2>Asignaturas</h2>
          <p>Registra las asignaturas que estarán disponibles en el sistema.</p>
          <button className="button" type="button" onClick={onCrearAsignatura}>Crear asignatura</button>
        </article>
        <article className="navigation-card navigation-card--active">
          <h2>Asignaturas</h2>
          <p>Registra las asignaturas que estarán disponibles en el sistema.</p>
          <button className="button" type="button" onClick={onCrearAsignatura}>Crear asignatura</button>
        </article>
        <article className="navigation-card navigation-card--active">
          <h2>Asignaturas</h2>
          <p>Registra las asignaturas que estarán disponibles en el sistema.</p>
          <button className="button" type="button" onClick={onCrearAsignatura}>Crear asignatura</button>
        </article>
        <article className="navigation-card navigation-card--active">
          <h2>Asignaturas</h2>
          <p>Registra las asignaturas que estarán disponibles en el sistema.</p>
          <button className="button" type="button" onClick={onCrearAsignatura}>Crear asignatura</button>
        </article>
        <article className="navigation-card navigation-card--active">
          <h2>Asignaturas</h2>
          <p>Registra las asignaturas que estarán disponibles en el sistema.</p>
          <button className="button" type="button" onClick={onCrearAsignatura}>Crear asignatura</button>
        </article>
      </div>
    </section>
  )
}

export default LandingPage
