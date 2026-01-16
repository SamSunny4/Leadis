'use client';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

// LocalStorage keys
const SCREENING_DATA_KEY = 'leadis_screening_form';
const QUESTIONS_KEY = 'leadis_personalized_questions';
const PERFORMANCE_KEY = 'leadis_quiz_performance';

/**
 * Get user screening data from localStorage
 */
export function getUserScreeningData() {
    if (typeof window === 'undefined') return null;
    
    try {
        const data = localStorage.getItem(SCREENING_DATA_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading screening data:', error);
        return null;
    }
}

/**
 * Calculate age in years from date of birth
 */
function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 8; // Default age
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return Math.max(6, Math.min(12, age)); // Clamp between 6-12
}

/**
 * Get grade level number from grade string
 */
function getGradeLevel(currentGrade) {
    const gradeMap = {
        'preschool': 0,
        'kindergarten': 0,
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6+': 6
    };
    return gradeMap[currentGrade] ?? 2;
}

/**
 * Get performance history from localStorage
 */
export function getPerformanceHistory() {
    if (typeof window === 'undefined') return {};
    
    try {
        const data = localStorage.getItem(PERFORMANCE_KEY);
        return data ? JSON.parse(data) : {
            categories: {
                dyslexia: { correct: 0, total: 0, currentDifficulty: 'medium' },
                dyscalculia: { correct: 0, total: 0, currentDifficulty: 'medium' },
                attention: { correct: 0, total: 0, currentDifficulty: 'medium' },
                memory: { correct: 0, total: 0, currentDifficulty: 'medium' },
                'visual-spatial': { correct: 0, total: 0, currentDifficulty: 'medium' },
                processing: { correct: 0, total: 0, currentDifficulty: 'medium' }
            },
            overallScore: 0,
            questionsAnswered: 0
        };
    } catch (error) {
        console.error('Error reading performance data:', error);
        return {};
    }
}

/**
 * Save performance history to localStorage
 */
export function savePerformanceHistory(performance) {
    if (typeof window === 'undefined') return;
    
    try {
        localStorage.setItem(PERFORMANCE_KEY, JSON.stringify(performance));
    } catch (error) {
        console.error('Error saving performance data:', error);
    }
}

/**
 * Update performance after answering a question
 * Returns the next difficulty level for that category
 */
export function updatePerformance(category, isCorrect, currentDifficulty) {
    const performance = getPerformanceHistory();
    
    if (!performance.categories[category]) {
        performance.categories[category] = { correct: 0, total: 0, currentDifficulty: 'medium' };
    }
    
    const cat = performance.categories[category];
    cat.total++;
    if (isCorrect) {
        cat.correct++;
    }
    
    // Adaptive difficulty logic
    const accuracy = cat.total > 0 ? cat.correct / cat.total : 0.5;
    
    // Determine new difficulty based on performance
    let newDifficulty = currentDifficulty;
    
    if (!isCorrect) {
        // If wrong, decrease difficulty
        if (currentDifficulty === 'hard') newDifficulty = 'medium';
        else if (currentDifficulty === 'medium') newDifficulty = 'easy';
    } else {
        // If correct and doing well, potentially increase difficulty
        if (accuracy >= 0.8 && cat.total >= 2) {
            if (currentDifficulty === 'easy') newDifficulty = 'medium';
            else if (currentDifficulty === 'medium') newDifficulty = 'hard';
        }
    }
    
    cat.currentDifficulty = newDifficulty;
    performance.questionsAnswered++;
    performance.overallScore = Object.values(performance.categories)
        .reduce((sum, c) => sum + c.correct, 0);
    
    savePerformanceHistory(performance);
    
    return {
        newDifficulty,
        categoryAccuracy: accuracy,
        overallProgress: performance
    };
}

/**
 * Get stored questions from localStorage
 */
export function getStoredQuestions() {
    if (typeof window === 'undefined') return null;
    
    try {
        const data = localStorage.getItem(QUESTIONS_KEY);
        if (!data) return null;
        
        const stored = JSON.parse(data);
        // Check if questions are still valid (generated within last hour)
        if (stored.generatedAt && Date.now() - stored.generatedAt < 3600000) {
            return stored.questions;
        }
        return null;
    } catch (error) {
        console.error('Error reading stored questions:', error);
        return null;
    }
}

/**
 * Save questions to localStorage
 */
export function saveQuestions(questions) {
    if (typeof window === 'undefined') return;
    
    try {
        localStorage.setItem(QUESTIONS_KEY, JSON.stringify({
            questions,
            generatedAt: Date.now()
        }));
    } catch (error) {
        console.error('Error saving questions:', error);
    }
}

/**
 * Clear stored questions (force regeneration)
 */
export function clearStoredQuestions() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(QUESTIONS_KEY);
}

/**
 * Generate personalized questions based on user profile
 */
export async function generatePersonalizedQuestions(forceRegenerate = false) {
    // Check for cached questions first
    if (!forceRegenerate) {
        const cached = getStoredQuestions();
        if (cached && cached.length > 0) {
            console.log('Using cached questions from localStorage');
            return cached;
        }
    }
    
    // Get user screening data
    const userData = getUserScreeningData();
    const performance = getPerformanceHistory();
    
    // Extract relevant metrics
    const age = userData ? calculateAge(userData.dateOfBirth) : 8;
    const gender = userData?.gender || 'prefer-not-to-say';
    const gradeLevel = userData ? getGradeLevel(userData.currentGrade) : 2;
    const academicDifficulties = Array.isArray(userData?.academicDifficulties) ? userData.academicDifficulties : [];
    const selectedTests = Array.isArray(userData?.selectedTests) ? userData.selectedTests : ['reading', 'math', 'visual'];
    const learningExperience = userData?.learningExperience || 'similar';
    const familyHistory = Array.isArray(userData?.familyLearningDifficulty) ? userData.familyLearningDifficulty : [];
    const childName = userData?.fullName?.split(' ')[0] || 'there';
    
    // Determine focus areas based on difficulties and selected tests
    const focusAreas = [];
    if (academicDifficulties.includes('reading') || selectedTests.includes('reading')) {
        focusAreas.push('dyslexia');
    }
    if (academicDifficulties.includes('math') || selectedTests.includes('math')) {
        focusAreas.push('dyscalculia');
    }
    if (academicDifficulties.includes('attention') || academicDifficulties.includes('following-instructions')) {
        focusAreas.push('attention');
    }
    if (academicDifficulties.includes('memory')) {
        focusAreas.push('memory');
    }
    if (selectedTests.includes('visual')) {
        focusAreas.push('visual-spatial');
    }
    if (focusAreas.length === 0) {
        focusAreas.push('dyslexia', 'dyscalculia', 'attention', 'memory', 'visual-spatial');
    }
    
    // Get current difficulty levels from performance history
    const difficultyLevels = {};
    Object.entries(performance.categories || {}).forEach(([cat, data]) => {
        difficultyLevels[cat] = data.currentDifficulty || 'medium';
    });
    
    // Adjust difficulty based on learning experience
    let baseDifficulty = 'medium';
    if (learningExperience === 'much-slower' || learningExperience === 'highly-variable') {
        baseDifficulty = 'easy';
    } else if (learningExperience === 'similar') {
        baseDifficulty = 'medium';
    }
    
    const randomSeed = Date.now() + Math.random() * 1000;
    
    const prompt = `You are an educational psychologist creating a PERSONALIZED learning disability screening assessment.

CHILD PROFILE:
- Age: ${age} years old
- Grade Level: ${gradeLevel === 0 ? 'Preschool/Kindergarten' : `Grade ${gradeLevel}`}
- Gender: ${gender}
- Learning Experience vs Peers: ${learningExperience}
- Focus Areas: ${focusAreas.join(', ')}
- Family History of LD: ${familyHistory.length > 0 ? familyHistory.join(', ') : 'None reported'}
- Base Difficulty: ${baseDifficulty}

RANDOM SEED: ${randomSeed} (Use this to ensure unique questions)

GENERATE 12 UNIQUE QUESTIONS tailored to this child's age (${age}) and grade (${gradeLevel}).

QUESTION DISTRIBUTION (adapt complexity to age ${age}):
${focusAreas.includes('dyslexia') ? `
DYSLEXIA SCREENING (3 questions for age ${age}):
- For ages 6-7: Letter sounds, simple rhyming, letter matching
- For ages 8-9: Word families, syllable counting, simple spelling
- For ages 10-12: Complex spelling, reading comprehension, phoneme manipulation
Difficulties: 1 easy, 1 medium, 1 ${baseDifficulty === 'easy' ? 'easy' : 'hard'}` : ''}

${focusAreas.includes('dyscalculia') ? `
DYSCALCULIA/MATH SCREENING (3 questions for age ${age}):
- For ages 6-7: Counting, number recognition, simple addition (1-10)
- For ages 8-9: Addition/subtraction (1-100), simple patterns, basic multiplication
- For ages 10-12: Multi-step problems, fractions, word problems
Difficulties: 1 easy, 1 medium, 1 ${baseDifficulty === 'easy' ? 'easy' : 'hard'}` : ''}

${focusAreas.includes('attention') ? `
ATTENTION/FOLLOWING INSTRUCTIONS (2 questions):
- Multi-step directions appropriate for age ${age}
- Detail-oriented tasks
Difficulties: based on ${baseDifficulty}` : ''}

${focusAreas.includes('memory') ? `
WORKING MEMORY (2 questions):
- Sequence patterns for age ${age}
- Information retention
Difficulties: based on ${baseDifficulty}` : ''}

${focusAreas.includes('visual-spatial') ? `
VISUAL-SPATIAL (2 questions):
- Shape recognition, patterns
- Spatial relationships for age ${age}
Difficulties: based on ${baseDifficulty}` : ''}

JSON FORMAT REQUIRED:
[
  {
    "id": 1,
    "type": "text",
    "category": "<dyslexia|dyscalculia|attention|memory|visual-spatial|processing>",
    "skill_tested": "<specific skill name>",
    "question": "<age-appropriate question for ${age} year old>",
    "options": ["option1", "option2", "option3", "option4"],
    "correctAnswer": "<exact match to one option>",
    "difficulty": "<easy|medium|hard>"
  }
]

CRITICAL RULES:
1. Questions MUST be appropriate for a ${age}-year-old in grade ${gradeLevel}
2. Use simple, child-friendly language
3. Each question has EXACTLY 4 options
4. correctAnswer MUST exactly match one option
5. Mix "text" and "visual" types
6. Generate COMPLETELY NEW questions each time (seed: ${randomSeed})
7. DO NOT use emojis in questions or answers.

Return ONLY the JSON array, no other text.`;

    try {
        console.log('Generating personalized questions for:', { age, gradeLevel, focusAreas });
    
     // TEMPORARY: Bypass API to save quota
        console.log('⚠️ API GENERATION DISABLED - Using fallback questions');
        const questions = getFallbackQuestions(age, gradeLevel, focusAreas);

        /* API CALL COMMENTED OUT
        
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 1.2,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!textContent) {
            throw new Error('No content in Gemini response');
        }

        // Clean and parse response
        let cleanedContent = textContent.trim();
        if (cleanedContent.startsWith('```json')) {
            cleanedContent = cleanedContent.slice(7);
        } else if (cleanedContent.startsWith('```')) {
            cleanedContent = cleanedContent.slice(3);
        }
        if (cleanedContent.endsWith('```')) {
            cleanedContent = cleanedContent.slice(0, -3);
        }
        cleanedContent = cleanedContent.trim();

        const questions = JSON.parse(cleanedContent);
        */
        if (!Array.isArray(questions)) {
            throw new Error('Response is not an array');
        }

        // Validate and structure questions
        const validatedQuestions = questions.map((q, index) => ({
            id: index + 1,
            type: ['text', 'audio', 'visual', 'minigame', 'apd-test'].includes(q.type) ? q.type : 'text',
            category: q.category || 'general',
            skill_tested: q.skill_tested || 'cognitive',
            question: q.question || 'Question not available',
            options: Array.isArray(q.options) && q.options.length >= 4 
                ? [...new Set(q.options)].slice(0, 4) // Deduplicate and take first 4
                : ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: q.correctAnswer || q.options?.[0] || 'Option A',
            difficulty: q.difficulty || 'medium'
        }));

        // Insert Minigames and individual APD Tests shuffled with questions
        try {
            const minigame1 = {
                id: 'mg1',
                type: 'minigame',
                gameType: 'find-character',
                category: 'attention',
                skill_tested: 'Visual Attention',
                question: 'Find the hidden character!',
                options: ['Completed'],
                correctAnswer: 'Completed',
                difficulty: 'medium',
                config: { targetScore: 3 }
            };

            const minigame2 = {
                id: 'mg2',
                type: 'minigame',
                gameType: 'sequence',
                category: 'memory',
                skill_tested: 'Working Memory',
                question: 'Watch the pattern and repeat it!',
                options: ['Completed'],
                correctAnswer: 'Completed',
                difficulty: 'medium',
                config: {}
            };

            // Individual APD tests to be shuffled with questions
            const apdDiscrimination = {
                id: 'apd-disc',
                type: 'apd-test',
                apdTestType: 'discrimination',
                category: 'processing',
                skill_tested: 'Sound Discrimination',
                question: 'Sound Discrimination Test',
                options: ['Completed'],
                correctAnswer: 'Completed',
                difficulty: 'medium',
                config: {}
            };

            const apdMemory = {
                id: 'apd-mem',
                type: 'apd-test',
                apdTestType: 'memory',
                category: 'processing',
                skill_tested: 'Auditory Memory',
                question: 'Auditory Memory Test',
                options: ['Completed'],
                correctAnswer: 'Completed',
                difficulty: 'medium',
                config: {}
            };

            const apdWords = {
                id: 'apd-words',
                type: 'apd-test',
                apdTestType: 'words',
                category: 'processing',
                skill_tested: 'Word Recognition',
                question: 'Word Recognition Test',
                options: ['Completed'],
                correctAnswer: 'Completed',
                difficulty: 'medium',
                config: {}
            };

            // Insert components at different positions to break up questions
            // Pattern: Q1, Q2, Q3, Minigame1, Q4, Q5, APD-Disc, Q6, Q7, APD-Memory, Q8, Q9, Minigame2, Q10, APD-Words
            if (validatedQuestions.length >= 3) {
                validatedQuestions.splice(3, 0, minigame1); // Insert as 4th
            } else {
                validatedQuestions.push(minigame1);
            }

            if (validatedQuestions.length >= 6) {
                validatedQuestions.splice(6, 0, apdDiscrimination); // Insert as 7th
            } else {
                validatedQuestions.push(apdDiscrimination);
            }

            if (validatedQuestions.length >= 9) {
                validatedQuestions.splice(9, 0, apdMemory); // Insert as 10th
            } else {
                validatedQuestions.push(apdMemory);
            }

            if (validatedQuestions.length >= 12) {
                validatedQuestions.splice(12, 0, minigame2); // Insert as 13th
            } else {
                validatedQuestions.push(minigame2);
            }

            if (validatedQuestions.length >= 14) {
                validatedQuestions.splice(14, 0, apdWords); // Insert as 15th
            } else {
                validatedQuestions.push(apdWords);
            }

            // Re-assign IDs sequentially
            validatedQuestions.forEach((q, i) => {
                q.id = i + 1;
            });

        } catch (err) {
            console.error('Error injecting minigames and APD tests:', err);
        }

        console.log(`Generated ${validatedQuestions.length} personalized questions (including minigames and APD tests)`);
        
        // Save to localStorage
        saveQuestions(validatedQuestions);
        
        return validatedQuestions;

    } catch (error) {
        console.error('Error generating questions:', error);
        return getFallbackQuestions(age, gradeLevel, focusAreas);
    }
}

/**
 * Get a replacement question when current one is answered wrong
 * Returns an easier question in the same category
 */
export async function getEasierQuestion(category, currentDifficulty) {
    const newDifficulty = currentDifficulty === 'hard' ? 'medium' : 'easy';
    
    const userData = getUserScreeningData();
    const age = userData ? calculateAge(userData.dateOfBirth) : 8;
    
    const prompt = `Generate 1 ${newDifficulty} difficulty question for a ${age}-year-old child.
Category: ${category}
This is a follow-up question after the child got a previous question wrong.
CRITICAL: DO NOT use emojis in the question or options.

Return ONLY valid JSON:
{
    "id": 99,
    "type": "text",
    "category": "${category}",
    "skill_tested": "<specific skill>",
    "question": "<simpler question for ${category}>",
    "options": ["opt1", "opt2", "opt3", "opt4"],
    "correctAnswer": "<exact match to one option>",
    "difficulty": "${newDifficulty}"
}`;

    try {
        // TEMPORARY: Return null to prevent API calls for follow-ups
        return null; 
        
        /* API CALL COMMENTED OUT
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.9, maxOutputTokens: 1024 }
            })
        });

        if (!response.ok) throw new Error('API error');

        const data = await response.json();
        let content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        
        // Clean markdown
        if (content.startsWith('```')) {
            content = content.replace(/```json\n?|```\n?/g, '').trim();
        }
        
        return JSON.parse(content);
        */
    } catch (error) {
        console.error('Error getting easier question:', error);
        return null;
    }
}

/**
 * Fallback questions based on user profile
 */
function getFallbackQuestions(age = 8, gradeLevel = 2, focusAreas = []) {
    const questions = [];
    let id = 1;
    
    // Age-appropriate math questions
    if (focusAreas.includes('dyscalculia') || focusAreas.length === 0) {
        if (age <= 7) {
            questions.push({
                id: id++,
                type: "text",
                category: "dyscalculia",
                skill_tested: "counting",
                question: "How many apples are there? 🍎🍎🍎🍎🍎",
                options: ["3", "4", "5", "6"],
                correctAnswer: "5",
                difficulty: "easy"
            });
        } else {
            questions.push({
                id: id++,
                type: "text",
                category: "dyscalculia",
                skill_tested: "number_sequencing",
                question: "What number comes next: 5, 10, 15, 20, ___?",
                options: ["22", "25", "30", "21"],
                correctAnswer: "25",
                difficulty: "easy"
            });
        }
    }
    
    // Dyslexia questions
    if (focusAreas.includes('dyslexia') || focusAreas.length === 0) {
        questions.push({
            id: id++,
            type: "text",
            category: "dyslexia",
            skill_tested: "phonological_awareness",
            question: "Which word rhymes with 'cat'?",
            options: ["Dog", "Hat", "Cup", "Tree"],
            correctAnswer: "Hat",
            difficulty: "easy"
        });
        
        questions.push({
            id: id++,
            type: "text",
            category: "dyslexia",
            skill_tested: "letter_recognition",
            question: "Which letter looks different from the others?",
            options: ["b", "b", "d", "b"],
            correctAnswer: "d",
            difficulty: "easy"
        });
    }
    
    // Add more fallback questions
    questions.push(
        {
            id: id++,
            type: "text",
            category: "dyscalculia",
            skill_tested: "number_sense",
            question: "Which number is bigger: 47 or 74?",
            options: ["47", "74", "They are the same", "Cannot tell"],
            correctAnswer: "74",
            difficulty: "easy"
        },
        {
            id: id++,
            type: "text",
            category: "attention",
            skill_tested: "multi_step_processing",
            question: age <= 7 
                ? "First count to 3, then add 2 more. How many?"
                : "First add 5 + 3, then multiply by 2. What is the answer?",
            options: age <= 7 ? ["4", "5", "6", "7"] : ["16", "13", "11", "10"],
            correctAnswer: age <= 7 ? "5" : "16",
            difficulty: "medium"
        },
        {
            id: id++,
            type: "text",
            category: "memory",
            skill_tested: "sequence_recall",
            question: "If the pattern is RED, BLUE, RED, BLUE, what comes next?",
            options: ["GREEN", "RED", "YELLOW", "BLUE"],
            correctAnswer: "RED",
            difficulty: "easy"
        },
        {
            id: id++,
            type: "visual",
            category: "visual-spatial",
            skill_tested: "shape_recognition",
            question: "Which shape has 4 equal sides and 4 corners?",
            options: ["Triangle", "Square", "Circle", "Pentagon"],
            correctAnswer: "Square",
            difficulty: "easy"
        },
        {
            id: id++,
            type: "text",
            category: "dyslexia",
            skill_tested: "word_recognition",
            question: "Which word is spelled correctly?",
            options: ["Freind", "Friend", "Frend", "Fryend"],
            correctAnswer: "Friend",
            difficulty: "medium"
        },
        {
            id: id++,
            type: "text",
            category: "processing",
            skill_tested: "categorization",
            question: "Which one does NOT belong with the others?",
            options: ["Apple", "Banana", "Carrot", "Orange"],
            correctAnswer: "Carrot",
            difficulty: "easy"
        },
        {
            id: id++,
            type: "text",
            category: "visual-spatial",
            skill_tested: "spatial_reasoning",
            question: age <= 8 
                ? "If you turn around completely, which way are you facing?"
                : "If you are facing North and turn right, which direction are you facing?",
            options: age <= 8 
                ? ["Same direction", "Opposite direction", "Left", "Right"]
                : ["South", "East", "West", "North"],
            correctAnswer: age <= 8 ? "Same direction" : "East",
            difficulty: "medium"
        }
    );
    
    // Save fallback questions to localStorage
    saveQuestions(questions);
    
    return questions;
}

export default {
    generatePersonalizedQuestions,
    getStoredQuestions,
    saveQuestions,
    clearStoredQuestions,
    updatePerformance,
    getPerformanceHistory,
    getEasierQuestion,
    getUserScreeningData
};
