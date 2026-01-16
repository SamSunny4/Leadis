/**
 * Quiz Schema Definitions
 * Defines types and validation for different quiz content types
 */

/**
 * Question types supported by the quiz system
 */
export const QuestionType = {
    TEXT: 'text',
    AUDIO: 'audio',
    VISUAL: 'visual',
    MINIGAME: 'minigame',
    APD_TEST: 'apd-test',
    INTERACTIVE_ASSESSMENT: 'interactive-assessment',
};

/**
 * Minigame subtypes
 */
export const MinigameType = {
    DRAG_DROP: 'drag-drop',
    MATCHING: 'matching',
    SEQUENCE: 'sequence',
    PUZZLE: 'puzzle',
    FIND_CHARACTER: 'find-character',
};

/**
 * Validates that a question has the required base fields
 * @param {Object} question - The question object to validate
 * @returns {boolean} - Whether the question is valid
 */
export function validateBaseQuestion(question) {
    if (!question || typeof question !== 'object') return false;
    if (question.id === undefined || question.id === null) return false;
    if (typeof question.question !== 'string' || !question.question.trim()) return false;
    return true;
}

/**
 * Validates a text-based question
 * @param {Object} question - The question object to validate
 * @returns {boolean} - Whether the question is valid
 */
export function validateTextQuestion(question) {
    if (!validateBaseQuestion(question)) return false;
    if (!Array.isArray(question.options) || question.options.length === 0) return false;
    return true;
}

/**
 * Validates an audio-based question
 * @param {Object} question - The question object to validate
 * @returns {boolean} - Whether the question is valid
 */
export function validateAudioQuestion(question) {
    if (!validateBaseQuestion(question)) return false;
    if (typeof question.audioUrl !== 'string' || !question.audioUrl.trim()) return false;
    if (!Array.isArray(question.options) || question.options.length === 0) return false;
    return true;
}

/**
 * Validates a visual-based question
 * @param {Object} question - The question object to validate
 * @returns {boolean} - Whether the question is valid
 */
export function validateVisualQuestion(question) {
    if (!validateBaseQuestion(question)) return false;
    if (!Array.isArray(question.options) || question.options.length === 0) return false;
    return true;
}

/**
 * Validates a minigame question
 * @param {Object} question - The question object to validate
 * @returns {boolean} - Whether the question is valid
 */
export function validateMinigameQuestion(question) {
    if (!validateBaseQuestion(question)) return false;
    if (!Object.values(MinigameType).includes(question.gameType)) return false;
    if (!question.config || typeof question.config !== 'object') return false;
    return true;
}

/**
 * Gets the appropriate validator for a question type
 * @param {string} type - The question type
 * @returns {Function} - The validator function
 */
export function getValidator(type) {
    switch (type) {
        case QuestionType.TEXT:
            return validateTextQuestion;
        case QuestionType.AUDIO:
            return validateAudioQuestion;
        case QuestionType.VISUAL:
            return validateVisualQuestion;
        case QuestionType.MINIGAME:
            return validateMinigameQuestion;
        case QuestionType.APD_TEST:
            return validateBaseQuestion; // APD test only needs base validation
        default:
            return validateTextQuestion; // Default to text validation
    }
}

/**
 * Normalizes a question to ensure it has a type field
 * Provides backwards compatibility with schema that doesn't include type
 * @param {Object} question - The question object
 * @returns {Object} - The normalized question with type field
 */
export function normalizeQuestion(question) {
    if (!question.type) {
        return {
            ...question,
            type: QuestionType.TEXT, // Default to text type
        };
    }
    return question;
}

/**
 * Gets the question type, defaulting to TEXT for backwards compatibility
 * @param {Object} question - The question object
 * @returns {string} - The question type
 */
export function getQuestionType(question) {
    return question?.type || QuestionType.TEXT;
}
