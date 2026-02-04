import 'package:flutter/material.dart';

class AppMenu {
  // Construcción del Drawer para pantallas pequeñas
  static Widget buildDrawer(Map<String, String?> userData) {
    return Drawer(
      child: Column(
        children: [
          UserAccountsDrawerHeader(
            decoration: BoxDecoration(
              color: Colors.blue.shade700,
            ),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: Text(
                userData['nombre']?.substring(0, 1).toUpperCase() ?? 'U',
                style: TextStyle(
                  fontSize: 32,
                  color: Colors.blue.shade700,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            accountName: Text(userData['nombre'] ?? 'Usuario'),
            accountEmail: Text(userData['email'] ?? ''),
          ),
          Expanded(child: buildMenuItems()),
        ],
      ),
    );
  }

  // Items del menú
  static Widget buildMenuItems() {
    return ListView(
      padding: EdgeInsets.zero,
      children: [
        buildMenuItem(
          icon: Icons.dashboard,
          title: 'Dashboard',
          onTap: () {},
        ),
        buildMenuItem(
          icon: Icons.folder_open,
          title: 'Mis Casos',
          onTap: () {},
        ),
        buildMenuItem(
          icon: Icons.add_circle_outline,
          title: 'Nuevo Caso',
          onTap: () {},
        ),
        buildMenuItem(
          icon: Icons.calendar_today,
          title: 'Calendario',
          onTap: () {},
        ),
        buildMenuItem(
          icon: Icons.description,
          title: 'Documentos',
          onTap: () {},
        ),
        buildMenuItem(
          icon: Icons.notifications,
          title: 'Notificaciones',
          badge: '5',
          onTap: () {},
        ),
        const Divider(),
        buildMenuItem(
          icon: Icons.settings,
          title: 'Configuración',
          onTap: () {},
        ),
      ],
    );
  }

  // Item individual del menú
  static Widget buildMenuItem({
    required IconData icon,
    required String title,
    String? badge,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: Colors.blue.shade700),
      title: Text(title),
      trailing: badge != null
          ? CircleAvatar(
              radius: 12,
              backgroundColor: Colors.red,
              child: Text(
                badge,
                style: const TextStyle(color: Colors.white, fontSize: 10),
              ),
            )
          : null,
      onTap: onTap,
    );
  }

  // Contenedor del menú lateral para pantallas grandes
  static Widget buildSideMenu() {
    return Container(
      width: 250,
      color: Colors.blue.shade50,
      child: buildMenuItems(),
    );
  }
}
