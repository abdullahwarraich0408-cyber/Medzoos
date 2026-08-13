import type { HealthContext } from '../types';

export function generatePersonalizedGreeting(context: HealthContext): string {
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const lines: string[] = [`${timeGreeting} ${context.personal.firstName}.`];

  if (context.insights.length > 0) {
    lines.push('', context.insights[0]);
    if (context.insights.length > 1) {
      lines.push(context.insights[1]);
    }
  } else if (context.labReports.length > 0) {
    lines.push(
      '',
      `Your latest ${context.labReports[0].name} report is on file.`,
    );
  }

  lines.push('', 'How can I help you today?');
  return lines.join('\n');
}
