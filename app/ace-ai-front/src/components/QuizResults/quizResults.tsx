// QuizResults Component - Updated to use QuizContext instead of location.state
// Force reload: v2.0
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Global/button';
import Card from '../Global/card';
import Badge from '../Global/badge';
import ProgressBar from '../Global/progressBar';
import { useQuiz, useUser } from '../../context/AppContext';
import type {
  LegacyQuestion,
  PerformanceAnalysis,
  QuestionFeedback,
} from '../../api/types';

interface ReviewSectionProps {
  feedback: QuestionFeedback[];
  questions: LegacyQuestion[];
}

const ReviewSection = ({ feedback, questions }: ReviewSectionProps) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  return (
    <div className='space-y-4'>
      <h3
        className='text-lg font-semibold'
        style={{ color: 'var(--color-quiz-text)' }}
      >
        Question Review
      </h3>

      {feedback.map((questionFeedback, index) => {
        const question = questions.find(
          q => q.id === questionFeedback.questionId
        );
        if (!question) {
          return null;
        }

        const isExpanded = expandedQuestions.has(questionFeedback.questionId);

        return (
          <Card
            key={questionFeedback.questionId}
            className='border-l-4'
            style={{
              borderLeftColor: questionFeedback.isCorrect
                ? '#10b981'
                : '#ef4444',
            }}
          >
            <div className='space-y-3'>
              <div className='flex items-start justify-between'>
                <div className='flex-1 space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant={
                        questionFeedback.isCorrect ? 'success' : 'danger'
                      }
                      size='sm'
                    >
                      {questionFeedback.isCorrect ? '✓' : '✗'}
                    </Badge>
                    <span
                      className='text-sm font-medium'
                      style={{ color: 'var(--color-quiz-text)' }}
                    >
                      Question {index + 1}
                    </span>
                    {question.subSubject && (
                      <Badge variant='secondary' size='sm'>
                        {question.subSubject}
                      </Badge>
                    )}
                  </div>
                  <button
                    className='text-sm font-medium cursor-pointer hover:opacity-75 text-left w-full'
                    style={{ color: 'var(--color-quiz-text)' }}
                    onClick={() => toggleQuestion(questionFeedback.questionId)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleQuestion(questionFeedback.questionId);
                      }
                    }}
                    aria-expanded={expandedQuestions.has(
                      questionFeedback.questionId
                    )}
                    aria-label={`Toggle details for: ${question.question}`}
                  >
                    {question.question}
                  </button>
                </div>
                <Button
                  variant='secondary'
                  size='sm'
                  onClick={() => toggleQuestion(questionFeedback.questionId)}
                >
                  {isExpanded ? 'Hide' : 'Show'} Details
                </Button>
              </div>

              {isExpanded && (
                <div
                  className='space-y-4 pt-2 border-t'
                  style={{ borderColor: 'var(--color-quiz-border)' }}
                >
                  {/* Question Options */}
                  <div className='space-y-2'>
                    <p
                      className='text-sm font-medium'
                      style={{ color: 'var(--color-quiz-text)' }}
                    >
                      Answer Options:
                    </p>
                    <div className='space-y-1'>
                      {question.options.map(option => {
                        const isUserAnswer =
                          questionFeedback.userAnswers.includes(option.id);
                        const isCorrectAnswer =
                          questionFeedback.correctAnswers.includes(option.id);

                        let badgeVariant:
                          | 'success'
                          | 'danger'
                          | 'secondary'
                          | 'warning' = 'secondary';
                        if (isCorrectAnswer && isUserAnswer) {
                          badgeVariant = 'success';
                        } else if (isCorrectAnswer) {
                          badgeVariant = 'warning';
                        } else if (isUserAnswer) {
                          badgeVariant = 'danger';
                        }

                        return (
                          <div
                            key={option.id}
                            className='flex items-center gap-2'
                          >
                            <Badge variant={badgeVariant} size='sm'>
                              {option.id.toUpperCase()}
                            </Badge>
                            <span
                              className='text-sm'
                              style={{ color: 'var(--color-quiz-text)' }}
                            >
                              {option.text}
                            </span>
                            {isUserAnswer && (
                              <span className='text-xs text-blue-600'>
                                (Your answer)
                              </span>
                            )}
                            {isCorrectAnswer && (
                              <span className='text-xs text-green-600'>
                                (Correct)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className='bg-quiz-light p-3 rounded-lg'>
                    <p
                      className='text-sm font-medium mb-1'
                      style={{ color: 'var(--color-quiz-text)' }}
                    >
                      Explanation:
                    </p>
                    <p
                      className='text-sm opacity-90'
                      style={{ color: 'var(--color-quiz-text)' }}
                    >
                      {questionFeedback.explanation}
                    </p>
                  </div>

                  {/* Tips */}
                  {questionFeedback.tips &&
                    questionFeedback.tips.length > 0 && (
                      <div className='space-y-1'>
                        <p
                          className='text-sm font-medium'
                          style={{ color: 'var(--color-quiz-text)' }}
                        >
                          Tips:
                        </p>
                        <ul
                          className='text-sm opacity-90 space-y-1'
                          style={{ color: 'var(--color-quiz-text)' }}
                        >
                          {questionFeedback.tips.map((tip, tipIndex) => (
                            <li
                              key={tipIndex}
                              className='flex items-start gap-2'
                            >
                              <span className='text-quiz-primary'>•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

interface PerformanceAnalysisProps {
  analysis: PerformanceAnalysis;
}

const PerformanceAnalysisSection = ({ analysis }: PerformanceAnalysisProps) => (
  <Card>
    <div className='space-y-4'>
      <h3
        className='text-lg font-semibold'
        style={{ color: 'var(--color-quiz-text)' }}
      >
        Performance Analysis
      </h3>

      {/* Time Analysis */}
      {analysis.timeSpent && (
        <div className='grid grid-cols-2 gap-4'>
          <div className='text-center p-3 bg-quiz-light rounded-lg'>
            <p
              className='text-2xl font-bold'
              style={{ color: 'var(--color-quiz-text)' }}
            >
              {Math.floor(analysis.timeSpent / 60)}:
              {String(analysis.timeSpent % 60).padStart(2, '0')}
            </p>
            <p
              className='text-sm opacity-70'
              style={{ color: 'var(--color-quiz-text)' }}
            >
              Total Time
            </p>
          </div>
          <div className='text-center p-3 bg-quiz-light rounded-lg'>
            <p
              className='text-2xl font-bold'
              style={{ color: 'var(--color-quiz-text)' }}
            >
              {analysis.averageTimePerQuestion
                ? Math.round(analysis.averageTimePerQuestion)
                : 0}
              s
            </p>
            <p
              className='text-sm opacity-70'
              style={{ color: 'var(--color-quiz-text)' }}
            >
              Avg per Question
            </p>
          </div>
        </div>
      )}

      {/* Strong and Weak Areas */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {analysis.strongAreas.length > 0 && (
          <div className='space-y-2'>
            <p className='font-medium text-emerald-600'>Strong Areas:</p>
            <div className='flex flex-wrap gap-1'>
              {analysis.strongAreas.map((area, index) => (
                <Badge key={index} variant='success' size='sm'>
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {analysis.weakAreas.length > 0 && (
          <div className='space-y-2'>
            <p className='font-medium text-red-600'>Areas for Improvement:</p>
            <div className='flex flex-wrap gap-1'>
              {analysis.weakAreas.map((area, index) => (
                <Badge key={index} variant='danger' size='sm'>
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className='space-y-2'>
          <p
            className='font-medium'
            style={{ color: 'var(--color-quiz-text)' }}
          >
            Recommendations:
          </p>
          <ul className='space-y-1'>
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className='flex items-start gap-2 text-sm'>
                <span className='text-quiz-primary'>•</span>
                <span style={{ color: 'var(--color-quiz-text)' }}>
                  {recommendation}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </Card>
);

const QuizResults = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const { session, results, resetQuiz } = useQuiz();
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🎯 QuizResults component state:', {
        isAuthenticated,
        hasResults: !!results,
        hasSession: !!session,
        results,
        session,
      });
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }

    // Redirect if no results or session
    if (!results || !session) {
      navigate('/generate-quiz', { replace: true });
      return;
    }
  }, [isAuthenticated, results, session, navigate]);

  // Return early if no results
  if (!results || !session) {
    return (
      <div className='min-h-[calc(100vh-4rem)] flex items-center justify-center'>
        <Card className='text-center space-y-4'>
          <div className='text-xl' style={{ color: 'var(--color-quiz-text)' }}>
            Loading results...
          </div>
        </Card>
      </div>
    );
  }

  // Calculate values for display - handle both new API format and legacy format
  const finalScore = results.correctAnswers || results.basicScore || 0;
  const finalTotal = results.totalQuestions || session.questions.length;
  const percentage = finalTotal > 0 ? (finalScore / finalTotal) * 100 : 0;
  const subject = session.metadata?.subject || 'Quiz';

  const getScoreVariant = (pct: number) => {
    if (pct >= 80) {
      return 'success';
    }
    if (pct >= 60) {
      return 'warning';
    }
    return 'danger';
  };

  const getScoreMessage = (pct: number) => {
    // Use API reflection if available, otherwise fall back to basic messages
    if (results.reflection) {
      return results.reflection;
    }

    if (!results.overallReview) {
      // Fallback messages
      if (pct >= 90) {
        return 'Excellent work!';
      }
      if (pct >= 80) {
        return 'Great job!';
      }
      if (pct >= 70) {
        return 'Good effort!';
      }
      if (pct >= 60) {
        return 'Not bad, keep practicing!';
      }
      return 'Keep studying and try again!';
    }
    return results.overallReview?.summary || 'Complete!';
  };

  const handleRetakeQuiz = () => {
    resetQuiz(); // Clear current quiz data
    navigate('/generate-quiz');
  };

  const handleBackToHome = () => {
    resetQuiz(); // Clear current quiz data
    navigate('/');
  };

  // This check is now handled in the useEffect above

  return (
    <div className='min-h-[calc(100vh-4rem)] p-4'>
      <div className='max-w-4xl mx-auto py-8'>
        {/* Header */}
        <Card className='text-center space-y-6 mb-6'>
          <div className='space-y-2'>
            <h1
              className='text-3xl font-bold'
              style={{ color: 'var(--color-quiz-text)' }}
            >
              {results.overallReview
                ? `Grade: ${results.overallReview.grade}`
                : 'Quiz Complete!'}
            </h1>
            <p
              className='text-lg opacity-80'
              style={{ color: 'var(--color-quiz-text)' }}
            >
              {subject} Quiz Results
            </p>
          </div>

          <div className='space-y-4'>
            <div className='flex justify-center'>
              <Badge variant={getScoreVariant(percentage)} size='lg'>
                {finalScore} / {finalTotal} Correct
              </Badge>
            </div>

            <div className='space-y-2'>
              <ProgressBar
                value={percentage}
                color={getScoreVariant(percentage)}
                size='lg'
                showLabel
                label='Your Score'
              />
            </div>
          </div>

          {/* View Toggle Buttons */}
          {(results.feedback || results.questionReviews) && (
            <div className='grid grid-cols-2 gap-3'>
              <Button
                variant={!showReview ? 'primary' : 'secondary'}
                onClick={() => setShowReview(false)}
                className='w-full'
              >
                Overview
              </Button>
              <Button
                variant={showReview ? 'primary' : 'secondary'}
                onClick={() => setShowReview(true)}
                className='w-full'
              >
                Review Questions
              </Button>
            </div>
          )}
        </Card>

        {/* Score Breakdown - Always Visible */}
        <Card>
          <div className='space-y-4'>
            <h3
              className='text-lg font-semibold'
              style={{ color: 'var(--color-quiz-text)' }}
            >
              Score Breakdown
            </h3>

            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
              <div className='p-3 bg-quiz-light rounded-lg'>
                <p className='text-2xl font-bold text-emerald-600'>
                  {finalScore}
                </p>
                <p
                  className='text-sm opacity-70'
                  style={{ color: 'var(--color-quiz-text)' }}
                >
                  Correct
                </p>
              </div>
              <div className='p-3 bg-quiz-light rounded-lg'>
                <p className='text-2xl font-bold text-red-600'>
                  {finalTotal - finalScore}
                </p>
                <p
                  className='text-sm opacity-70'
                  style={{ color: 'var(--color-quiz-text)' }}
                >
                  Incorrect
                </p>
              </div>
              <div className='p-3 bg-quiz-light rounded-lg'>
                <p
                  className='text-2xl font-bold'
                  style={{ color: 'var(--color-quiz-text)' }}
                >
                  {finalTotal}
                </p>
                <p
                  className='text-sm opacity-70'
                  style={{ color: 'var(--color-quiz-text)' }}
                >
                  Total
                </p>
              </div>
              <div className='p-3 bg-quiz-light rounded-lg'>
                <p
                  className='text-2xl font-bold'
                  style={{ color: 'var(--color-quiz-text)' }}
                >
                  {Math.round(percentage)}%
                </p>
                <p
                  className='text-sm opacity-70'
                  style={{ color: 'var(--color-quiz-text)' }}
                >
                  Score
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Default Overview Content */}
        {!showReview && (
          <div className='space-y-6'>
            {/* API Reflection (New Format) */}
            {results.reflection && !results.overallReview && (
              <Card>
                <div className='space-y-4'>
                  <h3
                    className='text-lg font-semibold'
                    style={{ color: 'var(--color-quiz-text)' }}
                  >
                    Quiz Reflection
                  </h3>
                  <div className='bg-quiz-light p-4 rounded-lg'>
                    <p
                      className='text-sm leading-relaxed whitespace-pre-wrap'
                      style={{ color: 'var(--color-quiz-text)' }}
                    >
                      {results.reflection}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Overall Review (Legacy Format) */}
            {results.overallReview && (
              <Card>
                <div className='space-y-4'>
                  <h3
                    className='text-lg font-semibold'
                    style={{ color: 'var(--color-quiz-text)' }}
                  >
                    Overall Review
                  </h3>

                  {results.overallReview.strengths.length > 0 && (
                    <div className='space-y-2'>
                      <p className='font-medium text-emerald-600'>Strengths:</p>
                      <ul className='space-y-1'>
                        {results.overallReview.strengths.map(
                          (strength, index) => (
                            <li
                              key={index}
                              className='flex items-start gap-2 text-sm'
                            >
                              <span className='text-emerald-500'>✓</span>
                              <span style={{ color: 'var(--color-quiz-text)' }}>
                                {strength}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {results.overallReview.improvements.length > 0 && (
                    <div className='space-y-2'>
                      <p className='font-medium text-amber-600'>
                        Areas for Improvement:
                      </p>
                      <ul className='space-y-1'>
                        {results.overallReview.improvements.map(
                          (improvement, index) => (
                            <li
                              key={index}
                              className='flex items-start gap-2 text-sm'
                            >
                              <span className='text-amber-500'>⚠</span>
                              <span style={{ color: 'var(--color-quiz-text)' }}>
                                {improvement}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {results.overallReview.nextSteps.length > 0 && (
                    <div className='space-y-2'>
                      <p
                        className='font-medium'
                        style={{ color: 'var(--color-quiz-text)' }}
                      >
                        Next Steps:
                      </p>
                      <ul className='space-y-1'>
                        {results.overallReview.nextSteps.map((step, index) => (
                          <li
                            key={index}
                            className='flex items-start gap-2 text-sm'
                          >
                            <span className='text-quiz-primary'>→</span>
                            <span style={{ color: 'var(--color-quiz-text)' }}>
                              {step}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Review Questions Content */}
        {showReview && results.feedback && (
          <ReviewSection
            feedback={results.feedback}
            questions={session.questions}
          />
        )}

        {showReview && results.questionReviews && !results.feedback && (
          <Card>
            <div className='space-y-4'>
              <h3
                className='text-lg font-semibold'
                style={{ color: 'var(--color-quiz-text)' }}
              >
                Question Review
              </h3>

              {results.questionReviews.map(review => {
                const question = session.questions.find(
                  q => q.questionNum === review.questionNum
                );

                if (!question) {
                  return null;
                }

                return (
                  <div
                    key={review.questionNum}
                    className='border-l-4 border-quiz-primary pl-4'
                  >
                    <div className='flex items-start justify-between mb-2'>
                      <h4
                        className='font-medium'
                        style={{ color: 'var(--color-quiz-text)' }}
                      >
                        Question {review.questionNum}
                      </h4>
                      <Badge
                        variant={review.isCorrect ? 'success' : 'danger'}
                        size='sm'
                      >
                        {review.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </Badge>
                    </div>

                    <p
                      className='text-sm mb-3'
                      style={{ color: 'var(--color-quiz-text)' }}
                    >
                      {question.question}
                    </p>

                    {review.explanation && (
                      <div className='bg-quiz-light p-3 rounded-lg'>
                        <p
                          className='text-sm'
                          style={{ color: 'var(--color-quiz-text)' }}
                        >
                          <strong>Explanation:</strong> {review.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Action Buttons Card */}
        <Card>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <Button onClick={handleRetakeQuiz} className='w-full'>
              Take Another Quiz
            </Button>
            <Button
              onClick={handleBackToHome}
              variant='secondary'
              className='w-full'
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QuizResults;
