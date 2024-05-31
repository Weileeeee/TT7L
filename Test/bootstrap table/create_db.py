from test import db
from test import User, Post  # Make sure to import your models

db.create_all()

from test import db, User, Post

# Create a new user
new_user = User(username='john_doe', email='john@example.com', password='password123')
db.session.add(new_user)
db.session.commit()

# Query the user
user = User.query.filter_by(username='john_doe').first()
print(user)
