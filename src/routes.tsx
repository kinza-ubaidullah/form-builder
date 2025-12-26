import Dashboard from './pages/Dashboard';
import CreateForm from './pages/CreateForm';
import Forms from './pages/Forms';
import FormBuilder from './pages/FormBuilder';
import Submissions from './pages/Submissions';
import Templates from './pages/Templates';
import Teams from './pages/Teams';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import Login from './pages/Login';
import PublicForm from './pages/PublicForm';
import NotFound from './pages/NotFound';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Create Form',
    path: '/forms/new',
    element: <CreateForm />,
  },
  {
    name: 'Dashboard',
    path: '/',
    element: <Dashboard />,
  },
  {
    name: 'Forms',
    path: '/forms',
    element: <Forms />,
  },
  {
    name: 'Form Builder',
    path: '/forms/:id/edit',
    element: <FormBuilder />,
  },
  {
    name: 'Submissions',
    path: '/forms/:id/submissions',
    element: <Submissions />,
  },
  {
    name: 'Templates',
    path: '/templates',
    element: <Templates />,
  },
  {
    name: 'Teams',
    path: '/teams',
    element: <Teams />,
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <Admin />,
  },
  {
    name: 'Settings',
    path: '/settings',
    element: <Settings />,
  },
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
  },
  {
    name: 'Public Form',
    path: '/form/:id',
    element: <PublicForm />,
  },
  {
    name: 'Not Found',
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
