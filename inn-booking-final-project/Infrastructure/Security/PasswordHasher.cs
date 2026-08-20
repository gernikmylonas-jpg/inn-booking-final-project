using System.Security.Cryptography;

namespace inn_booking_final_project.Infrastructure.Security;

// Simple PBKDF2 password hashing using only the .NET base class library --
// no extra NuGet package required (unlike ASP.NET Core Identity's hasher).
public static class PasswordHasher
{
	private const int SaltSizeBytes = 16;
	private const int KeySizeBytes = 32;
	private const int Iterations = 100_000;

	public static string Hash(string password)
	{
		var salt = RandomNumberGenerator.GetBytes(SaltSizeBytes);
		var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, KeySizeBytes);
		return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
	}

	public static bool Verify(string password, string storedHash)
	{
		var parts = storedHash.Split('.');
		if (parts.Length != 2)
		{
			return false;
		}

		var salt = Convert.FromBase64String(parts[0]);
		var expectedHash = Convert.FromBase64String(parts[1]);
		var actualHash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, KeySizeBytes);

		return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
	}
}