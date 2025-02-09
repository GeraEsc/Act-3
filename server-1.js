const express = require('express');
const app = express();
const PORT = 3000;
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware
app.use(express.json());

// Funciones para manejar tareas
async function obtenerTareas() {
  try {
    const data = await fs.readFile('tareas.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function guardarTareas(tareas) {
  try {
    await fs.writeFile('tareas.json', JSON.stringify(tareas, null, 2));
  } catch (error) {
    console.error(error);
  }
}

// Funciones de autenticación
const SECRET_KEY = 'mysecretkey'; // Esto debería estar en variables de entorno en producción

async function registrarUsuario(req, res) {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    res.status(201).send('Usuario registrado');
  } catch (error) {
    res.status(500).send('Error en el registro');
  }
}

async function loginUsuario(req, res) {
  console.log("Solicitud de login recibida");
  try {
    const { username, password } = req.body;
    
    const user = { username }; 
    const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).send('Error en el inicio de sesión');
  }
}

function verificarToken(req, res, next) {
  const token = req.header('Authorization');
  console.log("Token recibido:", token); // Imprime el token recibido

  if (!token) return res.status(401).send('Acceso denegado');

  //remover "Bearer " antes de verificarlo
  const tokenLimpio = token.replace("Bearer ", "");

  jwt.verify(tokenLimpio, SECRET_KEY, (err, user) => {
    if (err) {
      console.error("Error al verificar el token:", err); // Muestra detalles del error
      return res.status(403).send('Token no válido');
    }
    req.user = user;
    next();
  });
}



// Rutas
// --- Ruta para obtener todas las tareas
app.get('/tareas', verificarToken, async (req, res) => {
  const tareas = await obtenerTareas();
  res.json(tareas);
});

// --- Ruta para crear una nueva tarea
app.post('/tareas', verificarToken, async (req, res) => {
  const nuevaTarea = req.body;
  const { titulo, descripcion } = req.body;

  let tareas = await obtenerTareas();
  const idNuevo = tareas.length ? Math.max(...tareas.map(tarea => tarea.id)) + 1 : 1; // Crear un ID único
  nuevaTarea.id = idNuevo; // Asignar el ID a la nueva tarea

  tareas.push(nuevaTarea);

  await guardarTareas(tareas);
  res.status(201).send(`La tarea "${titulo}" fue creada con éxito`);
});

// --- Ruta para actualizar una tarea
app.put('/tareas/:id', verificarToken, async (req, res) => {
  const tareaId = parseInt(req.params.id);
  const datos = req.body;

  let tareas = await obtenerTareas();
  const tareaObjetivo = tareas.findIndex(tarea => tarea.id === tareaId);

  if (tareaObjetivo === -1) return res.status(404).send('Tarea no encontrada');

  tareas[tareaObjetivo] = { ...tareas[tareaObjetivo], ...datos };

  await guardarTareas(tareas);
  res.json(tareas[tareaObjetivo]);
});

// --- Ruta para eliminar una tarea
app.delete('/tareas/:id', verificarToken, async (req, res) => {
  const tareaId = parseInt(req.params.id);

  let tareas = await obtenerTareas();
  const tareaObjetivo = tareas.findIndex(tarea => tarea.id === tareaId);

  if (tareaObjetivo === -1) return res.status(404).send('Tarea no encontrada');

  tareas.splice(tareaObjetivo, 1);
  await guardarTareas(tareas);
  res.status(200).send('Tarea eliminada con éxito');
});

// --- Ruta para el registro de usuarios
app.post('/register', registrarUsuario);

// --- Ruta para el login
app.post('/login', loginUsuario);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de tareas');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});