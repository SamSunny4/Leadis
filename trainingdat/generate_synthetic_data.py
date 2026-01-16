"""
Synthetic Training Data Generator for Learning Disability Screening
Generates realistic training data with proper correlations between features and risk outputs.
"""

import json
import random
import csv
import os
from typing import Dict, List, Any
import math

# Set seed for reproducibility
random.seed(42)

# ============================================================================
# VALUE MAPPINGS
# ============================================================================

CATEGORICAL_MAPPINGS = {
    "primary_language": {"english": 0},
    "schooling_type": {
        "not-enrolled": 0, "daycare": 1, "preschool-kindergarten": 2,
        "school": 3, "homeschooling": 4, "other": 5
    },
    "gender": {"male": 0, "female": 1, "other": 2, "prefer-not-to-say": 3},
    "multilingualExposure": {
        "Monolingual": 0, "Minimal": 1, "Moderate": 2, "High": 3, "Native bilingual": 4
    },
    "birthHistory": {
        "full-term": 0, "preterm": 1, "nicu": 2, "complications": 3, "unknown": 4
    },
    "hearingStatus": {
        "normal": 0, "tested-normal": 0, "concerns": 1, "diagnosed": 2, "not-tested": 3
    },
    "visionStatus": {
        "normal": 0, "tested-normal": 0, "glasses": 1, "concerns": 2, "not-tested": 3
    }
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def clamp(value: float, min_val: float, max_val: float) -> float:
    """Clamp value between min and max."""
    return max(min_val, min(max_val, value))

def add_noise(value: float, noise_level: float = 0.1) -> float:
    """Add gaussian noise to a value."""
    return value + random.gauss(0, noise_level)

def weighted_choice(options: List[Any], weights: List[float]) -> Any:
    """Make a weighted random choice."""
    total = sum(weights)
    weights = [w / total for w in weights]
    r = random.random()
    cumulative = 0
    for option, weight in zip(options, weights):
        cumulative += weight
        if r <= cumulative:
            return option
    return options[-1]

def generate_correlated_value(base_risk: float, min_val: float, max_val: float, 
                              correlation: float = 0.7, noise: float = 0.15) -> float:
    """Generate a value correlated with base risk."""
    # Higher risk = worse performance (lower accuracy, higher times, etc.)
    correlated = base_risk * correlation + random.gauss(0.5, 0.2) * (1 - correlation)
    correlated = add_noise(correlated, noise)
    return clamp(correlated * (max_val - min_val) + min_val, min_val, max_val)

# ============================================================================
# CHILD PROFILE GENERATORS
# ============================================================================

def generate_child_profile(profile_type: str = "random") -> Dict[str, Any]:
    """
    Generate a child profile with realistic correlations.
    
    Profile types:
    - "typical": Typically developing child
    - "at_risk_reading": Child at risk for reading difficulties
    - "at_risk_attention": Child at risk for attention difficulties  
    - "at_risk_language": Child at risk for language difficulties
    - "at_risk_multiple": Child at risk for multiple areas
    - "random": Random profile with weighted distribution
    """
    
    if profile_type == "random":
        profile_type = weighted_choice(
            ["typical", "at_risk_reading", "at_risk_attention", 
             "at_risk_language", "at_risk_multiple", "borderline"],
            [0.45, 0.12, 0.12, 0.10, 0.08, 0.13]
        )
    
    profile = {"_profile_type": profile_type}
    
    # Base risk levels based on profile type
    base_risks = get_base_risks(profile_type)
    
    # Generate demographic features
    profile.update(generate_demographics(profile_type, base_risks))
    
    # Generate developmental history
    profile.update(generate_developmental_history(base_risks))
    
    # Generate family history
    profile.update(generate_family_history(base_risks))
    
    # Generate task performance metrics
    profile.update(generate_task_performance(base_risks))
    
    # Generate final risk scores
    profile.update(calculate_risk_scores(profile, base_risks))
    
    return profile

def get_base_risks(profile_type: str) -> Dict[str, float]:
    """Get base risk levels for each profile type."""
    
    if profile_type == "typical":
        return {
            "reading": random.uniform(0.05, 0.25),
            "writing": random.uniform(0.05, 0.25),
            "attention": random.uniform(0.05, 0.20),
            "working_memory": random.uniform(0.05, 0.25),
            "expressive_language": random.uniform(0.05, 0.20),
            "receptive_language": random.uniform(0.05, 0.20),
            "visual_processing": random.uniform(0.05, 0.20),
            "motor_coordination": random.uniform(0.05, 0.20)
        }
    
    elif profile_type == "at_risk_reading":
        return {
            "reading": random.uniform(0.55, 0.85),
            "writing": random.uniform(0.45, 0.75),  # Often comorbid
            "attention": random.uniform(0.15, 0.40),
            "working_memory": random.uniform(0.35, 0.60),
            "expressive_language": random.uniform(0.20, 0.45),
            "receptive_language": random.uniform(0.15, 0.35),
            "visual_processing": random.uniform(0.30, 0.55),
            "motor_coordination": random.uniform(0.10, 0.30)
        }
    
    elif profile_type == "at_risk_attention":
        return {
            "reading": random.uniform(0.20, 0.45),
            "writing": random.uniform(0.25, 0.50),
            "attention": random.uniform(0.60, 0.90),
            "working_memory": random.uniform(0.45, 0.70),
            "expressive_language": random.uniform(0.15, 0.35),
            "receptive_language": random.uniform(0.20, 0.40),
            "visual_processing": random.uniform(0.15, 0.35),
            "motor_coordination": random.uniform(0.20, 0.45)
        }
    
    elif profile_type == "at_risk_language":
        return {
            "reading": random.uniform(0.30, 0.55),
            "writing": random.uniform(0.25, 0.50),
            "attention": random.uniform(0.15, 0.35),
            "working_memory": random.uniform(0.25, 0.45),
            "expressive_language": random.uniform(0.55, 0.85),
            "receptive_language": random.uniform(0.50, 0.80),
            "visual_processing": random.uniform(0.10, 0.30),
            "motor_coordination": random.uniform(0.10, 0.25)
        }
    
    elif profile_type == "at_risk_multiple":
        return {
            "reading": random.uniform(0.50, 0.80),
            "writing": random.uniform(0.50, 0.80),
            "attention": random.uniform(0.45, 0.75),
            "working_memory": random.uniform(0.50, 0.75),
            "expressive_language": random.uniform(0.40, 0.70),
            "receptive_language": random.uniform(0.40, 0.65),
            "visual_processing": random.uniform(0.35, 0.60),
            "motor_coordination": random.uniform(0.30, 0.55)
        }
    
    else:  # borderline
        return {
            "reading": random.uniform(0.30, 0.50),
            "writing": random.uniform(0.30, 0.50),
            "attention": random.uniform(0.25, 0.45),
            "working_memory": random.uniform(0.30, 0.50),
            "expressive_language": random.uniform(0.25, 0.45),
            "receptive_language": random.uniform(0.25, 0.45),
            "visual_processing": random.uniform(0.20, 0.40),
            "motor_coordination": random.uniform(0.20, 0.40)
        }

def generate_demographics(profile_type: str, base_risks: Dict[str, float]) -> Dict[str, Any]:
    """Generate demographic features."""
    
    # Age distribution (36-144 months = 3-12 years)
    age_months = int(random.gauss(84, 24))  # Mean around 7 years
    age_months = clamp(age_months, 36, 144)
    
    # Gender - slight male predominance in learning difficulties
    if profile_type in ["at_risk_reading", "at_risk_attention", "at_risk_multiple"]:
        gender = weighted_choice([0, 1, 2, 3], [0.60, 0.35, 0.03, 0.02])
    else:
        gender = weighted_choice([0, 1, 2, 3], [0.48, 0.48, 0.02, 0.02])
    
    # Schooling type based on age
    if age_months < 48:
        schooling = weighted_choice([0, 1, 2, 4, 5], [0.15, 0.50, 0.25, 0.05, 0.05])
    elif age_months < 72:
        schooling = weighted_choice([1, 2, 3, 4, 5], [0.10, 0.60, 0.20, 0.05, 0.05])
    else:
        schooling = weighted_choice([2, 3, 4, 5], [0.05, 0.85, 0.07, 0.03])
    
    # Multilingual exposure
    multilingual = weighted_choice([0, 1, 2, 3, 4], [0.55, 0.20, 0.12, 0.08, 0.05])
    
    return {
        "age_months": age_months,
        "gender": gender,
        "primary_language": 0,  # English
        "schooling_type": schooling,
        "multilingualExposure": multilingual,
        "multilingual_exposure": multilingual
    }

def generate_developmental_history(base_risks: Dict[str, float]) -> Dict[str, Any]:
    """Generate developmental history features."""
    
    # Average risk level influences developmental history
    avg_risk = sum(base_risks.values()) / len(base_risks)
    
    # Birth history - higher risks correlate with more complications
    if avg_risk > 0.5:
        birth = weighted_choice([0, 1, 2, 3, 4], [0.50, 0.20, 0.12, 0.10, 0.08])
    elif avg_risk > 0.3:
        birth = weighted_choice([0, 1, 2, 3, 4], [0.65, 0.15, 0.08, 0.07, 0.05])
    else:
        birth = weighted_choice([0, 1, 2, 3, 4], [0.80, 0.10, 0.04, 0.03, 0.03])
    
    # Age of first words (typical: 12 months, delayed: 18-24+ months)
    language_risk = (base_risks["expressive_language"] + base_risks["receptive_language"]) / 2
    first_word_base = 12 + language_risk * 20
    age_first_word = int(clamp(random.gauss(first_word_base, 4), 6, 48))
    
    # Age of first sentences (typical: 18-24 months, delayed: 30+ months)
    first_sentence_base = max(age_first_word + 6, 18) + language_risk * 18
    age_first_sentence = int(clamp(random.gauss(first_sentence_base, 5), age_first_word + 3, 60))
    
    # Speech therapy history
    if language_risk > 0.5 or base_risks["reading"] > 0.5:
        speech_therapy = weighted_choice([0, 1, 2, 3], [0.30, 0.35, 0.25, 0.10])
    elif language_risk > 0.3:
        speech_therapy = weighted_choice([0, 1, 2, 3], [0.55, 0.30, 0.12, 0.03])
    else:
        speech_therapy = weighted_choice([0, 1, 2, 3], [0.85, 0.10, 0.04, 0.01])
    
    # Motor delay history
    motor_risk = base_risks["motor_coordination"]
    if motor_risk > 0.4:
        motor_delay = weighted_choice([0, 1, 2, 3, 4], [0.40, 0.25, 0.20, 0.10, 0.05])
    else:
        motor_delay = weighted_choice([0, 1, 2, 3, 4], [0.80, 0.12, 0.05, 0.02, 0.01])
    
    # Hearing status
    if base_risks["receptive_language"] > 0.5:
        hearing = weighted_choice([0, 1, 2, 3], [0.70, 0.15, 0.05, 0.10])
    else:
        hearing = weighted_choice([0, 1, 2, 3], [0.85, 0.08, 0.02, 0.05])
    
    # Vision status
    if base_risks["visual_processing"] > 0.4 or base_risks["reading"] > 0.5:
        vision = weighted_choice([0, 1, 2, 3], [0.65, 0.18, 0.10, 0.07])
    else:
        vision = weighted_choice([0, 1, 2, 3], [0.80, 0.12, 0.05, 0.03])
    
    return {
        "birthHistory": birth,
        "age_first_word_months": age_first_word,
        "age_first_sentence_months": age_first_sentence,
        "history_speech_therapy": speech_therapy,
        "history_motor_delay": motor_delay,
        "hearingStatus": hearing,
        "visionStatus": vision,
        "hearing_concerns": 1 if hearing in [1, 2] else 0,
        "vision_concerns": 1 if vision in [1, 2] else 0
    }

def generate_family_history(base_risks: Dict[str, float]) -> Dict[str, Any]:
    """Generate family history features."""
    
    reading_risk = base_risks["reading"]
    attention_risk = base_risks["attention"]
    
    # Family learning difficulties (dyslexia often runs in families)
    if reading_risk > 0.5:
        family_learning = weighted_choice([0, 1], [0.40, 0.60])
    elif reading_risk > 0.3:
        family_learning = weighted_choice([0, 1], [0.65, 0.35])
    else:
        family_learning = weighted_choice([0, 1], [0.85, 0.15])
    
    # Family ADHD history
    if attention_risk > 0.5:
        family_adhd = weighted_choice([0, 1, 2, 3, 4], [0.30, 0.35, 0.10, 0.15, 0.10])
    elif attention_risk > 0.3:
        family_adhd = weighted_choice([0, 1, 2, 3, 4], [0.55, 0.25, 0.05, 0.08, 0.07])
    else:
        family_adhd = weighted_choice([0, 1, 2, 3, 4], [0.75, 0.12, 0.03, 0.05, 0.05])
    
    return {
        "family_learning_difficulty": family_learning,
        "family_adhd": family_adhd
    }

def generate_task_performance(base_risks: Dict[str, float]) -> Dict[str, Any]:
    """Generate task performance metrics based on risk levels."""
    
    # General performance factors
    reading_risk = base_risks["reading"]
    attention_risk = base_risks["attention"]
    memory_risk = base_risks["working_memory"]
    language_exp_risk = base_risks["expressive_language"]
    language_rec_risk = base_risks["receptive_language"]
    visual_risk = base_risks["visual_processing"]
    motor_risk = base_risks["motor_coordination"]
    
    # Mean response accuracy (inverse of average risk)
    avg_risk = sum(base_risks.values()) / len(base_risks)
    mean_accuracy = clamp(1 - avg_risk * 0.8 + random.gauss(0, 0.08), 0.2, 1.0)
    accuracy_std = clamp(avg_risk * 0.3 + random.uniform(0.05, 0.15), 0.05, 0.5)
    
    # Response time - higher risk = slower/more variable
    base_rt = 1500 + avg_risk * 3000 + attention_risk * 2000
    mean_rt = clamp(random.gauss(base_rt, 500), 500, 15000)
    rt_std = clamp(mean_rt * (0.3 + attention_risk * 0.5), 100, 8000)
    
    # Task completion rate
    completion = clamp(1 - attention_risk * 0.4 - avg_risk * 0.3 + random.gauss(0, 0.1), 0.3, 1.0)
    
    # Focus duration (attention-dependent)
    focus_base = 180 - attention_risk * 120
    mean_focus = clamp(random.gauss(focus_base, 30), 15, 300)
    
    # Attention dropoff slope (negative = declining attention)
    dropoff = clamp(-attention_risk * 0.5 + random.gauss(0, 0.15), -0.8, 0.3)
    
    # Random interaction rate (impulsivity indicator)
    random_rate = clamp(attention_risk * 0.4 + random.gauss(0.1, 0.08), 0, 0.6)
    
    # Task abandonment
    abandonment = int(clamp(attention_risk * 15 + avg_risk * 10 + random.gauss(0, 3), 0, 30))
    
    # Sequence/memory tasks
    max_sequence = int(clamp(7 - memory_risk * 4 - attention_risk * 2 + random.gauss(0, 1), 2, 12))
    sequence_errors = clamp(memory_risk * 0.5 + attention_risk * 0.2 + random.gauss(0.1, 0.08), 0, 0.8)
    
    # Visual search
    visual_search = clamp(2000 + visual_risk * 8000 + attention_risk * 5000 + random.gauss(0, 1000), 500, 25000)
    
    # Instruction following
    instruction_acc = clamp(1 - language_rec_risk * 0.5 - attention_risk * 0.3 + random.gauss(0, 0.1), 0.2, 1.0)
    
    # Left-right confusion (common in dyslexia)
    lr_confusion = clamp(reading_risk * 0.4 + visual_risk * 0.2 + random.gauss(0.05, 0.08), 0, 0.7)
    
    # Speech rate
    speech_rate = clamp(120 - language_exp_risk * 50 + random.gauss(0, 15), 40, 180)
    
    # Auditory processing
    auditory_acc = clamp(1 - language_rec_risk * 0.4 - attention_risk * 0.2 + random.gauss(0, 0.1), 0.3, 1.0)
    audio_replays = int(clamp(language_rec_risk * 5 + attention_risk * 2 + random.gauss(0, 1), 0, 8))
    
    # Hesitation frequency
    hesitation = int(clamp(language_exp_risk * 25 + reading_risk * 15 + random.gauss(5, 5), 0, 45))
    
    # Reading metrics
    reading_speed = clamp(150 - reading_risk * 100 + random.gauss(0, 20), 20, 250)
    reading_acc = clamp(1 - reading_risk * 0.5 + random.gauss(0, 0.1), 0.3, 1.0)
    letter_reversal = clamp(reading_risk * 0.5 + visual_risk * 0.2 + random.gauss(0.05, 0.08), 0, 0.7)
    audio_text_mismatch = clamp(reading_risk * 0.4 + language_rec_risk * 0.2 + random.gauss(0.05, 0.08), 0, 0.6)
    
    # Learning preferences
    pref_visual = clamp(0.5 + visual_risk * -0.2 + random.gauss(0, 0.15), 0.1, 0.9)
    pref_auditory = clamp(0.5 + language_rec_risk * -0.2 + random.gauss(0, 0.15), 0.1, 0.9)
    
    # Normalize preferences
    total_pref = pref_visual + pref_auditory
    pref_visual = pref_visual / total_pref
    pref_auditory = pref_auditory / total_pref
    
    # Attention span average
    attention_span = clamp(180 - attention_risk * 120 + random.gauss(0, 30), 20, 400)
    
    return {
        "mean_response_accuracy": round(mean_accuracy, 4),
        "response_accuracy_std": round(accuracy_std, 4),
        "mean_response_time_ms": round(mean_rt, 2),
        "response_time_std_ms": round(rt_std, 2),
        "task_completion_rate": round(completion, 4),
        "mean_focus_duration_sec": round(mean_focus, 2),
        "attention_dropoff_slope": round(dropoff, 4),
        "random_interaction_rate": round(random_rate, 4),
        "task_abandonment_count": abandonment,
        "max_sequence_length": max_sequence,
        "sequence_order_error_rate": round(sequence_errors, 4),
        "visual_search_time_ms": round(visual_search, 2),
        "instruction_follow_accuracy": round(instruction_acc, 4),
        "left_right_confusion_rate": round(lr_confusion, 4),
        "speech_rate_wpm": round(speech_rate, 2),
        "auditory_processing_accuracy": round(auditory_acc, 4),
        "average_audio_replays": audio_replays,
        "hesitation_frequency": hesitation,
        "reading_speed_wpm": round(reading_speed, 2),
        "reading_accuracy": round(reading_acc, 4),
        "letter_reversal_rate": round(letter_reversal, 4),
        "audio_text_mismatch_rate": round(audio_text_mismatch, 4),
        "pref_visual": round(pref_visual, 4),
        "pref_auditory": round(pref_auditory, 4),
        "attention_span_average": round(attention_span, 2)
    }

def calculate_risk_scores(profile: Dict[str, Any], base_risks: Dict[str, float]) -> Dict[str, float]:
    """Calculate final risk scores with some noise and adjustments."""
    
    # Add small variations to base risks for final output
    return {
        "risk_reading": round(clamp(base_risks["reading"] + random.gauss(0, 0.05), 0, 1), 4),
        "risk_writing": round(clamp(base_risks["writing"] + random.gauss(0, 0.05), 0, 1), 4),
        "risk_attention": round(clamp(base_risks["attention"] + random.gauss(0, 0.05), 0, 1), 4),
        "risk_working_memory": round(clamp(base_risks["working_memory"] + random.gauss(0, 0.05), 0, 1), 4),
        "risk_expressive_language": round(clamp(base_risks["expressive_language"] + random.gauss(0, 0.05), 0, 1), 4),
        "risk_receptive_language": round(clamp(base_risks["receptive_language"] + random.gauss(0, 0.05), 0, 1), 4),
        "risk_visual_processing": round(clamp(base_risks["visual_processing"] + random.gauss(0, 0.05), 0, 1), 4),
        "risk_motor_coordination": round(clamp(base_risks["motor_coordination"] + random.gauss(0, 0.05), 0, 1), 4)
    }

# ============================================================================
# DATA GENERATION
# ============================================================================

def generate_dataset(n_samples: int = 1000) -> List[Dict[str, Any]]:
    """Generate a complete dataset with n_samples."""
    
    dataset = []
    for i in range(n_samples):
        profile = generate_child_profile("random")
        # Remove internal profile type marker
        profile.pop("_profile_type", None)
        dataset.append(profile)
    
    return dataset

def get_feature_order() -> List[str]:
    """Get the ordered list of all features."""
    return [
        # Categorical features
        "primary_language",
        "schooling_type", 
        "gender",
        "multilingualExposure",
        "birthHistory",
        "hearingStatus",
        "visionStatus",
        # Numerical features
        "age_months",
        "multilingual_exposure",
        "age_first_word_months",
        "age_first_sentence_months",
        "history_speech_therapy",
        "history_motor_delay",
        "vision_concerns",
        "hearing_concerns",
        "family_learning_difficulty",
        "family_adhd",
        "mean_response_accuracy",
        "response_accuracy_std",
        "mean_response_time_ms",
        "response_time_std_ms",
        "task_completion_rate",
        "mean_focus_duration_sec",
        "attention_dropoff_slope",
        "random_interaction_rate",
        "task_abandonment_count",
        "max_sequence_length",
        "sequence_order_error_rate",
        "visual_search_time_ms",
        "instruction_follow_accuracy",
        "left_right_confusion_rate",
        "speech_rate_wpm",
        "auditory_processing_accuracy",
        "average_audio_replays",
        "hesitation_frequency",
        "reading_speed_wpm",
        "reading_accuracy",
        "letter_reversal_rate",
        "audio_text_mismatch_rate",
        "pref_visual",
        "pref_auditory",
        "attention_span_average",
        # Output targets
        "risk_reading",
        "risk_writing",
        "risk_attention",
        "risk_working_memory",
        "risk_expressive_language",
        "risk_receptive_language",
        "risk_visual_processing",
        "risk_motor_coordination"
    ]

def save_to_csv(dataset: List[Dict[str, Any]], filename: str):
    """Save dataset to CSV file."""
    features = get_feature_order()
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=features)
        writer.writeheader()
        for row in dataset:
            # Only include features in our ordered list
            filtered_row = {k: row[k] for k in features if k in row}
            writer.writerow(filtered_row)

def save_to_json(dataset: List[Dict[str, Any]], filename: str):
    """Save dataset to JSON file."""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, indent=2)

def generate_statistics(dataset: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate statistics about the dataset."""
    
    stats = {
        "total_samples": len(dataset),
        "risk_distributions": {},
        "feature_ranges": {}
    }
    
    # Risk score distributions
    risk_fields = [
        "risk_reading", "risk_writing", "risk_attention", "risk_working_memory",
        "risk_expressive_language", "risk_receptive_language", 
        "risk_visual_processing", "risk_motor_coordination"
    ]
    
    for field in risk_fields:
        values = [d[field] for d in dataset]
        stats["risk_distributions"][field] = {
            "mean": round(sum(values) / len(values), 4),
            "min": round(min(values), 4),
            "max": round(max(values), 4),
            "high_risk_count": sum(1 for v in values if v > 0.5),
            "low_risk_count": sum(1 for v in values if v < 0.3)
        }
    
    # Age distribution
    ages = [d["age_months"] for d in dataset]
    stats["age_distribution"] = {
        "mean_months": round(sum(ages) / len(ages), 1),
        "min_months": min(ages),
        "max_months": max(ages)
    }
    
    return stats

# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("Generating Synthetic Training Data for Learning Disability Screening")
    print("=" * 60)
    
    # Generate different dataset sizes
    datasets = {
        "training": 2000,
        "validation": 500,
        "test": 500
    }
    
    output_dir = os.path.dirname(os.path.abspath(__file__))
    
    for name, size in datasets.items():
        print(f"\nGenerating {name} dataset ({size} samples)...")
        
        # Use different seeds for each split
        if name == "validation":
            random.seed(123)
        elif name == "test":
            random.seed(456)
        else:
            random.seed(42)
        
        dataset = generate_dataset(size)
        
        # Save as CSV
        csv_path = os.path.join(output_dir, f"{name}_data.csv")
        save_to_csv(dataset, csv_path)
        print(f"  Saved: {csv_path}")
        
        # Save as JSON
        json_path = os.path.join(output_dir, f"{name}_data.json")
        save_to_json(dataset, json_path)
        print(f"  Saved: {json_path}")
        
        # Generate and save statistics
        stats = generate_statistics(dataset)
        stats_path = os.path.join(output_dir, f"{name}_statistics.json")
        with open(stats_path, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2)
        print(f"  Saved: {stats_path}")
    
    print("\n" + "=" * 60)
    print("Data generation complete!")
    print("=" * 60)
    
    # Print summary statistics for training data
    random.seed(42)
    training_data = generate_dataset(2000)
    stats = generate_statistics(training_data)
    
    print("\nTraining Data Summary:")
    print(f"  Total samples: {stats['total_samples']}")
    print(f"  Age range: {stats['age_distribution']['min_months']}-{stats['age_distribution']['max_months']} months")
    print(f"  Mean age: {stats['age_distribution']['mean_months']} months")
    
    print("\nRisk Score Distributions:")
    for risk, data in stats['risk_distributions'].items():
        print(f"  {risk}:")
        print(f"    Mean: {data['mean']:.3f}, Range: [{data['min']:.3f}, {data['max']:.3f}]")
        print(f"    High risk (>0.5): {data['high_risk_count']}, Low risk (<0.3): {data['low_risk_count']}")
