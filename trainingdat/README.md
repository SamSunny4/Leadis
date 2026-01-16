# Synthetic Training Data for Learning Disability Screening

This folder contains synthetic training data generated for the Leadis learning disability screening ML model.

## Dataset Overview

| Dataset | Samples | Purpose |
|---------|---------|---------|
| `training_data` | 2,000 | Model training |
| `validation_data` | 500 | Hyperparameter tuning |
| `test_data` | 500 | Final evaluation |

## File Formats

Each dataset is available in two formats:
- `.csv` - Comma-separated values (for pandas, Excel, etc.)
- `.json` - JSON array of objects (for JavaScript, APIs, etc.)

Statistics files (`*_statistics.json`) contain distribution information for each dataset.

## Feature Categories

### Categorical Features (7)
| Feature | Description | Values |
|---------|-------------|--------|
| `primary_language` | Primary language spoken | 0=English |
| `schooling_type` | Current educational setting | 0-5 (not-enrolled to other) |
| `gender` | Gender | 0-3 (male, female, other, prefer-not-to-say) |
| `multilingualExposure` | Level of multilingual exposure | 0-4 (Monolingual to Native bilingual) |
| `birthHistory` | Birth complications history | 0-4 (full-term to unknown) |
| `hearingStatus` | Hearing status | 0-3 (normal to not-tested) |
| `visionStatus` | Vision status | 0-3 (normal to not-tested) |

### Numerical Features (35)
| Feature | Description | Range |
|---------|-------------|-------|
| `age_months` | Child's age in months | 36-144 |
| `multilingual_exposure` | Multilingual exposure level | 0-4 |
| `age_first_word_months` | Age at first word (months) | 0-48 |
| `age_first_sentence_months` | Age at first sentence (months) | 0-60 |
| `history_speech_therapy` | Speech therapy history | 0-3 |
| `history_motor_delay` | Motor delay history | 0-4 |
| `vision_concerns` | Vision concerns flag | 0-1 |
| `hearing_concerns` | Hearing concerns flag | 0-1 |
| `family_learning_difficulty` | Family history of learning difficulties | 0-1 |
| `family_adhd` | Family ADHD history | 0-4 |
| `mean_response_accuracy` | Average task accuracy | 0.0-1.0 |
| `response_accuracy_std` | Accuracy standard deviation | 0.0-1.0 |
| `mean_response_time_ms` | Average response time (ms) | 0-60000 |
| `response_time_std_ms` | Response time std (ms) | 0-30000 |
| `task_completion_rate` | Task completion rate | 0.0-1.0 |
| `mean_focus_duration_sec` | Average focus duration (sec) | 0-600 |
| `attention_dropoff_slope` | Attention decline rate | -1.0-1.0 |
| `random_interaction_rate` | Random/impulsive interactions | 0.0-1.0 |
| `task_abandonment_count` | Number of abandoned tasks | 0-50 |
| `max_sequence_length` | Maximum sequence remembered | 0-20 |
| `sequence_order_error_rate` | Sequence ordering errors | 0.0-1.0 |
| `visual_search_time_ms` | Visual search time (ms) | 0-30000 |
| `instruction_follow_accuracy` | Instruction following accuracy | 0.0-1.0 |
| `left_right_confusion_rate` | Left-right confusion rate | 0.0-1.0 |
| `speech_rate_wpm` | Speech rate (words per minute) | 0-200 |
| `auditory_processing_accuracy` | Auditory processing accuracy | 0.0-1.0 |
| `average_audio_replays` | Average audio replay requests | 0-10 |
| `hesitation_frequency` | Hesitation count | 0-50 |
| `reading_speed_wpm` | Reading speed (wpm) | 0-300 |
| `reading_accuracy` | Reading accuracy | 0.0-1.0 |
| `letter_reversal_rate` | Letter reversal rate | 0.0-1.0 |
| `audio_text_mismatch_rate` | Audio-text mismatch rate | 0.0-1.0 |
| `pref_visual` | Visual learning preference | 0.0-1.0 |
| `pref_auditory` | Auditory learning preference | 0.0-1.0 |
| `attention_span_average` | Average attention span (sec) | 0-600 |

### Output Targets (8 Risk Scores)
All risk scores range from 0.0 (no risk) to 1.0 (highest risk):

| Target | Description |
|--------|-------------|
| `risk_reading` | Reading difficulty risk |
| `risk_writing` | Writing difficulty risk |
| `risk_attention` | Attention difficulty risk |
| `risk_working_memory` | Working memory difficulty risk |
| `risk_expressive_language` | Expressive language difficulty risk |
| `risk_receptive_language` | Receptive language difficulty risk |
| `risk_visual_processing` | Visual processing difficulty risk |
| `risk_motor_coordination` | Motor coordination difficulty risk |

## Data Generation Methodology

The synthetic data is generated with realistic correlations and patterns:

### Profile Types (Distribution)
- **Typical** (45%): Typically developing children with low risk scores
- **At-risk Reading** (12%): Children showing reading/dyslexia-like patterns
- **At-risk Attention** (12%): Children showing attention/ADHD-like patterns
- **At-risk Language** (10%): Children showing language delay patterns
- **At-risk Multiple** (8%): Children with multiple area concerns
- **Borderline** (13%): Children with borderline/mild concerns

### Realistic Correlations
The generator implements evidence-based correlations:

1. **Comorbidities**: Reading difficulties often co-occur with writing difficulties
2. **Family History**: Learning difficulties and ADHD often run in families
3. **Developmental Milestones**: Delayed speech correlates with language risks
4. **Gender Distribution**: Slight male predominance in certain learning difficulties
5. **Age-Appropriate Performance**: Task performance metrics scale with age
6. **Attention-Performance Link**: Attention difficulties affect multiple metrics

## Usage Example

### Python (pandas)
```python
import pandas as pd

# Load training data
train_df = pd.read_csv('training_data.csv')

# Separate features and targets
feature_cols = [col for col in train_df.columns if not col.startswith('risk_')]
target_cols = [col for col in train_df.columns if col.startswith('risk_')]

X_train = train_df[feature_cols]
y_train = train_df[target_cols]
```

### JavaScript
```javascript
const trainingData = require('./training_data.json');

// Extract features and targets
const features = trainingData.map(sample => {
  const { risk_reading, risk_writing, risk_attention, risk_working_memory,
          risk_expressive_language, risk_receptive_language, 
          risk_visual_processing, risk_motor_coordination, ...features } = sample;
  return features;
});

const targets = trainingData.map(sample => ({
  risk_reading: sample.risk_reading,
  risk_writing: sample.risk_writing,
  risk_attention: sample.risk_attention,
  risk_working_memory: sample.risk_working_memory,
  risk_expressive_language: sample.risk_expressive_language,
  risk_receptive_language: sample.risk_receptive_language,
  risk_visual_processing: sample.risk_visual_processing,
  risk_motor_coordination: sample.risk_motor_coordination
}));
```

## Regenerating Data

To regenerate the data with different parameters:

```bash
cd trainingdat
python generate_synthetic_data.py
```

You can modify `generate_synthetic_data.py` to:
- Change sample sizes
- Adjust profile type distributions
- Modify correlation strengths
- Add new features

## Notes

- Data is seeded for reproducibility (training: 42, validation: 123, test: 456)
- All numerical values are appropriately bounded within specified ranges
- Risk scores are continuous values between 0 and 1
- The data mimics patterns observed in learning disability research literature
