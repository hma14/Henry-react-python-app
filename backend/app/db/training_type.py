from enum import Enum

class TrainingType(Enum):
    LIGHTGBM = "LightGBM"
    PIPELINE = "Pipeline"
    LSTM = "LSTM"