// Gestionnaire de notifications
class NotificationManager {
  constructor() {
    this.notifications = [];
    this.listeners = [];
  }

  // Ajouter une nouvelle notification
  addNotification(notification) {
    const newNotification = {
      id: Date.now(),
      timestamp: Date.now(),
      read: false,
      ...notification
    };
    
    this.notifications.unshift(newNotification);
    this.notifyListeners();
    return newNotification;
  }

  // Marquer une notification comme lue
  markAsRead(notificationId) {
    if (notificationId === 'all') {
      this.notifications = this.notifications.map(notif => ({
        ...notif,
        read: true
      }));
    } else {
      this.notifications = this.notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
    }
    
    this.notifyListeners();
  }

  // Obtenir toutes les notifications
  getNotifications() {
    return this.notifications;
  }

  // Obtenir le nombre de notifications non lues
  getUnreadCount() {
    return this.notifications.filter(notif => !notif.read).length;
  }

  // S'abonner aux changements
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notifier tous les abonnés
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  // Créer une notification pour un nouveau produit
  notifyNewProduct(product) {
    return this.addNotification({
      type: 'product',
      message: `Nouveau produit ajouté : ${product.name}`,
      data: product
    });
  }

  // Créer une notification pour une certification
  notifyCertification(product) {
    return this.addNotification({
      type: 'certification',
      message: `Produit certifié : ${product.name}`,
      data: product
    });
  }

  // Créer une notification pour une action admin
  notifyAdminAction(action, target) {
    return this.addNotification({
      type: 'admin',
      message: `Action administrative : ${action} - ${target}`,
      data: { action, target }
    });
  }
}

// Créer une instance unique du gestionnaire
export const notificationManager = new NotificationManager();

export default notificationManager;