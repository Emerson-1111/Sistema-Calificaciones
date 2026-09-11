using System.ComponentModel.DataAnnotations;

namespace SC_API.Entidades
{
    public class Rol
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Nombre { get; set; } // Ejemplo: "Maestro", "Estudiante", "Admin"

        // Propiedad de navegación
        public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
    }
}
