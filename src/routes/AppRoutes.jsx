import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Auth Pages
import LoginForm from '../pages/auth/LoginForm';
import SignUpForm from '../pages/auth/SignUpForm';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Organization Layout & Pages
import OrganizationSideBar from '../components/layout/OrganizationSideBar';
import OrganizationDashboard from '../pages/organization/OrganizationDashboard/OrganizationDashboard';
import OrgMeetings from '../pages/organization/meetings/Meetings';
import Scribes from '../pages/organization/scribes/Scribes';
import Reports from '../pages/organization/OrganizationDashboard/reports/Reports';
import Calendar from '../pages/organization/calendar/Calendar';
import CreateMeeting from '../pages/organization/meetings/CreateMeeting';
import Setting from '../pages/organization/Setting/Setting';
import MeetingHistory from '../pages/organization/meetings/Meetinghistory';
import OrgLiveSession from '../pages/organization/live-session/LiveSession';
import OrgMeetingFeedback from '../pages/organization/meetings/MeetingFeedback';

// Admin Layout & Pages
import AdminSidebar from '../components/layout/AdminSidebar';
import AdminDashboard from '../pages/admin/dashborad/Dashboard';
import Organizations from '../pages/admin/organizations/Organizations';
import CreateOrganization from '../pages/admin/organizations/CreateOrganization';
import OrganizationProfile from '../pages/admin/organizations/OrganizationProfile';
import AdminMeetings from '../pages/admin/meetings/Meetings';
import AdminCreateMeeting from '../pages/admin/meetings/CreateMeeting';
import AdminScribes from '../pages/admin/scribes/Scribes';
import Analytics from '../pages/admin/analytics/Analytics';
import Feedback from '../pages/admin/feedback/Feedback';
import RecentActivity from '../pages/admin/recent-activity/RecentActivity';
import AdminSettings from '../pages/admin/settings/Settings';

// Attendee Layout & Pages
import AttendeeLayout from '../components/attendee/AttendeeLayout';
import StandaloneLayout from '../components/attendee/StandaloneLayout';
import AttendeeDashboard from '../pages/attendee/dashboard/Dashboard';
import AttendeeMeetings from '../pages/attendee/meetings/Meetings';
import MeetingArchive from '../pages/attendee/archive/MeetingArchive';
import MeetingTranscript from '../pages/attendee/archive/MeetingTranscript';
import LiveSession from '../pages/attendee/live-session/LiveSession';
import LiveNotes from '../pages/attendee/live-notes/LiveNotes';
import MeetingFeedback from '../pages/attendee/feedback/MeetingFeedback';
import Tasks from '../pages/attendee/tasks/Tasks';
import Profile from '../pages/attendee/profile/Profile';
import AttendeeSettings from '../pages/attendee/settings/Settings';

// Scribe Pages (Now integrated into Attendee)
import LiveCanvas from '../pages/scribe/live-canvas/LiveCanvas';

import RootRedirect from '../components/auth/RootRedirect';
// ... (rest of imports)
import RootErrorBoundary from '../components/common/RootErrorBoundary';

const router = createBrowserRouter([
  // Root redirect and selector
  {
    path: '/',
    element: <RootRedirect />,
  },

  // ─── Auth Routes ───────────────────────────────────────────
  { path: '/login', element: <LoginForm /> },
  { path: '/signup', element: <SignUpForm /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password/:token', element: <ResetPassword /> },

  // ─── Organization Routes ───────────────────────────────────
  {
    path: '/organization',
    element: (
      <ProtectedRoute allowedRoles={['organizer']}>
        <OrganizationSideBar />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <OrganizationDashboard /> },
      { path: 'meetings', element: <OrgMeetings /> },
      { path: 'create-meeting', element: <CreateMeeting /> },
      { path: 'create-meeting/:id', element: <CreateMeeting /> },
      { path: 'meetings/history', element: <MeetingHistory /> },
      { path: 'scribes', element: <Scribes /> },
      { path: 'reports', element: <Reports /> },
      { path: 'setting', element: <Setting /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'live-session', element: <OrgLiveSession /> },
      { path: 'meetings/feedback/:id', element: <OrgMeetingFeedback /> },
    ],
  },

  // ─── Admin Routes ──────────────────────────────────────────
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminSidebar />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'organizations', element: <Organizations /> },
      { path: 'organizations/create', element: <CreateOrganization /> },
      { path: 'organizations/edit/:id', element: <CreateOrganization /> },
      { path: 'organizations/:id', element: <OrganizationProfile /> },
      { path: 'meetings', element: <AdminMeetings /> },
      { path: 'meetings/create', element: <AdminCreateMeeting /> },
      { path: 'meetings/edit/:id', element: <AdminCreateMeeting /> },
      { path: 'meetings/view/:id', element: <AdminMeetings /> }, // Or a separate view page if needed
      // { path: 'scribes', element: <AdminScribes /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'feedback', element: <Feedback /> },
      { path: 'recent-activity', element: <RecentActivity /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },

  // ─── Attendee Routes (with sidebar) ───────────────────────
  {
    path: '/attendee',
    element: (
      <ProtectedRoute allowedRoles={['attendee', 'scribe']}>
        <AttendeeLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AttendeeDashboard /> },
      { path: 'dashboard', element: <AttendeeDashboard /> },
      { path: 'meetings', element: <AttendeeMeetings /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'archive', element: <MeetingArchive /> },
      { path: 'feedback/:id', element: <MeetingFeedback /> },
      { path: 'live-canvas', element: <LiveCanvas /> }, // Integrated Scribe feature
      { path: 'archive/transcript', element: <MeetingTranscript /> },
      { path: 'live-session', element: <LiveSession /> },
      { path: 'live-notes', element: <LiveNotes /> },
      { path: 'settings', element: <AttendeeSettings /> },
    ],
  },



  // ─── Global Catch-all ──────────────────────────────────────
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

export default router;