'use client';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

/**
 * Learning Disability Categories to screen for:
 * - Dyslexia: reading, phonological awareness, letter/word recognition
 * - Dyscalculia: number sense, math operations, quantity comparison
 * - Dysgraphia: sequencing, spatial organization
 * - ADHD indicators: attention to detail, following multi-step instructions
 * - Processing speed: timed pattern recognition
 * - Working memory: remembering sequences, following instructions
 */

/**
 * Generates quiz questions using Google Gemini API
 * Questions are specifically designed for learning disability screening
 */
export async function generateQuestions(count = 10) {
    // Add randomization seed to ensure different questions each time
    const randomSeed = Date.now() + Math.random();
    const categories = ['dyslexia', 'dyscalculia', 'attention', 'memory', 'processing', 'visual-spatial'];
    const shuffledCategories = categories.sort(() => Math.random() - 0.5);
    
    const prompt = `You are an educational psychologist creating screening questions for learning disabilities in children ages 6-12.

IMPORTANT: Generate COMPLETELY NEW and UNIQUE questions. Use random seed: ${randomSeed}

Create exactly ${count} questions that screen for these specific learning disabilities:

1. DYSLEXIA SCREENING (2-3 questions):
   - Phonological awareness: "Which word rhymes with 'cat'?" or "Which word starts with the same sound as 'ball'?"
   - Letter reversal detection: "Which letter is different: b, b, d, b?"
   - Word recognition: "Which word is spelled correctly?"
   - Reading comprehension with short passages

2. DYSCALCULIA SCREENING (2-3 questions):
   - Number sense: "Which number is bigger: 47 or 74?"
   - Basic operations with word problems
   - Number sequencing: "What comes next: 5, 10, 15, ___?"
   - Quantity estimation and comparison

3. ATTENTION & FOLLOWING INSTRUCTIONS (1-2 questions):
   - Multi-step problems: "First add 5+3, then multiply by 2. What is the answer?"
   - Detail-oriented questions with distractors

4. WORKING MEMORY (1-2 questions):
   - Sequence recall: "If the pattern is RED, BLUE, RED, BLUE, what comes next?"
   - Following verbal instructions

5. VISUAL-SPATIAL PROCESSING (1-2 questions):
   - Shape recognition and rotation
   - Pattern completion
   - Spatial relationships: "If you turn left, then left again, which direction are you facing?"

6. PROCESSING SPEED INDICATORS (1 question):
   - Simple but requires quick recognition
   - Pattern matching

Return ONLY a valid JSON array. Each question MUST have:
{
    "id": <sequential number 1 to ${count}>,
    "type": "<text|audio|visual|minigame>",
    "category": "<dyslexia|dyscalculia|attention|memory|visual-spatial|processing>",
    "skill_tested": "<specific skill being assessed>",
    "question": "<clear, child-friendly question>",
    "options": ["<option1>", "<option2>", "<option3>", "<option4>"],
    "correctAnswer": "<must exactly match one option>",
    "difficulty": "<easy|medium|hard>"
}

CRITICAL RULES:
- Each question MUST have exactly 4 options
- correctAnswer MUST be one of the 4 options (exact match)
- Use child-friendly language
- Mix difficulty levels
- Make questions engaging and non-threatening
- Focus categories: ${shuffledCategories.slice(0, 4).join(', ')}
- DO NOT use emojis in questions or answers.

Generate ${count} UNIQUE questions now. Return ONLY the JSON array, no other text.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 1.0,  // Higher temperature for more variety
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API response:', errorText);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Extract the text content from Gemini response
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!textContent) {
            console.error('Gemini response:', JSON.stringify(data, null, 2));
            throw new Error('No content in Gemini response');
        }

        console.log('Raw Gemini response:', textContent.substring(0, 500));

        // Clean the response - remove markdown code blocks if present
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

        // Parse the JSON
        const questions = JSON.parse(cleanedContent);

        // Validate and ensure proper structure
        if (!Array.isArray(questions)) {
            throw new Error('Response is not an array');
        }

        console.log(`Successfully generated ${questions.length} questions`);

        // Validate and structure each question with LD screening metadata
        return questions.map((q, index) => ({
            id: q.id || index + 1,
            type: validateType(q.type),
            category: q.category || 'general',
            skill_tested: q.skill_tested || 'cognitive',
            question: q.question || 'Question not available',
            options: Array.isArray(q.options) && q.options.length === 4 
                ? q.options 
                : ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: q.correctAnswer || q.options?.[0] || 'Option A',
            difficulty: q.difficulty || 'medium',
            ...(q.type === 'minigame' && { 'Minigame-type': q['Minigame-type'] || 'puzzle' })
        }));

    } catch (error) {
        console.error('Error generating questions:', error);
        // Return fallback questions if API fails
        return getFallbackQuestions();
    }
}

function validateType(type) {
    const validTypes = ['text', 'audio', 'visual', 'minigame'];
    return validTypes.includes(type) ? type : 'text';
}

/**
 * Fallback questions if API fails - specifically designed for LD screening
 */
function getFallbackQuestions() {
    return [
        {
            id: 1,
            type: "text",
            category: "dyslexia",
            skill_tested: "phonological_awareness",
            question: "Which word rhymes with 'cat'?",
            options: ["Dog", "Hat", "Cup", "Tree"],
            correctAnswer: "Hat",
            difficulty: "easy"
        },
        {
            id: 2,
            type: "text",
            category: "dyslexia",
            skill_tested: "letter_recognition",
            question: "Which letter looks different from the others?",
            options: ["b", "b", "d", "b"],
            correctAnswer: "d",
            difficulty: "easy"
        },
        {
            id: 3,
            type: "text",
            category: "dyscalculia",
            skill_tested: "number_sense",
            question: "Which number is bigger: 47 or 74?",
            options: ["47", "74", "They are the same", "Cannot tell"],
            correctAnswer: "74",
            difficulty: "easy"
        },
        {
            id: 4,
            type: "text",
            category: "dyscalculia",
            skill_tested: "number_sequencing",
            question: "What number comes next: 5, 10, 15, 20, ___?",
            options: ["22", "25", "30", "21"],
            correctAnswer: "25",
            difficulty: "easy"
        },
        {
            id: 5,
            type: "text",
            category: "attention",
            skill_tested: "multi_step_processing",
            question: "First add 5 + 3, then multiply by 2. What is the answer?",
            options: ["16", "13", "11", "10"],
            correctAnswer: "16",
            difficulty: "medium"
        },
        {
            id: 6,
            type: "text",
            category: "memory",
            skill_tested: "sequence_recall",
            question: "If the pattern is RED, BLUE, RED, BLUE, what comes next?",
            options: ["GREEN", "RED", "YELLOW", "BLUE"],
            correctAnswer: "RED",
            difficulty: "easy"
        },
        {
            id: 7,
            type: "visual",
            category: "visual-spatial",
            skill_tested: "shape_recognition",
            question: "Which shape has 4 equal sides and 4 corners?",
            options: ["Triangle", "Square", "Circle", "Pentagon"],
            correctAnswer: "Square",
            difficulty: "easy"
        },
        {
            id: 8,
            type: "text",
            category: "visual-spatial",
            skill_tested: "spatial_reasoning",
            question: "If you are facing North and turn right, which direction are you facing?",
            options: ["South", "East", "West", "North"],
            correctAnswer: "East",
            difficulty: "medium"
        },
        {
            id: 9,
            type: "text",
            category: "dyslexia",
            skill_tested: "word_recognition",
            question: "Which word is spelled correctly?",
            options: ["Freind", "Friend", "Frend", "Fryend"],
            correctAnswer: "Friend",
            difficulty: "medium"
        },
        {
            id: 10,
            type: "text",
            category: "processing",
            skill_tested: "categorization",
            question: "Which one does NOT belong with the others?",
            options: ["Apple", "Banana", "Carrot", "Orange"],
            correctAnswer: "Carrot",
            difficulty: "easy"
        }
    ];
}

export default generateQuestions;
