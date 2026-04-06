
/**
 * Real Google Calendar API Service
 * Handles OAuth2 Implicit Flow for client-side integration
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar';

let tokenClient: any = null;
let accessToken: string | null = null;

/**
 * Wait for the Google Identity Services script to load.
 * The <script src="https://accounts.google.com/gsi/client"> is async,
 * so we may need to poll briefly before it's available.
 */
const waitForGIS = (timeout = 5000): Promise<void> =>
  new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.oauth2) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error('Google Identity Services failed to load. Check your internet connection.'));
      }
    }, 100);
  });

export const initGoogleAuth = async (): Promise<boolean> => {
  if (!CLIENT_ID) {
    throw new Error('VITE_GOOGLE_CLIENT_ID is not set in your .env.local file.');
  }

  await waitForGIS();

  tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: () => {}, // replaced dynamically in connectGoogleCalendar
  });

  return true;
};

export const connectGoogleCalendar = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Call initGoogleAuth() first.'));
      return;
    }
    
    tokenClient.callback = (response: any) => {
      if (response.error) {
        reject(new Error(response.error_description || response.error));
      } else {
        accessToken = response.access_token;
        resolve(accessToken!);
      }
    };
    
    tokenClient.requestAccessToken({ prompt: accessToken ? '' : 'consent' });
  });
};

export const disconnectGoogleCalendar = () => {
  if (accessToken) {
    (window as any).google?.accounts?.oauth2?.revoke?.(accessToken);
  }
  accessToken = null;
  tokenClient = null;
};

export const isGoogleCalendarConnected = () => !!accessToken;

export const fetchUpcomingMeetings = async (token: string) => {
  const timeMin = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=10&orderBy=startTime&singleEvents=true`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch calendar events');
  }

  const data = await response.json();
  
  // Transform Google Event to MeetingItem format
  return data.items.map((event: any) => {
    const start = event.start.dateTime || event.start.date;
    const startDate = new Date(start);
    
    return {
      id: event.id,
      title: event.summary || 'Untitled Meeting',
      date: startDate.toLocaleDateString(),
      time: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'Live Sync',
      attendees: event.attendees?.length || 0,
      link: event.hangoutLink || event.location || '#'
    };
  });
};

export interface CalendarEventInput {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  description?: string;
  duration?: number; // in minutes, default 60
  reminder?: number; // in minutes before
}

export const createCalendarEvent = async (
  token: string,
  event: CalendarEventInput
): Promise<any> => {
  const startDateTime = new Date(`${event.date}T${event.time}`);
  const endDateTime = new Date(startDateTime.getTime() + (event.duration || 60) * 60 * 1000);
  
  const calendarEvent = {
    summary: event.title,
    description: event.description || `Scheduled via Show App`,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: event.reminder || 15 },
      ],
    },
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calendarEvent),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create calendar event');
  }

  return response.json();
};

export const getAccessToken = () => accessToken;