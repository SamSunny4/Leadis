/**
 * PDF Report Generator
 * Generates downloadable PDF reports with assessment data
 */

/**
 * Generate and download PDF report
 * @param {Object} options - Report options
 * @param {Object} options.predictionData - Prediction data with breakdown
 * @param {Object} options.geminiAnalysis - AI analysis data
 * @param {Object} options.userData - User demographic data
 */
export const generatePDFReport = async ({ predictionData, geminiAnalysis, userData }) => {
    // Create a new window for the printable report
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
        alert('Please allow pop-ups to download the report');
        return;
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const diagnosis = geminiAnalysis?.primaryDiagnosis || predictionData?.primaryPrediction || 'Assessment Complete';
    const confidence = geminiAnalysis?.confidence || predictionData?.riskLevel || 'Moderate';
    const analysis = geminiAnalysis?.analysis || predictionData?.evaluation || '';
    const recommendations = geminiAnalysis?.recommendations || predictionData?.recommendations || [];
    const keyFindings = geminiAnalysis?.keyFindings || [];
    const breakdown = predictionData?.breakdown || [];

    // Generate skill breakdown HTML
    const skillBreakdownHTML = breakdown.map(skill => `
        <div class="skill-row">
            <div class="skill-info">
                <span class="skill-name">${skill.name}</span>
                <span class="skill-level ${skill.probability < 30 ? 'low' : skill.probability < 60 ? 'moderate' : 'high'}">
                    ${skill.probability < 30 ? 'Low Risk' : skill.probability < 60 ? 'Moderate Risk' : 'High Risk'}
                </span>
            </div>
            <div class="skill-bar-container">
                <div class="skill-bar" style="width: ${skill.probability}%; background-color: ${skill.color};"></div>
            </div>
            <span class="skill-percentage">${skill.probability}%</span>
        </div>
    `).join('');

    // Generate recommendations HTML
    const recommendationsHTML = recommendations.map(rec => `
        <li class="recommendation-item">
            <span class="check-icon">✓</span>
            <span>${rec}</span>
        </li>
    `).join('');

    // Generate key findings HTML
    const keyFindingsHTML = keyFindings.length > 0 ? `
        <div class="section">
            <h2>Key Findings</h2>
            <ul class="findings-list">
                ${keyFindings.map(finding => `<li>${finding}</li>`).join('')}
            </ul>
        </div>
    ` : '';

    // Build the complete HTML document
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leadis Assessment Report - ${currentDate}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Fredoka:wght@600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Nunito', sans-serif;
            color: #1e293b;
            line-height: 1.6;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 24px;
            border-bottom: 3px solid #22c55e;
            margin-bottom: 32px;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .logo-icon {
            width: 60px;
            height: 60px;
        }
        
        .logo-icon img {
            width: 100%;
            height: 100%;
            display: block;
        }
        
        .logo-text {
            font-size: 32px;
            font-weight: 800;
            color: #1e293b;
            font-family: 'Fredoka', sans-serif;
        }
        
        .report-meta {
            text-align: right;
            color: #64748b;
            font-size: 14px;
        }
        
        .report-title {
            font-size: 14px;
            font-weight: 600;
            color: #22c55e;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .main-result {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%);
            border-radius: 24px;
            padding: 40px;
            text-align: center;
            margin-bottom: 40px;
            border: 3px solid #86efac;
            box-shadow: 0 10px 30px rgba(34, 197, 94, 0.15);
        }
        
        .result-label {
            display: inline-block;
            background: #e0f2fe;
            color: #0284c7;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 16px;
        }
        
        .diagnosis-title {
            font-size: 48px;
            font-weight: 800;
            background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 16px;
            font-family: 'Fredoka', 'Nunito', sans-serif;
        }
        
        .confidence-badge {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 16px;
        }
        
        .confidence-high { background: #dcfce7; color: #166534; }
        .confidence-moderate { background: #fef3c7; color: #92400e; }
        .confidence-low { background: #fee2e2; color: #991b1b; }
        
        .section {
            margin-bottom: 32px;
        }
        
        .section h2 {
            font-size: 22px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: 'Fredoka', 'Nunito', sans-serif;
        }
        
        .section h2::before {
            content: '';
            width: 5px;
            height: 28px;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            border-radius: 3px;
            box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }
        
        .analysis-box {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border: 2px solid #e2e8f0;
            border-radius: 20px;
            padding: 28px;
            line-height: 1.8;
            color: #1e293b;
            white-space: pre-line;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }
        
        .skill-row {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 12px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .skill-row:last-child {
            border-bottom: none;
        }
        
        .skill-info {
            width: 200px;
            flex-shrink: 0;
        }
        
        .skill-name {
            display: block;
            font-weight: 600;
            color: #1e293b;
            font-size: 14px;
        }
        
        .skill-level {
            display: inline-block;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 8px;
            margin-top: 4px;
        }
        
        .skill-level.low { background: #dcfce7; color: #166534; }
        .skill-level.moderate { background: #fef3c7; color: #92400e; }
        .skill-level.high { background: #fee2e2; color: #991b1b; }
        
        .skill-bar-container {
            flex: 1;
            height: 10px;
            background: #f1f5f9;
            border-radius: 5px;
            overflow: hidden;
        }
        
        .skill-bar {
            height: 100%;
            border-radius: 5px;
            transition: width 0.5s ease;
        }
        
        .skill-percentage {
            width: 50px;
            text-align: right;
            font-weight: 700;
            color: #64748b;
            font-size: 14px;
        }
        
        .recommendations-section {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 3px solid #86efac;
            border-radius: 20px;
            padding: 28px;
            box-shadow: 0 6px 20px rgba(34, 197, 94, 0.12);
        }
        
        .recommendations-section h2 {
            color: #166534;
        }
        
        .recommendations-section h2::before {
            background: #166534;
        }
        
        .recommendation-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 10px 0;
            font-size: 15px;
            color: #1e293b;
        }
        
        .check-icon {
            color: #22c55e;
            font-weight: bold;
            font-size: 16px;
            flex-shrink: 0;
        }
        
        .findings-list {
            padding-left: 20px;
        }
        
        .findings-list li {
            padding: 8px 0;
            color: #1e293b;
        }
        
        .footer {
            margin-top: 48px;
            padding-top: 24px;
            border-top: 2px solid #f1f5f9;
            text-align: center;
            color: #64748b;
            font-size: 13px;
        }
        
        .disclaimer {
            background: #fef3c7;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
            font-size: 13px;
            color: #92400e;
        }
        
        .print-button {
            display: block;
            width: 100%;
            padding: 16px;
            background: #22c55e;
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            margin-bottom: 24px;
        }
        
        .print-button:hover {
            background: #16a34a;
        }
        
        @media print {
            .print-button {
                display: none;
            }
            body {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print(); return false;">
        📥 Download as PDF (Print to PDF)
    </button>

    <header class="header">
        <div class="logo-section">
            <div class="logo-icon">
                <img src="/logo.svg" alt="Leadis Logo" />
            </div>
            <span class="logo-text">Leadis</span>
        </div>
        <div class="report-meta">
            <div class="report-title">Assessment Report</div>
            <div>${currentDate}</div>
        </div>
    </header>

    <div class="main-result">
        <div class="result-label">${geminiAnalysis ? '🤖 AI-Powered Diagnosis' : 'Screening Result'}</div>
        <div style="font-size: 16px; font-weight: 600; color: #0284c7; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">
            Primary Diagnosis
        </div>
        <h1 class="diagnosis-title">${diagnosis}</h1>
        <div class="confidence-badge confidence-${confidence.toLowerCase()}">
            ${confidence} Confidence
        </div>
    </div>

    <div class="section">
        <h2>AI Analysis Summary</h2>
        <div class="analysis-box">${analysis}</div>
    </div>

    ${keyFindingsHTML}

    <div class="section">
        <h2>Skill Breakdown</h2>
        ${skillBreakdownHTML}
    </div>

    <div class="section recommendations-section">
        <h2>Recommended Next Steps</h2>
        <ul style="list-style: none;">
            ${recommendationsHTML}
        </ul>
    </div>

    <div class="disclaimer">
        <strong>Important Disclaimer:</strong> This report is based on an AI-powered screening tool and is not a medical diagnosis. 
        Please consult with a qualified healthcare professional or learning specialist for a formal evaluation.
    </div>

    <footer class="footer">
        <p>Generated by Leadis - AI-Powered Learning Disability Screening</p>
        <p>© 2026 Leadis. Made with love for families everywhere.</p>
    </footer>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
};

/**
 * Share report via Web Share API or copy link
 * @param {Object} options - Share options
 */
export const shareReport = async ({ predictionData, geminiAnalysis }) => {
    const diagnosis = geminiAnalysis?.primaryDiagnosis || predictionData?.primaryPrediction || 'Assessment Complete';
    const confidence = geminiAnalysis?.confidence || 'Moderate';
    
    const shareData = {
        title: 'Leadis Assessment Report',
        text: `Check out my child's learning assessment results from Leadis! Diagnosis: ${diagnosis} (${confidence} Confidence)`,
        url: window.location.href
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
            return { success: true, method: 'native' };
        } else {
            // Fallback: copy link to clipboard
            await navigator.clipboard.writeText(
                `${shareData.text}\n\n${shareData.url}`
            );
            return { success: true, method: 'clipboard' };
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Share failed:', error);
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(shareData.url);
                return { success: true, method: 'clipboard' };
            } catch (clipError) {
                return { success: false, error: clipError.message };
            }
        }
        return { success: false, error: 'Share cancelled' };
    }
};
