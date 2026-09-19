from __future__ import annotations
from dataclasses import asdict, dataclass

CATEGORIES = (
    "discovery","evidence","timeline","relationships","dna",
    "sources","coverage","tasks","recovery","observability",
)

@dataclass(frozen=True)
class Enhancement:
    id: str
    category: str
    title: str
    status: str
    public_safe: bool = True

def catalog() -> list[dict]:
    items=[]
    for n in range(1,501):
        category=CATEGORIES[(n-1)%len(CATEGORIES)]
        items.append(asdict(Enhancement(
            id=f"MOMTO-{n:04d}",
            category=category,
            title=f"{category.replace('-', ' ').title()} enhancement {n:04d}",
            status="planned",
        )))
    return items

def summary() -> dict:
    items=catalog()
    by_category={c:sum(x["category"]==c for x in items) for c in CATEGORIES}
    return {
        "program":"MomTo 500 Enhancement Wave",
        "total":len(items),
        "planned":sum(x["status"]=="planned" for x in items),
        "active":sum(x["status"]=="active" for x in items),
        "complete":sum(x["status"]=="complete" for x in items),
        "public_safe":all(x["public_safe"] for x in items),
        "categories":by_category,
        "current_wave":"wave-01",
        "next":"Implement and validate enhancements against local evidence without publishing private records.",
    }

def wave(limit: int=25) -> list[dict]:
    return catalog()[:max(1,min(limit,500))]
