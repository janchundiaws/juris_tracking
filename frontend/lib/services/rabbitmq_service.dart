import 'dart:convert';
import 'package:frontend/parameters.dart';
import 'package:http/http.dart' as http;

class RabbitMQService {
  // Obtener mensajes de RabbitMQ
  Future<Map<String, dynamic>> getMensajes({int limit = 20}) async {
    try {
      final uri = Uri.parse('$baseUrl/rabbitmq/mensajes?limit=$limit');
      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': 'Error al obtener mensajes'};
      }
    } catch (e) {
      print('Error getMensajes: $e');
      return {'success': false, 'error': 'Error de conexión: $e'};
    }
  }

  // Obtener estadísticas de mensajes
  Future<Map<String, dynamic>> getStats() async {
    try {
      final uri = Uri.parse('$baseUrl/rabbitmq/mensajes/stats');
      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': 'Error al obtener estadísticas'};
      }
    } catch (e) {
      print('Error getStats: $e');
      return {'success': false, 'error': 'Error de conexión: $e'};
    }
  }

  // Limpiar mensajes
  Future<Map<String, dynamic>> limpiarMensajes() async {
    try {
      final uri = Uri.parse('$baseUrl/rabbitmq/mensajes');
      final response = await http.delete(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return {'success': true, 'message': 'Mensajes limpiados'};
      } else {
        return {'success': false, 'error': 'Error al limpiar mensajes'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Error de conexión: $e'};
    }
  }
}
