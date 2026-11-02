/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WhatsAppDocType = 'INVOICE' | 'QUOTATION' | 'DELIVERY_CHALLAN' | 'LEDGER_REPORT' | 'PAYMENT_REMINDER';

export interface WhatsAppSendPayload {
  recipientPhone: string;
  recipientName: string;
  documentType: WhatsAppDocType;
  documentNumber: string;
  amount: number;
  messageBody: string;
  upiId?: string;
  companyName?: string;
}

export interface WhatsAppSendResponse {
  success: boolean;
  messageId?: string;
  status?: 'SENT' | 'DELIVERED' | 'READ';
  recipient?: string;
  provider?: string;
  error?: string;
}

export interface WhatsAppLogItem {
  id: string;
  timestamp: string;
  recipientPhone: string;
  recipientName: string;
  documentType: string;
  documentNumber: string;
  amount: number;
  messageBody: string;
  provider: string;
  providerMessageId: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
}

/**
 * Sends a WhatsApp message directly via the backend integration service
 * (using Twilio or Meta WhatsApp Cloud API or simulated cloud gateway)
 */
export async function sendWhatsAppMessage(payload: WhatsAppSendPayload): Promise<WhatsAppSendResponse> {
  try {
    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to dispatch WhatsApp message');
    }
    return data;
  } catch (err: any) {
    console.error('Error sending WhatsApp message:', err);
    return {
      success: false,
      error: err?.message || 'Network error connecting to WhatsApp integration service',
    };
  }
}

export async function fetchWhatsAppLogs(): Promise<WhatsAppLogItem[]> {
  try {
    const res = await fetch('/api/whatsapp/logs');
    if (!res.ok) return [];
    const data = await res.json();
    return data.logs || [];
  } catch (err) {
    console.error('Failed to fetch WhatsApp logs', err);
    return [];
  }
}

export async function fetchWhatsAppConfig() {
  try {
    const res = await fetch('/api/whatsapp/config');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch WhatsApp config', err);
    return null;
  }
}

/**
 * Formats standard compliant Indian business WhatsApp messages with formatting
 */
export function buildWhatsAppTemplate(options: {
  type: WhatsAppDocType;
  companyName: string;
  tradeName?: string;
  companyPhone?: string;
  recipientName: string;
  docNumber: string;
  date: string;
  amount: number;
  upiId?: string;
  itemsSummary?: string;
  dueDate?: string;
  balance?: number;
}): string {
  const brand = options.tradeName || options.companyName;

  switch (options.type) {
    case 'INVOICE':
      return `*TAX INVOICE DISPATCH* 📄
━━━━━━━━━━━━━━━━━━━━
Namaste *${options.recipientName}*,

Greetings from *${brand}*!
Please find details of your GST Tax Invoice below:

🧾 *Invoice No:* ${options.docNumber}
📅 *Date:* ${options.date}
${options.itemsSummary ? `📦 *Items:* ${options.itemsSummary}\n` : ''}💰 *Total Amount:* ₹${options.amount.toLocaleString('en-IN')}

💳 *Pay via UPI:* ${options.upiId || 'company@bank'}
_Scan the QR code printed on the invoice or transfer via UPI to clear this payment._

For any queries, please reach out to us. Thank you for your business!
━━━━━━━━━━━━━━━━━━━━
*${brand}* · Powered by Nexora Books`;

    case 'QUOTATION':
      return `*PRICE ESTIMATE & QUOTATION* 📋
━━━━━━━━━━━━━━━━━━━━
Dear *${options.recipientName}*,

We are pleased to share our official quotation:

🔖 *Quotation No:* ${options.docNumber}
📅 *Date:* ${options.date}
${options.itemsSummary ? `📦 *Scope/Items:* ${options.itemsSummary}\n` : ''}💵 *Estimated Value:* ₹${options.amount.toLocaleString('en-IN')}

_This quote is valid for 15 days. Please reply to this message to confirm and generate the sales order._

Warm regards,
*${brand}* · Powered by Nexora Books`;

    case 'DELIVERY_CHALLAN':
      return `*GOODS DISPATCH & DELIVERY CHALLAN* 🚚
━━━━━━━━━━━━━━━━━━━━
Dear *${options.recipientName}*,

Your consignment has been dispatched:

📦 *Delivery Challan No:* ${options.docNumber}
📅 *Dispatch Date:* ${options.date}
${options.itemsSummary ? `📋 *Dispatched Items:* ${options.itemsSummary}\n` : ''}
_Kindly inspect the physical materials upon receipt and acknowledge delivery._

Safe Transit Support,
*${brand}* · Powered by Nexora Books`;

    case 'LEDGER_REPORT':
      return `*ACCOUNT LEDGER STATEMENT* 📊
━━━━━━━━━━━━━━━━━━━━
Dear *${options.recipientName}*,

Here is the current account balance summary with *${brand}*:

📌 *Account:* ${options.recipientName}
📅 *As of:* ${options.date}
💰 *Net Outstanding Balance:* ₹${(options.balance || options.amount).toLocaleString('en-IN')} (Dr)

💳 *Quick Settlement UPI ID:* ${options.upiId || 'company@bank'}
_Please let us know if you require the detailed daybook statement or bank reconciliation._

Regards,
Accounts Dept · *${brand}*`;

    case 'PAYMENT_REMINDER':
      return `*PAYMENT DUE REMINDER* ⏳
━━━━━━━━━━━━━━━━━━━━
Dear *${options.recipientName}*,

This is a gentle reminder regarding invoice *${options.docNumber}* dated *${options.date}* for *₹${options.amount.toLocaleString('en-IN')}*, which is currently pending.

Kindly arrange for settlement at your earliest convenience:
📲 *UPI ID:* ${options.upiId || 'company@bank'}

If you have already processed this payment, kindly disregard this notification.

Thank you,
*${brand}* · Powered by Nexora Books`;

    default:
      return `Document ${options.docNumber} from ${brand}. Total: ₹${options.amount.toLocaleString('en-IN')}`;
  }
}
