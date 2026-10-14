const timeZones = {
  'New York': 'America/New_York',
  Copenhagen: 'Europe/Copenhagen',
  Milan: 'Europe/Rome',
  'Virtual Studio': 'UTC',
};

export function bookingToday(location, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZones[location] || 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = type => parts.find(item => item.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
