import { PrismaClient, NotificationType, NotificationChannel } from '@prisma/client';

const prisma = new PrismaClient();

interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  data?: Record<string, any>;
}

class NotificationService {
  // Send notification to user
  async send(payload: NotificationPayload): Promise<void> {
    try {
      // Get user preferences
      const prefs = await prisma.notificationPreference.findUnique({
        where: { userId: payload.userId },
      });

      // Default to all channels if no preferences set
      const channels: NotificationChannel[] = ['IN_APP'];

      if (prefs) {
        if (prefs.smsEnabled && this.shouldSendSMS(payload.type, prefs)) {
          channels.push('SMS');
        }
        if (prefs.whatsappEnabled && this.shouldSendWhatsApp(payload.type, prefs)) {
          channels.push('WHATSAPP');
        }
        if (prefs.emailEnabled && this.shouldSendEmail(payload.type, prefs)) {
          channels.push('EMAIL');
        }
        if (prefs.pushEnabled) {
          channels.push('PUSH');
        }
      } else {
        // Default behavior without preferences
        if (this.isHighPriorityNotification(payload.type)) {
          channels.push('SMS', 'WHATSAPP');
        }
      }

      // Create notification record
      const notification = await prisma.notification.create({
        data: {
          userId: payload.userId,
          type: payload.type,
          title: payload.title,
          titleAr: payload.titleAr,
          message: payload.message,
          messageAr: payload.messageAr,
          data: payload.data,
          channel: channels,
        },
      });

      // Send to each channel asynchronously
      const sendPromises = channels.map(channel =>
        this.sendToChannel(channel, payload).catch(err => {
          console.error(`Failed to send to ${channel}:`, err);
        })
      );

      await Promise.allSettled(sendPromises);

      console.log(`Notification sent: ${payload.type} to user ${payload.userId} via ${channels.join(', ')}`);
    } catch (error) {
      console.error('Notification send error:', error);
      throw error;
    }
  }

  // Check if notification type requires SMS
  private shouldSendSMS(type: NotificationType, prefs: any): boolean {
    const smsTypes: NotificationType[] = [
      'ORDER_CONFIRMED',
      'ORDER_OUT_FOR_DELIVERY',
      'ORDER_DELIVERED',
      'SUBSCRIPTION_REMINDER',
    ];

    if (!prefs.orderUpdates && type.startsWith('ORDER_')) return false;
    if (!prefs.subscriptionReminders && type.startsWith('SUBSCRIPTION_')) return false;

    return smsTypes.includes(type);
  }

  // Check if notification type requires WhatsApp
  private shouldSendWhatsApp(type: NotificationType, prefs: any): boolean {
    const whatsappTypes: NotificationType[] = [
      'ORDER_CONFIRMED',
      'ORDER_OUT_FOR_DELIVERY',
      'DELIVERY_APPROACHING',
      'ORDER_DELIVERED',
      'QUALITY_REPORT_UPDATE',
      'CREDIT_AWARDED',
    ];

    if (!prefs.orderUpdates && type.startsWith('ORDER_')) return false;
    if (!prefs.deliveryAlerts && type === 'DELIVERY_APPROACHING') return false;

    return whatsappTypes.includes(type);
  }

  // Check if notification type requires Email
  private shouldSendEmail(type: NotificationType, prefs: any): boolean {
    const emailTypes: NotificationType[] = [
      'ORDER_CONFIRMED',
      'ORDER_DELIVERED',
      'SUBSCRIPTION_REMINDER',
      'CREDIT_AWARDED',
      'PROMOTION',
    ];

    if (!prefs.orderUpdates && type.startsWith('ORDER_')) return false;
    if (!prefs.promotions && type === 'PROMOTION') return false;
    if (!prefs.subscriptionReminders && type.startsWith('SUBSCRIPTION_')) return false;

    return emailTypes.includes(type);
  }

  // High priority notifications that should always be sent
  private isHighPriorityNotification(type: NotificationType): boolean {
    return [
      'ORDER_CONFIRMED',
      'ORDER_OUT_FOR_DELIVERY',
      'ORDER_DELIVERED',
      'DELIVERY_APPROACHING',
    ].includes(type);
  }

  // Send to specific channel
  private async sendToChannel(
    channel: NotificationChannel,
    payload: NotificationPayload
  ): Promise<void> {
    switch (channel) {
      case 'SMS':
        await this.sendSMS(payload);
        break;
      case 'WHATSAPP':
        await this.sendWhatsApp(payload);
        break;
      case 'EMAIL':
        await this.sendEmail(payload);
        break;
      case 'PUSH':
        await this.sendPush(payload);
        break;
      case 'IN_APP':
        // Already stored in database
        break;
    }
  }

  // SMS sending (placeholder - integrate with Tunisie Telecom)
  private async sendSMS(payload: NotificationPayload): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { phone: true, preferredLanguage: true },
    });

    if (!user?.phone) {
      console.log('No phone number for SMS');
      return;
    }

    const message = user.preferredLanguage === 'ar' ? payload.messageAr : payload.message;

    // TODO: Integrate with Tunisie Telecom SMS Gateway
    // Example: await tunisieTelecom.sendSMS(user.phone, message);
    console.log(`[SMS] To: ${user.phone}, Message: ${message}`);
  }

  // WhatsApp sending (placeholder - integrate with WhatsApp Business API)
  private async sendWhatsApp(payload: NotificationPayload): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { whatsappNumber: true, phone: true, preferredLanguage: true },
    });

    const whatsappNumber = user?.whatsappNumber || user?.phone;
    if (!whatsappNumber) {
      console.log('No WhatsApp number');
      return;
    }

    const message = user?.preferredLanguage === 'ar' ? payload.messageAr : payload.message;

    // TODO: Integrate with WhatsApp Business API
    // Example: await whatsappBusiness.sendMessage(whatsappNumber, message);
    console.log(`[WhatsApp] To: ${whatsappNumber}, Message: ${message}`);

    // Log WhatsApp message
    await prisma.whatsAppMessage.create({
      data: {
        userId: payload.userId,
        direction: 'OUTBOUND',
        messageType: 'TEXT',
        content: message,
        status: 'PENDING',
      },
    });
  }

  // Email sending (placeholder - integrate with email service)
  private async sendEmail(payload: NotificationPayload): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { email: true, name: true, preferredLanguage: true },
    });

    if (!user?.email) {
      console.log('No email address');
      return;
    }

    const subject = user.preferredLanguage === 'ar' ? payload.titleAr : payload.title;
    const body = user.preferredLanguage === 'ar' ? payload.messageAr : payload.message;

    // TODO: Integrate with email service (SendGrid, SES, etc.)
    // Example: await emailService.send({ to: user.email, subject, body });
    console.log(`[Email] To: ${user.email}, Subject: ${subject}`);
  }

  // Push notification (placeholder - integrate with FCM/APNS)
  private async sendPush(payload: NotificationPayload): Promise<void> {
    // TODO: Integrate with Firebase Cloud Messaging or Apple Push Notification Service
    console.log(`[Push] User: ${payload.userId}, Title: ${payload.title}`);
  }

  // Send order status notification
  async sendOrderStatusNotification(
    userId: string,
    orderId: string,
    orderNumber: string,
    status: string
  ): Promise<void> {
    const statusMessages: Record<string, { type: NotificationType; title: string; titleAr: string; message: string; messageAr: string }> = {
      CONFIRMED: {
        type: 'ORDER_CONFIRMED',
        title: 'Order Confirmed',
        titleAr: 'تم تأكيد الطلب',
        message: `Your order ${orderNumber} has been confirmed and is being prepared.`,
        messageAr: `تم تأكيد طلبك ${orderNumber} وجاري تحضيره.`,
      },
      PREPARING: {
        type: 'ORDER_PREPARING',
        title: 'Order Being Prepared',
        titleAr: 'جاري تحضير الطلب',
        message: `Your order ${orderNumber} is being prepared with fresh produce.`,
        messageAr: `جاري تحضير طلبك ${orderNumber} بمنتجات طازجة.`,
      },
      OUT_FOR_DELIVERY: {
        type: 'ORDER_OUT_FOR_DELIVERY',
        title: 'Out for Delivery',
        titleAr: 'في الطريق إليك',
        message: `Your order ${orderNumber} is on its way! Track your delivery in real-time.`,
        messageAr: `طلبك ${orderNumber} في الطريق إليك! تابع التوصيل مباشرة.`,
      },
      DELIVERED: {
        type: 'ORDER_DELIVERED',
        title: 'Order Delivered',
        titleAr: 'تم التوصيل',
        message: `Your order ${orderNumber} has been delivered. Enjoy your fresh produce!`,
        messageAr: `تم توصيل طلبك ${orderNumber}. استمتع بمنتجاتك الطازجة!`,
      },
      CANCELLED: {
        type: 'ORDER_CANCELLED',
        title: 'Order Cancelled',
        titleAr: 'تم إلغاء الطلب',
        message: `Your order ${orderNumber} has been cancelled.`,
        messageAr: `تم إلغاء طلبك ${orderNumber}.`,
      },
    };

    const notification = statusMessages[status];
    if (notification) {
      await this.send({
        userId,
        ...notification,
        data: { orderId, orderNumber, status },
      });
    }
  }

  // Send subscription reminder
  async sendSubscriptionReminder(
    userId: string,
    subscriptionId: string,
    farmName: string,
    deliveryDate: Date
  ): Promise<void> {
    const dateStr = deliveryDate.toLocaleDateString('fr-TN', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    await this.send({
      userId,
      type: 'SUBSCRIPTION_REMINDER',
      title: 'Upcoming Delivery',
      titleAr: 'توصيل قادم',
      message: `Your ${farmName} box will be delivered on ${dateStr}. Want to skip or modify?`,
      messageAr: `سيتم توصيل صندوق ${farmName} يوم ${dateStr}. هل تريد التخطي أو التعديل؟`,
      data: { subscriptionId, farmName, deliveryDate: deliveryDate.toISOString() },
    });
  }

  // Send credit awarded notification
  async sendCreditAwardedNotification(
    userId: string,
    amount: number,
    reason: string
  ): Promise<void> {
    const reasonMessages: Record<string, { title: string; titleAr: string; message: string; messageAr: string }> = {
      QUALITY_ISSUE: {
        title: 'Credit Added - Quality Issue',
        titleAr: 'تمت إضافة رصيد - مشكلة جودة',
        message: `${amount.toFixed(3)} TND has been added to your account due to a quality issue.`,
        messageAr: `تمت إضافة ${amount.toFixed(3)} دينار إلى حسابك بسبب مشكلة جودة.`,
      },
      PACKAGING_RETURN: {
        title: 'Credit Added - Packaging Return',
        titleAr: 'تمت إضافة رصيد - إرجاع التغليف',
        message: `${amount.toFixed(3)} TND has been added for returning packaging. Thank you!`,
        messageAr: `تمت إضافة ${amount.toFixed(3)} دينار لإرجاع التغليف. شكرا لك!`,
      },
      REFERRAL: {
        title: 'Referral Bonus!',
        titleAr: 'مكافأة الإحالة!',
        message: `${amount.toFixed(3)} TND has been added for your referral. Keep sharing!`,
        messageAr: `تمت إضافة ${amount.toFixed(3)} دينار لإحالتك. استمر في المشاركة!`,
      },
      LOYALTY: {
        title: 'Thank You!',
        titleAr: 'شكرا لك!',
        message: `${amount.toFixed(3)} TND credit has been added as a thank you for your feedback.`,
        messageAr: `تمت إضافة ${amount.toFixed(3)} دينار كشكر لملاحظاتك.`,
      },
    };

    const messages = reasonMessages[reason] || {
      title: 'Credit Added',
      titleAr: 'تمت إضافة رصيد',
      message: `${amount.toFixed(3)} TND has been added to your account.`,
      messageAr: `تمت إضافة ${amount.toFixed(3)} دينار إلى حسابك.`,
    };

    await this.send({
      userId,
      type: 'CREDIT_AWARDED',
      ...messages,
      data: { amount, reason },
    });
  }

  // Get user notifications
  async getUserNotifications(userId: string, limit = 20, offset = 0): Promise<any> {
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unreadCount };
  }

  // Mark notification as read
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }
}

export const notificationService = new NotificationService();
