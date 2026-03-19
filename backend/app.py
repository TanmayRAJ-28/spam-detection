from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os

app = FastAPI(title="Spam Detection API")
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_PATH = os.path.join(BASE_DIR, "../public/models")

nb_model = joblib.load(os.path.join(MODELS_PATH, "naive_bayes.joblib"))
lr_model = joblib.load(os.path.join(MODELS_PATH, "logistic_regression.joblib"))
svm_model = joblib.load(os.path.join(MODELS_PATH, "svm.joblib"))

class MessageRequest(BaseModel):
    message: str

import numpy as np

@app.post("/predict")
def predict_spam(data: MessageRequest):
    message = [data.message]

    nb_pred = nb_model.predict(message)[0]
    lr_pred = lr_model.predict(message)[0]
    svm_pred = svm_model.predict(message)[0]

    # Confidence for NB & LR
    nb_conf = float(np.max(nb_model.predict_proba(message))) * 100
    lr_conf = float(np.max(lr_model.predict_proba(message))) * 100

    # SVM confidence (approximate)
    svm_score = svm_model.decision_function(message)
    svm_conf = float(abs(svm_score[0])) / 2 * 100

    return {
        "naive_bayes": "Spam" if nb_pred == 1 else "Not Spam",
        "logistic_regression": "Spam" if lr_pred == 1 else "Not Spam",
        "svm": "Spam" if svm_pred == 1 else "Not Spam",
        "confidence": {
            "naive_bayes": round(nb_conf, 2),
            "logistic_regression": round(lr_conf, 2),
            "svm": round(svm_conf, 2)
        }
    }