import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from './button';
import { useUser, useQuiz } from '../../context/AppContext';
import AceLogo from '../../assets/aciAiLogo.svg';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  requiresAuth: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    path: '/',
    icon: 'H',
    requiresAuth: false,
  },
  {
    label: 'Generate Quiz',
    path: '/generate-quiz',
    icon: 'G',
    requiresAuth: true,
  },
  {
    label: 'Take Quiz',
    path: '/take-quiz',
    icon: 'T',
    requiresAuth: true,
  },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, createUser, logout, isLoading } = useUser();
  const { session } = useQuiz();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userError, setUserError] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Show user input if no current user
  const shouldShowUserInput = !currentUser;

  // Update timer when quiz is active
  useEffect(() => {
    if (!session || session.isComplete) {
      setElapsedTime(0);
      return;
    }

    const updateTimer = () => {
      setElapsedTime(Date.now() - session.startTime);
    };

    // Initial update
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleNavigation = (path: string, requiresAuth: boolean) => {
    if (requiresAuth && !currentUser) {
      // Redirect to home if authentication is required but user is not logged in
      navigate('/');
      return;
    }
    navigate(path);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const handleCreateUser = async () => {
    const result = await createUser(userName);

    if (!result.success) {
      setUserError(result.error || 'Failed to create user');
      return;
    }

    setUserName('');
    setUserError('');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className='bg-quiz-bg border-b border-quiz-border sticky top-0 z-50 shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo/Brand */}
          <div
            className='flex items-center cursor-pointer hover:opacity-80 transition-opacity'
            onClick={() => navigate('/')}
          >
            <img src={AceLogo} alt='Ace AI Logo' className='w-8 h-8 mr-3' />
            <span className='text-xl font-bold font-heading text-quiz-text'>
              Ace AI Quiz
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-8'>
            <div className='flex space-x-4'>
              {navItems.map(item => {
                const canAccess = !item.requiresAuth || currentUser;
                const isActive = isActivePath(item.path);

                return (
                  <button
                    key={item.path}
                    onClick={() =>
                      handleNavigation(item.path, item.requiresAuth)
                    }
                    disabled={!canAccess}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-quiz-primary text-white shadow-sm'
                        : canAccess
                          ? 'text-quiz-text hover:bg-quiz-light hover:text-quiz-primary'
                          : 'text-quiz-text opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span className='w-5 h-5 rounded bg-quiz-light flex items-center justify-center text-xs font-bold'>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quiz Timer */}
            {session && !session.isComplete && (
              <div className='flex items-center space-x-2 px-4 py-2 bg-quiz-light rounded-lg border border-quiz-primary/20'>
                <svg
                  className='w-5 h-5 text-quiz-primary'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <div className='flex flex-col'>
                  <span className='text-xs text-quiz-text opacity-60'>Quiz Time</span>
                  <span className='text-sm font-semibold text-quiz-primary'>
                    {formatTime(elapsedTime)}
                  </span>
                </div>
              </div>
            )}

            {/* User Section */}
            <div className='flex items-center space-x-4 border-l border-quiz-border pl-4'>
              {currentUser && !shouldShowUserInput ? (
                <div className='flex items-center space-x-3'>
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-quiz-primary to-quiz-secondary flex items-center justify-center'>
                    <span className='text-white text-sm font-bold'>
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className='text-left'>
                    <p className='text-sm font-semibold text-quiz-text'>
                      {currentUser.name}
                    </p>
                    <p className='text-xs text-quiz-text opacity-60'>
                      Active User
                    </p>
                  </div>
                  <Button
                    variant='secondary'
                    size='sm'
                    onClick={handleLogout}
                    className='ml-4'
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className='flex items-center space-x-3'>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='text'
                      value={userName}
                      onChange={e => {
                        setUserName(e.target.value);
                        setUserError('');
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleCreateUser();
                        }
                      }}
                      placeholder='Enter your name'
                      className='px-3 py-2 text-sm border border-quiz-border rounded-md bg-quiz-bg text-quiz-text focus:outline-none focus:border-quiz-primary focus:ring-2 focus:ring-quiz-primary/20 transition-all duration-200'
                    />
                    <Button size='sm' onClick={handleCreateUser}>
                      Continue
                    </Button>
                  </div>
                </div>
              )}
              {userError && (
                <div className='absolute top-full right-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 whitespace-nowrap'>
                  {userError}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='text-quiz-text hover:text-quiz-primary focus:outline-none focus:ring-2 focus:ring-quiz-primary rounded-md p-2'
              aria-label='Toggle mobile menu'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                ) : (
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className='md:hidden border-t border-quiz-border'>
            <div className='px-2 pt-2 pb-3 space-y-1'>
              {/* Navigation Items */}
              {navItems.map(item => {
                const canAccess = !item.requiresAuth || currentUser;
                const isActive = isActivePath(item.path);

                return (
                  <button
                    key={item.path}
                    onClick={() =>
                      handleNavigation(item.path, item.requiresAuth)
                    }
                    disabled={!canAccess}
                    className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-quiz-primary text-white'
                        : canAccess
                          ? 'text-quiz-text hover:bg-quiz-light hover:text-quiz-primary'
                          : 'text-quiz-text opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span className='w-6 h-6 rounded bg-quiz-light flex items-center justify-center text-sm font-bold'>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Quiz Timer - Mobile */}
              {session && !session.isComplete && (
                <div className='mx-3 mt-3 p-3 bg-quiz-light rounded-lg border border-quiz-primary/20'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <svg
                        className='w-5 h-5 text-quiz-primary'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                      <span className='text-sm text-quiz-text opacity-60'>Quiz Time</span>
                    </div>
                    <span className='text-lg font-bold text-quiz-primary'>
                      {formatTime(elapsedTime)}
                    </span>
                  </div>
                </div>
              )}

              {/* User Section */}
              <div className='pt-4 border-t border-quiz-border'>
                {currentUser && !shouldShowUserInput ? (
                  <div className='px-3 space-y-3'>
                    <div className='flex items-center space-x-3 py-2'>
                      <div className='w-8 h-8 rounded-full bg-gradient-to-br from-quiz-primary to-quiz-secondary flex items-center justify-center'>
                        <span className='text-white text-sm font-bold'>
                          {currentUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className='text-sm font-semibold text-quiz-text'>
                          {currentUser.name}
                        </p>
                        <p className='text-xs text-quiz-text opacity-60'>
                          Active User
                        </p>
                      </div>
                    </div>
                    <Button
                      variant='secondary'
                      size='sm'
                      onClick={handleLogout}
                      className='w-full'
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className='px-3 space-y-3'>
                    <div className='space-y-2'>
                      <input
                        type='text'
                        value={userName}
                        onChange={e => {
                          setUserName(e.target.value);
                          setUserError('');
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleCreateUser();
                          }
                        }}
                        placeholder='Enter your name'
                        className='w-full px-3 py-2 text-sm border border-quiz-border rounded-md bg-quiz-bg text-quiz-text focus:outline-none focus:border-quiz-primary focus:ring-2 focus:ring-quiz-primary/20 transition-all duration-200'
                      />
                      {userError && (
                        <p className='text-sm text-red-600'>{userError}</p>
                      )}
                    </div>
                    <Button
                      size='sm'
                      onClick={async () => {
                        await handleCreateUser();
                        // Close mobile menu after adding user
                        setIsMobileMenuOpen(false);
                      }}
                      className='w-full'
                    >
                      Continue
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
