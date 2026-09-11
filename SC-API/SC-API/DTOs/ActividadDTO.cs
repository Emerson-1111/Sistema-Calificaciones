namespace SC_API.DTOs
{
    public class ActividadDTO
    {
        public int Id { get; set; }
        public string Titulo { get; set; }
        public string Descripcion { get; set; }
        public decimal ValorMaximo { get; set; }
        public DateTime FechaEntrega { get; set; }
        public int GrupoId { get; set; }
    }
}
