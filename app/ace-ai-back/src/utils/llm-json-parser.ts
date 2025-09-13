/**
 * Robust JSON parser for LLM responses with multiple fallback strategies
 */

import { Question } from '../types/quiz.types';

interface ParsedQuizResponse {
    questions: Question[];
}

/**
 * Attempts to parse potentially malformed JSON from LLM responses
 */
export function parseQuizResponseFromLLM(rawResponse: string): ParsedQuizResponse {
    // Strategy 1: Direct JSON parsing
    try {
        const parsed = JSON.parse(rawResponse);
        if (isValidQuizResponse(parsed)) {
            return transformToQuizFormat(parsed);
        }
    } catch (error: any) {
        console.warn('Direct JSON parse failed:', error.message);
    }

    // Strategy 2: Clean and parse
    const cleaned = cleanLLMResponse(rawResponse);
    try {
        const parsed = JSON.parse(cleaned);
        if (isValidQuizResponse(parsed)) {
            return transformToQuizFormat(parsed);
        }
    } catch (error: any) {
        console.warn('Cleaned JSON parse failed:', error.message);
    }

    // Strategy 3: Fix common JSON issues programmatically
    const repaired = repairJsonStructure(rawResponse);
    try {
        const parsed = JSON.parse(repaired);
        if (isValidQuizResponse(parsed)) {
            return transformToQuizFormat(parsed);
        }
    } catch (error: any) {
        console.warn('Repaired JSON parse failed:', error.message);
    }

    // Strategy 4: Extract questions using regex patterns
    try {
        const extracted = extractQuestionsWithRegex(rawResponse);
        if (extracted.questions.length > 0) {
            return extracted;
        }
    } catch (error: any) {
        console.warn('Regex extraction failed:', error.message);
    }

    throw new Error('Failed to parse quiz response using all available strategies');
}

/**
 * Clean common formatting issues in LLM responses
 */
function cleanLLMResponse(response: string): string {
    return response
        // Remove markdown code blocks
        .replace(/```json\s*/gi, '')
        .replace(/```\s*$/gi, '')
        
        // Remove leading/trailing whitespace
        .trim()
        
        // Fix escaped quotes issues
        .replace(/\\"/g, '"')
        .replace(/\\\\"/g, '"')
        
        // Fix spacing around colons and commas
        .replace(/"\s*:\s*"/g, '":"')
        .replace(/",\s*"/g, '","')
        
        // Remove trailing commas before closing braces/brackets
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        
        // Fix missing quotes around property names
        .replace(/(\w+):/g, '"$1":')
        
        // Fix unquoted string values (basic attempt)
        .replace(/:\s*([^"\[\{][^,\}\]]*)/g, (_match, value) => {
            const trimmed = value.trim();
            if (trimmed === 'true' || trimmed === 'false' || !isNaN(Number(trimmed))) {
                return `: ${trimmed}`;
            }
            return `: "${trimmed}"`;
        });
}

/**
 * Advanced JSON structure repair
 */
function repairJsonStructure(response: string): string {
    let repaired = cleanLLMResponse(response);
    
    // Try to find the questions array and reconstruct JSON
    const questionsMatch = repaired.match(/[\[\{][\s\S]*"questions"\s*:\s*\[[\s\S]*\][\s\S]*[\]\}]/);
    if (questionsMatch) {
        repaired = questionsMatch[0];
    }
    
    // Fix missing quotes around all property names more aggressively
    repaired = repaired.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
    
    // Fix arrays with missing commas
    repaired = repaired.replace(/"\s*\n\s*"/g, '", "');
    
    // Fix objects with missing commas
    repaired = repaired.replace(/}\s*\n\s*{/g, '}, {');
    
    return repaired;
}

/**
 * Extract questions using regex patterns as last resort
 */
function extractQuestionsWithRegex(response: string): ParsedQuizResponse {
    const questions: Question[] = [];
    
    // Pattern to match question objects (flexible)
    const questionPattern = /(?:"question"\s*:\s*"([^"]+)"|question\s*:\s*"([^"]+)")/gi;
    const answersPattern = /(?:"possibleAnswers"\s*:\s*\[([^\]]+)\]|possibleAnswers\s*:\s*\[([^\]]+)\])/gi;
    const correctPattern = /(?:"correctAnswer"\s*:\s*\[([^\]]+)\]|correctAnswer\s*:\s*\[([^\]]+)\])/gi;
    
    let questionMatches = [...response.matchAll(questionPattern)];
    let answersMatches = [...response.matchAll(answersPattern)];
    let correctMatches = [...response.matchAll(correctPattern)];
    
    for (let i = 0; i < Math.min(questionMatches.length, answersMatches.length, correctMatches.length, 10); i++) {
        try {
            const questionText = questionMatches[i][1] || questionMatches[i][2] || '';
            const answersText = answersMatches[i][1] || answersMatches[i][2] || '';
            const correctText = correctMatches[i][1] || correctMatches[i][2] || '';
            
            // Parse answers array
            const answers = answersText
                .split(',')
                .map(a => a.trim().replace(/^["']|["']$/g, ''))
                .filter(a => a.length > 0)
                .slice(0, 4); // Ensure exactly 4 answers
            
            // Parse correct answers
            const correctAnswers = correctText
                .split(',')
                .map(c => parseInt(c.trim()))
                .filter(c => !isNaN(c) && c >= 0 && c <= 3);
            
            if (questionText && answers.length === 4 && correctAnswers.length > 0) {
                questions.push({
                    questionNum: i + 1,
                    question: questionText,
                    possibleAnswers: answers,
                    correctAnswer: correctAnswers
                });
            }
        } catch (error: any) {
            console.warn(`Failed to parse question ${i + 1}:`, error.message);
        }
    }
    
    return { questions };
}

/**
 * Validate if parsed object is a valid quiz response
 */
function isValidQuizResponse(obj: any): boolean {
    return obj && 
           obj.questions && 
           Array.isArray(obj.questions) && 
           obj.questions.length > 0 &&
           obj.questions.every((q: any) => 
               q.question && 
               Array.isArray(q.possibleAnswers) && 
               q.possibleAnswers.length === 4 &&
               Array.isArray(q.correctAnswer) &&
               q.correctAnswer.length > 0
           );
}

/**
 * Transform parsed response to match our Question interface
 */
function transformToQuizFormat(parsed: any): ParsedQuizResponse {
    const questions: Question[] = parsed.questions.map((q: any, index: number) => ({
        questionNum: index + 1,
        question: String(q.question || ''),
        possibleAnswers: Array.isArray(q.possibleAnswers) 
            ? q.possibleAnswers.map((a: any) => String(a)).slice(0, 4)
            : [],
        correctAnswer: Array.isArray(q.correctAnswer)
            ? q.correctAnswer.filter((i: any) => typeof i === 'number' && i >= 0 && i <= 3)
            : [0]
    }));
    
    return { questions };
}

/**
 * Validate final quiz response before returning
 */
export function validateQuizResponse(response: ParsedQuizResponse, _expectedCount: number = 10): boolean {
    if (!response.questions || !Array.isArray(response.questions)) {
        return false;
    }
    
    // Only accept if we have at least some questions (minimum 1)
    if (response.questions.length < 1) {
        console.warn('No valid questions found in response');
        return false;
    }
    
    // Don't auto-fill with placeholder questions - let the coordinator handle insufficient questions
    // This allows for better error reporting with partial results
    
    return response.questions.every((q, index) => {
        if (!q.question || q.question.trim().length === 0) {
            console.warn(`Question ${index + 1} has empty question text`);
            return false;
        }
        
        if (!Array.isArray(q.possibleAnswers) || q.possibleAnswers.length !== 4) {
            console.warn(`Question ${index + 1} doesn't have exactly 4 possible answers`);
            return false;
        }
        
        if (!Array.isArray(q.correctAnswer) || q.correctAnswer.length === 0) {
            console.warn(`Question ${index + 1} has no correct answers specified`);
            return false;
        }
        
        if (q.correctAnswer.some(i => i < 0 || i > 3)) {
            console.warn(`Question ${index + 1} has invalid correct answer indices`);
            return false;
        }
        
        return true;
    });
}