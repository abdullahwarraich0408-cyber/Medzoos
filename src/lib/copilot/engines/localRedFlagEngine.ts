/**
 * Offline/local red-flag screen for Medzoos when API is unavailable.
 * Mirrors backend deterministic policy — emergency never waits on LLM.
 */

function normalize(text: string): string {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

type LocalRedFlag = {
  triggered: boolean;
  reasonCode?: string;
};

export function evaluateLocalRedFlags(message: string): LocalRedFlag {
  const t = normalize(message);

  const rules: Array<{ code: string; test: (s: string) => boolean }> = [
    {
      code: 'CHEST_PAIN_RED_FLAG',
      test: s =>
        (s.includes('chest') &&
          (s.includes('crushing') ||
            s.includes('pressure') ||
            s.includes('sweat') ||
            s.includes('radiat') ||
            s.includes('shortness of breath') ||
            s.includes('cannot breathe'))) ||
        s.includes('heart attack'),
    },
    {
      code: 'STROKE_SYMPTOM',
      test: s =>
        s.includes('facial droop') ||
        s.includes('slurred speech') ||
        (s.includes('one sided') && s.includes('weak')) ||
        s.includes('stroke'),
    },
    {
      code: 'SEVERE_DYSPNEA',
      test: s =>
        s.includes('cannot breathe') ||
        s.includes('blue lips') ||
        (s.includes('severe') && s.includes('breath')),
    },
    {
      code: 'ANAPHYLAXIS',
      test: s =>
        (s.includes('throat') && s.includes('swell')) ||
        (s.includes('tongue') && s.includes('swell')) ||
        s.includes('anaphylaxis'),
    },
    {
      code: 'LOSS_OF_CONSCIOUSNESS',
      test: s =>
        s.includes('loss of consciousness') ||
        s.includes('loss of conciousness') ||
        s.includes('lost consciousness') ||
        s.includes('lost conciousness') ||
        s.includes('passed out') ||
        s.includes('passing out') ||
        s.includes('blackout') ||
        s.includes('blacked out') ||
        s.includes('fainted') ||
        s.includes('fainting') ||
        s.includes('unconscious') ||
        s.includes('unconcious') ||
        s.includes('unresponsive') ||
        s.includes('syncope') ||
        s.includes('behosh') ||
        s.includes('be hosh') ||
        s.includes('gash') ||
        s.includes('seizure') ||
        s.includes('coma'),
    },
    {
      code: 'POISONING_OVERDOSE',
      test: s => s.includes('poison') || s.includes('overdose'),
    },
    {
      code: 'CAUDA_EQUINA_RED_FLAG',
      test: s =>
        (s.includes('back') || s.includes('saddle')) &&
        (s.includes('incontinence') ||
          s.includes('urinary retention') ||
          s.includes('saddle')),
    },
    {
      code: 'EXPLICIT_EMERGENCY',
      test: s => s.includes('ambulance') || s.includes('1122'),
    },
  ];

  for (const rule of rules) {
    if (rule.test(t)) return { triggered: true, reasonCode: rule.code };
  }
  return { triggered: false };
}
