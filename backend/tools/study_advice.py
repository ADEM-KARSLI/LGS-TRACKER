from typing import Dict

TOOL_DEFINITION = {
    "type": "function",
    "function": {
        "name": "generate_study_advice",
        "description": "Generate study advice based on lesson name and wrong answer count.",
        "parameters": {
            "type": "object",
            "properties": {
                "lesson": {
                    "type": "string",
                    "description": "Lesson name."
                },
                "wrong_count": {
                    "type": "integer",
                    "description": "Number of wrong answers."
                }
            },
            "required": ["lesson", "wrong_count"]
        }
    }
}


def generate_study_advice(lesson: str, wrong_count: int) -> Dict[str, object]:
    if wrong_count >= 10:
        advice = f"{lesson} dersinde yanlış sayın yüksek. Konu tekrarı yapıp kolay test çöz."
    elif wrong_count >= 5:
        advice = f"{lesson} dersinde orta seviyede yanlışın var. Karışık soru çözmeye devam et."
    else:
        advice = f"{lesson} dersinde durum iyi görünüyor. Düzenli tekrar yap."

    return {
        "lesson": lesson,
        "wrong_count": wrong_count,
        "advice": advice,
    }


if __name__ == "__main__":
    import argparse
    import json

    parser = argparse.ArgumentParser(description="Run the generate_study_advice tool from the command line")
    parser.add_argument("--lesson", required=True, help="Lesson name")
    parser.add_argument("--wrong_count", required=True, type=int, help="Number of wrong answers")
    args = parser.parse_args()

    result = generate_study_advice(args.lesson, args.wrong_count)
    print(json.dumps(result, ensure_ascii=False))
