db = db.getSiblingDB('dndevops'); // Switch to 'my-db' (create if not exists)
db.createCollection('dummy'); // Create a dummy collection (this will create the data