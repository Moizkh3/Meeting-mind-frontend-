export const transcriptSegments = [
  {
    speaker: 'John Doe',
    text: 'Hello everyone, thank you for joining the product sync. We have a lot to cover today regarding the Q4 roadmap.'
  },
  {
    speaker: 'Sarah Smith',
    text: "Hi John, I've prepared the slides for the new portal designs. Should I present them now or wait for Mark?"
  },
  {
    speaker: 'John Doe',
    text: "Let's wait for a few more minutes. In the meantime, Moiz, could you update us on the backend progress?"
  },
  {
    speaker: 'Moiz Khan',
    text: "Sure John. We've completed the API integration for the new notification system. It's ready for testing in the staging environment."
  }
];

export const analysisData = {
  summary: 'The team discussed Q4 roadmap priorities and backend integration status. Sarah is ready to present portal designs once the full team arrives.',
  actionItems: [
    { text: 'Sarah: Share portal design slides.', completed: true },
    { text: 'Moiz: Upload API documentation.', completed: false }
  ],
  metadata: [
    { label: 'Date', value: 'Oct 24, 2023' },
    { label: 'Duration', value: '42:15' },
    { label: 'Participants', value: '4 active' }
  ]
};
