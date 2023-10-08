const express = require('express');
const app = express();
require('dotenv').config();
const fs = require('fs');

//se cargan las materias
const dataTecnico = fs.readFileSync('materias_tecnico.json','utf8');
const materiasTecnico = JSON.parse(dataTecnico);

const dataIngenieria = fs.readFileSync('materias_inge.json','utf8');
const materiasIngenieria = JSON.parse(dataIngenieria);


app.use(express.json());

//--> pensum tecnico <--

app.get('/api/materias/tec', (req, res) => {
    try {
      const data = fs.readFileSync('materias_tecnico.json', 'utf8');
      const materias = JSON.parse(data).materias;
      res.json(materias);
    } catch (error) {
      console.error('Error al leer el archivo JSON:', error);
      res.status(500).json({ error: 'Error al leer el archivo JSON.' });
    }
  });

  //--> Pensum ingenieria <--

  app.get('/api/materias/inge', (req, res) => {
    try {
      const data = fs.readFileSync('materias_inge.json', 'utf8');
      const materias = JSON.parse(data).materias;
      res.json(materias);
    } catch (error) {
      console.error('Error al leer el archivo JSON:', error);
      res.status(500).json({ error: 'Error al leer el archivo JSON.' });
    }
  });

  //--> materia por código Tecnico <--
app.get('/api/materias/tec/:codigo', (req, res) => {
    const codigoMateria = req.params.codigo;
    try {
      const data = fs.readFileSync('materias_tecnico.json', 'utf8');
      const materias = JSON.parse(data).materias;
      const materiaEncontrada = materias.find(materia => materia.codigo === codigoMateria);
  
      if (materiaEncontrada) {
        res.json(materiaEncontrada);
      } else {
        res.status(404).json({ error: 'Materia no encontrada.' });
      }
    } catch (error) {
      console.error('Error al leer el archivo JSON:', error);
      res.status(500).json({ error: 'Error al leer el archivo JSON.' });
    }
  });

  //--> Materias por ciclo Tecnico <--
  app.get('/api/materias/tec/ciclo/:numeroCiclo', (req, res) => {
    const numeroCiclo = parseInt(req.params.numeroCiclo);
  
    // Leer el archivo JSON de materias
    try {
      const data = fs.readFileSync('materias_tecnico.json', 'utf8');
      const materiasData = JSON.parse(data).materias;
  
      // Filtrar las materias por el ciclo
      const materiasFiltradas = materiasData.filter(materia => materia.ciclo === numeroCiclo);
  
      if (materiasFiltradas.length === 0) {
        res.status(404).json({ error: 'No se encontraron materias para el ciclo especificado.' });
      } else {
        //mostrar las materias filtradas
        res.json(materiasFiltradas);
      }
    } catch (error) {
      console.error('Error al leer el archivo JSON de materias:', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  });


  // --> Materia por código Inge <--

  app.get('/api/materias/inge/:codigo', (req, res) => {
    const codigoMateria = req.params.codigo;
    try {
      const data = fs.readFileSync('materias_inge.json', 'utf8');
      const materias = JSON.parse(data).materias;
      const materiaEncontrada = materias.find(materia => materia.codigo === codigoMateria);
  
      if (materiaEncontrada) {
        res.json(materiaEncontrada);
      } else {
        res.status(404).json({ error: 'Materia no encontrada.' });
      }
    } catch (error) {
      console.error('Error al leer el archivo JSON:', error);
      res.status(500).json({ error: 'Error al leer el archivo JSON.' });
    }
  });

    //--> Materias por ciclo Inge <--
  app.get('/api/materias/inge/ciclo/:numeroCiclo', (req, res) => {
    const numeroCiclo = parseInt(req.params.numeroCiclo);
  
    // Leer el archivo JSON de materias
    try {
      const data = fs.readFileSync('materias_inge.json', 'utf8');
      const materiasData = JSON.parse(data).materias;
  
      // Filtrar las materias por el ciclo
      const materiasFiltradas = materiasData.filter(materia => materia.ciclo === numeroCiclo);
  
      if (materiasFiltradas.length === 0) {
        res.status(404).json({ error: 'No se encontraron materias para el ciclo especificado.' });
      } else {
        //mostrar las materias filtradas
        res.json(materiasFiltradas);
      }
    } catch (error) {
      console.error('Error al leer el archivo JSON de materias:', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  });
  


//--> inscripcion tecnico <--
app.post('/api/alumnos/tec/:carnet/inscribir-materia/:codigo', (req, res) => {
    const carnet = req.params.carnet;
    const codigoMateria = req.params.codigo;

    //Buscar al estudiante por su número de carnet
    const data = fs.readFileSync('alumnos_tec.json','utf8');
    const estudiantesData = JSON.parse(data);
    const estudiantes = estudiantesData.alumnos;

    const estudiante = estudiantes.find(est => est.carnet === carnet);

    if (!estudiante) {
        return res.status(404).json({ error: 'Estudiante no encontrado.' });
    }

    //Verificar si el estudiante tiene suficientes unidades valorativas
    if (estudiante.UV < 4) {
        return res.status(400).json({ error: 'No tienes suficientes unidades valorativas para inscribir esta materia.' });
    }

    //Verificar si la materia con el código existe en el pensum técnico.
    const pensumTecnicoData = fs.readFileSync('materias_tecnico.json','utf8');
    const pensumTecnico = JSON.parse(pensumTecnicoData).materias;

    const materiaEncontrada = pensumTecnico.find(materia => materia.codigo === codigoMateria);

    if (!materiaEncontrada) {
        return res.status(404).json({ error: 'Materia no encontrada en el pensum técnico.' });
    }

    //Verificar si el estudiante ya ha inscrito esta materia previamente.
    if (estudiante.materias_inscritas.includes(codigoMateria)) {
        return res.status(400).json({ error: 'Ya has inscrito esta materia previamente.' });
    }

    //Realizar las acciones de inscripción.
    estudiante.materias_inscritas.push(codigoMateria);
    estudiante.UV -= 4;

    //Guardar los datos actualizados del estudiante en el archivo JSON o estructura de datos.
    fs.writeFileSync('alumnos_tec.json', JSON.stringify(estudiantesData, null, 2));
    res.json({ mensaje: 'Materia inscrita exitosamente.' });
});



//--> inscripcion ingenieria <--
app.post('/api/alumnos/inge/:carnet/inscribir-materia/:codigo', (req, res) => {
    const carnet = req.params.carnet;
    const codigoMateria = req.params.codigo;

    //Buscar al estudiante por su número de carnet
    const data = fs.readFileSync('alumnos.json','utf8');
    const estudiantesData = JSON.parse(data);
    const estudiantes = estudiantesData.alumnos;

    const estudiante = estudiantes.find(est => est.carnet === carnet);

    if (!estudiante) {
        return res.status(404).json({ error: 'Estudiante no encontrado.' });
    }

    //Verificar si el estudiante tiene suficientes unidades valorativas
    if (estudiante.UV < 4) {
        return res.status(400).json({ error: 'No tienes suficientes unidades valorativas para inscribir esta materia.' });
    }

    //Verificar si la materia con el código existe en el pensum técnico.
    const pensumTecnicoData = fs.readFileSync('materias_inge.json','utf8');
    const pensumTecnico = JSON.parse(pensumTecnicoData).materias;

    const materiaEncontrada = pensumTecnico.find(materia => materia.codigo === codigoMateria);

    if (!materiaEncontrada) {
        return res.status(404).json({ error: 'Materia no encontrada en el pensum de ingenieria.' });
    }

    //Verificar si el estudiante ya ha inscrito esta materia previamente.
    if (estudiante.materias_inscritas.includes(codigoMateria)) {
        return res.status(400).json({ error: 'Ya has inscrito esta materia previamente.' });
    }

    //Realizar las acciones de inscripción.
    estudiante.materias_inscritas.push(codigoMateria);
    estudiante.UV -= 4;

    //Guardar los datos actualizados del estudiante en el archivo JSON o estructura de datos.
    fs.writeFileSync('alumnos.json', JSON.stringify(estudiantesData, null, 2));
    res.json({ mensaje: 'Materia inscrita exitosamente.' });
});


//--> Consulta del perfil del estudiante Tecnico<--

app.get('/api/alumnos/tec/:carnet', (req, res) => {
    const carnet = req.params.carnet;

    //Se lee el archivo JSON de alumnos
    try {
        const data = fs.readFileSync('alumnos_tec.json','utf-8');
        const estudiantesData = JSON.parse(data);
        const estudiantes = estudiantesData.alumnos;

        //Se busca el estudiante por el Carnet
        const estudiante = estudiantes.find(est => est.carnet === carnet);

        if (!estudiante) {
            res.status(404).json({ error: 'Estudiante no encotrado.' });
        } else {
            res.json(estudiante);
        }
    } catch (error) {
        console.error(500).json({ error: 'Error al leer el archivo JSON de alumnos.' });
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});



//--> Consulta del perfil del estudiante Ingenieria<--

app.get('/api/alumnos/inge/:carnet', (req, res) => {
  const carnet = req.params.carnet;

  //Se lee el archivo JSON de alumnos
  try {
      const data = fs.readFileSync('alumnos.json','utf-8');
      const estudiantesData = JSON.parse(data);
      const estudiantes = estudiantesData.alumnos;

      //Se busca el estudiante por el Carnet
      const estudiante = estudiantes.find(est => est.carnet === carnet);

      if (!estudiante) {
          res.status(404).json({ error: 'Estudiante no encotrado.' });
      } else {
          res.json(estudiante);
      }
  } catch (error) {
      console.error(500).json({ error: 'Error al leer el archivo JSON de alumnos.' });
      res.status(500).json({ error: 'Error interno del servidor.' });
  }
});






//--> Retirar materias Tecnico <--

app.delete('/api/alumnos/tec/:carnet/retirar-materia/:codigo', (req, res) => {
  const carnet = req.params.carnet;
  const codigoMateria = req.params.codigo;

  // 1. Buscar al estudiante por su número de carnet en una estructura de datos o archivo JSON.
  try {
    const data = fs.readFileSync('alumnos_tec.json', 'utf8');
    const estudiantesData = JSON.parse(data);
    const estudiantes = estudiantesData.alumnos;
    const estudiante = estudiantes.find(est => est.carnet === carnet);

    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado.' });
    }

    // 2. Verificar si el estudiante tiene inscrita la materia que desea retirar.
    const materiaIndex = estudiante.materias_inscritas.indexOf(codigoMateria);
    if (materiaIndex === -1) {
      return res.status(400).json({ error: 'El estudiante no tiene inscrita esta materia.' });
    }

    // 3. Realizar el retiro de la materia y actualizar las unidades valorativas.
    estudiante.materias_inscritas.splice(materiaIndex, 1); // Eliminar la materia de la lista de inscritas
    estudiante.UV += 4; // Incrementar las unidades valorativas

    // 4. Guardar los datos actualizados del estudiante en el archivo JSON o estructura de datos.
    fs.writeFileSync('alumnos_tec.json', JSON.stringify(estudiantesData, null, 2));

    res.json({ mensaje: 'Materia retirada exitosamente.' });
  } catch (error) {
    console.error('Error al leer o escribir el archivo JSON de estudiantes:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});




//--> Retirar materias Ingenieria <--

app.delete('/api/alumnos/inge/:carnet/retirar-materia/:codigo', (req, res) => {
  const carnet = req.params.carnet;
  const codigoMateria = req.params.codigo;

  // 1. Buscar al estudiante por su número de carnet en una estructura de datos o archivo JSON.
  try {
    const data = fs.readFileSync('alumnos.json', 'utf8');
    const estudiantesData = JSON.parse(data);
    const estudiantes = estudiantesData.alumnos;
    const estudiante = estudiantes.find(est => est.carnet === carnet);

    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado.' });
    }

    // 2. Verificar si el estudiante tiene inscrita la materia que desea retirar.
    const materiaIndex = estudiante.materias_inscritas.indexOf(codigoMateria);
    if (materiaIndex === -1) {
      return res.status(400).json({ error: 'El estudiante no tiene inscrita esta materia.' });
    }

    // 3. Realizar el retiro de la materia y actualizar las unidades valorativas.
    estudiante.materias_inscritas.splice(materiaIndex, 1); // Eliminar la materia de la lista de inscritas
    estudiante.UV += 4; // Incrementar las unidades valorativas

    // 4. Guardar los datos actualizados del estudiante en el archivo JSON o estructura de datos.
    fs.writeFileSync('alumnos.json', JSON.stringify(estudiantesData, null, 2));

    res.json({ mensaje: 'Materia retirada exitosamente.' });
  } catch (error) {
    console.error('Error al leer o escribir el archivo JSON de estudiantes:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});



//--> Puerto asignado <--
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor Express escuchando en el puerto ${port}`);
});


