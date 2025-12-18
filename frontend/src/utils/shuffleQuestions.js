/**
 * Shuffle quiz questions deterministically based on user ID
 * This ensures each user gets the same shuffle every time they see the quiz
 */

/**
 * Simple hash function to convert user ID to a number
 * @param {string} str - User ID or any string
 * @returns {number} - Hash value
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

/**
 * Seeded random number generator
 * Uses a Linear Congruential Generator algorithm
 * @param {number} seed - Seed value
 */
function SeededRandom(seed) {
    this.seed = seed;

    this.next = function () {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    };
}

/**
 * Fisher-Yates shuffle with a seeded random generator
 * @param {Array} array - Array to shuffle
 * @param {number} seed - Seed for randomization
 * @returns {Array} - Shuffled array
 */
function shuffleWithSeed(array, seed) {
    const shuffled = [...array]; // Create a copy
    const random = new SeededRandom(seed);

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random.next() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

/**
 * Shuffle quiz questions for a specific user
 * @param {Array} questions - Array of quiz questions
 * @param {string} userId - User ID (used as seed)
 * @param {string} roomId - Room ID (for additional uniqueness)
 * @returns {Array} - Shuffled array of questions
 */
export function shuffleQuizQuestions(questions, userId, roomId = '') {
    console.log('🔀 shuffleQuizQuestions called with:', {
        questionCount: questions?.length || 0,
        userId: userId,
        roomId: roomId
    });

    if (!questions || questions.length === 0) {
        console.warn('⚠️ No questions provided');
        return questions;
    }

    // If no userId provided, return original order
    if (!userId) {
        console.warn('⚠️ No userId provided for quiz shuffle, returning original order');
        return questions;
    }

    // Create a unique seed based on userId and roomId
    const seedString = `${userId}-${roomId}`;
    const seed = hashString(seedString);

    console.log(`🔀 Shuffling quiz questions:`, {
        seedString,
        seed,
        userIdPrefix: userId.toString().substring(0, 8)
    });

    const shuffled = shuffleWithSeed(questions, seed);
    console.log('🔀 Shuffle complete. First 3 question IDs:', shuffled.slice(0, 3).map(q => q.id));

    return shuffled;
}

/**
 * Shuffle options within each question
 * @param {Array} questions - Array of quiz questions
 * @param {string} userId - User ID (used as seed)
 * @param {string} roomId - Room ID (for additional uniqueness)
 * @returns {Array} - Questions with shuffled options
 */
export function shuffleQuizOptions(questions, userId, roomId = '') {
    if (!questions || questions.length === 0) {
        return questions;
    }

    if (!userId) {
        console.warn('No userId provided for option shuffle, returning original order');
        return questions;
    }

    return questions.map((question, index) => {
        // Only shuffle options for single-choice and multi-choice questions
        if (question.type === 'single' || question.type === 'multi') {
            if (question.options && question.options.length > 0) {
                // Create unique seed for each question's options
                const seedString = `${userId}-${roomId}-q${index}`;
                const seed = hashString(seedString);

                return {
                    ...question,
                    options: shuffleWithSeed(question.options, seed)
                };
            }
        }

        return question;
    });
}

/**
 * Shuffle both questions and options
 * @param {Array} questions - Array of quiz questions
 * @param {string} userId - User ID (used as seed)
 * @param {string} roomId - Room ID (for additional uniqueness)
 * @returns {Array} - Fully shuffled quiz
 */
export function shuffleCompleteQuiz(questions, userId, roomId = '') {
    // First shuffle the questions
    const shuffledQuestions = shuffleQuizQuestions(questions, userId, roomId);

    // Then shuffle the options within each question
    return shuffleQuizOptions(shuffledQuestions, userId, roomId);
}
