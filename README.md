# MTG Custom Set Editor

A comprehensive web application for creating and managing custom Magic: The Gathering sets with advanced number crunching and color distribution tools.

## Features

- **Set Management**: Create, edit, and delete custom MTG sets
- **Card Creation**: Add cards with full MTG card properties (mana cost, type, text, power/toughness, colors, rarity)
- **Number Crunching**: Advanced analytics showing actual vs target color distribution
- **Color Distribution**: Customizable target distribution for all 5 colors plus colorless and multicolor
- **Visual Analytics**: Charts and graphs showing set composition and progress
- **Modern UI**: Clean, responsive interface built with React and modern CSS

## Tech Stack

### Backend
- **Flask**: Python web framework
- **SQLAlchemy**: Database ORM
- **SQLite**: Database (easily switchable to PostgreSQL/MySQL)

### Frontend
- **React**: Modern JavaScript framework
- **React Router**: Client-side routing
- **Recharts**: Data visualization
- **Lucide React**: Modern icon library
- **Axios**: HTTP client

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask server:
```bash
python app.py
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Usage

1. **Create a Set**: Start by creating a new set with your desired color distribution
2. **Add Cards**: Use the card creation interface to add cards to your set
3. **Monitor Progress**: Use the Number Crunch tab to see how your actual distribution compares to targets
4. **Adjust Settings**: Modify set settings as needed to fine-tune your distribution

## API Endpoints

### Sets
- `GET /api/sets` - Get all sets
- `POST /api/sets` - Create a new set
- `GET /api/sets/{id}` - Get a specific set with cards
- `PUT /api/sets/{id}` - Update a set
- `DELETE /api/sets/{id}` - Delete a set

### Cards
- `POST /api/sets/{id}/cards` - Create a new card in a set
- `PUT /api/cards/{id}` - Update a card
- `DELETE /api/cards/{id}` - Delete a card

### Analytics
- `GET /api/sets/{id}/number-crunch` - Get number crunch analysis for a set

## Database Schema

### CustomSet
- `id`: Primary key
- `name`: Set name
- `description`: Set description
- `total_cards`: Target total number of cards
- `white_cards`, `blue_cards`, `black_cards`, `red_cards`, `green_cards`: Target color distribution
- `colorless_cards`, `multicolor_cards`: Additional card types
- `created_at`, `updated_at`: Timestamps

### Card
- `id`: Primary key
- `name`: Card name
- `mana_cost`: Mana cost (e.g., "{2}{W}{W}")
- `type_line`: Card type (e.g., "Creature — Human Knight")
- `text`: Rules text
- `power`, `toughness`: Power and toughness for creatures
- `colors`: JSON array of colors
- `rarity`: Card rarity (common, uncommon, rare, mythic)
- `set_id`: Foreign key to CustomSet
- `created_at`: Timestamp

## Development

### Project Structure
```
mtg-card-set-editor/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── mtg_sets.db        # SQLite database (created automatically)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json       # Node dependencies
└── README.md
```

### Adding New Features

1. **Backend**: Add new routes to `backend/app.py`
2. **Frontend**: Create new components in `frontend/src/components/`
3. **Database**: Use Flask-Migrate for schema changes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
