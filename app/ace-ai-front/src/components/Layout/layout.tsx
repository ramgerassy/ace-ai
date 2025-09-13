import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Global/navbar';
import ErrorBoundary from '../Global/errorBoundary';

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className='min-h-screen bg-quiz-bg'>
      <ErrorBoundary>
        <Navbar />
        <main className='flex-1'>{children || <Outlet />}</main>
      </ErrorBoundary>
    </div>
  );
};

export default Layout;
