# Backend (placeholder)

Future FastAPI + scikit-learn microservice for ML prediction.
The current app ships a pure-TypeScript heuristic in `src/services/predictionService.ts`
and will swap to this service once trained models are ready.

```
backend/fastapi/
  main.py            FastAPI app entry
  models/            Model interfaces (RandomForest, DecisionTree, XGBoost)
  prediction/        Inference endpoints
  training/          Training pipelines + dataset loaders
```

No model training has been performed yet — these files are interface placeholders only.
