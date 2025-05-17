from flask import Flask, request, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')

# MongoDB Atlas connection
try:
    # Get MongoDB Atlas connection string from environment variable
    mongo_uri = os.getenv('MONGODB_URI')
    if not mongo_uri:
        raise ValueError("MONGODB_URI environment variable is not set")
    
    client = MongoClient(mongo_uri)
    db = client['greengrow']
    users = db['users']
    # Create unique index on email
    users.create_index('email', unique=True)
    print("Successfully connected to MongoDB Atlas!")
except Exception as e:
    print(f"Error connecting to MongoDB Atlas: {e}")

@app.route('/test-db')
def test_db():
    try:
        # Try to insert and then delete a test document
        test_doc = {'test': 'connection'}
        result = users.insert_one(test_doc)
        users.delete_one({'_id': result.inserted_id})
        return jsonify({'success': True, 'message': 'Database connection successful!'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Database connection failed: {str(e)}'})

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.form
        
        # Check if email already exists
        if users.find_one({'email': data['email']}):
            return jsonify({'success': False, 'message': 'Email already registered!'})
        
        # Create user document
        user = {
            'full_name': data['fullName'],
            'email': data['email'],
            'phone': data['phone'],
            'address': data['address'],
            'city': data['city'],
            'state': data['state'],
            'postcode': data['postcode'],
            'password': generate_password_hash(data['password'])
        }
        
        # Insert user into database
        users.insert_one(user)
        
        return jsonify({'success': True, 'message': 'Registration successful!'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.form
        email = data['email']
        password = data['password']
        
        # Find user by email
        user = users.find_one({'email': email})
        
        if user and check_password_hash(user['password'], password):
            return jsonify({'success': True, 'message': 'Login successful!'})
        else:
            return jsonify({'success': False, 'message': 'No Email Account Registered Under This Email'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)