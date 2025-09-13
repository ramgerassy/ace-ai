import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../Global/button';
import Card from '../Global/card';
import { useUser } from '../../context/useUser';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, createUser } = useUser();

  const [isVisible, setIsVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [showUserInput, setShowUserInput] = useState(false);
  const [userName, setUserName] = useState('');
  const [userError, setUserError] = useState('');

  useEffect(() => {
    // Staggered animations for smooth entry
    const timer1 = setTimeout(() => setIsVisible(true), 100);
    const timer2 = setTimeout(() => setFeaturesVisible(true), 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleCreateUser = async () => {
    const result = await createUser(userName);

    if (!result.success) {
      setUserError(result.error || 'Failed to create user');
      return;
    }

    setShowUserInput(false);
    setUserName('');
    setUserError('');
  };

  const handleStartQuiz = () => {
    if (!isAuthenticated) {
      setUserError('Please sign in to start the quiz');
      setShowUserInput(true);
      return;
    }
    navigate('/generate-quiz');
  };

  const features = [
    {
      icon: '🧠',
      title: 'AI-Powered',
      description: 'Intelligent questions adapted to your level',
    },
    {
      icon: '📊',
      title: 'Real-time Feedback',
      description: 'Get instant insights on your performance',
    },
    {
      icon: '🎯',
      title: 'Personalized',
      description: 'Tailored content for your learning goals',
    },
  ];

  return (
    <div className='min-h-[calc(100vh-4rem)] relative overflow-hidden'>
      {/* Background Pattern */}
      <div className='absolute inset-0 opacity-5 pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-radial from-quiz-primary to-transparent' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-radial from-quiz-accent to-transparent' />
      </div>

      {/* Main Content */}
      <div className='relative z-10 min-h-screen flex flex-col'>
        {/* Header Section */}
        <div className='flex-1 flex items-center justify-center px-4 py-8 sm:py-12'>
          <div className='w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl'>
            {/* Hero Card */}
            <Card
              className={`text-center transform transition-all duration-700 ${
                isVisible
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-8 opacity-0'
              }`}
            >
              <div className='space-y-6 sm:space-y-8'>
                {/* App Icon/Logo */}
                <div
                  className={`mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center 
                  bg-gradient-to-br from-quiz-primary to-quiz-secondary shadow-quiz-md
                  animate-bounce-in hover:animate-pulse-glow ${
                    isVisible ? 'animate-pulse-glow' : ''
                  }`}
                >
                  <span className='text-2xl sm:text-3xl text-white font-bold'>
                    🎓
                  </span>
                </div>

                {/* Main Heading */}
                <div className='space-y-3 sm:space-y-4 animate-fade-in-up'>
                  <h1
                    className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-heading 
                    leading-tight text-quiz-text'
                  >
                    {currentUser && !showUserInput ? (
                      <>
                        Welcome back,{' '}
                        <span className='bg-gradient-to-r from-quiz-primary to-quiz-accent bg-clip-text text-transparent'>
                          {currentUser.name}!
                        </span>
                      </>
                    ) : (
                      <>
                        Welcome to <br />
                        <span className='bg-gradient-to-r from-quiz-primary to-quiz-accent bg-clip-text text-transparent'>
                          Ace AI Quiz
                        </span>
                      </>
                    )}
                  </h1>
                  <p
                    className='text-base sm:text-lg md:text-xl text-quiz-text opacity-80 
                    leading-relaxed px-2 sm:px-0 font-body'
                  >
                    Master any subject with personalized AI-powered quizzes
                  </p>
                </div>

                {/* User Input or CTA Button */}
                {showUserInput ? (
                  <div className='space-y-4 px-4 sm:px-8'>
                    <div className='space-y-2'>
                      <label
                        htmlFor='userName'
                        className='block text-sm font-medium text-quiz-text'
                      >
                        What&apos;s your name?
                      </label>
                      <input
                        id='userName'
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
                        className='w-full px-4 py-3 rounded-lg border-2 border-quiz-border bg-quiz-bg text-quiz-text
                          focus:outline-none focus:border-quiz-primary focus:ring-2 focus:ring-quiz-primary/20
                          transition-all duration-200 font-body'
                      />
                      {userError && (
                        <p className='text-sm text-red-500 animate-fade-in-up'>
                          {userError}
                        </p>
                      )}
                    </div>

                    <div>
                      <Button onClick={handleCreateUser} className='w-full'>
                        Continue
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='pt-2'>
                    <Button
                      onClick={handleStartQuiz}
                      size='lg'
                      className='w-full sm:w-auto sm:px-12 text-base sm:text-lg font-semibold 
                        transform hover:scale-105 transition-all duration-300'
                    >
                      Start Your Journey
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Feature Cards */}
            <div
              className={`mt-8 sm:mt-12 transition-all duration-700 delay-300 ${
                featuresVisible
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-8 opacity-0'
              }`}
            >
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6'>
                {features.map((feature, index) => (
                  <div
                    key={feature.title}
                    className={`transform transition-all duration-500 ${
                      featuresVisible
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-4 opacity-0'
                    }`}
                    style={{ transitionDelay: `${800 + index * 150}ms` }}
                  >
                    <Card
                      className='text-center p-4 sm:p-6 transition-all duration-300 cursor-pointer group 
                        focus:outline-none focus:ring-4 focus:ring-quiz-primary/30
                        hover:-translate-y-2 hover:scale-[1.02] hover:shadow-quiz-lg'
                      variant='elevated'
                      role='button'
                      tabIndex={0}
                      aria-label={`Learn about ${feature.title}: ${feature.description}`}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          // Could add feature details modal here
                        }
                      }}
                    >
                      <div className='space-y-3'>
                        <div
                          className='text-2xl sm:text-3xl group-hover:scale-110 
                          transition-transform duration-300 group-hover:animate-bounce-in'
                          role='img'
                          aria-label={feature.title}
                        >
                          {feature.icon}
                        </div>
                        <h3 className='text-sm sm:text-base font-semibold font-heading text-quiz-primary'>
                          {feature.title}
                        </h3>
                        <p
                          className='text-xs sm:text-sm text-quiz-text opacity-70 
                          leading-relaxed font-body'
                        >
                          {feature.description}
                        </p>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className='text-center py-6 px-4'>
          <p className='text-xs sm:text-sm text-quiz-text opacity-60 font-body'>
            Ready to challenge yourself? Let&apos;s begin your learning
            adventure.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default WelcomeScreen;
