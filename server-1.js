const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

//rutas
//---- Rutas Gestion Tareas
//---- ---- Post Tareas
app.get('/', async (req, res)=>{
  res.send('Bienvenido a la app')

})
const fs = require('fs').promises;
//funciones
//---- leer funciones JSON y obtener datos

async function obtenerTareas() {
  const data = await fs.readFile('tareas.json', 'utf8');
  return JSON.parse(data);
}

async function guardarTareas(tareas) {
  await fs.writeFile('tareas.json', JSON.stringify(tareas));
}

app.post('/tareas', async (req, res) =>{
    let nuevaTarea= req.body
    const {titulo, descripcion} = req.body;
    //titulo, descripcion
    var tareas = await obtenerTareas();
    tareas.push(nuevaTarea);

    await guardarTareas(tareas);

    res.status(201).send('la tarea ${titulo} fue creada con ecxsito')

});

app.put('/:id', async(req, res) =>{
  let tareaid = parseInt(req.params.id);

  let datos = req.body;

  let tareas = await obtenerTareas();

  let tareaObjetivo = tareas.findIndex((tareita) => tareita.id === tareaId);
    if(tareaObjetivo)
      res.status(401);

  tareas[tareaObjetivo] = {...tareas[tareaObjetivo], ...datosNuevos};

  await guardarTareas(tareas);
  res.json(tareas[tareaObjetivo]);
  

})
