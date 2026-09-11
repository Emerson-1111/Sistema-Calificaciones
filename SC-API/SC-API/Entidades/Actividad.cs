using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SC_API.Entidades
{
    public class Actividad
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Titulo { get; set; }

        public string Descripcion { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal ValorMaximo { get; set; }

        public DateTime FechaEntrega { get; set; }

        [Required]
        public int GrupoId { get; set; }

        // Propiedades de navegación
        [ForeignKey("GrupoId")]
        public virtual Grupo Grupo { get; set; }

        public virtual ICollection<Calificacion> Calificaciones { get; set; } = new List<Calificacion>();
    }
}
