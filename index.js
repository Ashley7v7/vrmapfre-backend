

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient, Prisma } = require('@prisma/client');
const path = require('path');
require('dotenv').config();


const app = express();
const prisma = new PrismaClient();

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://vrmapfre-frontend.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // importante para que funcione en Render
app.use(bodyParser.json());



console.log('📦 Modelos disponibles en Prisma:', Object.keys(prisma));

// 🔐 LOGIN corregido
app.post('/api/login', async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
  }

  try {
    const user = await prisma.usuario.findUnique({ where: { correo } });

    console.log('🔍 Usuario encontrado:', user);

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    res.json({
      message: 'Login exitoso',
      nombre: user.nombre,
      rol: user.rol,
      correo: user.correo
    });

  } catch (error) {
    console.error('❌ Error al guardar visitas múltiples:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('🧠 Código Prisma:', error.code);
      console.error('📌 Meta del error:', error.meta);
      res.status(500).json({ message: `Prisma error: ${error.message}`, code: error.code, meta: error.meta });
    } else {
      res.status(500).json({ message: error.message || 'Error desconocido al registrar visitas', stack: error.stack });
    }
  }

}); // 👈 ESTA LLAVE FALTABA EN TU CÓDIGO ORIGINAL




// 📋 Obtener usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// 👨‍🔧 Obtener ingenieros
app.get('/api/ingenieros', async (req, res) => {
  try {
    const ingenieros = await prisma.usuario.findMany({
      where: { rol: 'administrador' },
      select: { nombre: true }
    });
    res.json(ingenieros);
  } catch (error) {
    console.error('Error al cargar ingenieros:', error);
    res.status(500).json({ error: 'Error al cargar ingenieros' });
  }
});

// 📅 VISITAS
app.get('/api/visitas', async (req, res) => {
  try {
    const visitas = await prisma.visita.findMany({ orderBy: { id: 'desc' } });
    res.json(visitas);
  } catch (error) {
    console.error('Error al obtener visitas:', error);
    res.status(500).json({ message: 'Error al obtener visitas' });
  }
});

app.post('/api/visitas-multiples', async (req, res) => {
  try {
    const { visitas } = req.body;
    console.log('📥 Visitas recibidas:', JSON.stringify(visitas, null, 2));
    console.log('Creando visita con:', {
      usoReporte: visita.usoReporte,
      compartirCon: visita.compartirCon,
    });

    

    await Promise.all(visitas.map(async (visita) => {
      await prisma.visita.create({
        data: {
         
          usoReporte: visita.usoReporte || '',
          compartirCon: visita.compartirCon || {},

          suscriptor: visita.suscriptor,
          asegurado: visita.asegurado,
          direccion: visita.direccion,
          ciudad: visita.ciudad,
          municipio: visita.municipio,
          estado: visita.estado,
          cobertura: visita.cobertura,
          giro: visita.giro,
          fechaSolicitud: new Date(visita.fechaSolicitud),
          estatus: visita.estatus,
          latitud: visita.latitud,
          longitud: visita.longitud,
          tipoMoneda: visita.tipoMoneda,
          cp: visita.cp,
          ingeniero: visita.ingeniero || '',

          tipoNegocio: visita.tipoNegocio || '',
          tipoVisita: visita.tipoVisita || '',
          poliza: visita.poliza || '',
          vigenciaInicio: visita.vigenciaInicio ? new Date(visita.vigenciaInicio) : null,
          vigenciaTermino: visita.vigenciaTermino ? new Date(visita.vigenciaTermino) : null,

          correoSuscriptor: visita.correoSuscriptor,
          telSuscriptor: visita.telSuscriptor,
          coordinador: visita.coordinador,
          correoCoordinador: visita.correoCoordinador,
          telCoordinador: visita.telCoordinador,
          territorial: visita.territorial,
          territorialOtra: visita.territorialOtra,
          representante: visita.representante,
          correoRepresentante: visita.correoRepresentante,
          telRepresentante: visita.telRepresentante,

          contactos: {
            create: [
              {
                nombre: visita.contacto.nombreAsegurado,
                puesto: visita.contacto.puestoAsegurado,
                correo: visita.contacto.correoAsegurado,
                telefono: visita.contacto.telAsegurado,
                tipo: 'asegurado'
              },
              {
                nombre: visita.contacto.nombreAgente,
                puesto: visita.contacto.puestoAgente,
                correo: visita.contacto.correoAgente,
                telefono: visita.contacto.telAgente,
                tipo: 'agente'
              }
            ]
          },

          ubicaciones: {
            create: [
              {
                direccion: visita.direccion,
                estado: visita.estado,
                municipio: visita.municipio,
                cp: visita.cp,
                suma: visita.cobertura,
                tipoMoneda: visita.tipoMoneda,
                latitud: visita.latitud,
                longitud: visita.longitud
              }
            ]
          },


          rubrosInteres: {
            create: typeof visita.rubrosInteres === 'string'
              ? [{ descripcion: visita.rubrosInteres }]
              : Array.isArray(visita.rubrosInteres)
                ? visita.rubrosInteres.map((desc) => ({ descripcion: desc }))
                : [{ descripcion: 'Sin especificar' }]
          }


        }
      });
    }));

    res.status(200).json({ message: '✅ Visitas registradas correctamente' });

  } catch (error) {
    console.error('❌ Error al guardar visitas múltiples:', error);
    console.error('❌ Error al registrar visitas múltiples:', JSON.stringify(error, null, 2));
    res.status(500).json({
      message: error.message || 'Error al registrar visitas múltiples',
      code: error.code || null,
      meta: error.meta || null,
      stack: error.stack || null
    });

  }
});



// 🗓️ Actualizar visita con fecha
app.put('/api/visitas/:id', async (req, res) => {
  const { id } = req.params;
  const { fechaVisita, estatus, ingeniero, fechaVisitada, fechaCancelacion } = req.body;

  console.log('🧩 Datos recibidos:', {
    estatus, fechaVisitada,
    tipo: typeof fechaVisitada,
    valida: !isNaN(new Date(fechaVisitada))
  });

  try {
    const visita = await prisma.visita.update({
      where: { id: parseInt(id) },
      data: {
        fechaVisita: fechaVisita ? new Date(fechaVisita) : undefined,
        estatus: estatus || undefined,
        ingeniero: ingeniero || undefined,
        fechaCancelacion: fechaCancelacion ? new Date(fechaCancelacion) : undefined,
        fechaVisitada: fechaVisitada ? new Date(fechaVisitada) : undefined, // ✅
      }
    });
    res.json(visita);
  } catch (error) {
    console.error('❌ Error exacto al actualizar visita:', error);
    res.status(500).json({ message: 'Error al actualizar la visita' });
  }
});




// ✅ Verificar y cambiar a "Visitada"
app.put('/api/visitas/:id', async (req, res) => {
  const { id } = req.params;
  const { fechaVisita, estatus, ingeniero, fechaVisitada, fechaCancelacion } = req.body;

  console.log('🧩 Datos recibidos en PUT /api/visitas/:id:', {
    fechaVisita,
    estatus,
    ingeniero,
    fechaCancelacion,
    fechaVisitada
  });

  try {
    const visita = await prisma.visita.update({
      where: { id: parseInt(id) },
      data: {
        fechaVisita: fechaVisita ? new Date(fechaVisita) : undefined,
        estatus: estatus || undefined,
        ingeniero: ingeniero || undefined,
        fechaCancelacion: fechaCancelacion ? new Date(fechaCancelacion) : undefined,
        fechaVisitada: estatus === 'Visitada' ? new Date() : (fechaVisitada ? new Date(fechaVisitada) : undefined),
      }
    });
    res.json(visita);
  } catch (error) {
    console.error('❌ Error exacto al actualizar visita:', error);
    res.status(500).json({ message: 'Error al actualizar la visita' });
  }
});


app.put('/api/corregir-canceladas', async (req, res) => {
  try {
    const visitas = await prisma.visita.findMany({
      where: {
        estatus: 'Cancelada',
        fechaCancelacion: null
      }
    });

    const updates = await Promise.all(
      visitas.map((v) =>
        prisma.visita.update({
          where: { id: v.id },
          data: { fechaCancelacion: new Date() }
        })
      )
    );

    res.json({ message: 'Canceladas corregidas', actualizadas: updates.length });
  } catch (error) {
    console.error('Error en corrección:', error);
    res.status(500).json({ message: 'Error al corregir canceladas' });
  }
});




app.get('/api/solicitudes', async (req, res) => {
  try {
    const visitas = await prisma.visita.findMany({
      orderBy: { fechaSolicitud: 'desc' },
      include: {
        contactos: true,
        ubicaciones: true,
        rubrosInteres: true
      }
    });

    const resultado = visitas.map((v) => ({
      id: v.id,
      razonSocial: v.razonSocial || v.asegurado, // para mantener compatibilidad con visitas viejas
      monto: v.cobertura,
      moneda: v.tipoMoneda,
      giro: v.giro,
      tipoNegocio: v.tipoNegocio || 'No especificado',
      tipoVisita: v.tipoVisita || 'No especificado',
      poliza: v.poliza || 'N/A',
      vigenciaInicio: v.vigenciaInicio,
      vigenciaTermino: v.vigenciaTermino,


      tipoVisita: v.tipoVisita || 'N/A',
      fechaSolicitud: v.fechaSolicitud, // 👈 ESTA LÍNEA NUEVA

      usoReporte: v.usoReporte || 'Sin especificar',  // ✅ Agregado
      compartirCon: v.compartirCon || {},             // ✅ Agregado


      // 👇 Campos faltantes que ahora sí incluimos
      suscriptor: v.suscriptor,
      correoSuscriptor: v.correoSuscriptor,
      telSuscriptor: v.telSuscriptor,
      coordinador: v.coordinador,
      correoCoordinador: v.correoCoordinador,
      telCoordinador: v.telCoordinador,
      territorial: v.territorial,
      territorialOtra: v.territorialOtra,
      representante: v.representante,
      correoRepresentante: v.correoRepresentante,
      telRepresentante: v.telRepresentante,

      contacto: {
        nombreAsegurado: v.contactos?.find(c => c.tipo === 'asegurado')?.nombre || '',
        puestoAsegurado: v.contactos?.find(c => c.tipo === 'asegurado')?.puesto || '',
        telAsegurado: v.contactos?.find(c => c.tipo === 'asegurado')?.telefono || '',
        correoAsegurado: v.contactos?.find(c => c.tipo === 'asegurado')?.correo || '',
        nombreAgente: v.contactos?.find(c => c.tipo === 'agente')?.nombre || '',
        puestoAgente: v.contactos?.find(c => c.tipo === 'agente')?.puesto || '',
        telAgente: v.contactos?.find(c => c.tipo === 'agente')?.telefono || '',
        correoAgente: v.contactos?.find(c => c.tipo === 'agente')?.correo || '',
      },

      rubrosInteres: v.rubrosInteres.map(r => r.descripcion).join('\n'),

      ubicaciones: v.ubicaciones.map(u => ({
        direccion: u.direccion,
        estado: u.estado,
        municipio: u.municipio,
        cp: u.cp,
        suma: u.suma,
        tipoMoneda: u.tipoMoneda,
        latitud: u.latitud,
        longitud: u.longitud
      }))
    }));

    res.json(resultado);
  } catch (error) {
    console.error('Error en /api/solicitudes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});



// 🧾 Frontend
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.put('/api/verificar-visitas', async (req, res) => {
  try {
    const hoy = new Date();

    const visitas = await prisma.visita.findMany({
      where: {
        OR: [
          { estatus: 'Agendada' },
          { estatus: 'En espera' }
        ],
        fechaVisita: {
          lt: hoy
        }
      }
    });

    const updates = await Promise.all(
      visitas.map((v) => {
        if (v.estatus !== 'Cancelada') {
          return prisma.visita.update({
            where: { id: v.id },
            data: { estatus: 'Visitada' },
          });
        }
        return Promise.resolve(); // no toca canceladas
      })
    );

    res.json({ message: 'Actualización completa', actualizadas: updates.length });
  } catch (error) {
    console.error('Error al verificar visitas:', error);
    res.status(500).json({ message: 'Error al actualizar visitas' });
  }
});

app.get('/api/notificaciones', async (req, res) => {
  try {
    const hoy = new Date();
    const hace2Dias = new Date();
    hace2Dias.setDate(hoy.getDate() - 2);

    const notificaciones = await prisma.visita.findMany({
      where: {
        OR: [
          { estatus: 'En espera' },
          {
            estatus: 'Cancelada',
            fechaCancelacion: { gte: hace2Dias }
          },
          {
            estatus: 'Visitada',
            fechaVisitada: { gte: hace2Dias }
          },
          {
            estatus: 'Agendada'
          }
        ]
      },
      orderBy: {
        fechaVisita: 'asc'
      },
      select: {
        estatus: true,
        asegurado: true,
        fechaVisita: true,
        fechaCancelacion: true,
        fechaSolicitud: true,
        fechaVisitada: true,
        suscriptor: true // 👈 ¡ESTO ES LO QUE FALTABA!
      }
    });

    res.json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ message: 'Error al obtener notificaciones' });
  }
});



app.delete('/api/visitas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const visitaId = parseInt(id);

    // Elimina los contactos relacionados
    await prisma.contacto.deleteMany({ where: { visitaId } });

    // Elimina las ubicaciones relacionadas
    await prisma.ubicacion.deleteMany({ where: { visitaId } });

    // Elimina los rubros de interés relacionados
    await prisma.rubrosInteres.deleteMany({ where: { visitaId } });

    // Elimina la visita principal
    await prisma.visita.delete({
      where: { id: visitaId }
    });

    res.json({ message: '✅ Visita eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al guardar visitas múltiples:', JSON.stringify(error, null, 2));

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('🧠 Código Prisma:', error.code);
      console.error('📌 Meta del error:', error.meta);
      res.status(500).json({ message: `Prisma error: ${error.message}`, code: error.code, meta: error.meta });
    } else {
      res.status(500).json({ message: error.message || 'Error desconocido al registrar visitas' });
    }
  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
