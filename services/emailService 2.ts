// ─── Email Notification Service ──────────────────────────────────────────────
// Uses EmailJS to send email notifications from the frontend
// Free tier: 200 emails/month at https://www.emailjs.com/

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

export interface ScheduledEventEmail {
  to_email: string;
  to_name: string;
  event_title: string;
  event_type: 'snap' | 'stream';
  event_date: string;
  event_time: string;
  event_details: string; // e.g., "Screenshot" or "YouTube"
  reminder_minutes: number;
}

/**
 * Check if EmailJS is configured
 */
export function isEmailConfigured(): boolean {
  return !!(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);
}

/**
 * Send email notification for a scheduled event
 */
export async function sendScheduledEventEmail(params: ScheduledEventEmail): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn('EmailJS not configured. Add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY to .env.local');
    return false;
  }

  const eventTypeLabel = params.event_type === 'snap' ? '📸 Snap Capture' : '📺 Live Stream';
  
  // Format the date nicely
  const dateObj = new Date(`${params.event_date}T${params.event_time}`);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = dateObj.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  const templateParams = {
    to_email: params.to_email,
    to_name: params.to_name,
    event_title: params.event_title,
    event_type: eventTypeLabel,
    event_date: formattedDate,
    event_time: formattedTime,
    event_details: params.event_details,
    reminder_text: `You'll receive a reminder ${params.reminder_minutes} minutes before.`,
    app_name: 'Show App',
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: templateParams,
      }),
    });

    if (response.ok) {
      return true;
    } else {
      const errorText = await response.text();
      console.error('EmailJS error:', errorText);
      return false;
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send a reminder email (can be called closer to the event time)
 */
export async function sendReminderEmail(params: {
  to_email: string;
  to_name: string;
  event_title: string;
  event_type: 'snap' | 'stream';
  minutes_until: number;
}): Promise<boolean> {
  if (!isEmailConfigured()) {
    return false;
  }

  const eventTypeLabel = params.event_type === 'snap' ? '📸 Snap Capture' : '📺 Live Stream';

  const templateParams = {
    to_email: params.to_email,
    to_name: params.to_name,
    event_title: params.event_title,
    event_type: eventTypeLabel,
    event_date: 'Starting soon!',
    event_time: `In ${params.minutes_until} minute${params.minutes_until !== 1 ? 's' : ''}`,
    event_details: 'This is your scheduled reminder.',
    reminder_text: `Your ${params.event_type} is about to start!`,
    app_name: 'Show App',
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: templateParams,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send reminder email:', error);
    return false;
  }
}
