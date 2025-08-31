import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connection_db_pg } from './connection.js';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura';

// Middleware
app.use(cors());
app.use(express.json());

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        req.user = user;
        next();
    });
};

// ==================== ENDPOINTS DE AUTENTICACIÓN ====================

// Registro de usuario
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Validaciones
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        if (password.length < 4) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await connection_db_pg.query(
            'SELECT id FROM usuarios WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'El usuario ya existe' });
        }

        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insertar usuario
        const result = await connection_db_pg.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email',
            [nombre, email, hashedPassword]
        );

        const user = result.rows[0];

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: { id: user.id, nombre: user.nombre, email: user.email }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Login de usuario
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        // Buscar usuario
        const result = await connection_db_pg.query(
            'SELECT id, nombre, email, password FROM usuarios WHERE email = $1 AND activo = true',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: { id: user.id, nombre: user.nombre, email: user.email }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== ENDPOINTS DE CIUDADES ====================

// Obtener todas las ciudades
app.get('/api/ciudades', async (req, res) => {
    try {
        const result = await connection_db_pg.query(
            'SELECT id, nombre, descripcion, imagen_url FROM ciudades WHERE activa = true ORDER BY nombre'
        );

        res.json({
            ciudades: result.rows
        });

    } catch (error) {
        console.error('Error obteniendo ciudades:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener ciudad por ID
app.get('/api/ciudades/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await connection_db_pg.query(
            'SELECT id, nombre, descripcion, imagen_url FROM ciudades WHERE id = $1 AND activa = true',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ciudad no encontrada' });
        }

        res.json({
            ciudad: result.rows[0]
        });

    } catch (error) {
        console.error('Error obteniendo ciudad:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== ENDPOINTS DE OFERTAS ====================

// Buscar ofertas
app.get('/api/ofertas/buscar', async (req, res) => {
    try {
        const { ciudad, fecha, hora } = req.query;

        let query = `
            SELECT o.id, o.titulo, o.descripcion, o.precio, o.fecha_disponible, 
                   o.hora_disponible, o.cupos_disponibles, c.nombre as ciudad_nombre
            FROM ofertas o 
            JOIN ciudades c ON o.ciudad_id = c.id 
            WHERE o.activa = true AND c.activa = true
        `;
        const params = [];
        let paramCount = 0;

        if (ciudad) {
            paramCount++;
            query += ` AND LOWER(c.nombre) LIKE LOWER($${paramCount})`;
            params.push(`%${ciudad}%`);
        }

        if (fecha) {
            paramCount++;
            query += ` AND o.fecha_disponible = $${paramCount}`;
            params.push(fecha);
        }

        if (hora) {
            paramCount++;
            query += ` AND o.hora_disponible = $${paramCount}`;
            params.push(hora);
        }

        query += ' ORDER BY o.fecha_disponible, o.hora_disponible';

        const result = await connection_db_pg.query(query, params);

        res.json({
            ofertas: result.rows
        });

    } catch (error) {
        console.error('Error buscando ofertas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener todas las ofertas
app.get('/api/ofertas', async (req, res) => {
    try {
        const result = await connection_db_pg.query(`
            SELECT o.id, o.titulo, o.descripcion, o.precio, o.fecha_disponible, 
                   o.hora_disponible, o.cupos_disponibles, c.nombre as ciudad_nombre
            FROM ofertas o 
            JOIN ciudades c ON o.ciudad_id = c.id 
            WHERE o.activa = true AND c.activa = true
            ORDER BY o.fecha_disponible, o.hora_disponible
        `);

        res.json({
            ofertas: result.rows
        });

    } catch (error) {
        console.error('Error obteniendo ofertas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener oferta por ID
app.get('/api/ofertas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await connection_db_pg.query(`
            SELECT o.id, o.titulo, o.descripcion, o.precio, o.fecha_disponible, 
                   o.hora_disponible, o.cupos_disponibles, c.nombre as ciudad_nombre, c.id as ciudad_id
            FROM ofertas o 
            JOIN ciudades c ON o.ciudad_id = c.id 
            WHERE o.id = $1 AND o.activa = true AND c.activa = true
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Oferta no encontrada' });
        }

        res.json({
            oferta: result.rows[0]
        });

    } catch (error) {
        console.error('Error obteniendo oferta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== ENDPOINTS DE RESERVAS ====================

// Crear reserva (requiere autenticación)
app.post('/api/reservas', authenticateToken, async (req, res) => {
    try {
        const { oferta_id, cantidad_personas = 1 } = req.body;
        const usuario_id = req.user.userId;

        if (!oferta_id) {
            return res.status(400).json({ error: 'ID de oferta requerido' });
        }

        // Verificar que la oferta existe y tiene cupos
        const ofertaResult = await connection_db_pg.query(
            'SELECT id, precio, cupos_disponibles FROM ofertas WHERE id = $1 AND activa = true',
            [oferta_id]
        );

        if (ofertaResult.rows.length === 0) {
            return res.status(404).json({ error: 'Oferta no encontrada' });
        }

        const oferta = ofertaResult.rows[0];

        if (oferta.cupos_disponibles < cantidad_personas) {
            return res.status(400).json({ error: 'No hay suficientes cupos disponibles' });
        }

        const total = oferta.precio * cantidad_personas;

        // Iniciar transacción
        await connection_db_pg.query('BEGIN');

        try {
            // Crear la reserva
            const reservaResult = await connection_db_pg.query(
                'INSERT INTO reservas (usuario_id, oferta_id, cantidad_personas, total) VALUES ($1, $2, $3, $4) RETURNING *',
                [usuario_id, oferta_id, cantidad_personas, total]
            );

            // Actualizar cupos disponibles
            await connection_db_pg.query(
                'UPDATE ofertas SET cupos_disponibles = cupos_disponibles - $1 WHERE id = $2',
                [cantidad_personas, oferta_id]
            );

            await connection_db_pg.query('COMMIT');

            res.status(201).json({
                message: 'Reserva creada exitosamente',
                reserva: reservaResult.rows[0]
            });

        } catch (error) {
            await connection_db_pg.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error creando reserva:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener reservas del usuario (requiere autenticación)
app.get('/api/reservas', authenticateToken, async (req, res) => {
    try {
        const usuario_id = req.user.userId;

        const result = await connection_db_pg.query(`
            SELECT r.id, r.fecha_reserva, r.estado, r.cantidad_personas, r.total,
                   o.titulo, o.descripcion, o.fecha_disponible, o.hora_disponible,
                   c.nombre as ciudad_nombre
            FROM reservas r
            JOIN ofertas o ON r.oferta_id = o.id
            JOIN ciudades c ON o.ciudad_id = c.id
            WHERE r.usuario_id = $1
            ORDER BY r.fecha_reserva DESC
        `, [usuario_id]);

        res.json({
            reservas: result.rows
        });

    } catch (error) {
        console.error('Error obteniendo reservas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== ENDPOINT DE PRUEBA ====================

app.get('/api/health', (req, res) => {
    res.json({ message: 'Servidor MoviTour funcionando correctamente', timestamp: new Date() });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📚 Documentación de API disponible en http://localhost:${PORT}/api/health`);
});

// Endpoint para enviar problemas o consultas
app.post('/api/soporte', async (req, res) => {
    const { nombre, email, mensaje } = req.body;
  
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
  
    // Aquí podrías guardar el mensaje en la base de datos o enviarlo por correo electrónico
    // Por simplicidad, solo lo registraremos en la consola
    console.log(`Nuevo mensaje de soporte:
    Nombre: ${nombre}
    Email: ${email}
    Mensaje: ${mensaje}`);
  
    return res.status(200).json({ message: 'Tu mensaje ha sido enviado con éxito. Nos pondremos en contacto contigo pronto.' });
  });

  

// Configuración del transportador de Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Cambia esto si usas otro servicio de correo
  port: 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER, // Tu correo electrónico
    pass: process.env.EMAIL_PASS, // Tu contraseña de correo
  },
});

// Endpoint para enviar problemas o consultas
app.post('/api/soporte', async (req, res) => {
  const { nombre, email, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  // Configuración del correo
  const mailOptions = {
    from: email, 
    to: process.env.EMAIL_USER, 
    subject: `Nuevo mensaje de soporte de ${nombre}`,
    text: `Nombre: ${nombre}\nEmail: ${email}\nMensaje: ${mensaje}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Tu mensaje ha sido enviado con éxito. Nos pondremos en contacto contigo pronto.' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return res.status(500).json({ error: 'Error al enviar el mensaje. Inténtalo de nuevo más tarde.' });
  }
});

  

export default app;