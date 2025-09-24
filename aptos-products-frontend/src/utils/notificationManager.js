// Gestionnaire de notifications
class NotificationManager {
  constructor() {
    this.notifications = [];
    this.listeners = [];
    this.initializeEventSource();
  }

  // Initialiser la source d'événements pour les notifications en temps réel
  initializeEventSource() {
    if (typeof window !== 'undefined') {
      // Écouter les événements de la blockchain
      window.aptos?.onAccountChanged(() => {
        this.checkNewTransactions();
      });
    }
  }

  // Vérifier les nouvelles transactions liées aux produits
  async checkNewTransactions() {
    try {
      // À implémenter : logique pour vérifier les nouvelles transactions
      // et créer des notifications appropriées
    } catch (error) {
      console.error('Erreur lors de la vérification des transactions:', error);
    }
  }

  // Ajouter une nouvelle notification
  addNotification(notification) {
    const newNotification = {
      id: Date.now(),
      timestamp: Date.now(),
      read: false,
      ...notification,
      type: notification.type || 'info'  // Ajouter le type de notification
    };
    
    // Ajouter le son de notification
    if (!newNotification.read && !notification.silent) {
      this.playNotificationSound();
    }
    
    this.notifications.unshift(newNotification);
    this.notifyListeners();
    return newNotification;
  }

  // Jouer un son de notification
  playNotificationSound() {
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch(e => console.log('Erreur lors de la lecture du son:', e));
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