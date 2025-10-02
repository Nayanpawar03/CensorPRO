from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
import numpy as np

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your React app's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model at startup
classifier = pipeline(
    "text-classification",
    model="Sheshank2609/content-moderation-distilbert",
    return_all_scores=True,
    function_to_apply="sigmoid"
)

class TextRequest(BaseModel):
    text: str

@app.post("/moderate-text")
async def moderate_text(request: TextRequest):
    try:
        # Get model predictions
        results = classifier(request.text)[0]
        
        # Format predictions
        predictions = [
            {"label": result["label"], "score": round(float(result["score"]), 3)}
            for result in results
        ]
        
        return {
            "input": request.text,
            "predictions": predictions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)