import 'dart:convert';
import 'package:frontend/parameters.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  // Registrar usuario
  Future<Map<String, dynamic>> registro({
    required String nombre,
    required String email,
    required String password,
    String rol = 'usuario',
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/usuarios/registro'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'nombre': nombre,
          'email': email,
          'password': password,
          'rol': rol,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        // Guardar token
        await _saveToken(data['token']);
        await _saveUserData(data['usuario']);
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Error al registrar'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Error de conexión: $e'};
    }
  }

  // Login
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/usuarios/login');
      final body = json.encode({'email': email, 'password': password});
      final response = await http
          .post(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: body,
          )
          .timeout(const Duration(seconds: 15));
      
      final data = json.decode(response.body);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        // Guardar token y datos del usuario
        await _saveToken(data['token']);
        await _saveUserData(data['usuario']);
        return {'success': true, 'data': data};
      } else {
        print(response.reasonPhrase);
        return {'success': false, 'error': data['error'] ?? 'Credenciales inválidas'};
      }
    } catch (e) {
      print(e);
      return {'success': false, 'error': 'Error de conexión: $e'};
    }
  }

  // Guardar token
  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  // Guardar datos del usuario
  Future<void> _saveUserData(Map<String, dynamic> usuario) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('userId', usuario['id'].toString());
    await prefs.setString('userName', usuario['nombre'].toString());
    await prefs.setString('userEmail', usuario['email'].toString());
    await prefs.setString('userRol', usuario['rol'].toString());
  }

  // Obtener token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // Obtener datos del usuario
  Future<Map<String, String?>> getUserData() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      'id': prefs.getString('userId'),
      'nombre': prefs.getString('userName'),
      'email': prefs.getString('userEmail'),
      'rol': prefs.getString('userRol'),
    };
  }

  // Verificar si está autenticado
  Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // Cerrar sesión
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}
