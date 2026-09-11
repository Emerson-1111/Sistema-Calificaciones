using System.ComponentModel.DataAnnotations;

namespace SC_API.DTOs
{
    public class UsuarioCreacionDTO
    {
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
    }
}
