/**
 * SMS Notification Service
 * Handles sending SMS notifications for order status updates
 * 
 * This service should be called from:
 * - Backend/Cloud Functions when order status changes
 * - Or integrated with Firestore triggers
 */

export interface SMSNotification {
  phone: string;
  message: string;
  type: 'order_placed' | 'order_shipped' | 'order_delivered' | 'otp' | 'password_reset';
}

/**
 * Send SMS notification
 * This should be called from backend/Cloud Functions
 * For frontend, we'll create a helper that calls the backend API
 */
export const sendSMS = async (notification: SMSNotification): Promise<boolean> => {
  try {
    // Call backend API to send SMS
    const response = await fetch('/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });

    if (!response.ok) {
      throw new Error('Failed to send SMS');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error sending SMS:', error);
    // In production, this should fail silently or log to error tracking
    return false;
  }
};

/**
 * Format order status message
 */
export const formatOrderMessage = (
  orderId: string,
  status: 'placed' | 'shipped' | 'delivered',
  total: number
): string => {
  const messages = {
    placed: `Your order #${orderId} has been placed successfully. Total: ₹${total}. Thank you for shopping with HandyCraft!`,
    shipped: `Great news! Your order #${orderId} is out for delivery. Expected delivery soon. Track: handycraft.com/order/${orderId}`,
    delivered: `Your order #${orderId} has been delivered! We hope you love your purchase. Rate us: handycraft.com/order/${orderId}`,
  };

  return messages[status];
};

/**
 * Helper to send order status SMS
 * This should be called when order status changes in Firestore
 */
export const sendOrderStatusSMS = async (
  phone: string,
  orderId: string,
  status: 'placed' | 'shipped' | 'delivered',
  total: number
): Promise<void> => {
  const message = formatOrderMessage(orderId, status, total);
  
  await sendSMS({
    phone,
    message,
    type: `order_${status}` as SMSNotification['type'],
  });
};

