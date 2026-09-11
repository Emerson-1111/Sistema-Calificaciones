using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SC_API.Entidades
{
    public class Inscripcion
    {
        [Key]
        public int Id { get; set; }

        public DateTime FechaInscripcion { get; set; } = DateTime.UtcNow;

        [Required]
        public int EstudianteId { get; set; }

        [Required]
        public int GrupoId { get; set; }

        // Propiedades de navegación
        [ForeignKey("EstudianteId")]
        public virtual Usuario Estudiante { get; set; }

        [ForeignKey("GrupoId")]
        public virtual Grupo Grupo { get; set; }
    }
}
