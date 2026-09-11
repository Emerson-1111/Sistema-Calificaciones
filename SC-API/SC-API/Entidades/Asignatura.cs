using System.ComponentModel.DataAnnotations;

namespace SC_API.Entidades
{
    public class Asignatura
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; }

        [Required]
        [MaxLength(20)]
        public string Codigo { get; set; }

        public int Creditos { get; set; }

        // Propiedad de navegación
        public virtual ICollection<Grupo> Grupos { get; set; } = new List<Grupo>();
    }
}
