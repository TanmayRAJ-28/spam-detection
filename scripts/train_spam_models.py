#!/usr/bin/env python3
"""
Spam Detection Model Training Script
Trains Naive Bayes, Logistic Regression, and SVM models on SMS spam dataset
"""

import json
import os
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

# Create necessary directories
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "public" / "models"
DATA_DIR = BASE_DIR / "public" / "data"

MODELS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_dataset():
    """Load SMS Spam Collection dataset from Kaggle file"""
    
    data_path = BASE_DIR / "data" / "spam.csv"
    
    if not data_path.exists():
        raise FileNotFoundError("spam.csv not found inside data folder")

    df = pd.read_csv(data_path, encoding="latin-1")

    # Rename columns (Kaggle format)
    df = df.rename(columns={"v1": "label", "v2": "message"})

    df = df[["label", "message"]]

    # Convert labels to binary
    df["label"] = df["label"].map({"ham": 0, "spam": 1})

    return df

   


def train_models(X_train, X_test, y_train, y_test):

    models = {}
    results = {}

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1,2),
        max_features=5000,
        lowercase=True
    )

    # NAIVE BAYES
    print("\nTraining Naive Bayes...")
    nb_pipeline = Pipeline([
        ("tfidf", vectorizer),
        ("clf", MultinomialNB())
    ])

    nb_pipeline.fit(X_train, y_train)
    y_pred_nb = nb_pipeline.predict(X_test)

    models["naive_bayes"] = nb_pipeline
    results["naive_bayes"] = evaluate_model(y_test, y_pred_nb, "Naive Bayes")


    # LOGISTIC REGRESSION
    print("\nTraining Logistic Regression...")
    lr_pipeline = Pipeline([
        ("tfidf", vectorizer),
        ("clf", LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=42
        ))
    ])

    lr_pipeline.fit(X_train, y_train)
    y_pred_lr = lr_pipeline.predict(X_test)

    models["logistic_regression"] = lr_pipeline
    results["logistic_regression"] = evaluate_model(y_test, y_pred_lr, "Logistic Regression")


    # SVM
    print("\nTraining SVM...")
    svm_pipeline = Pipeline([
        ("tfidf", vectorizer),
        ("clf", LinearSVC(
            max_iter=2000,
            class_weight="balanced",
            random_state=42
        ))
    ])

    svm_pipeline.fit(X_train, y_train)
    y_pred_svm = svm_pipeline.predict(X_test)

    models["svm"] = svm_pipeline
    results["svm"] = evaluate_model(y_test, y_pred_svm, "SVM")

    return models, results


def evaluate_model(y_true, y_pred, model_name):
    """Evaluate model performance"""
    accuracy = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, zero_division=0)
    recall = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)

    cm = confusion_matrix(y_true, y_pred)
    report = classification_report(y_true, y_pred, output_dict=True)

    print(f"\nResults for {model_name}:")
    print(f"Accuracy:  {accuracy:.4f} ({accuracy * 100:.2f}%)")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    print(f"\nConfusion Matrix:")
    print(cm)
    print(f"\nClassification Report:")
    print(classification_report(y_true, y_pred))

    return {
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1": round(float(f1), 4),
        "confusion_matrix": cm.tolist(),
        "report": report,
    }


def get_feature_importance(pipeline, top_n=10):
    """Extract top spam and ham words from model"""
    tfidf = pipeline.named_steps["tfidf"]
    feature_names = np.array(tfidf.get_feature_names_out())

    feature_importance = []

    # For Logistic Regression
    if hasattr(pipeline.named_steps["clf"], "coef_"):
        # Get top spam features (class 1)
        top_spam_idx = np.argsort(pipeline.named_steps["clf"].coef_[0])[-top_n:][::-1]
        top_spam_words = feature_names[top_spam_idx].tolist()
        feature_importance = top_spam_words

    return feature_importance


def save_models_and_metrics(models, results):
    """Save trained models and metrics to files"""
    print("\n" + "=" * 50)
    print("Saving Models and Metrics...")
    print("=" * 50)

    # Save models
    for name, model in models.items():
        model_path = MODELS_DIR / f"{name}.joblib"
        joblib.dump(model, str(model_path))
        print(f"Saved: {model_path}")

    # Extract feature importance for display
    feature_importance = {}
    for name, model in models.items():
        try:
            feature_importance[name] = get_feature_importance(model)
        except Exception as e:
            print(f"Could not extract features for {name}: {e}")
            feature_importance[name] = []

    # Create comprehensive metrics file
    metrics_data = {
        "models": {},
        "feature_importance": feature_importance,
        "metadata": {
            "total_samples": "5574",
            "test_size": "0.2",
            "stratified": True,
        },
    }

    # Add model results
    for name, metrics in results.items():
        metrics_data["models"][name] = {
            "accuracy": metrics["accuracy"],
            "precision": metrics["precision"],
            "recall": metrics["recall"],
            "f1": metrics["f1"],
            "confusion_matrix": metrics["confusion_matrix"],
        }

    # Save metrics JSON
    metrics_path = DATA_DIR / "metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(metrics_data, f, indent=2)
    print(f"Saved: {metrics_path}")

    # Print summary
    print("\n" + "=" * 50)
    print("MODEL PERFORMANCE SUMMARY")
    print("=" * 50)
    print(f"{'Model':<25} {'Accuracy':<15} {'Precision':<15} {'Recall':<15} {'F1-Score':<15}")
    print("-" * 85)
    for name, metrics in results.items():
        print(
            f"{name:<25} "
            f"{metrics['accuracy']:<15.2%} "
            f"{metrics['precision']:<15.2%} "
            f"{metrics['recall']:<15.2%} "
            f"{metrics['f1']:<15.2%}"
        )
    print("=" * 85)


def main():
    """Main training pipeline"""
    print("Spam Detection Model Training Pipeline")
    print("=" * 50)

    # Load data
    print("\nLoading SMS Spam Collection dataset...")
    df = load_dataset()

    print(f"Dataset size: {len(df)} messages")
    print(f"Spam messages: {(df['label'] == 1).sum()} ({(df['label'] == 1).sum() / len(df) * 100:.1f}%)")
    print(f"Ham messages: {(df['label'] == 0).sum()} ({(df['label'] == 0).sum() / len(df) * 100:.1f}%)")

    X = df["message"]
    y = df["label"]

    # Split data with stratification
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

    print(f"\nTrain set size: {len(X_train)}")
    print(f"Test set size: {len(X_test)}")

    # Train models
    models, results = train_models(X_train, X_test, y_train, y_test)

    # Save models and metrics
    save_models_and_metrics(models, results)

    print("\n✓ Training complete!")
    print(f"Models saved to: {MODELS_DIR}")
    print(f"Metrics saved to: {DATA_DIR / 'metrics.json'}")


if __name__ == "__main__":
    main()
