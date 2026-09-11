using Microsoft.EntityFrameworkCore;
using SC_API.Entidades;

namespace SC_API
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Rol> Roles { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Asignatura> Asignaturas { get; set; }
        public DbSet<Grupo> Grupos { get; set; }
        public DbSet<Inscripcion> Inscripciones { get; set; }
        public DbSet<Actividad> Actividades { get; set; }
        public DbSet<Calificacion> Calificaciones { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configurar relación Maestro -> Grupo (Evitar borrado en cascada)
            modelBuilder.Entity<Grupo>()
                .HasOne(g => g.Maestro)
                .WithMany(u => u.GruposImpartidos)
                .HasForeignKey(g => g.MaestroId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configurar relación Estudiante -> Inscripcion (Evitar borrado en cascada)
            modelBuilder.Entity<Inscripcion>()
                .HasOne(i => i.Estudiante)
                .WithMany(u => u.Inscripciones)
                .HasForeignKey(i => i.EstudianteId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configurar relación Estudiante -> Calificacion (Evitar borrado en cascada)
            modelBuilder.Entity<Calificacion>()
                .HasOne(c => c.Estudiante)
                .WithMany(u => u.Calificaciones)
                .HasForeignKey(c => c.EstudianteId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
