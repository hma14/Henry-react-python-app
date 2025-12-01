
from typing import Dict, Any

class PromptTemplates:
    """Contains for prompt templates used in predicting next potential draws assistant """
    
    @staticmethod
    def analysis_system() -> str:
        """ system prompt """
        return """ you are an expert to identify a reasonable trend of lottery by analyzing the provided past draw history
                    and provide the user of potential hit numbers for the next draw"""
        
        
