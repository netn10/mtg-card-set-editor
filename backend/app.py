from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json
import os

app = Flask(__name__)
CORS(app)

# Database configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f'sqlite:///{os.path.join(basedir, "mtg_sets.db")}'
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# Models
class CustomSet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Set configuration
    total_cards = db.Column(db.Integer, default=0)
    white_cards = db.Column(db.Integer, default=0)
    blue_cards = db.Column(db.Integer, default=0)
    black_cards = db.Column(db.Integer, default=0)
    red_cards = db.Column(db.Integer, default=0)
    green_cards = db.Column(db.Integer, default=0)
    colorless_cards = db.Column(db.Integer, default=0)
    multicolor_cards = db.Column(db.Integer, default=0)
    # Lands configuration
    lands_cards = db.Column(db.Integer, default=0)
    basic_lands_cards = db.Column(db.Integer, default=0)

    # Relationships
    cards = db.relationship(
        "Card", backref="custom_set", lazy=True, cascade="all, delete-orphan"
    )
    archetypes = db.relationship(
        "Archetype", backref="custom_set", lazy=True, cascade="all, delete-orphan"
    )


class Card(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    mana_cost = db.Column(db.String(50))
    type_line = db.Column(db.String(100))
    text = db.Column(db.Text)
    power = db.Column(db.String(10))
    toughness = db.Column(db.String(10))
    colors = db.Column(db.String(20))  # JSON string of colors
    rarity = db.Column(db.String(20), default="common")
    set_id = db.Column(db.Integer, db.ForeignKey("custom_set.id"), nullable=False)
    archetype_id = db.Column(db.Integer, db.ForeignKey("archetype.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Archetype(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    set_id = db.Column(db.Integer, db.ForeignKey("custom_set.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    color_pair = db.Column(db.String(10), nullable=False)  # e.g., "WU", "UB", etc.
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# Routes
@app.route("/api/sets", methods=["GET"])
def get_sets():
    sets = CustomSet.query.all()
    return jsonify(
        [
            {
                "id": s.id,
                "name": s.name,
                "description": s.description,
                "created_at": s.created_at.isoformat(),
                "updated_at": s.updated_at.isoformat(),
                "total_cards": s.total_cards,
                "white_cards": s.white_cards,
                "blue_cards": s.blue_cards,
                "black_cards": s.black_cards,
                "red_cards": s.red_cards,
                "green_cards": s.green_cards,
                "colorless_cards": s.colorless_cards,
                "multicolor_cards": s.multicolor_cards,
                "lands_cards": s.lands_cards,
                "basic_lands_cards": s.basic_lands_cards,
                "card_count": len(s.cards),
            }
            for s in sets
        ]
    )


@app.route("/api/sets", methods=["POST"])
def create_set():
    data = request.get_json()

    new_set = CustomSet(
        name=data["name"],
        description=data.get("description", ""),
        total_cards=data.get("total_cards", 0),
        white_cards=data.get("white_cards", 0),
        blue_cards=data.get("blue_cards", 0),
        black_cards=data.get("black_cards", 0),
        red_cards=data.get("red_cards", 0),
        green_cards=data.get("green_cards", 0),
        colorless_cards=data.get("colorless_cards", 0),
        multicolor_cards=data.get("multicolor_cards", 0),
        lands_cards=data.get("lands_cards", 0),
        basic_lands_cards=data.get("basic_lands_cards", 0),
    )

    db.session.add(new_set)
    db.session.commit()

    return (
        jsonify(
            {
                "id": new_set.id,
                "name": new_set.name,
                "description": new_set.description,
                "message": "Set created successfully",
            }
        ),
        201,
    )


@app.route("/api/sets/<int:set_id>", methods=["GET"])
def get_set(set_id):
    custom_set = CustomSet.query.get_or_404(set_id)
    cards = Card.query.filter_by(set_id=set_id).all()
    archetypes = Archetype.query.filter_by(set_id=set_id).all()

    return jsonify(
        {
            "id": custom_set.id,
            "name": custom_set.name,
            "description": custom_set.description,
            "created_at": custom_set.created_at.isoformat(),
            "updated_at": custom_set.updated_at.isoformat(),
            "total_cards": custom_set.total_cards,
            "white_cards": custom_set.white_cards,
            "blue_cards": custom_set.blue_cards,
            "black_cards": custom_set.black_cards,
            "red_cards": custom_set.red_cards,
            "green_cards": custom_set.green_cards,
            "colorless_cards": custom_set.colorless_cards,
            "multicolor_cards": custom_set.multicolor_cards,
            "lands_cards": custom_set.lands_cards,
            "basic_lands_cards": custom_set.basic_lands_cards,
            "archetypes": [
                {
                    "id": a.id,
                    "name": a.name,
                    "color_pair": a.color_pair,
                    "description": a.description or "",
                }
                for a in archetypes
            ],
            "cards": [
                {
                    "id": card.id,
                    "name": card.name,
                    "mana_cost": card.mana_cost,
                    "type_line": card.type_line,
                    "text": card.text,
                    "power": card.power,
                    "toughness": card.toughness,
                    "colors": json.loads(card.colors) if card.colors else [],
                    "rarity": card.rarity,
                    "archetype": (
                        (
                            lambda at: {
                                "id": at.id,
                                "name": at.name,
                                "color_pair": at.color_pair,
                            }
                        )(Archetype.query.get(card.archetype_id))
                        if card.archetype_id
                        else None
                    ),
                    "created_at": card.created_at.isoformat(),
                }
                for card in cards
            ],
        }
    )


@app.route("/api/sets/<int:set_id>", methods=["PUT"])
def update_set(set_id):
    custom_set = CustomSet.query.get_or_404(set_id)
    data = request.get_json()

    custom_set.name = data.get("name", custom_set.name)
    custom_set.description = data.get("description", custom_set.description)
    custom_set.total_cards = data.get("total_cards", custom_set.total_cards)
    custom_set.white_cards = data.get("white_cards", custom_set.white_cards)
    custom_set.blue_cards = data.get("blue_cards", custom_set.blue_cards)
    custom_set.black_cards = data.get("black_cards", custom_set.black_cards)
    custom_set.red_cards = data.get("red_cards", custom_set.red_cards)
    custom_set.green_cards = data.get("green_cards", custom_set.green_cards)
    custom_set.colorless_cards = data.get("colorless_cards", custom_set.colorless_cards)
    custom_set.multicolor_cards = data.get(
        "multicolor_cards", custom_set.multicolor_cards
    )
    custom_set.lands_cards = data.get("lands_cards", custom_set.lands_cards)
    custom_set.basic_lands_cards = data.get(
        "basic_lands_cards", custom_set.basic_lands_cards
    )

    db.session.commit()

    return jsonify({"message": "Set updated successfully"})


@app.route("/api/sets/<int:set_id>", methods=["DELETE"])
def delete_set(set_id):
    custom_set = CustomSet.query.get_or_404(set_id)
    db.session.delete(custom_set)
    db.session.commit()

    return jsonify({"message": "Set deleted successfully"})


def parse_mana_cost(mana_cost):
    """Parse mana cost to extract colors and handle hybrid mana"""
    if not mana_cost:
        return []

    colors = []
    # Extract colors from mana cost using regex
    import re

    # Look for colored mana symbols: {W}, {U}, {B}, {R}, {G}
    color_pattern = r"\{([WUBRG])\}"
    color_matches = re.findall(color_pattern, mana_cost)

    # Look for hybrid mana: {W/U}, {U/B}, {B/R}, {R/G}, {G/W}, {2/W}, etc.
    hybrid_pattern = r"\{([WUBRG])/([WUBRG2])\}"
    hybrid_matches = re.findall(hybrid_pattern, mana_cost)

    # Add regular colors
    for color in color_matches:
        color_map = {"W": "white", "U": "blue", "B": "black", "R": "red", "G": "green"}
        if color in color_map and color_map[color] not in colors:
            colors.append(color_map[color])

    # Add hybrid colors (both colors from hybrid mana)
    for color1, color2 in hybrid_matches:
        color_map = {
            "W": "white",
            "U": "blue",
            "B": "black",
            "R": "red",
            "G": "green",
            "2": None,
        }
        if (
            color1 in color_map
            and color_map[color1]
            and color_map[color1] not in colors
        ):
            colors.append(color_map[color1])
        if (
            color2 in color_map
            and color_map[color2]
            and color_map[color2] not in colors
        ):
            colors.append(color_map[color2])

    return colors


@app.route("/api/sets/<int:set_id>/cards", methods=["POST"])
def create_card(set_id):
    CustomSet.query.get_or_404(set_id)  # Verify set exists
    data = request.get_json()

    # Parse colors from mana cost if not explicitly provided
    colors = data.get("colors", [])
    if not colors and data.get("mana_cost"):
        colors = parse_mana_cost(data["mana_cost"])

    new_card = Card(
        name=data["name"],
        mana_cost=data.get("mana_cost", ""),
        type_line=data.get("type_line", ""),
        text=data.get("text", ""),
        power=data.get("power", ""),
        toughness=data.get("toughness", ""),
        colors=json.dumps(colors),
        rarity=data.get("rarity", "common"),
        set_id=set_id,
        archetype_id=data.get("archetype_id"),
    )

    db.session.add(new_card)
    db.session.commit()

    return (
        jsonify(
            {
                "id": new_card.id,
                "name": new_card.name,
                "mana_cost": new_card.mana_cost,
                "type_line": new_card.type_line,
                "text": new_card.text,
                "power": new_card.power,
                "toughness": new_card.toughness,
                "colors": json.loads(new_card.colors) if new_card.colors else [],
                "rarity": new_card.rarity,
                "message": "Card created successfully",
            }
        ),
        201,
    )


@app.route("/api/cards/<int:card_id>", methods=["PUT"])
def update_card(card_id):
    card = Card.query.get_or_404(card_id)
    data = request.get_json()

    # Parse colors from mana cost if not explicitly provided
    colors = data.get("colors", [])
    if not colors and data.get("mana_cost"):
        colors = parse_mana_cost(data["mana_cost"])
    elif not colors:
        colors = json.loads(card.colors) if card.colors else []

    card.name = data.get("name", card.name)
    card.mana_cost = data.get("mana_cost", card.mana_cost)
    card.type_line = data.get("type_line", card.type_line)
    card.text = data.get("text", card.text)
    card.power = data.get("power", card.power)
    card.toughness = data.get("toughness", card.toughness)
    card.colors = json.dumps(colors)
    card.rarity = data.get("rarity", card.rarity)
    card.archetype_id = data.get("archetype_id", card.archetype_id)

    db.session.commit()

    return jsonify({"message": "Card updated successfully"})


@app.route("/api/cards/<int:card_id>", methods=["DELETE"])
def delete_card(card_id):
    card = Card.query.get_or_404(card_id)
    db.session.delete(card)
    db.session.commit()

    return jsonify({"message": "Card deleted successfully"})


@app.route("/api/sets/<int:set_id>/number-crunch", methods=["GET"])
def get_number_crunch(set_id):
    custom_set = CustomSet.query.get_or_404(set_id)
    cards = Card.query.filter_by(set_id=set_id).all()

    # Count actual cards by color
    color_counts = {
        "white": 0,
        "blue": 0,
        "black": 0,
        "red": 0,
        "green": 0,
        "colorless": 0,
        "multicolor": 0,
    }

    rarity_counts = {"common": 0, "uncommon": 0, "rare": 0, "mythic": 0}

    for card in cards:
        colors = json.loads(card.colors) if card.colors else []

        if len(colors) == 0:
            color_counts["colorless"] += 1
        elif len(colors) == 1:
            color_counts[colors[0]] += 1
        else:
            color_counts["multicolor"] += 1

        rarity_counts[card.rarity] += 1

    # Calculate percentages
    total_cards = len(cards)
    color_percentages = {
        k: (v / total_cards * 100) if total_cards > 0 else 0
        for k, v in color_counts.items()
    }
    rarity_percentages = {
        k: (v / total_cards * 100) if total_cards > 0 else 0
        for k, v in rarity_counts.items()
    }

    return jsonify(
        {
            "set_id": set_id,
            "set_name": custom_set.name,
            "target_distribution": {
                "total_cards": custom_set.total_cards,
                "white_cards": custom_set.white_cards,
                "blue_cards": custom_set.blue_cards,
                "black_cards": custom_set.black_cards,
                "red_cards": custom_set.red_cards,
                "green_cards": custom_set.green_cards,
                "colorless_cards": custom_set.colorless_cards,
                "multicolor_cards": custom_set.multicolor_cards,
                "lands_cards": custom_set.lands_cards,
                "basic_lands_cards": custom_set.basic_lands_cards,
            },
            "actual_distribution": {
                "total_cards": total_cards,
                "white_cards": color_counts["white"],
                "blue_cards": color_counts["blue"],
                "black_cards": color_counts["black"],
                "red_cards": color_counts["red"],
                "green_cards": color_counts["green"],
                "colorless_cards": color_counts["colorless"],
                "multicolor_cards": color_counts["multicolor"],
            },
            "color_percentages": color_percentages,
            "rarity_distribution": rarity_counts,
            "rarity_percentages": rarity_percentages,
        }
    )


if __name__ == "__main__":
    with app.app_context():
        # Ensure tables exist
        db.create_all()
        # Lightweight migration: add new columns if missing
        from sqlalchemy import text

        try:
            with db.engine.connect() as conn:
                # Check existing columns on custom_set
                result = conn.execute(text("PRAGMA table_info(custom_set);"))
                existing_cols = {row[1] for row in result}
                if "lands_cards" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE custom_set ADD COLUMN lands_cards INTEGER DEFAULT 0"
                        )
                    )
                if "basic_lands_cards" not in existing_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE custom_set ADD COLUMN basic_lands_cards INTEGER DEFAULT 0"
                        )
                    )
                # Add archetype_id to card if missing
                result2 = conn.execute(text("PRAGMA table_info(card);"))
                existing_card_cols = {row[1] for row in result2}
                if "archetype_id" not in existing_card_cols:
                    conn.execute(
                        text("ALTER TABLE card ADD COLUMN archetype_id INTEGER")
                    )
        except Exception as e:
            # Log and continue; app can still run even if migration fails
            print(f"Startup migration warning: {e}")
    app.run(debug=True, port=5000)


# Archetype endpoints
@app.route("/api/sets/<int:set_id>/archetypes", methods=["GET"])
def list_archetypes(set_id):
    CustomSet.query.get_or_404(set_id)
    archetypes = Archetype.query.filter_by(set_id=set_id).all()
    return jsonify(
        [
            {
                "id": a.id,
                "name": a.name,
                "color_pair": a.color_pair,
                "description": a.description or "",
            }
            for a in archetypes
        ]
    )


@app.route("/api/sets/<int:set_id>/archetypes", methods=["POST"])
def create_archetype(set_id):
    CustomSet.query.get_or_404(set_id)
    data = request.get_json()
    new_arch = Archetype(
        set_id=set_id,
        name=data["name"],
        color_pair=data["color_pair"],
        description=data.get("description", ""),
    )
    db.session.add(new_arch)
    db.session.commit()
    return (
        jsonify(
            {
                "id": new_arch.id,
                "name": new_arch.name,
                "color_pair": new_arch.color_pair,
                "description": new_arch.description or "",
                "message": "Archetype created successfully",
            }
        ),
        201,
    )


@app.route("/api/archetypes/<int:archetype_id>", methods=["PUT"])
def update_archetype(archetype_id):
    arch = Archetype.query.get_or_404(archetype_id)
    data = request.get_json()
    arch.name = data.get("name", arch.name)
    arch.color_pair = data.get("color_pair", arch.color_pair)
    arch.description = data.get("description", arch.description)
    db.session.commit()
    return jsonify({"message": "Archetype updated successfully"})


@app.route("/api/archetypes/<int:archetype_id>", methods=["DELETE"])
def delete_archetype(archetype_id):
    arch = Archetype.query.get_or_404(archetype_id)
    db.session.delete(arch)
    db.session.commit()
    return jsonify({"message": "Archetype deleted successfully"})
