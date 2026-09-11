using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SC_API.Entidades
{
    public class Grupo
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string NombreGrupo { get; set; } // Ejemplo: "101-A"

        [Required]
        [MaxLength(50)]
        public string Periodo { get; set; } // Ejemplo: "2026-2"

        [Required]
        public int AsignaturaId { get; set; }

        [Required]
        public int MaestroId { get; set; }

        // Propiedades de navegación
        [ForeignKey("AsignaturaId")]
        public virtual Asignatura Asignatura { get; set; }

        [ForeignKey("MaestroId")]
        public virtual Usuario Maestro { get; set; }

        public virtual ICollection<Inscripcion> Inscripciones { get; set; } = new List<Inscripcion>();
        public virtual ICollection<Actividad> Actividades { get; set; } = new List<Actividad>();
    }
}
