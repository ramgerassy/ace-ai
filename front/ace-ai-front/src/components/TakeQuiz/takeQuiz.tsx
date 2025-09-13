import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Global/button';
import Card from '../Global/card';
import RadioGroup from '../Global/radioGroup';
import CheckboxGroup from '../Global/checkboxGroup';
import ProgressBar from '../Global/progressBar';
import Badge from '../Global/badge';
import { ApiClient } from '../../api/apiClient';
import { useQuiz, useUser } from '../../context/AppContext';
import type { UserAnswer as ApiUserAnswer, Question } from '../../api/types';

interface QuizHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  progress: number;
  subject?: string;
  level?: string;
}

const QuizHeader = ({
  currentQuestion,
  totalQuestions,
  progress,
  subject = 'Quiz',
  level = 'intermediate',
}: QuizHeaderProps) => (
  <div className='mb-6'>
    <div className='flex justify-between items-center mb-4'>
      <Badge variant='secondary'>
        Question {currentQuestion + 1} of {totalQuestions}
      </Badge>
      <Badge>
        {subject} &bull; {level}
      </Badge>
    </div>
    <ProgressBar
      value={progress}
      showLabel
      label='Quiz Progress'
      className='mb-2'
    />
  </div>
);

interface QuizNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  hasAnswer: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onBackToGenerate: () => void;
}

const QuizNavigation = ({
  currentQuestion,
  totalQuestions,
  hasAnswer,
  onPrevious,
  onNext,
  onBackToGenerate,
}: QuizNavigationProps) => (
  <div className='flex gap-3'>
    <Button
      variant='secondary'
      onClick={currentQuestion === 0 ? onBackToGenerate : onPrevious}
      className='flex-1'
    >
      {currentQuestion === 0 ? 'Back to Setup' : 'Previous'}
    </Button>
    <Button onClick={onNext} disabled={!hasAnswer} className='flex-1'>
      {currentQuestion === totalQuestions - 1 ? 'Finish Quiz' : 'Next Question'}
    </Button>
  </div>
);

// Convert legacy quiz data to API contract format for quiz review

const TakeQuiz = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const {
    session,
    currentQuestion,
    progress,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    setResults,
  } = useQuiz();

  useEffect(() => {
    // Redirect if not authenticated or no active quiz session
    if (!isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }

    if (!session || !session.questions.length) {
      navigate('/generate-quiz', { replace: true });
      return;
    }
  }, [isAuthenticated, session, navigate]);

  const handleSingleAnswer = (value: string) => {
    if (!session || !currentQuestion) {
      return;
    }
    answerQuestion(currentQuestion.questionNum, [value]);
  };

  const handleMultipleAnswers = (values: string[]) => {
    if (!session || !currentQuestion) {
      return;
    }
    answerQuestion(currentQuestion.questionNum, values);
  };

  const handleNext = async () => {
    if (!session) {
      return;
    }

    const isQuizComplete = nextQuestion();

    if (isQuizComplete) {
      // Quiz completed, generate feedback
      //const timeSpent = Math.floor((Date.now() - session.startTime) / 1000);

      try {
        // Convert to new API format
        const userAnswers: ApiUserAnswer[] = session.questions.map(
          question => ({
            questionNum: question.questionNum,
            question: question.question,
            possibleAnswers: question.possibleAnswers,
            correctAnswer: question.correctAnswer,
            userAnswer: session.answers[question.questionNum]
              ? session.answers[question.questionNum]
                  .map(answerText =>
                    question.possibleAnswers.indexOf(answerText)
                  )
                  .filter(index => index !== -1) // Filter out any answers not found
              : [],
          })
        );

        const reviewResponse = await ApiClient.reviewQuiz({
          userAnswers,
        });

        if ('error' in reviewResponse) {
          console.error('Quiz review failed:', reviewResponse.error);
          // Fallback to basic results using context
          const basicScore = calculateBasicScore(
            session.questions,
            session.answers
          );
          setResults({
            basicScore,
            totalQuestions: session.questions.length,
          });
          navigate('/quiz-results');
          return;
        }

        if (reviewResponse.success) {
          // Set results in context
          setResults({
            // API response data
            score: reviewResponse.score,
            correctAnswers: reviewResponse.correctAnswers,
            totalQuestions: reviewResponse.totalQuestions,
            reflection: reviewResponse.reflection,
            questionReviews: reviewResponse.questionReviews,
          });
          navigate('/quiz-results');
        } else {
          console.error('Quiz review failed: Invalid response format');
          // Fallback to basic results
          const basicScore = calculateBasicScore(
            session.questions,
            session.answers
          );
          setResults({
            basicScore,
            totalQuestions: session.questions.length,
          });
          navigate('/quiz-results');
        }
      } catch (error) {
        console.error('Quiz review error:', error);
        // Fallback to basic results
        const basicScore = calculateBasicScore(
          session.questions,
          session.answers
        );
        setResults({
          basicScore,
          totalQuestions: session.questions.length,
        });
        navigate('/quiz-results');
      }
    }
  };

  const calculateBasicScore = (
    questions: Question[],
    answers: Record<number, string[]>
  ) => {
    return questions.reduce((score, question) => {
      const userAnswerTexts = answers[question.questionNum] || [];
      // Convert user answer strings to indices
      const userAnswerIndices = userAnswerTexts
        .map(text => question.possibleAnswers.indexOf(text))
        .filter(idx => idx !== -1);
      const correctIndices = question.correctAnswer;

      // Simple comparison for single-choice questions
      if (userAnswerIndices.length === 1 && correctIndices.length === 1) {
        return userAnswerIndices[0] === correctIndices[0] ? score + 1 : score;
      }

      // For multi-choice, check if arrays match
      const sortedUser = [...userAnswerIndices].sort();
      const sortedCorrect = [...correctIndices].sort();

      if (sortedUser.length === sortedCorrect.length) {
        const isCorrect = sortedUser.every(
          (answer, index) => answer === sortedCorrect[index]
        );
        return isCorrect ? score + 1 : score;
      }

      return score;
    }, 0);
  };

  const handlePrevious = () => {
    previousQuestion();
  };

  const handleBackToGenerate = () => {
    navigate('/generate-quiz');
  };

  // Show loading if no session
  if (!session || !session.questions.length) {
    return (
      <div className='min-h-[calc(100vh-4rem)] flex items-center justify-center'>
        <Card className='text-center space-y-4'>
          <div className='text-xl' style={{ color: 'var(--color-quiz-text)' }}>
            Loading quiz...
          </div>
          <div className='space-y-2'>
            <div className='w-64 h-2 bg-quiz-border rounded-full mx-auto'>
              <div className='h-2 bg-quiz-primary rounded-full animate-pulse w-1/2' />
            </div>
            <p
              className='text-sm opacity-70'
              style={{ color: 'var(--color-quiz-text)' }}
            >
              Preparing your personalized quiz
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className='min-h-[calc(100vh-4rem)] flex items-center justify-center'>
        <Card className='text-center space-y-4'>
          <div className='text-xl' style={{ color: 'var(--color-quiz-text)' }}>
            Question not found
          </div>
        </Card>
      </div>
    );
  }

  const currentAnswer = session.answers[currentQuestion.questionNum] || [];

  // Detect if this is a multiple choice question (more than one correct answer)
  const isMultipleChoice = currentQuestion.correctAnswer && currentQuestion.correctAnswer.length > 1;

  // Convert Question format to options
  const answerOptions = currentQuestion.possibleAnswers ? 
    currentQuestion.possibleAnswers.map(option => ({
      label: option,
      value: option,
    })) : [];

  // Check if current question is properly answered
  const hasValidAnswer = isMultipleChoice
    ? currentAnswer.length === currentQuestion.correctAnswer.length
    : currentAnswer.length > 0;

  return (
    <div className='min-h-[calc(100vh-4rem)] p-4'>
      <div className='max-w-4xl mx-auto py-8'>
        <QuizHeader
          currentQuestion={session.currentQuestionIndex}
          totalQuestions={session.questions.length}
          progress={progress}
          subject={session.metadata?.subject}
          level={session.metadata?.level}
        />

        <Card className='mb-6'>
          <div className='space-y-6'>
            <div className='space-y-2'>
              <div className='flex items-start justify-between'>
                <h2
                  className='text-xl font-semibold flex-1'
                  style={{ color: 'var(--color-quiz-text)' }}
                >
                  {currentQuestion.question}
                </h2>
                {session.metadata?.level && (
                  <Badge
                    variant={
                      session.metadata.level === 'hard'
                        ? 'danger'
                        : session.metadata.level === 'intermediate'
                          ? 'warning'
                          : 'success'
                    }
                    size='sm'
                  >
                    {session.metadata.level}
                  </Badge>
                )}
              </div>

              {session.metadata?.subSubjects && (
                <p
                  className='text-sm opacity-70'
                  style={{ color: 'var(--color-quiz-text)' }}
                >
                  Topic:
                  {session.metadata?.subSubjects.map(subSubject => (
                    <span key={subSubject}> {subSubject}</span>
                  ))}
                </p>
              )}
            </div>

            {/* Question Type Indicator */}
            <div className='mb-3'>
              <Badge
                variant={isMultipleChoice ? 'warning' : 'secondary'}
                size='sm'
              >
                {isMultipleChoice
                  ? `Multiple Choice (Select ${currentQuestion.correctAnswer.length} answers)`
                  : 'Single Choice (Select 1 answer)'}
              </Badge>
            </div>

            {/* Answer Input */}
            {isMultipleChoice ? (
              <CheckboxGroup
                name={`question-${currentQuestion.questionNum}`}
                options={answerOptions}
                values={currentAnswer}
                onChange={handleMultipleAnswers}
                label={`Select ${currentQuestion.correctAnswer.length} answers:`}
              />
            ) : (
              <RadioGroup
                name={`question-${currentQuestion.questionNum}`}
                options={answerOptions}
                value={currentAnswer[0] || ''}
                onChange={handleSingleAnswer}
              />
            )}

            {/* Answer Progress for Multiple Choice */}
            {isMultipleChoice && (
              <div className='mt-3 p-3 bg-quiz-light rounded-lg'>
                <p
                  className='text-sm'
                  style={{ color: 'var(--color-quiz-text)' }}
                >
                  <strong>Progress:</strong> {currentAnswer.length} of{' '}
                  {currentQuestion.correctAnswer.length} answers selected
                  {currentAnswer.length <
                    currentQuestion.correctAnswer.length && (
                    <span className='text-amber-600 ml-2'>
                      (Select{' '}
                      {currentQuestion.correctAnswer.length -
                        currentAnswer.length}{' '}
                      more)
                    </span>
                  )}
                  {currentAnswer.length ===
                    currentQuestion.correctAnswer.length && (
                    <span className='text-emerald-600 ml-2'>✓ Complete</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </Card>

        <QuizNavigation
          currentQuestion={session.currentQuestionIndex}
          totalQuestions={session.questions.length}
          hasAnswer={hasValidAnswer}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onBackToGenerate={handleBackToGenerate}
        />

        {/* Progress indicator */}
        <div className='mt-6 text-center'>
          <p
            className='text-sm opacity-70'
            style={{ color: 'var(--color-quiz-text)' }}
          >
            Time elapsed: {Math.floor((Date.now() - session.startTime) / 60000)}
            :
            {String(
              Math.floor(((Date.now() - session.startTime) % 60000) / 1000)
            ).padStart(2, '0')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
