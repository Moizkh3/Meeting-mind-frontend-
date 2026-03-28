export const participants = [
  {
    id: 'p1',
    name: 'Sarah Jenkins',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    isSpeaking: true,
    isLive: true,
    lastTranscript: "We need to consolidate the Q4 targets before the investor call next Tuesday...",
    position: { top: '2200px', left: '2100px' },
    color: '#F97316'
  },
  {
    id: 'p2',
    name: 'Mark Thompson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mark',
    isSpeaking: false,
    isLive: false,
    lastTranscript: "Listening...",
    position: { top: '2220px', left: '2600px' },
    color: '#E2E8F0'
  },
  {
    id: 'p3',
    name: 'Alex Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    isSpeaking: false,
    isLive: false,
    lastTranscript: "Referencing docs...",
    position: { top: '2550px', left: '2600px' },
    color: '#E2E8F0'
  },
  {
    id: 'p4',
    name: 'Jessica Wu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    isSpeaking: false,
    isLive: false,
    lastTranscript: "Reviewing metrics...",
    position: { top: '2580px', left: '2100px' },
    color: '#E2E8F0'
  }
];

export const stickyNotes = [
  {
    id: 'n1',
    participantId: 'p1', // Sarah
    text: 'Review API limits for high-traffic endpoints during Q4 peak.',
    tag: '#TECH-DEBT',
    time: '10:02 AM',
    position: { top: '2800px', left: '2200px' }
  },
  {
    id: 'n2',
    participantId: 'p3', // Alex
    text: 'Sprint blockers identified in the checkout flow rewrite.',
    tag: '#URGENT',
    time: '10:05 AM',
    position: { top: '2900px', left: '2500px' }
  }
];

export const intelligenceNotes = [
  { 
    id: 'in1',
    participantId: 'p1',
    time: '10:02 AM', 
    title: 'API limits discussed', 
    content: 'System architecture review required for the new gateway endpoints.',
    position: { top: '2100px', left: '1800px' }
  },
  { 
    id: 'in2',
    participantId: 'p3',
    time: '10:05 AM', 
    title: 'Sprint blockers identified', 
    content: 'Frontend team waiting on final Figma handoff for the checkout flow rewrite.',
    position: { top: '2300px', left: '1800px' }
  },
  { 
    id: 'in3',
    participantId: 'p1',
    time: '10:12 AM', 
    title: 'Resource allocation', 
    content: 'Sarah suggested moving 2 senior devs from platform to checkout squad.',
    position: { top: '2500px', left: '1800px' }
  }
];

export const quickTasks = [
  { id: 1, text: 'Finalize Q4 roadmap for board approval', completed: false },
  { id: 2, text: 'Review API documentation for clarity', completed: false },
  { id: 3, text: 'Email stakeholder update', completed: true },
  { id: 4, text: 'Schedule follow-up with DevOps team', completed: false }
];
