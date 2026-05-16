from .study_advice import TOOL_DEFINITION as STUDY_ADVICE_TOOL, generate_study_advice

TOOL_DEFINITIONS = [
    STUDY_ADVICE_TOOL,
]

TOOL_FUNCTIONS = {
    "generate_study_advice": generate_study_advice,
}
