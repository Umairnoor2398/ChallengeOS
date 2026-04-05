using System;
using System.Collections.Generic;
using ChallengeOS.Data;
using Microsoft.EntityFrameworkCore;

namespace ChallengeOS.DbModels;

public partial class ChallengeOsDbContext : DbContext
{
    public ChallengeOsDbContext()
    {
    }

    public ChallengeOsDbContext(DbContextOptions<ChallengeOsDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ChallengeGroup> ChallengeGroups { get; set; }

    public virtual DbSet<ChallengeTaskSubmission> ChallengeTaskSubmissions { get; set; }

    public virtual DbSet<ChallengeTaskTestCase> ChallengeTaskTestCases { get; set; }

    public virtual DbSet<ChallengeUnitTask> ChallengeUnitTasks { get; set; }

    public virtual DbSet<Log> Logs { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<TeamSubmissionLog> TeamSubmissionLogs { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseLazyLoadingProxies();
        optionsBuilder.UseSqlServer(DbSeeder.ConnectionString);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ChallengeGroup>(entity =>
        {
            entity.ToTable("ChallengeGroup");

            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(256)
                .IsUnicode(false);
            entity.Property(e => e.EndingTime).HasColumnType("datetime");
            entity.Property(e => e.IsActive).HasColumnName("isActive");
            entity.Property(e => e.Name).HasMaxLength(256);
            entity.Property(e => e.StartingTime).HasColumnType("datetime");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.ChallengeGroups)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ChallengeGroup_User");
        });

        modelBuilder.Entity<ChallengeTaskSubmission>(entity =>
        {
            entity.ToTable("ChallengeTaskSubmission");

            entity.Property(e => e.ChallengeId).HasMaxLength(256);
            entity.Property(e => e.Language)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.SubmittedAt).HasColumnType("datetime");
            entity.Property(e => e.UserId)
                .HasMaxLength(256)
                .IsUnicode(false);
            entity.Property(e => e.Version)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.Challenge).WithMany(p => p.ChallengeTaskSubmissions)
                .HasForeignKey(d => d.ChallengeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ChallengeTaskSubmission_ChallengeUnitTask");

            entity.HasOne(d => d.User).WithMany(p => p.ChallengeTaskSubmissions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ChallengeTaskSubmission_User");
        });

        modelBuilder.Entity<ChallengeTaskTestCase>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Challeng__3214EC07D39B8414");

            entity.ToTable("ChallengeTaskTestCase");

            entity.Property(e => e.Id).HasMaxLength(256);
            entity.Property(e => e.ChallengeUnitTaskId).HasMaxLength(256);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(256)
                .IsUnicode(false);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.MatchCase).HasDefaultValue(true);

            entity.HasOne(d => d.ChallengeUnitTask).WithMany(p => p.ChallengeTaskTestCases)
                .HasForeignKey(d => d.ChallengeUnitTaskId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Challenge__Chall__0D7A0286");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.ChallengeTaskTestCases)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ChallengeTaskTestCase_ChallengeTaskTestCase");
        });

        modelBuilder.Entity<ChallengeUnitTask>(entity =>
        {
            entity.ToTable("ChallengeUnitTask");

            entity.Property(e => e.Id).HasMaxLength(256);
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(256)
                .IsUnicode(false);
            entity.Property(e => e.IsActive).HasColumnName("isActive");
            entity.Property(e => e.MaxMarks).HasDefaultValue(1);
            entity.Property(e => e.Name).HasMaxLength(256);

            entity.HasOne(d => d.ChallengeGroup).WithMany(p => p.ChallengeUnitTasks)
                .HasForeignKey(d => d.ChallengeGroupId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ChallengeUnitTask_ChallengeGroup");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.ChallengeUnitTasks)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ChallengeUnitTask_User");
        });

        modelBuilder.Entity<Log>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Logs__3214EC0754925698");

            entity.Property(e => e.Level).HasMaxLength(128);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("Role");

            entity.Property(e => e.Value)
                .HasMaxLength(256)
                .IsUnicode(false);
        });

        modelBuilder.Entity<TeamSubmissionLog>(entity =>
        {
            entity.ToTable("TeamSubmissionLog");

            entity.Property(e => e.Status)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.SubmittedAt).HasColumnType("datetime");
            entity.Property(e => e.SubmittedBy)
                .HasMaxLength(256)
                .IsUnicode(false);
            entity.Property(e => e.TaskId).HasMaxLength(256);

            entity.HasOne(d => d.SubmittedByNavigation).WithMany(p => p.TeamSubmissionLogs)
                .HasForeignKey(d => d.SubmittedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TeamSubmissionLog_User");

            entity.HasOne(d => d.Task).WithMany(p => p.TeamSubmissionLogs)
                .HasForeignKey(d => d.TaskId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TeamSubmissionLog_ChallengeUnitTask");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("User");

            entity.Property(e => e.Id)
                .HasMaxLength(256)
                .IsUnicode(false);
            entity.Property(e => e.Contact).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(256)
                .IsUnicode(false);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.IsActive).HasColumnName("isActive");
            entity.Property(e => e.Name).HasMaxLength(256);
            entity.Property(e => e.Password).HasMaxLength(256);
            entity.Property(e => e.Prefix).HasMaxLength(50);
            entity.Property(e => e.Username).HasMaxLength(256);

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.InverseCreatedByNavigation)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK_User_User");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_User_Role");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
