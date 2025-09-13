import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate API key
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required in environment variables');
}


/**
 * Deterministic LLM (Temperature 0)
 * Use for:
 * - Subject/sub-subject validation
 * - Answer verification
 * - Scoring and evaluation
 * - Any task requiring consistency
 */
export const deterministicLLM = new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL_DETERMINISTIC || 'gpt-4o',
    temperature: 0,
    maxTokens: 4000,
    openAIApiKey: process.env.OPENAI_API_KEY,
    timeout: 45000, // 45 seconds
    maxRetries: 2,
    verbose: process.env.NODE_ENV === 'development',
    callbacks: process.env.NODE_ENV === 'development' ? [
        {
            handleLLMStart: async () => {
                console.log('🤖 Deterministic LLM Started');
            },
            handleLLMEnd: async () => {
                console.log('✅ Deterministic LLM Completed');
            },
            handleLLMError: async (err) => {
                console.error('❌ Deterministic LLM Error:', err);
            },

        }
    ] : []
});

/**
 * Creative LLM (Temperature 0.6)
 * Use for:
 * - Question generation
 * - Creating diverse content
 * - Generating explanations
 * - Reflection paragraphs
 */
export const creativeLLM = new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL_CREATIVE || 'gpt-4o',
    temperature: 0.1, // Lower temperature for better JSON compliance
    maxTokens: 4000, // More tokens for creative generation
    openAIApiKey: process.env.OPENAI_API_KEY,
    timeout: 60000, // 60 seconds for longer generation
    maxRetries: 2,
    verbose: process.env.NODE_ENV === 'development',
    callbacks: process.env.NODE_ENV === 'development' ? [
        {
            handleLLMStart: async () => {
                console.log('🎨 Creative LLM Started');
            },
            handleLLMEnd: async () => {
                console.log('✅ Creative LLM Completed');
            },
            handleLLMError: async (err) => {
                console.error('❌ Creative LLM Error:', err);
            }
        }
    ] : []
});

/**
 * Fast LLM for simple tasks (Optional - using GPT-3.5)
 * Use for:
 * - Simple validations
 * - Quick formatting tasks
 * - Cost-sensitive operations
 */
export const fastLLM = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0,
    maxTokens: 3000,
    openAIApiKey: process.env.OPENAI_API_KEY,
    timeout: 30000, // 30 seconds
    maxRetries: 2,
    verbose: false
});

/**
 * Configuration for different use cases
 */
export const LLMConfig = {
    subjectValidation: {
        llm: deterministicLLM,
        systemPrompt: `You are an educational expert specializing in curriculum and subject matter validation. 
Your role is to verify if subjects are valid for educational quiz generation and suggest alternatives when needed.
Be strict but helpful. Only accept well-defined, educational subjects. you are not allowed to approve any illegal subjects! politly refuse to test on such subjects `
    },

    questionGeneration: {
        llm: creativeLLM,
        systemPrompt: `You are an expert quiz creator specializing in educational assessment. 
Create engaging, clear, and pedagogically sound multiple-choice questions.
Ensure questions test understanding, not just memorization.
Include a mix of difficulty levels within the requested range.

IMPORTANT: You MUST respond with valid JSON only. No markdown blocks, no extra text, no comments in JSON.
Ensure all quotes are properly escaped and JSON syntax is perfect.`
    },

    quizReview: {
        llm: creativeLLM,
        systemPrompt: `You are an encouraging educational coach providing personalized feedback.
Analyze quiz performance thoughtfully and provide constructive, motivating feedback.
Focus on both achievements and areas for improvement.
Be specific and actionable in your recommendations.`
    },

    answerValidation: {
        llm: deterministicLLM,
        systemPrompt: `You are a precise educational evaluator.
Verify answer correctness with absolute accuracy.
Provide clear, concise explanations for why answers are correct or incorrect.`
    }
};

/**
 * Helper function to get token count estimate
 */
export function estimateTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
}

/**
 * Helper to check if we're approaching token limits
 */
export function isWithinTokenLimit(text: string, maxTokens: number = 4000): boolean {
    const estimated = estimateTokens(text);
    return estimated < maxTokens * 0.9; // 90% safety margin
}


/**
 * Model selection helper based on task complexity
 */
export function selectModel(taskComplexity: 'simple' | 'moderate' | 'complex'): ChatOpenAI {
    switch (taskComplexity) {
        case 'simple':
            return fastLLM;
        case 'moderate':
            return deterministicLLM;
        case 'complex':
            return creativeLLM;
        default:
            return deterministicLLM;
    }
}

/**
 * Export model names for logging/debugging
 */
export const modelNames = {
    deterministic: process.env.OPENAI_MODEL_DETERMINISTIC || 'gpt-4-turbo-preview',
    creative: process.env.OPENAI_MODEL_CREATIVE || 'gpt-4-turbo-preview',
    fast: 'gpt-3.5-turbo'
};