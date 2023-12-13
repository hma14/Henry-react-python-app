from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # Import the CORS module
from config import Config

app = Flask(__name__)

app.config.from_object(Config)

CORS(app)  # Enable CORS for all routes
#app.config['SQLALCHEMY_DATABASE_URI'] = Config.SQLALCHEMY_DATABASE_URI
db = SQLAlchemy(app)

class BC49(db.Model):
    __tablename__ = 'BC49'
    DrawNumber = db.Column(db.Integer, primary_key=True, unique=True)
    DrawDate = db.Column(db.DateTime, nullable=False)
    Number1 = db.Column(db.Integer, nullable=False)
    Number2 = db.Column(db.Integer, nullable=False)
    Number3 = db.Column(db.Integer, nullable=False)
    Number4 = db.Column(db.Integer, nullable=False)
    Number5 = db.Column(db.Integer, nullable=False)
    Number6 = db.Column(db.Integer, nullable=False)
    Bonus = db.Column(db.Integer, nullable=False)
    
    
    def __init__(self, DrawNumber, DrawDate, Number1, Number2, Number3, Number4, Number5, Number6, Bonus):
        self.DrawNumber = DrawNumber
        self.DrawDate = datetime.strptime(DrawDate, "%Y-%m-%d %H:%M:%S")
        self.Number1 = Number1
        self.Number2 = Number2
        self.Number3 = Number3
        self.Number4 = Number4
        self.Number5 = Number5
        self.Number6 = Number6
        self.Bonus = Bonus

@app.route('/api/data', methods=['GET'])
def get_data():
    data = BC49.query.all()
    
    if data:
        # Convert data to a JSON format that suits your needs
        result = [{'DrawNumber': entry.DrawNumber, 'DrawDate': entry.DrawDate.strftime("%Y-%m-%d"),
                'Number1': entry.Number1, 'Number2': entry.Number2, 'Number3': entry.Number3,
                'Number4': entry.Number4, 'Number5': entry.Number5, 'Number6': entry.Number6,
                'Bonus': entry.Bonus} for entry in data]

        # Sort 'Number1' through 'Number6' within each dictionary in 'result'
        for entry in result:
            entry.update(
                {
                    key: value
                    for key, value in sorted(entry.items(), key=lambda x: int(x[0].split('Number')[1]) if 'Number' in x[0] and x[0].split('Number')[1].isdigit() else float('inf'))
                }
            )

        sorted_object_list = sorted(result, key=lambda x: x["DrawNumber"], reverse=True)

        return jsonify({'data': sorted_object_list})
    else:
        return jsonify({'message': 'No data found'})

if __name__ == '__main__':
    app.run(debug=True)
