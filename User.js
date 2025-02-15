const mongoose = require('mongoose');

// Definición del esquema de usuario
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Crear el modelo de usuario
const User = mongoose.model('User ', userSchema); 

// Exportar el modelo de usuario
module.exports = User;