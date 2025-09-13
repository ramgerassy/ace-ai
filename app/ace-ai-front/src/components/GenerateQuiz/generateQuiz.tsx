import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Global/button';
import Card from '../Global/card';
import Input from '../Global/input';
import RadioGroup from '../Global/radioGroup';
import Badge from '../Global/badge';
import { ApiClient } from '../../api/apiClient';
import { useQuiz, useUser } from '../../context/AppContext';
import type {
  Question as ApiQuestion,
  ErrorResponse,
  GenerateQuizResponse,
  LegacyQuestion,
  VerifySubSubjectResponse,
  VerifySubjectResponse,
} from '../../api/types';

const difficultyOptions = [
  { label: 'Easy', value: 'easy' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Hard', value: 'hard' },
];

// Adapter functions to convert between API contract and legacy format
const convertApiQuestionToLegacy = (
  apiQuestion: ApiQuestion,
  index: number
): LegacyQuestion => ({
  id: `q${apiQuestion.questionNum}`,
  question: apiQuestion.question,
  options: apiQuestion.possibleAnswers.map((text, idx) => ({
    id: String.fromCharCode(97 + idx), // 'a', 'b', 'c', 'd'
    text,
    isCorrect: apiQuestion.correctAnswer.includes(idx),
  })),
  correctAnswers: apiQuestion.correctAnswer.map(idx =>
    String.fromCharCode(97 + idx)
  ),
  explanation: `Question ${apiQuestion.questionNum} explanation`,
  difficulty: 'medium' as const,
  subSubject: 'general',
  tags: [],
});

const mapLegacyDifficultyToApi = (
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): 'easy' | 'intermediate' | 'hard' => {
  switch (difficulty) {
    case 'beginner':
      return 'easy';
    case 'intermediate':
      return 'intermediate';
    case 'advanced':
      return 'hard';
    default:
      return 'intermediate';
  }
};

interface QuizFormProps {
  onValidateSubject: () => void;
  onValidateSubSubjects: () => void;
  onGenerate: () => void;
  onBack: () => void;
}

const QuizForm = ({
  onValidateSubject,
  onValidateSubSubjects,
  onGenerate,
  onBack,
}: QuizFormProps) => {
  const {
    formData,
    validationState,
    isGenerating,
    updateFormData,
    canProceed,
  } = useQuiz();
  const { topic, subSubjects, difficulty } = formData;

  return (
    <div className='space-y-6'>
      {/* Subject Input */}
      <div className='space-y-2'>
        <Input
          label='Quiz Subject'
          placeholder='Enter a subject (e.g., Mathematics, Physics, History)'
          value={topic}
          onChange={e => updateFormData({ topic: e.target.value })}
          onBlur={onValidateSubject}
          helperText='Enter the main subject for your quiz'
          error={
            validationState.subject.validated &&
            !validationState.subject.isAppropriate
              ? 'This subject contains inappropriate content'
              : undefined
          }
        />

        {/* Subject Loading Spinner */}
        {validationState.subject.loading && (
          <div className='flex items-center gap-2 text-sm text-quiz-text opacity-70'>
            <div className='animate-spin rounded-full h-4 w-4 border-2 border-quiz-primary border-t-transparent' />
            Validating subject...
          </div>
        )}

        {/* Subject Validation Results */}
        {validationState.subject.validated && (
          <div className='space-y-2'>
            {validationState.subject.isValid &&
              validationState.subject.isAppropriate && (
                <Badge variant='success'>✓ Subject approved</Badge>
              )}

            {!validationState.subject.isAppropriate && (
              <div className='space-y-2'>
                <Badge variant='danger'>
                  ⚠ Inappropriate content detected
                </Badge>
                {validationState.subject.warnings.map((warning, index) => (
                  <p key={index} className='text-sm text-red-600'>
                    {warning}
                  </p>
                ))}
              </div>
            )}

            {validationState.subject.suggestions.length > 0 && (
              <div className='space-y-2'>
                <p
                  className='text-sm font-medium'
                  style={{ color: 'var(--color-quiz-text)' }}
                >
                  Suggested subjects:
                </p>
                <div className='flex flex-wrap gap-2'>
                  {validationState.subject.suggestions.map(
                    (suggestion, index) => (
                      <Badge
                        key={index}
                        variant='secondary'
                        className='cursor-pointer hover:bg-quiz-primary hover:text-white'
                        onClick={() => updateFormData({ topic: suggestion })}
                      >
                        {suggestion}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sub-subjects Input */}
      <div className='space-y-2'>
        <Input
          label='Sub-subjects'
          placeholder='Enter sub-topics separated by commas (e.g., algebra, geometry, calculus)'
          value={subSubjects}
          onChange={e => updateFormData({ subSubjects: e.target.value })}
          onBlur={onValidateSubSubjects}
          helperText='List specific topics within your subject area'
          disabled={
            !validationState.subject.isValid ||
            !validationState.subject.isAppropriate
          }
        />

        {/* Sub-subjects Loading Spinner */}
        {validationState.subSubjects.loading && (
          <div className='flex items-center gap-2 text-sm text-quiz-text opacity-70'>
            <div className='animate-spin rounded-full h-4 w-4 border-2 border-quiz-primary border-t-transparent' />
            Validating sub-subjects...
          </div>
        )}

        {/* Sub-subjects Validation Results */}
        {validationState.subSubjects.validated && (
          <div className='space-y-3'>
            {validationState.subSubjects.validSubjects.length > 0 && (
              <div>
                <p className='text-sm font-medium text-emerald-600 mb-1'>
                  ✓ Valid sub-subjects:
                </p>
                <div className='flex flex-wrap gap-1'>
                  {validationState.subSubjects.validSubjects.map(
                    (subject, index) => (
                      <Badge key={index} variant='success' size='sm'>
                        {subject}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}

            {validationState.subSubjects.invalidSubjects.length > 0 && (
              <div>
                <p className='text-sm font-medium text-amber-600 mb-1'>
                  ⚠ Invalid sub-subjects:
                </p>
                <div className='flex flex-wrap gap-1'>
                  {validationState.subSubjects.invalidSubjects.map(
                    (subject, index) => (
                      <Badge key={index} variant='warning' size='sm'>
                        {subject}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}

            {validationState.subSubjects.inappropriateSubjects.length > 0 && (
              <div>
                <p className='text-sm font-medium text-red-600 mb-1'>
                  ⚠ Inappropriate sub-subjects:
                </p>
                <div className='flex flex-wrap gap-1'>
                  {validationState.subSubjects.inappropriateSubjects.map(
                    (subject, index) => (
                      <Badge key={index} variant='danger' size='sm'>
                        {subject}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {Object.keys(validationState.subSubjects.suggestions).length >
              0 && (
              <div className='space-y-2'>
                <p
                  className='text-sm font-medium'
                  style={{ color: 'var(--color-quiz-text)' }}
                >
                  Suggested alternatives:
                </p>
                {Object.entries(validationState.subSubjects.suggestions).map(
                  ([invalid, suggestions]) => (
                    <div key={invalid} className='text-sm'>
                      <span className='font-medium'>
                        Instead of &quot;{invalid}&quot;:
                      </span>
                      <div className='flex flex-wrap gap-1 mt-1'>
                        {suggestions.map((suggestion, index) => (
                          <Badge
                            key={index}
                            variant='secondary'
                            size='sm'
                            className='cursor-pointer hover:bg-quiz-primary hover:text-white'
                            onClick={() => {
                              const newSubSubjects = subSubjects
                                .split(',')
                                .map(s => s.trim())
                                .map(s => (s === invalid ? suggestion : s))
                                .join(', ');
                              updateFormData({ subSubjects: newSubSubjects });
                            }}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Difficulty Selection */}
      <div>
        <RadioGroup
          name='difficulty'
          label='Difficulty Level'
          options={difficultyOptions}
          value={mapLegacyDifficultyToApi(difficulty)}
          onChange={value =>
            updateFormData({
              difficulty:
                value === 'easy'
                  ? 'beginner'
                  : value === 'hard'
                    ? 'advanced'
                    : 'intermediate',
            })
          }
        />
      </div>

      {/* Action Buttons */}
      <div className='flex gap-3 pt-4'>
        <Button variant='secondary' onClick={onBack} className='flex-1'>
          Back
        </Button>
        <Button
          onClick={onGenerate}
          isLoading={isGenerating}
          disabled={!canProceed}
          className='flex-1'
        >
          Generate Quiz
        </Button>
      </div>
    </div>
  );
};

const GenerateQuiz = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const {
    formData,
    validationState,
    updateValidationState,
    setGenerating,
    startQuiz,
    resetQuiz,
    clearFormData,
  } = useQuiz();

  // Debug logging for validation state changes (development only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Validation state updated:', {
        subject: {
          validated: validationState.subject.validated,
          isValid: validationState.subject.isValid,
          isAppropriate: validationState.subject.isAppropriate,
          loading: validationState.subject.loading,
        },
        subSubjectsDisabled:
          !validationState.subject.isValid ||
          !validationState.subject.isAppropriate,
      });
    }
  }, [validationState]);

  const handleValidateSubject = async () => {
    if (!formData.topic.trim()) {
      if (import.meta.env.DEV) {
        console.log('Subject validation skipped: empty topic');
      }
      return;
    }

    // Don't re-validate if already loading
    if (validationState.subject.loading) {
      if (import.meta.env.DEV) {
        console.log('Subject validation skipped: already loading');
      }
      return;
    }

    if (import.meta.env.DEV) {
      console.log('Starting subject validation for:', formData.topic);
    }

    updateValidationState({
      subject: {
        ...validationState.subject,
        loading: true,
        validated: false,
      },
    });

    try {
      const response = await ApiClient.verifySubject({
        subject: formData.topic,
      });

      if ('error' in response) {
        // Handle error response
        console.error('Subject validation failed:', response.error);

        // Provide specific feedback for different error types
        let warningMessage = response.error.message;
        if (response.error.code === 'CORS_ERROR') {
          warningMessage =
            'Cannot connect to backend server. Please check CORS configuration.';
        } else if (response.error.code === 'NETWORK_ERROR') {
          warningMessage =
            'Backend server unavailable. Please ensure the server is running.';
        }

        updateValidationState({
          subject: {
            validated: true,
            isValid: false,
            isAppropriate: false,
            suggestions: [],
            warnings: [warningMessage],
            loading: false,
          },
        });
        return;
      }

      if (import.meta.env.DEV) {
        console.log('Subject validation completed:', response);
      }

      // Handle success response
      if (response.success && response.valid) {
        updateValidationState({
          subject: {
            validated: true,
            isValid: true,
            isAppropriate: true,
            suggestions: [],
            warnings: [],
            loading: false,
          },
        });
      } else if (response.success && !response.valid) {
        updateValidationState({
          subject: {
            validated: true,
            isValid: false,
            isAppropriate: true,
            suggestions: response.suggestions || [],
            warnings: [response.message],
            loading: false,
          },
        });
      }
    } catch (error) {
      console.error('Subject validation failed:', error);
      updateValidationState({
        subject: {
          ...validationState.subject,
          loading: false,
          validated: false,
        },
      });
    }
  };

  const handleValidateSubSubjects = async () => {
    if (
      !formData.subSubjects.trim() ||
      !validationState.subject.isValid ||
      !validationState.subject.isAppropriate
    ) {
      return;
    }

    // Don't re-validate if already loading
    if (validationState.subSubjects.loading) {
      return;
    }

    const subSubjectList = formData.subSubjects
      .split(',')
      .map(s => s.trim())
      .filter(s => s);

    updateValidationState({
      subSubjects: {
        ...validationState.subSubjects,
        loading: true,
        validated: false,
      },
    });

    try {
      const validSubjects: string[] = [];
      const invalidSubjects: string[] = [];
      const inappropriateSubjects: string[] = [];
      const suggestions: Record<string, string[]> = {};

      // Validate each sub-subject individually using the new API
      for (const subSubject of subSubjectList) {
        const response = await ApiClient.verifySubSubject({
          subject: formData.topic,
          subSubject: subSubject,
        });

        if ('error' in response) {
          // Treat API errors as invalid subjects
          invalidSubjects.push(subSubject);
          continue;
        }

        if (response.success && response.valid) {
          validSubjects.push(subSubject);
        } else if (response.success && !response.valid) {
          invalidSubjects.push(subSubject);
          if (response.suggestions && response.suggestions.length > 0) {
            suggestions[subSubject] = response.suggestions;
          }
        }
      }

      updateValidationState({
        subSubjects: {
          validated: true,
          validSubjects,
          invalidSubjects,
          inappropriateSubjects,
          suggestions,
          loading: false,
        },
      });
    } catch (error) {
      console.error('Sub-subject validation failed:', error);
      updateValidationState({
        subSubjects: {
          ...validationState.subSubjects,
          loading: false,
        },
      });
    }
  };

  const handleGenerateQuiz = async () => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const subSubjectList = formData.subSubjects
      .split(',')
      .map(s => s.trim())
      .filter(s => s);

    setGenerating(true);
    try {
      const response = await ApiClient.generateQuiz({
        subject: formData.topic,
        subSubjects: subSubjectList,
        level: mapLegacyDifficultyToApi(formData.difficulty),
      });

      if ('error' in response) {
        console.error('Quiz generation failed:', response.error);
        setGenerating(false);
        return;
      }

      if (response.success && response.questions) {
        // Questions from API are already in the correct format (Question[])
        // Add questionNum if not present (1-indexed)
        const questions = response.questions.map((q, index) => ({
          questionNum: q.questionNum || index + 1,
          question: q.question,
          possibleAnswers: q.possibleAnswers,
          correctAnswer: q.correctAnswer
        }));

        // Pass the metadata as is
        startQuiz(questions, response.metadata);
        // Don't clear form data yet - we might need it for display
        navigate('/take-quiz');
      } else {
        console.error('Quiz generation failed: Invalid response format');
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleBack = () => {
    resetQuiz();
    navigate('/');
  };

  return (
    <div className='min-h-[calc(100vh-4rem)] flex items-center justify-center p-4'>
      <Card className='max-w-3xl w-full'>
        <div className='space-y-6'>
          <div className='text-center space-y-2'>
            <h1
              className='text-2xl font-bold'
              style={{ color: 'var(--color-quiz-text)' }}
            >
              Generate Your Quiz
            </h1>
            <p
              className='opacity-80'
              style={{ color: 'var(--color-quiz-text)' }}
            >
              Create a personalized quiz with AI-powered content validation
            </p>
          </div>

          <QuizForm
            onValidateSubject={handleValidateSubject}
            onValidateSubSubjects={handleValidateSubSubjects}
            onGenerate={handleGenerateQuiz}
            onBack={handleBack}
          />
        </div>
      </Card>
    </div>
  );
};

export default GenerateQuiz;
