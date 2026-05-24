"""Map Vercel / legacy env names to canonical app variables."""
import os


def _set_if_missing(canonical: str, *aliases: str) -> None:
    if os.environ.get(canonical):
        return
    for key in aliases:
        val = os.environ.get(key)
        if val:
            os.environ[canonical] = val
            return


def apply_env_aliases() -> None:
    _set_if_missing("MONGO_URL", "MONGODB_URI")
    _set_if_missing("STRIPE_API_KEY", "STRIPE_SECRET_KEY")
    _set_if_missing(
        "STRIPE_PUBLISHABLE_KEY",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
        "VITE_STRIPE_PUBLISHABLE_KEY",
    )
    if not os.environ.get("DB_NAME"):
        os.environ["DB_NAME"] = "cvpm"
