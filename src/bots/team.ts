export type Accessory = 'clipboard'|'calendar'|'book'|'backpack'|'clock'|'marker'|'bottle'|'laptop'|'ram'|'flask';
export interface TeamMember { id: string; name: string; short: string; color: string; dept: string; accessory: Accessory; lead?: boolean; colorAssumed?: boolean;
  /** One-line real job (docs/tags). */ role?: string;
  /** Second desk inside a shared dept zone: offset from the zone's default seat. */ seatOffset?: { x: number; z: number }; }
// Agent ids are the real Grok Bot agent ids so pushed status can match them.
export const TEAM: TeamMember[] = [
  { id: 'cbae969e-3163-46eb-ab58-23e3f341f26d', name: 'Alfred', role: 'Ops lead · chief advisor, routes work', short: 'Alfred', color: '#6b7280', dept: 'Ops', accessory: 'clipboard', lead: true },
  { id: '008dd220-3d73-4eb1-aba7-168ef890168e', name: 'niẓām', role: 'Life / personal assistant', short: 'niẓām', color: '#1a1a1a', dept: 'Life', accessory: 'calendar' },
  { id: '8d8c2db0-fb0d-4701-8965-bab6fed9e397', name: 'NSU · Study buddy', role: 'NSU study buddy', short: 'NSU', color: '#3b82f6', dept: 'School NSU', accessory: 'book' },
  { id: '0b3c7f02-8dd6-4e5d-9e95-a70ae7786823', name: 'Lamar', role: 'Other-university study', short: 'Lamar', color: '#14b8a6', dept: 'School Uni', accessory: 'backpack', colorAssumed: true },
  { id: '404a85ba-453a-403a-9c4d-7787f9ae3a77', name: 'Victoria', role: 'Deadlines tracker', short: 'Victoria', color: '#8b5cf6', dept: 'Deadlines', accessory: 'clock', colorAssumed: true },
  { id: '80381437-13be-4b95-9f83-c85632a12fac', name: 'Mentor', role: 'Personal growth mentor', short: 'Mentor', color: '#22c55e', dept: 'Growth', accessory: 'marker', colorAssumed: true },
  { id: 'ba5b82e3-ebd9-4abe-b6a0-e9c3ddb43a5d', name: 'Fitness', role: 'Health & fitness coach', short: 'Fitness', color: '#f97316', dept: 'Health', accessory: 'bottle' },
  { id: '9af0c291-72b5-4478-b261-1f6717350ee8', name: 'Mibot', role: 'Engineering · GitHub', short: 'Mibot', color: '#9ca3af', dept: 'Engineering', accessory: 'laptop' },
  { id: 'a659b8f6-fe6f-4387-8e5b-62834e2f4df3', name: 'Ram-Hunt', role: 'Hardware · RAM stock hunter', short: 'Ram-Hunt', color: '#d946ef', dept: 'Hardware', accessory: 'ram' },
  { id: 'f585d306-3c01-4457-97ed-e2f4a2c5fae1', name: 'dr eggbot', role: 'Bot Lab · bot designer', short: 'eggbot', color: '#ef4444', dept: 'Bot Lab', accessory: 'flask' },
  { id: '7af8ff89-8acc-4ce2-9c97-2d5928e14400', name: 'SWE', role: 'Software engineer · code, deploys', short: 'SWE', color: '#0ea5e9', dept: 'Software', accessory: 'laptop' },
];
