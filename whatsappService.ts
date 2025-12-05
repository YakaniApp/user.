
import { TransactionRecord } from '../types';

// CONFIGURATION: Infobip API (WhatsApp & SMS)
// Documentation: https://www.infobip.com/docs/api
const INFOBIP_CONFIG = {
    // The Base URL (Specific to your account cluster)
    baseUrl: 'https://l2rrzd.api.infobip.com', 
    
    // The API Key provided
    apiKey: '2ca2bcf05210a5789f9871737dbfecba-b35ff1d0-96d6-4d46-818c-3c9a3dda0a95',
    
    // WhatsApp Sender Number (The System/Bot Number)
    senderNumber: '447860088970',

    // SMS Sender ID 
    smsSenderId: '447491163443' 
};

/**
 * Helper to format phone numbers to international format required by Infobip.
 * Adds 252 or 256 if missing.
 */
const formatPhoneNumber = (phone: string, countryCode: string): string => {
    let clean = phone.replace(/\D/g, '');
    
    // If it already starts with the country code, return as is
    if (clean.startsWith(countryCode)) {
        return clean;
    }
    
    // Remove leading zero if present (e.g. 077... -> 77...)
    if (clean.startsWith('0')) {
        clean = clean.substring(1);
    }
    
    return `${countryCode}${clean}`;
};

/**
 * Sends a message via the Infobip WhatsApp API.
 * Uses the text endpoint for dynamic content (names, amounts, etc).
 */
const sendToWhatsAppApi = async (phone: string, text: string): Promise<boolean> => {
    // 1. Clean the phone number (Remove spaces, +, etc)
    const cleanPhone = phone.replace(/\D/g, '');

    console.log(`[Infobip WhatsApp] From: ${INFOBIP_CONFIG.senderNumber} To: ${cleanPhone}`);

    try {
        const url = `${INFOBIP_CONFIG.baseUrl}/whatsapp/1/message/text`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `App ${INFOBIP_CONFIG.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                from: INFOBIP_CONFIG.senderNumber,
                to: cleanPhone,
                content: {
                    text: text
                }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Infobip WhatsApp Error (Will Fallback):', data);
            return false;
        }

        console.log('Infobip WhatsApp Success:', data);
        return true;

    } catch (error) {
        console.error('Infobip WhatsApp Network Error:', error);
        return false;
    }
};

/**
 * Send SMS via Infobip
 */
const sendSmsApi = async (phone: string, text: string): Promise<boolean> => {
    const cleanPhone = phone.replace(/\D/g, '');
    console.log(`[Infobip SMS] From: ${INFOBIP_CONFIG.smsSenderId} To: ${cleanPhone}`);

    try {
        const url = `${INFOBIP_CONFIG.baseUrl}/sms/2/text/advanced`;

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
                        destinations: [{ to: cleanPhone }],
                        from: INFOBIP_CONFIG.smsSenderId,
                        text: text
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Infobip SMS Error:', data);
            return false;
        }
        console.log('Infobip SMS Success:', data);
        return true;

    } catch (error) {
        console.error('Infobip SMS Network Error:', error);
        return false;
    }
};

/**
 * Sends a confirmation message to the Sender when the Admin approves the transfer.
 * Tries WhatsApp first (if requested), falls back to SMS if WhatsApp fails.
 */
export const notifySenderOfCompletion = async (txn: TransactionRecord) => {
    if (!txn.senderPhone) return;

    // Determine Sender Country Code based on direction
    const senderCountryCode = txn.direction === 'SOM_TO_UGA' ? '252' : '256';
    const formattedPhone = formatPhoneNumber(txn.senderPhone, senderCountryCode);

    const smsMessage = `✅ Transfer Approved!\n` +
        `Ref: ${txn.transactionId}\n` +
        `Sent: ${txn.amountSend} ${txn.currencySend}\n` +
        `To: ${txn.recipient.fullName}\n` +
        `Status: COMPLETED\n` +
        `Thank you for using SomalUganda Remit.`;

    // 1. Try WhatsApp if enabled
    if (txn.notifyOnWhatsapp) {
        const waMessage = `✅ *Transfer Approved!*\n\n` +
            `Dear ${txn.senderName},\n` +
            `Your transfer of *${txn.amountSend} ${txn.currencySend}* to *${txn.recipient.fullName}* has been successfully processed.\n\n` +
            `🆔 Ref: ${txn.transactionId}\n` +
            `🚀 Status: COMPLETED\n\n` +
            `Thank you for choosing SomalUganda Remit.`;
            
        const waSuccess = await sendToWhatsAppApi(formattedPhone, waMessage);
        
        // If WhatsApp succeeded, we are done.
        if (waSuccess) return true;
        
        console.log("WhatsApp notification failed. Falling back to SMS...");
    } 

    // 2. Fallback to SMS (or default path)
    return sendSmsApi(formattedPhone, smsMessage);
};

/**
 * Sends a notification to the Recipient that funds are available/sent.
 * Uses SMS for reliability.
 */
export const notifyRecipientOfFunds = async (txn: TransactionRecord) => {
    if (!txn.recipient.phone) return;

    // Determine Recipient Country Code based on direction
    const recipientCountryCode = txn.direction === 'SOM_TO_UGA' ? '256' : '252';
    const formattedPhone = formatPhoneNumber(txn.recipient.phone, recipientCountryCode);

    const message = `💰 Money Received!\n` +
        `You received ${txn.amountReceive.toLocaleString()} ${txn.currencyReceive} from ${txn.senderName}.\n` +
        `Ref: ${txn.transactionId}\n` +
        `Funds should reflect shortly.`;

    // Always SMS for recipient to ensure delivery on non-smartphones
    return sendSmsApi(formattedPhone, message);
};
