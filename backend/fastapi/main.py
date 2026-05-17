"""FastAPI entry point (placeholder).

Run locally: `uvicorn backend.fastapi.main:app --reload`
"""
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Intellecta ML Service", version="0.0.1")


class StudentSignals(BaseModel):
    attendance: float
    study_hours: float
    previous_marks: float
    assignments_completed: float
    sleep_hours: float = 7.0
    participation: str = "Medium"


class PredictionResponse(BaseModel):
    predicted_score: float
    risk_level: str
    confidence: float
    model: str


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResponse)
def predict(signals: StudentSignals) -> PredictionResponse:
    # Placeholder — real models live under backend/fastapi/models/.
    raise NotImplementedError("Connect a trained model from backend/fastapi/models/")
