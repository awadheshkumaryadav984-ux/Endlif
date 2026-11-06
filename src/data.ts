import { Contact, EmergencyService } from './types';

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'father',
    name: 'Father (Rajesh)',
    role: 'Primary Guardian',
    status: 'Active',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgz1jrN_-13qpoRVBpS7S-YQ7JVoFiz1RFQAWoSaQAsGlzPe0ZuV5FKlTb5rVVSlRMz4f2x8_frcANz_ES189dpxwmihcr0POFOvW2Ckyy0TwtrSY-dBiJkhrcIkw6Od1BlM3NFWkV8tcPFTMbxLJKPT67wn3w35sMHu2MDFQQ1In2AqSyhvwDs11Y9OldH_5GJWJppFGzL88DXwNGFuTkLEFrXP60Rs6so0bA-yGmJtEGrk9d6x8wvR9fHRksVnUOQeBt1DhrajE',
    online: true,
    phone: '+919876543210',
    email: 'guardian.rajesh@endlif.org',
    hasAppInstalled: true,
    fcmToken: 'fcm_guardian_device_tok_primary_rajesh',
    optedIntoEmergency: true,
    consentGiven: true,
    consentTimestamp: '2026-01-15T08:00:00.000Z',
    preferredChannel: 'fcm'
  },
  {
    id: 'mother',
    name: 'Mother (Sunita)',
    role: 'Primary Guardian',
    status: 'Active',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByBBFm0_aGHS9XIJvfKYNawX0O6m9luBgWlx0V6PsBcwecln13RrI0PJmoUuZOOKd0x_BhEZliBhsCFsdgtPiw7VYO9MoMexkq1725yqj2jwIvLTSarboDiHzuqvJ9I0TDaSvqpEe6H6Ej14YPFBvkR8vZ1mH_OtDKPnyFAGveN2k_lygJXI-FBvt6fwwAz90mJSq9PY68heE10MaNR60P1yuNHSo03_OcUnESKZYU4YoYLvS9zbzHj7sfEawa2NJSHVE13TRvKvs',
    online: true,
    phone: '+919812345678',
    email: 'sunita.vance@endlif.org',
    hasAppInstalled: false, // Will demonstrate SMS / Email fallback!
    fcmToken: undefined,
    optedIntoEmergency: true,
    consentGiven: true,
    consentTimestamp: '2026-01-15T08:00:00.000Z',
    preferredChannel: 'sms'
  },
  {
    id: 'brother',
    name: 'Brother (Aarav)',
    role: 'Secondary Guardian',
    status: 'Active',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHbZuiJHOG5KNEmMqqjQtfl18aEV1fABgOVQ0TYHyxtl8AMQVlLau4AeJG5eje5UxaBcFhdp3M_ltz5qltGR0noFsBlkDUKdncIu55LM-ejXhS2Z8NDE-eIHcjF8NXeBSn7OHkYBN_x7A3RuZodZYC7CN7pcjjf8q134SRb3cPTIYX8kw9eKhEncKrbpkYo7grxnPQxTlP-6tgZS8qS6NOKPmkN5YTmN0743IV1KVkoKkPCLat8t0EAfoiTU-MmYPSr4dVpb5qLhg',
    online: true,
    phone: '+14155552671', // International E.164 US/Canada format
    email: 'aarav.vance@endlif.org',
    hasAppInstalled: true,
    fcmToken: 'fcm_guardian_device_tok_secondary_aarav',
    optedIntoEmergency: true,
    consentGiven: true,
    consentTimestamp: '2026-02-01T10:30:00.000Z',
    preferredChannel: 'fcm'
  },
  {
    id: 'friend',
    name: 'Sarah (Campus Lead)',
    role: 'Emergency Backup',
    status: 'Active',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj9awLdHeoyRWhpmJ_G_9iEymBJIcMPqIXy66-tiksDTcwVcy8p_M6uySonXEmqlwnhOlRTGXLqHC9rHiRojZT-ojhHZZGwJbBaeaQob1KWy_sutgEsQm7A-PrfVYVT3DsZwL-ZvLXA5PJasMpUFsqhEHbmNBXbOewH8R4xh-i5KNIokS9OamLNXAydPYfn3YQBTJ64afZO2pIxoP1b3DVOm7NSqq6PS_K6-Yr4dU_oWHNeQDGWmSxp1Bn9WetsBAq36NnTqTj6OU',
    online: true,
    phone: '+447911123456', // International E.164 UK format
    email: 'sarah.lead@endlif.org',
    hasAppInstalled: false,
    fcmToken: undefined,
    optedIntoEmergency: true,
    consentGiven: true,
    consentTimestamp: '2026-03-01T14:15:00.000Z',
    preferredChannel: 'email'
  }
];

export const EMERGENCY_SERVICES: EmergencyService[] = [
  {
    id: 'police',
    name: 'Police',
    dialCode: '911',
    category: 'Dial 911',
    iconName: 'ShieldAlert',
    colorClass: 'text-red-500 bg-red-500/10 hover:bg-red-500/20 active:border-red-500'
  },
  {
    id: 'ambulance',
    name: 'Ambulance',
    dialCode: 'Medical',
    category: 'Medical assistance',
    iconName: 'PlusSquare',
    colorClass: 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 active:border-rose-500'
  },
  {
    id: 'fire',
    name: 'Fire Services',
    dialCode: 'Rescue',
    category: 'Fire & rescue',
    iconName: 'Flame',
    colorClass: 'text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 active:border-orange-500'
  },
  {
    id: 'child',
    name: 'Child Helpline',
    dialCode: 'Protection',
    category: 'Child advocacy',
    iconName: 'Baby',
    colorClass: 'text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 active:border-blue-400'
  } as any, // Cast for any icon variations
  {
    id: 'women',
    name: 'Women Helpline',
    dialCode: 'Support',
    category: 'Emergency support',
    iconName: 'UserCheck',
    colorClass: 'text-purple-400 bg-purple-400/10 hover:bg-purple-400/20 active:border-purple-400'
  },
  {
    id: 'disaster',
    name: 'Disaster Helplines',
    dialCode: 'Emergency',
    category: 'Civil response',
    iconName: 'AlertTriangle',
    colorClass: 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 active:border-amber-500'
  }
];

export const SUGGESTED_ASSISTANT_PROMPTS = [
  'Someone is following me, what should I do?',
  'What is the emergency police number in Mumbai, India?',
  'What is the current national safety helpline in 2026?',
  'Start a 15-minute safety check-in timer',
  'Find nearest emergency hospital and police station',
  'Explain Endlif Decoy Mode & Covert Defense',
  'Emergency first aid: severe bleeding stabilization',
  'Live weather & natural disaster advisories near me',
  'Alert my Safety Circle with live coordinates'
];
