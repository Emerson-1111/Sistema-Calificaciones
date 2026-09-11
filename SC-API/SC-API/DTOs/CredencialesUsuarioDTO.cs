using System.ComponentModel.DataAnnotations;

namespace SC_API.DTOs
{
    public class CredencialesUsuarioDTO
    {
        [Required]
        [EmailAddress]
        public string Correo { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
