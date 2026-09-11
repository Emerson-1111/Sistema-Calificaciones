using System.ComponentModel.DataAnnotations;

namespace SC_API.DTOs
{
    public class AsignaturaCreacionDTO
    {
        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; }

        [Required]
        [MaxLength(20)]
        public string Codigo { get; set; }

        public int Creditos { get; set; }
    }
}
