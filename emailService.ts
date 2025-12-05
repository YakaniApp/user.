
import { TransactionDetails, TransactionRecord } from '../types';

// CONFIGURATION: Infobip Email API
const INFOBIP_CONFIG = {
    baseUrl: 'https://l2rrzd.api.infobip.com',
    apiKey: '2ca2bcf05210a5789f9871737dbfecba-b35ff1d0-96d6-4d46-818c-3c9a3dda0a95',
    senderEmail: 'yakani@selfserve.worlds-connected.co',
    adminEmail: 'yakanicash@gmail.com'
};

/**
 * Sends an email using the Infobip API.
 */
export const sendEmailApi = async (to: string, subject: string, text: string): Promise<boolean> => {
    console.log(`[Infobip Email] To: ${to} | Subject: ${subject}`);
    
    try {
        const url = `${INFOBIP_CONFIG.baseUrl}/email/4/messages`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `App ${INFOBIP_CONFIG.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        destinations: [
                            { to: [{ destination: to }] }
                        ],
                        sender: INFOBIP_CONFIG.senderEmail,
                        content: {
                            subject: subject,
                            text: text
                        }
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Infobip Email Error:', data);
            return false;
        }

        console.log('Infobip Email Success:', data);
        return true;

    } catch (error) {
        console.error('Infobip Email Network Error:', error);
        return false;
    }
};

/**
 * Notifies the Admin (yakanicash@gmail.com) when a new transaction request is submitted.
 */
export const notifyAdminOfNewRequest = async (txn: TransactionDetails | TransactionRecord) => {
    const subject = `New Transfer Request: ${txn.amountSend} ${txn.currencySend} from ${txn.senderName}`;
    const text = `
NEW MONEY TRANSFER REQUEST

Sender Details:
Name: ${txn.senderName}
Phone: ${txn.senderPhone}
Email: ${txn.senderEmail || 'N/A'}

Transaction Details:
Amount Sent: ${txn.amountSend} ${txn.currencySend}
Manual Ref Code: ${txn.senderTransactionRef}
Recipient: ${txn.recipient.fullName} (${txn.recipient.withdrawalMethod})

Please verify this payment in your mobile money account and approve the transaction in the dashboard.
    `.trim();

    return sendEmailApi(INFOBIP_CONFIG.adminEmail, subject, text);
};

/**
 * Sends a confirmation receipt to the Sender if they provided an email.
 */
export const sendReceiptToUser = async (txn: TransactionDetails | TransactionRecord) => {
    if (!txn.senderEmail) return;

    const subject = `Request Received - SomalUganda Remit`;
    const text = `
Dear ${txn.senderName},

We have received your request to send ${txn.amountSend} ${txn.currencySend} to ${txn.recipient.fullName}.

Your Payment Reference: ${txn.senderTransactionRef}
Status: PENDING VERIFICATION

Our team is currently verifying your manual payment. Once confirmed, the funds will be released to the recipient.

Thank you for choosing SomalUganda Remit.
    `.trim();

    return sendEmailApi(txn.senderEmail, subject, text);
};
