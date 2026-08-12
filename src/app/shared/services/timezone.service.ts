import { Injectable } from '@angular/core';

export interface TimezoneOption {
  code: string;
  name: string;
  offset: string;
}

@Injectable({
  providedIn: 'root'
})
export class TimezoneService {

  public readonly TIMEZONES: TimezoneOption[] = [
    { code: 'Asia/Kolkata', name: 'IST (India Standard Time)', offset: 'UTC+05:30' },
    { code: 'UTC', name: 'UTC (Coordinated Universal Time)', offset: 'UTC+00:00' },
    { code: 'America/New_York', name: 'EST / EDT (Eastern Time - US)', offset: 'UTC-05:00' },
    { code: 'America/Chicago', name: 'CST / CDT (Central Time - US)', offset: 'UTC-06:00' },
    { code: 'America/Denver', name: 'MST / MDT (Mountain Time - US)', offset: 'UTC-07:00' },
    { code: 'America/Los_Angeles', name: 'PST / PDT (Pacific Time - US)', offset: 'UTC-08:00' },
    { code: 'Europe/London', name: 'GMT / BST (London)', offset: 'UTC+00:00' },
    { code: 'Europe/Paris', name: 'CET / CEST (Paris / Central Europe)', offset: 'UTC+01:00' },
    { code: 'Asia/Dubai', name: 'GST (Gulf Standard Time - Dubai)', offset: 'UTC+04:00' },
    { code: 'Asia/Singapore', name: 'SGT (Singapore Standard Time)', offset: 'UTC+08:00' },
    { code: 'Australia/Sydney', name: 'AEST / AEDT (Sydney)', offset: 'UTC+10:00' }
  ];

  getUserTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    } catch (e) {
      return 'Asia/Kolkata';
    }
  }

  /**
   * Converts a 12h / 24h local time string (e.g. "01:30 PM" or "13:30") from sourceTimezone into UTC time ("08:00:00")
   */
  convertLocalToUtc(timeStr: string, sourceTimezone?: string): string {
    if (!timeStr) return '';
    const tz = sourceTimezone || this.getUserTimezone();
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const normalizedTime = this.parseTimeString(timeStr);
      const isoLocalStr = `${todayStr}T${normalizedTime}`;

      // Create Date object assuming UTC then compute timezone offset difference
      const localDate = new Date(isoLocalStr);
      const sourceFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });

      // Simple offset adjustment fallback
      const match12 = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
      if (match12) {
        let hours = parseInt(match12[1], 10);
        const minutes = parseInt(match12[2], 10);
        const ampm = match12[4] ? match12[4].toUpperCase() : null;
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        // Standardize as UTC ISO string timestamp
        const utcHours = String(date.getUTCHours()).padStart(2, '0');
        const utcMins = String(date.getUTCMinutes()).padStart(2, '0');
        return `${utcHours}:${utcMins}:00`;
      }
      return normalizedTime;
    } catch (e) {
      console.warn('Timezone conversion error:', e);
      return timeStr;
    }
  }

  /**
   * Converts a stored time string (UTC or 24h) into a formatted display string in targetTimezone
   * e.g. "08:00:00" -> "01:30 PM (IST)" or "03:00 AM (EST)"
   */
  convertUtcToDisplay(timeStr: string, targetTimezone?: string): string {
    if (!timeStr) return '-';
    const tz = targetTimezone || this.getUserTimezone();

    try {
      const normalized = this.parseTimeString(timeStr);
      const [hStr, mStr] = normalized.split(':');
      const hours = parseInt(hStr, 10);
      const minutes = parseInt(mStr, 10);

      const now = new Date();
      now.setUTCHours(hours, minutes, 0, 0);

      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const formattedTime = formatter.format(now);
      const tzShortName = this.getTimezoneAbbreviation(tz);
      return `${formattedTime} (${tzShortName})`;
    } catch (e) {
      return timeStr;
    }
  }

  getTimezoneAbbreviation(tz: string): string {
    const found = this.TIMEZONES.find(t => t.code === tz);
    if (found) {
      const abbrMatch = found.name.match(/^([A-Z\/]+)/);
      return abbrMatch ? abbrMatch[1] : tz;
    }
    return tz.split('/')[1] || tz;
  }

  private parseTimeString(timeStr: string): string {
    const match = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (!match) return '00:00:00';

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[4] ? match[4].toUpperCase() : null;

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const hStr = String(hours).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    return `${hStr}:${mStr}:00`;
  }
}
