using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SC_API.DTOs
{
    public class ActividadCreacionDTO
    {
        [Required]
        [MaxLength(150)]
        public string Titulo { get; set; }

        public string Descripcion { get; set; }

        [Required]
        public decimal ValorMaximo { get; set; }

        public DateTime FechaEntrega { get; set; }

        [Required]
        public int GrupoId { get; set; }
    }
}
