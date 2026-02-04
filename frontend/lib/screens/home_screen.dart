import 'dart:async';
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/rabbitmq_service.dart';
import '../utils/menu.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _authService = AuthService();
  final _rabbitmqService = RabbitMQService();
  Map<String, String?> _userData = {};
  bool _isLoading = true;
  List<dynamic> _mensajesRabbitMQ = [];
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _loadMensajesRabbitMQ();
    // Actualizar mensajes cada 5 segundos
    _timer = Timer.periodic(const Duration(seconds: 5), (_) {
      _loadMensajesRabbitMQ();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _loadUserData() async {
    final data = await _authService.getUserData();
    setState(() {
      _userData = data;
      _isLoading = false;
    });
  }

  Future<void> _loadMensajesRabbitMQ() async {
    final result = await _rabbitmqService.getMensajes(limit: 20);
    if (result['success'] == true && mounted) {
      setState(() {
        _mensajesRabbitMQ = result['data']['mensajes'] ?? [];
      });
    }
  }

  Future<void> _logout() async {
    final shouldLogout = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Cerrar Sesión'),
          content: const Text('¿Estás seguro de que deseas cerrar sesión?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancelar'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              style: TextButton.styleFrom(
                foregroundColor: Colors.red,
              ),
              child: const Text('Cerrar Sesión'),
            ),
          ],
        );
      },
    );

    if (shouldLogout == true) {
      await _authService.logout();
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final isSmallScreen = size.width < 600;
    final isMediumScreen = size.width >= 600 && size.width < 1200;

    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('JurisTracking'),
        backgroundColor: Colors.blue.shade700,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          if (!isSmallScreen)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Center(
                child: Text(
                  _userData['nombre'] ?? 'Usuario',
                  style: const TextStyle(fontSize: 16),
                ),
              ),
            ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
            tooltip: 'Cerrar Sesión',
          ),
        ],
      ),
      drawer: isSmallScreen ? AppMenu.buildDrawer(_userData) : null,
      body: Row(
        children: [
          if (!isSmallScreen) AppMenu.buildSideMenu(),
          Expanded(
            child: _buildMainContent(isSmallScreen, isMediumScreen),
          ),
        ],
      ),
    );
  }

  Widget _buildMainContent(bool isSmallScreen, bool isMediumScreen) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(isSmallScreen ? 16 : 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header con saludo
          _buildWelcomeCard(),
          const SizedBox(height: 24),

          // Estadísticas
          _buildStatsGrid(isSmallScreen, isMediumScreen),
          const SizedBox(height: 24),

          // Casos Recientes
          _buildRecentCases(),
          const SizedBox(height: 24),

          // Mensajes RabbitMQ
          _buildMensajesRabbitMQ(),
          const SizedBox(height: 24),

        ],
      ),
    );
  }

  Widget _buildWelcomeCard() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.blue.shade700, Colors.blue.shade500],
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '¡Bienvenido, ${_userData['nombre']?.split(' ').first ?? 'Usuario'}!',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Rol: ${_userData['rol']?.toUpperCase() ?? 'USUARIO'}',
                    style: const TextStyle(
                      fontSize: 16,
                      color: Colors.white70,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.gavel,
              size: 64,
              color: Colors.white38,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsGrid(bool isSmallScreen, bool isMediumScreen) {
    final crossAxisCount = isSmallScreen ? 2 : (isMediumScreen ? 3 : 8);

    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: crossAxisCount,
      crossAxisSpacing: 5,
      mainAxisSpacing: 5,
      children: [
        _buildStatCard(
          'Casos Activos',
          '12',
          Icons.folder_open,
          Colors.blue,
        ),
        _buildStatCard(
          'Casos Cerrados',
          '45',
          Icons.folder,
          Colors.green,
        ),
        _buildStatCard(
          'Audiencias Próximas',
          '3',
          Icons.calendar_today,
          Colors.orange,
        ),
        _buildStatCard(
          'Documentos',
          '127',
          Icons.description,
          Colors.purple,
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 32, color: color),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentCases() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Casos Recientes',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 16),
        Card(
          elevation: 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: 5,
            separatorBuilder: (_, __) => const Divider(),
            itemBuilder: (context, index) {
              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.blue.shade100,
                  child: Icon(Icons.folder_open, color: Colors.blue.shade700),
                ),
                title: Text('Caso #${1000 + index}'),
                subtitle: Text('Demanda civil - En proceso'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {},
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildMensajesRabbitMQ() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Mensajes de RabbitMQ',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.green.shade100,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.circle, size: 8, color: Colors.green.shade700),
                      const SizedBox(width: 6),
                      Text(
                        '${_mensajesRabbitMQ.length} mensajes',
                        style: TextStyle(
                          color: Colors.green.shade700,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: _loadMensajesRabbitMQ,
                  tooltip: 'Actualizar mensajes',
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),
        Card(
          elevation: 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: _mensajesRabbitMQ.isEmpty
              ? const Padding(
                  padding: EdgeInsets.all(32),
                  child: Center(
                    child: Column(
                      children: [
                        Icon(Icons.inbox, size: 48, color: Colors.grey),
                        SizedBox(height: 16),
                        Text(
                          'No hay mensajes de RabbitMQ',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                )
              : ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _mensajesRabbitMQ.length > 10 ? 10 : _mensajesRabbitMQ.length,
                  separatorBuilder: (_, __) => const Divider(),
                  itemBuilder: (context, index) {
                    final mensaje = _mensajesRabbitMQ[index];
                    final evento = mensaje['event'] ?? {};
                    final data = mensaje['data'] ?? {};
                    final timestamp = mensaje['timestamp'] ?? '';

                    // Determinar el icono y color según el tipo de evento
                    IconData iconData;
                    Color color;
                    switch (evento) {
                      case 'usuario.creado':
                        iconData = Icons.person_add;
                        color = Colors.green;
                        break;
                      case 'usuario.actualizado':
                        iconData = Icons.edit;
                        color = Colors.blue;
                        break;
                      case 'usuario.eliminado':
                        iconData = Icons.person_remove;
                        color = Colors.red;
                        break;
                      default:
                        iconData = Icons.message;
                        color = Colors.grey;
                    }

                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: color.withOpacity(0.2),
                        child: Icon(iconData, color: color),
                      ),
                      title: Text(
                        _getTituloEvento(evento),
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (data['nombre'] != null)
                            Text('Usuario: ${data['nombre']}'),
                          if (data['email'] != null)
                            Text('Email: ${data['email']}'),
                          Text(
                            _formatearFecha(timestamp),
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                      isThreeLine: true,
                      trailing: Icon(Icons.chevron_right, color: Colors.grey.shade400),
                      onTap: () {
                        _mostrarDetallesMensaje(mensaje);
                      },
                    );
                  },
                ),
        ),
      ],
    );
  }

  String _getTituloEvento(String tipo) {
    switch (tipo) {
      case 'usuario.creado':
        return 'Nuevo usuario registrado';
      case 'usuario.actualizado':
        return 'Usuario actualizado';
      case 'usuario.eliminado':
        return 'Usuario eliminado';
      default:
        return 'Evento: $tipo';
    }
  }

  String _formatearFecha(String timestamp) {
    if (timestamp.isEmpty) return '';
    try {
      final date = DateTime.parse(timestamp);
      final now = DateTime.now();
      final difference = now.difference(date);

      if (difference.inMinutes < 1) {
        return 'Hace un momento';
      } else if (difference.inHours < 1) {
        return 'Hace ${difference.inMinutes} minutos';
      } else if (difference.inDays < 1) {
        return 'Hace ${difference.inHours} horas';
      } else {
        return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
      }
    } catch (e) {
      return timestamp;
    }
  }

  void _mostrarDetallesMensaje(Map<String, dynamic> mensaje) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Detalles del Mensaje'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Evento:',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              Text(mensaje['evento']['tipo'] ?? 'N/A'),
              const SizedBox(height: 16),
              Text(
                'Timestamp:',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              Text(_formatearFecha(mensaje['timestamp'] ?? '')),
              const SizedBox(height: 16),
              Text(
                'Datos del Usuario:',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              if (mensaje['evento']['usuario'] != null) ...[
                Text('Nombre: ${mensaje['evento']['usuario']['nombre'] ?? 'N/A'}'),
                Text('Email: ${mensaje['evento']['usuario']['email'] ?? 'N/A'}'),
                Text('Rol: ${mensaje['evento']['usuario']['rol'] ?? 'N/A'}'),
                Text('ID: ${mensaje['evento']['usuario']['id'] ?? 'N/A'}'),
              ],
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }
}
