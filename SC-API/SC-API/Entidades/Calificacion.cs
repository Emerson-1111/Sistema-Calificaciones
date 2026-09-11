using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SC_API.Entidades
{
    public class Calificacion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal PuntuacionObtenida { get; set; }

        public string ComentariosRetroalimentacion { get; set; }

        [Required]
        public int ActividadId { get; set; }

        [Required]
        public int EstudianteId { get; set; }

        // Propiedades de navegación
        [ForeignKey("ActividadId")]
        public virtual Actividad Actividad { get; set; }

        [ForeignKey("EstudianteId")]
        public virtual Usuario Estudiante { get; set; }
    }
}
