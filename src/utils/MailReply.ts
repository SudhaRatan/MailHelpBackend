import { gmail_v1 } from "googleapis";

const { google } = require('googleapis');

export default class GmailReply {
  gmail: gmail_v1.Gmail;
  SENDER_EMAIL:any
  constructor(gmail: gmail_v1.Gmail, email: string) {
    

    // Initialize Gmail API
    this.gmail = gmail
    this.SENDER_EMAIL = email
  }

  /**
   * Get email thread by ID
   */
  async getThread(threadId: string) {
    try {
      const response = await this.gmail.users.threads.get({
        userId: 'me',
        id: threadId,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting thread:', error);
      throw error;
    }
  }

  /**
   * Get email headers from message
   */
  getEmailHeaders(headers:any) {
    const headerData: any = {};
    headers.forEach((header:any) => {
      headerData[header.name.toLowerCase()] = header.value;
    });
    return headerData;
  }

  /**
   * Create reply message in base64 encoded format
   */
  createReplyMessage(originalEmail:any, replyText:any) {
    const headers = this.getEmailHeaders(originalEmail.payload.headers);
    const originalFrom = headers.from;
    const originalSubject = headers.subject;
    const references = headers.references || headers['message-id'];
    const inReplyTo = headers['message-id'];
    
    // Format the reply subject
    const subject = originalSubject.startsWith('Re:') 
      ? originalSubject 
      : `Re: ${originalSubject}`;

    // Email headers for reply
    const emailLines = [
      `From: ${this.SENDER_EMAIL}`,
      `To: ${originalFrom}`,
      `Subject: ${subject}`,
      `References: ${references}`,
      `In-Reply-To: ${inReplyTo}`,
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      replyText,
      '',
      'On ' + new Date(originalEmail.internalDate * 1).toLocaleString() + ', ' + originalFrom + ' wrote:',
      this.getOriginalMessageBody(originalEmail)
    ];

    const emailContent = emailLines.join('\r\n').trim();

    // Base64 encode the email
    const base64EncodedEmail = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return base64EncodedEmail;
  }

  /**
   * Get original message body
   */
  getOriginalMessageBody(message: any) {
    let body = '';
    if (message.payload.body.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf8');
    } else if (message.payload.parts) {
      message.payload.parts.forEach((part:any) => {
        if (part.mimeType === 'text/plain' && part.body.data) {
          body += Buffer.from(part.body.data, 'base64').toString('utf8');
        }
      });
    }
    
    // Add '>' to each line of the original message
    return body.split('\n').map(line => `> ${line}`).join('\n');
  }

  /**
   * Send reply to an email
   */
  async sendReply(threadId: string, replyText:string) {
    try {
      // Get the thread
      const thread = await this.getThread(threadId);
      const originalEmail = thread.messages![thread.messages!.length - 1];

      // Create reply message
      const base64EncodedEmail = this.createReplyMessage(originalEmail, replyText);

      // Send the reply
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: base64EncodedEmail,
          threadId: threadId
        }
      });

      console.log('Reply sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending reply:', error);
      throw error;
    }
  }

}

// Example usage
// async function main() {
//   const gmailReply = new GmailReply();

//   try {
//     // List recent emails
//     const recentEmails = await gmailReply.listRecentEmails(5);
//     console.log('Recent emails:', recentEmails);

//     // Reply to the first email in the list
//     if (recentEmails.length > 0) {
//       const threadId = recentEmails[0].threadId;
//       await gmailReply.sendReply(threadId, 'Thank you for your email. This is my reply.');
//     }
//   } catch (error) {
//     console.error('Main error:', error);
//   }
// }
