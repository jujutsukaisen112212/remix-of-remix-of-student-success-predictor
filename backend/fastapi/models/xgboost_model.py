"""XGBoost placeholder."""
class XGBoostModel:
    name = "xgboost"
    def predict(self, features: dict) -> float:
        raise NotImplementedError
