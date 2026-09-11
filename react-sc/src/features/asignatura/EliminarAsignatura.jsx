import { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import clienteAPI from '../../api/clienteAxios'

function EliminarAsignatura({ show, asignatura, onCerrar, onAsignaturaEliminada }) {
  const [eliminando, setEliminando] = useState(false)
  const [errorServidor, setErrorServidor] = useState('')

  const manejarEliminar = async () => {
    if (!asignatura?.id) return

    setEliminando(true)
    setErrorServidor('')

    try {
      await clienteAPI.delete(`/Asignaturas/${asignatura.id}`)
      if (onAsignaturaEliminada) {
        onAsignaturaEliminada(asignatura.id)
      }
      onCerrar()
    } catch (error) {
      console.error('Error al eliminar asignatura:', error)
      const resp = error.response?.data
      let mensaje = 'No se pudo eliminar la asignatura. Verifica que el servidor esté activo o que no tenga registros vinculados.'

      if (resp?.title || resp?.message) {
        mensaje = resp.title || resp.message
      }

      setErrorServidor(mensaje)
    } finally {
      setEliminando(false)
    }
  }

  const manejarCerrar = () => {
    if (!eliminando) {
      setErrorServidor('')
      onCerrar()
    }
  }

  return (
    <Modal show={show} onHide={manejarCerrar} centered backdrop="static" size="md">
      <Modal.Header closeButton={!eliminando} className="border-0 pb-0">
        <Modal.Title className="h5 fw-bold text-dark d-flex align-items-center gap-2">
          <span className="bg-danger-subtle text-danger p-2 rounded-3 d-inline-flex">
            <i className="bi bi-trash3-fill fs-5"></i>
          </span>
          <span>¿Eliminar Asignatura?</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        <p className="text-muted small mb-3">
          ¿Estás seguro de que deseas eliminar la siguiente asignatura? Esta acción es permanente y no se puede deshacer.
        </p>

        {asignatura && (
          <div className="bg-light p-3 rounded-3 border mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="fw-semibold text-dark">{asignatura.nombre}</span>
              <span className="badge bg-secondary-subtle text-secondary">
                {asignatura.codigo}
              </span>
            </div>
            <div className="text-muted small">
              <i className="bi bi-award me-1"></i>
              {asignatura.creditos} {asignatura.creditos === 1 ? 'crédito' : 'créditos'}
            </div>
          </div>
        )}

        {errorServidor && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-0 small" role="alert">
            <i className="bi bi-exclamation-triangle-fill fs-5 flex-shrink-0"></i>
            <div>{errorServidor}</div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0 pb-3">
        <button
          type="button"
          className="button button--secondary btn-sm"
          onClick={manejarCerrar}
          disabled={eliminando}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm px-3"
          onClick={manejarEliminar}
          disabled={eliminando}
        >
          {eliminando ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Eliminando...
            </>
          ) : (
            <>
              <i className="bi bi-trash me-1"></i>
              Sí, eliminar
            </>
          )}
        </button>
      </Modal.Footer>
    </Modal>
  )
}

export default EliminarAsignatura
