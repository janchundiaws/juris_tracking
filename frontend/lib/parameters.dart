import 'package:flutter/foundation.dart' show kIsWeb;

// URL base de la API
String get baseUrl {
  if (kIsWeb) {
    // Para Flutter Web
    return 'http://localhost:3003/api';
  }
  
  // iOS simulator y otras plataformas
  return 'http://10.0.2.2:3003/api';
}