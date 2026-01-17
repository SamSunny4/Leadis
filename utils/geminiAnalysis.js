/**
 * Gemini AI Analysis Service
 * Provides AI-powered diagnosis and recommendations based on risk assessment data
 */

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

/**
 * Analyze risk assessment data and provide diagnosis summary
 * @param {Object} riskData - Risk assessment scores
 * @returns {Promise<Object>} Analysis result with diagnosis and recommendations
 */
export async function analyzeRiskAssessment(riskData) {
    if (!GEMINI_API_KEY) {
        console.warn('Gemini API key not found');
        return null;
    }

    try {
        // Prepare risk data summary for Gemini
        const riskSummary = Object.entries(riskData)
            .map(([key, value]) => {
                const label = key.replace('risk_', '').replace(/_/g, ' ');
                const percentage = Math.round(value * 100);
                return `${label}: ${percentage}%`;
            })
            .join('\n');

        const prompt = `You are a child psychologist specializing in learning disabilities. Analyze the following screening assessment results for a child:

RISK ASSESSMENT SCORES:
${riskSummary}

Based on these scores, provide:

1. PRIMARY DIAGNOSIS: What learning disability or condition is most likely? (Choose from: Dyslexia, Dysgraphia, Dyscalculia, ADHD, Working Memory Difficulty, Language Processing Difficulty, Visual Processing Difficulty, Dyspraxia, or combination)

2. CONFIDENCE LEVEL: Your confidence in this diagnosis (Low/Moderate/High)

3. DETAILED ANALYSIS: A 2-3 paragraph explanation of:
   - What patterns you see in the scores
   - Why you arrived at this diagnosis
   - What specific strengths and challenges the child shows
   - Important considerations or secondary concerns

4. SPECIFIC RECOMMENDATIONS: 5-7 actionable recommendations for:
   - Home learning strategies
   - Educational accommodations
   - Professional support to seek
   - Activities to support development

Format your response as JSON with this structure:
{
  "primaryDiagnosis": "condition name",
  "confidence": "Low|Moderate|High",
  "analysis": "detailed paragraph analysis",
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}

Be empathetic, supportive, and remember this is a screening tool, not a formal diagnosis.`;

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
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', errorText);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid response from Gemini API');
        }

        const analysisText = data.candidates[0].content.parts[0].text;
        
        // Try to extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            console.log('✅ Gemini analysis completed:', analysis);
            return analysis;
        } else {
            // Fallback if JSON not properly formatted
            console.warn('Could not parse JSON from Gemini, using raw text');
            return {
                primaryDiagnosis: 'Analysis Available',
                confidence: 'Moderate',
                analysis: analysisText,
                keyFindings: [],
                recommendations: []
            };
        }

    } catch (error) {
        console.error('Error analyzing with Gemini:', error);
        return null;
    }
}

/**
 * Get summary text for risk level
 */
export function getRiskLevelDescription(confidence) {
    if (confidence < 30) {
        return {
            level: 'Low Risk',
            description: 'The assessment indicates low risk in the evaluated areas. Continue monitoring development.',
            color: '#22c55e'
        };
    } else if (confidence < 60) {
        return {
            level: 'Moderate Risk',
            description: 'Some areas show moderate risk. Consider consultation with a learning specialist for further evaluation.',
            color: '#f59e0b'
        };
    } else {
        return {
            level: 'Elevated Risk',
            description: 'Multiple areas show elevated risk. We recommend professional evaluation and support.',
            color: '#ef4444'
        };
    }
}
