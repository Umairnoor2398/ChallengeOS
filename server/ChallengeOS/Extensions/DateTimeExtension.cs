namespace ChallengeOS.Extensions
{
    public static class DateTimeExtension
    {
        public static string ToStandardDateTimeString(this DateTime datetime)
        {
            return datetime.ToString("yyyy-MM-dd HH:mm:ss");
        }
    }
}
