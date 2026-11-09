namespace LeetAlgo.Tools;

public static class PasswordInput
{
    public static string Read()
    {
        string password = "";
        while (true)
        {
            ConsoleKeyInfo key = Console.ReadKey(intercept: true);
            if (key.Key == ConsoleKey.Enter)
            {
                Console.WriteLine();
                return password;
            }

            if (key.Key == ConsoleKey.Backspace)
            {
                if (password.Length > 0)
                {
                    password = password.Substring(0, password.Length - 1);
                }
            }
            else
            {
                password += key.KeyChar;
            }
        }
    }
}
