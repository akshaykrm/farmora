class Urls {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://hortense-pseudoamatory-crawly.ngrok-free.dev/',
  );
  static String loginUrl = "api/auth/login";
  static String signUp = "api/auth/signup";
  static String packages = "api/packages";
}
