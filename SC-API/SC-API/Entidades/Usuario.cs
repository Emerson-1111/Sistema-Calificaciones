using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SC_API.Entidades
{
    public class Usuario
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Correo { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        public int RolId { get; set; }

        // Propiedades de navegación
        [ForeignKey("RolId")]
        public virtual Rol Rol { get; set; }

        // Relaciones inversas dependiendo del rol
        public virtual ICollection<Grupo> GruposImpartidos { get; set; } = new List<Grupo>();
        public virtual ICollection<Inscripcion> Inscripciones { get; set; } = new List<Inscripcion>();
        public virtual ICollection<Calificacion> Calificaciones { get; set; } = new List<Calificacion>();
    }
}
