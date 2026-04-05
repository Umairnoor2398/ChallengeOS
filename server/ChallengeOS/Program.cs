
using ChallengeOS.Data;
using ChallengeOS.DbModels;
using ChallengeOS.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.MSSqlServer;
using System.Text;
using Log = Serilog.Log;


namespace ChallengeOS
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

            DbSeeder.ConnectionString = connectionString;

            builder.Services.AddDbContext<ChallengeOsDbContext>(options => options.UseSqlServer(connectionString));


            // Serilog configuration
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Error()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Error)
                .Enrich.FromLogContext()
                .WriteTo.Console()
                .WriteTo.MSSqlServer(
                    connectionString: connectionString,
                    sinkOptions: new MSSqlServerSinkOptions { TableName = "Logs" },
                    restrictedToMinimumLevel: LogEventLevel.Error
                )
                .CreateLogger();

            builder.Host.UseSerilog();


            // Read JWT settings from appsettings.json
            var jwtSettings = builder.Configuration.GetSection("JwtSettings");

            builder.Services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false; // Set true for production
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    RequireExpirationTime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["Issuer"],  // Fetch from appsettings
                    ValidAudience = jwtSettings["Audience"],  // Fetch from appsettings
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"])),  // Fetch from appsettings
                    ClockSkew = TimeSpan.Zero
                };

                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        // Log error or set additional details
                        Console.WriteLine("Authentication failed: " + context.Exception.Message);
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        // Log validation success or perform extra checks
                        //Console.WriteLine("Token validated");
                        return Task.CompletedTask;
                    }
                };

            });

            // Other services...
            builder.Services.AddAuthorization();

            builder.Services.AddControllers();

            // Add services to the container.
            builder.Services.AddControllers(options =>
            {
                // Set the global route prefix here
                options.Conventions.Add(new RoutePrefixConvention("api/v1"));
            });

            //builder.Services.Configure<EmailSettings>(hostContext.Configuration.GetSection("EmailSettings"));

            builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
            builder.Services.AddSingleton<IEmailService, EmailService>();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });


            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
            }
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                //c.SwaggerEndpoint("/swagger/v1/swagger.json", "ChallengeOS API V1");
                //c.RoutePrefix = string.Empty;
            });

            app.UseHttpsRedirection();

            app.UseCors("AllowAll");

            app.UseAuthentication();
            app.UseRouting();
            app.UseAuthorization();

            app.MapControllers();

            using (var scope = app.Services.CreateScope())
            {
                await DbSeeder.SeedData(scope.ServiceProvider);
            }

            try
            {
                Log.Information("Starting web host");
                app.Run();
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Host terminated unexpectedly");
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }
    }
}
