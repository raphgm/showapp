
/**
 * Real Google Calendar API Service
 * Handles OAuth2 Implicit Flow for client-side integration
 */

// Replace this with your actual Client ID from Google Cloud Console
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/calendar.readonly';

let tokenClient: any = null;
let accessToken: string | null = null;

export const initGoogleAuth = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).google) {
      tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response: any) => {
          if (response.error !== undefined) {
            throw response;
          }
          accessToken = response.access_token;
          resolve(accessToken);
        },
      });
      resolve(true);
    }
  });
};

export const connectGoogleCalendar = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject('Google Identity Services not initialized');
      return;
    }
    
    // Check if we need to request new token
    tokenClient.callback = (response: any) => {
      if (response.error) {
        reject(response.error);
      } else {
        accessToken = response.access_token;
        resolve(accessToken!);
      }
    };
    
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

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
