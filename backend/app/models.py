from datetime import datetime
from flask_sqlalchemy import SQLAlchemy



db = SQLAlchemy()


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

    def __init__(
        self,
        DrawNumber,
        DrawDate,
        Number1,
        Number2,
        Number3,
        Number4,
        Number5,
        Number6,
        Bonus,
    ):
        DrawNumber = DrawNumber
        DrawDate = datetime.strptime(DrawDate, "%Y-%m-%d")
        Number1 = Number1
        Number2 = Number2
        Number3 = Number3
        Number4 = Number4
        Number5 = Number5
        Number6 = Number6
        Bonus = Bonus
        
class Lotto649(db.Model):
    __tablename__ = 'Lotto649'    
    DrawNumber = db.Column(db.Integer, primary_key=True, unique=True)
    DrawDate = db.Column(db.DateTime, nullable=False)
    Number1 = db.Column(db.Integer, nullable=False)
    Number2 = db.Column(db.Integer, nullable=False)
    Number3 = db.Column(db.Integer, nullable=False)
    Number4 = db.Column(db.Integer, nullable=False)
    Number5 = db.Column(db.Integer, nullable=False)
    Number6 = db.Column(db.Integer, nullable=False)
    Bonus = db.Column(db.Integer, nullable=False)

    def __init__(
        self,
        DrawNumber,
        DrawDate,
        Number1,
        Number2,
        Number3,
        Number4,
        Number5,
        Number6,
        Bonus,
    ):
        DrawNumber = DrawNumber
        DrawDate = datetime.strptime(DrawDate, "%Y-%m-%d")
        Number1 = Number1
        Number2 = Number2
        Number3 = Number3
        Number4 = Number4
        Number5 = Number5
        Number6 = Number6
        Bonus = Bonus


class LottoMax(db.Model):
    __tablename__ = 'LottoMax'
    DrawNumber = db.Column(db.Integer, primary_key=True, unique=True)
    DrawDate = db.Column(db.DateTime, nullable=False)
    Number1 = db.Column(db.Integer, nullable=False)
    Number2 = db.Column(db.Integer, nullable=False)
    Number3 = db.Column(db.Integer, nullable=False)
    Number4 = db.Column(db.Integer, nullable=False)
    Number5 = db.Column(db.Integer, nullable=False)
    Number6 = db.Column(db.Integer, nullable=False)
    Number7 = db.Column(db.Integer, nullable=False)
    Bonus = db.Column(db.Integer, nullable=False)

    def __init__(
        self,
        DrawNumber,
        DrawDate,
        Number1,
        Number2,
        Number3,
        Number4,
        Number5,
        Number6,
        Number7,
        Bonus,
    ):
        DrawNumber = DrawNumber
        DrawDate = datetime.strptime(DrawDate, "%Y-%m-%d")
        Number1 = Number1
        Number2 = Number2
        Number3 = Number3
        Number4 = Number4
        Number5 = Number5
        Number6 = Number6
        Number7 = Number7
        Bonus = Bonus
        
class Numbers(db.Model):
    __tablename__ = 'Numbers'
    Id = db.Column(db.String, primary_key=True, unique=True)
    Value = db.Column(db.Integer, nullable=False)
    Distance = db.Column(db.Integer, nullable=False)
    IsHit = db.Column(db.Boolean)
    NumberOfDrawsWhenHit = db.Column(db.Integer, nullable=False)
    IsBonusNumber = db.Column(db.Boolean)
    TotalHits = db.Column(db.Integer, nullable=False)
    
    LottoTypeId = db.Column(db.String, db.ForeignKey('LottoTypes.Id'), nullable=False)
    lottotype = db.relationship('LottoType')

    

    def __init__(
        self,
        Id,
        Value,
        LottoTypeId,
        Distance,
        IsHit,
        NumberOfDrawsWhenHit,
        IsBonusNumber,
        TotalHits
    ):
        self.Id = Id
        self.Value = Value
        self.LottoTypeId = LottoTypeId
        self.Distance = Distance
        self.IsHit = IsHit
        self.NumberOfDrawsWhenHit = NumberOfDrawsWhenHit
        self.IsBonusNumber = IsBonusNumber
        self.TotalHits = TotalHits
        
class LottoType(db.Model):
    __tablename__ = 'LottoTypes'

    Id = db.Column(db.String, primary_key=True, unique=True)
    LottoName = db.Column(db.String, nullable=False)
    DrawNumber = db.Column(db.Integer, nullable=False)
    DrawDate = db.Column(db.DateTime, nullable=False)
    NumberRange = db.Column(db.Integer, nullable=False)
    numbers = db.relationship('Numbers')
    
        