"""
IBM Granite client — wraps ibm-watsonx-ai to send chat messages to Granite.
"""

import os
from ibm_watsonx_ai import APIClient, Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams

# ---------------------------------------------------------------------------
# Configuration — loaded from environment variables (set in .env)
# ---------------------------------------------------------------------------
WATSONX_URL = os.environ.get("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
WATSONX_API_KEY = os.environ["WATSONX_API_KEY"]
WATSONX_PROJECT_ID = os.environ["WATSONX_PROJECT_ID"]

# Granite model to use — granite-3-8b-instruct is the recommended chat model
GRANITE_MODEL_ID = os.environ.get(
    "GRANITE_MODEL_ID", "ibm/granite-3-8b-instruct"
)

# Generation parameters
GENERATE_PARAMS = {
    GenParams.MAX_NEW_TOKENS: 1024,
    GenParams.TEMPERATURE: 0.7,
    GenParams.TOP_P: 0.9,
    GenParams.REPETITION_PENALTY: 1.05,
}


def _build_client() -> ModelInference:
    """Initialise and return a watsonx.ai ModelInference instance."""
    credentials = Credentials(url=WATSONX_URL, api_key=WATSONX_API_KEY)
    api_client = APIClient(credentials=credentials, project_id=WATSONX_PROJECT_ID)
    return ModelInference(
        model_id=GRANITE_MODEL_ID,
        api_client=api_client,
        params=GENERATE_PARAMS,
    )


# Module-level singleton — created once on first use
_model: ModelInference | None = None


def get_model() -> ModelInference:
    global _model
    if _model is None:
        _model = _build_client()
    return _model


def chat(messages: list[dict], system_prompt: str) -> str:
    """
    Send a list of chat messages to Granite and return the reply text.

    Args:
        messages: List of {"role": "user"|"assistant", "content": str} dicts.
        system_prompt: The system instruction prepended to the conversation.

    Returns:
        The assistant's reply as a plain string.
    """
    model = get_model()

    # ibm-watsonx-ai >= 1.1 supports the chat() method with OpenAI-style messages
    formatted = [{"role": "system", "content": system_prompt}] + messages

    response = model.chat(messages=formatted)

    # Extract the text from the response structure
    return response["choices"][0]["message"]["content"].strip()
