
import {
    deterministicLLM,
    creativeLLM,
    fastLLM,
    LLMConfig
} from './llm';
import {
    Question,
    UserAnswer
} from '../types/quiz.types';
import { parseQuizResponseFromLLM, validateQuizResponse } from '../utils/llm-json-parser';
import {
    SubjectValidationResult,
    SubSubjectValidationResult,
    QuizGenerationParams,
    ScoreResult
} from '../types/agent.types';
import {
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    ChatPromptTemplate
} from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';

/**
 * Verify if a subject is valid for quiz generation
 */
export async function verifySubjectWithAgent(subject: string): Promise<SubjectValidationResult> {
    try {
        // Create the prompt with explicit JSON format instructions
        const prompt = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate(LLMConfig.subjectValidation.systemPrompt),
            HumanMessagePromptTemplate.fromTemplate(
                `Validate if "{subject}" is a valid educational subject for quiz generation.

Rules:
1. Accept well-defined academic subjects (e.g., Mathematics, Physics, History)
2. Accept professional/technical subjects (e.g., Programming, Marketing, Medicine)
3. Accept skill-based subjects (e.g., Critical Thinking, Public Speaking)
4. Reject vague, inappropriate, or non-educational topics
5. If valid, provide the properly capitalized/normalized form
6. If invalid, suggest 5 related valid subjects

Respond in JSON format:
{{
  "isValid": boolean,
  "normalizedSubject": "string or null",
  "suggestions": ["exactly 5 subject suggestions"],
  "reasoning": "brief explanation"
}}

Subject to validate: {subject}`
            )
        ]);

        // Use JsonOutputParser instead
        const parser = new JsonOutputParser<SubjectValidationResult>();
        const chain = prompt.pipe(deterministicLLM).pipe(parser);

        const result = await chain.invoke({ subject });

        // Ensure we have exactly 5 suggestions
        if (result.suggestions.length !== 5) {
            result.suggestions = [
                'Mathematics',
                'Science',
                'History',
                'Literature',
                'Computer Science'
            ].slice(0, 5);
        }

        return result;
    } catch (error) {
        console.error('Error in subject validation:', error);
        // Fallback response
        return {
            isValid: false,
            suggestions: [
                'Mathematics',
                'Science',
                'History',
                'Literature',
                'Computer Science'
            ],
            reasoning: 'Unable to validate subject at this time'
        };
    }
}

/**
 * Verify if a sub-subject is related to the main subject
 */
export async function verifySubSubjectWithAgent(
    subject: string,
    subSubject: string
): Promise<SubSubjectValidationResult> {
    try {
        const prompt = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate(LLMConfig.subjectValidation.systemPrompt),
            HumanMessagePromptTemplate.fromTemplate(
                `Determine if "{subSubject}" is a valid sub-topic of "{subject}".

Rules:
1. The sub-subject must be directly related to the main subject
2. It should be a specific topic within the broader subject area
3. It should be appropriate for educational quiz generation
4. If valid, provide the properly formatted version
5. If invalid, suggest up to 5 related sub-topics for the main subject

Respond in JSON format:
{{
  "isValid": boolean,
  "normalizedSubSubject": "string or null",
  "suggestions": ["array of 0-5 sub-topic suggestions"],
  "reasoning": "brief explanation"
}}

Main Subject: {subject}
Sub-Subject to validate: {subSubject}`
            )
        ]);

        const parser = new JsonOutputParser<SubSubjectValidationResult>();
        const chain = prompt.pipe(deterministicLLM).pipe(parser);

        const result = await chain.invoke({ subject, subSubject });

        // Ensure suggestions array is within bounds
        if (result.suggestions.length > 5) {
            result.suggestions = result.suggestions.slice(0, 5);
        }

        return result;
    } catch (error) {
        console.error('Error in sub-subject validation:', error);
        return {
            isValid: false,
            suggestions: [],
            reasoning: 'Unable to validate sub-subject at this time'
        };
    }
}

/**
 * Generate quiz questions using AI
 */
export async function generateQuizWithAgent(params: QuizGenerationParams): Promise<Question[]> {
    try {
        const { subject, subSubjects, level, questionCount } = params;

        // Create difficulty guidelines
        const difficultyGuidelines = {
            easy: 'Basic concepts, definitions, and simple applications. Difficulty 1-4.',
            intermediate: 'Moderate complexity, analysis, and problem-solving. Difficulty 4-7.',
            hard: 'Advanced concepts, synthesis, and complex reasoning. Difficulty 7-10.'
        };

        const prompt = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate(LLMConfig.questionGeneration.systemPrompt),
            HumanMessagePromptTemplate.fromTemplate(
                `Generate {questionCount} multiple-choice questions for the subject "{subject}".

Subject: {subject}
Sub-topics to cover: {subTopics}
Difficulty Level: {level} - {difficultyGuideline}

Requirements:
1. Each question must have exactly 4 answer options
2. Questions can have multiple correct answers (provide indices 0-3)
3. Mix question types: factual, conceptual, application, and analytical
4. Ensure questions are clear, unambiguous, and educational
5. Cover different aspects of the subject/sub-topics
6. Include brief explanations for learning purposes
7. Assign difficulty scores (1-10) based on the complexity
8. Specify which topic each question relates to

CRITICAL: Respond with VALID JSON only. No extra text, no markdown blocks, no comments.

JSON format:
{{
  "questions": [
    {{
      "question": "The question text",
      "possibleAnswers": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": [0],
      "explanation": "Brief explanation",
      "difficulty": 5,
      "topic": "Specific topic"
    }},
    {{
      "question": "Second question text",
      "possibleAnswers": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": [1,2],
      "explanation": "Brief explanation",
      "difficulty": 6,
      "topic": "Specific topic"
    }}
  ]
}}

Ensure:
- Exactly {questionCount} questions
- No trailing commas
- All quotes properly escaped
- Valid JSON syntax
- No comments in JSON

Generate diverse, engaging questions that test understanding, not just memorization.`
            )
        ]);

        // Retry logic with different strategies
        const maxRetries = 3;
        const strategies = [
            { llm: creativeLLM, name: 'creative' },
            { llm: deterministicLLM, name: 'deterministic' },
            { llm: fastLLM, name: 'fast' }
        ];
        
        let bestAttempt: { questions: Question[], count: number } | null = null;
        let allErrors: string[] = [];

        // Helper function for simplified prompt
        const createSimplifiedPrompt = () => {
            return ChatPromptTemplate.fromMessages([
                SystemMessagePromptTemplate.fromTemplate(
                    `You are a quiz creator. You MUST respond with valid JSON only.
                    NO markdown blocks, NO extra text, NO explanations.
                    Create exactly {questionCount} multiple-choice questions.`
                ),
                HumanMessagePromptTemplate.fromTemplate(
                    `Subject: {subject}
                    Topics: {subTopics}
                    Level: {level}
                    
                    Return valid JSON with this structure:
                    {{
                      "questions": [
                        {{
                          "question": "What is 2+2?",
                          "possibleAnswers": ["3", "4", "5", "6"],
                          "correctAnswer": [1]
                        }}
                      ]
                    }}
                    
                    Create {questionCount} questions following this exact format.`
                )
            ]);
        };

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const strategy = strategies[attempt] || strategies[0];
                console.log(`Quiz generation attempt ${attempt + 1} using ${strategy.name} LLM`);
                
                // Use simplified prompt after first failure
                const currentPrompt = attempt > 0 ? createSimplifiedPrompt() : prompt;
                const chain = currentPrompt.pipe(strategy.llm);
                
                const response = await chain.invoke({
                    subject,
                    subTopics: subSubjects.length > 0 ? subSubjects.join(', ') : 'General topics',
                    level,
                    difficultyGuideline: difficultyGuidelines[level],
                    questionCount
                });
                
                // Extract content from the response
                let rawContent: string;
                if (typeof response.content === 'string') {
                    rawContent = response.content;
                } else if (Array.isArray(response.content)) {
                    rawContent = response.content
                        .filter((part: any) => part.type === 'text')
                        .map((part: any) => part.text)
                        .join('');
                } else {
                    rawContent = String(response.content || response);
                }
                
                // Use robust JSON parser
                const parsedResponse = parseQuizResponseFromLLM(rawContent);
                
                // Check if we got the exact number of questions
                if (parsedResponse.questions.length === questionCount && validateQuizResponse(parsedResponse, questionCount)) {
                    console.log(`✅ Quiz generation successful on attempt ${attempt + 1}: ${parsedResponse.questions.length} questions`);
                    return parsedResponse.questions;
                }
                
                // If we got some valid questions but not the full amount, track this attempt
                if (parsedResponse.questions.length > 0 && validateQuizResponse(parsedResponse, parsedResponse.questions.length)) {
                    console.log(`⚠️ Partial success on attempt ${attempt + 1}: ${parsedResponse.questions.length}/${questionCount} questions`);
                } else {
                    console.warn(`❌ Attempt ${attempt + 1} failed: invalid questions format`);
                    allErrors.push(`Attempt ${attempt + 1}: Invalid question format`);
                    continue;
                }
                
                // Track the best attempt so far
                if (!bestAttempt || parsedResponse.questions.length > bestAttempt.count) {
                    bestAttempt = {
                        questions: parsedResponse.questions,
                        count: parsedResponse.questions.length
                    };
                }
                
                console.warn(`❌ Attempt ${attempt + 1} failed validation: got ${parsedResponse.questions.length} questions`);
                allErrors.push(`Attempt ${attempt + 1}: Generated ${parsedResponse.questions.length}/${questionCount} questions`);
                
            } catch (error: any) {
                console.error(`❌ Attempt ${attempt + 1} failed with error:`, error.message);
                allErrors.push(`Attempt ${attempt + 1}: ${error.message}`);
                if (attempt === maxRetries - 1) {
                    // If we have a partial result, throw a specific error
                    if (bestAttempt && bestAttempt.count > 0) {
                        const insufficientQuestionsError = new Error(
                            `Unable to generate ${questionCount} questions. Best attempt generated ${bestAttempt.count} questions. This may be due to the complexity or specificity of the requested subject/topic combination.`
                        );
                        (insufficientQuestionsError as any).code = 'INSUFFICIENT_QUESTIONS';
                        (insufficientQuestionsError as any).details = {
                            requested: questionCount,
                            generated: bestAttempt.count,
                            partialQuestions: bestAttempt.questions,
                            attempts: allErrors,
                            suggestion: 'Try simplifying the subject, using fewer sub-subjects, or selecting a different difficulty level.'
                        };
                        throw insufficientQuestionsError;
                    }
                    throw error;
                }
            }
        }
        
        // Final fallback if no questions were generated at all
        if (bestAttempt && bestAttempt.count > 0) {
            const insufficientQuestionsError = new Error(
                `Unable to generate ${questionCount} questions after ${maxRetries} attempts. Only ${bestAttempt.count} questions could be generated.`
            );
            (insufficientQuestionsError as any).code = 'INSUFFICIENT_QUESTIONS';
            (insufficientQuestionsError as any).details = {
                requested: questionCount,
                generated: bestAttempt.count,
                partialQuestions: bestAttempt.questions,
                attempts: allErrors,
                suggestion: 'The subject/topic combination may be too specific or complex. Try using a broader subject or different sub-topics.'
            };
            throw insufficientQuestionsError;
        }
        
        throw new Error('All quiz generation attempts failed - no questions could be generated');
    } catch (error) {
        console.error('Error in quiz generation:', error);
        throw new Error('Failed to generate quiz questions');
    }
}

/**
 * Generate personalized feedback for quiz results
 */
export async function reviewQuizWithAgent(
    userAnswers: UserAnswer[],
    scoreResult: ScoreResult
): Promise<string> {
    try {
        // Prepare analysis data
        const analysisData = userAnswers.map(answer => ({
            questionNum: answer.questionNum,
            question: answer.question,
            userAnswer: answer.userAnswer,
            correctAnswer: answer.correctAnswer,
            isCorrect: JSON.stringify(answer.userAnswer.sort()) === JSON.stringify(answer.correctAnswer.sort()),
            possibleAnswers: answer.possibleAnswers
        }));

        // Identify patterns
        const incorrectQuestions = analysisData.filter(q => !q.isCorrect);
        const correctQuestions = analysisData.filter(q => q.isCorrect);

        const prompt = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate(LLMConfig.quizReview.systemPrompt),
            HumanMessagePromptTemplate.fromTemplate(
                `Generate a personalized reflection paragraph for a quiz taker based on their performance.

Quiz Performance:
- Score: {score}% ({correctCount}/{totalCount} questions correct)
- Questions answered correctly: {correctQuestions}
- Questions answered incorrectly: {incorrectQuestions}

Detailed Results:
{detailedResults}

Create a thoughtful, encouraging reflection (100-300 words) that:
1. Acknowledges their performance level
2. Highlights specific strengths shown in correct answers
3. Identifies patterns in incorrect answers
4. Provides specific, actionable study recommendations
5. Encourages continued learning
6. Maintains a positive, constructive tone

The reflection should be personal and specific to their actual performance, not generic.`
            )
        ]);

        const chain = prompt.pipe(creativeLLM);
        const result = await chain.invoke({
            score: scoreResult.percentage,
            correctCount: scoreResult.correctCount,
            totalCount: scoreResult.totalCount,
            correctQuestions: correctQuestions.map(q => `Q${q.questionNum}`).join(', '),
            incorrectQuestions: incorrectQuestions.map(q => `Q${q.questionNum}`).join(', '),
            detailedResults: JSON.stringify(analysisData, null, 2)
        });

        return result.content as string;
    } catch (error) {
        console.error('Error in quiz review:', error);
        return generateFallbackReflection(scoreResult);
    }
}

/**
 * Generate fallback reflection if AI fails
 */
function generateFallbackReflection(scoreResult: ScoreResult): string {
    const { percentage, correctCount, totalCount } = scoreResult;

    if (percentage >= 80) {
        return `Excellent work! You scored ${percentage}% by correctly answering ${correctCount} out of ${totalCount} questions. Your strong performance demonstrates a solid understanding of the material. To further enhance your knowledge, consider exploring more advanced topics or practicing with harder difficulty levels. Keep up the great work!`;
    } else if (percentage >= 60) {
        return `Good effort! You scored ${percentage}% by correctly answering ${correctCount} out of ${totalCount} questions. You're showing a decent grasp of the material, with room for improvement. Review the questions you missed and focus on understanding the underlying concepts. With more practice, you'll definitely improve your score!`;
    } else {
        return `You scored ${percentage}% by correctly answering ${correctCount} out of ${totalCount} questions. While this might not be the score you hoped for, remember that learning is a process. Take time to review the material, especially the topics you found challenging. Consider starting with easier difficulty levels to build confidence. Every quiz is a learning opportunity!`;
    }
}