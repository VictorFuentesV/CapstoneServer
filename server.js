const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

const uri = 'mongodb+srv://vicfuentes:vhfv1010@capstone.taita.mongodb.net/?retryWrites=true&w=majority&appName=Capstone';
const client = new MongoClient(uri);

// Middleware para servir archivos estáticos
app.use(express.static('public'));

// Endpoint para reducir el stock
app.get('/reducir-stock/:id', async (req, res) => {
  try {
    await client.connect();
    const database = client.db('Capstone');
    const productosCollection = database.collection('productos');

    const productoId = new ObjectId(req.params.id);
    
    // Buscar el producto y verificar stock
    const producto = await productosCollection.findOne({ _id: productoId });
    
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    if (producto.stock <= 0) {
      return res.status(400).json({ mensaje: 'No hay stock disponible' });
    }

    // Reducir el stock en 1
    const resultado = await productosCollection.updateOne(
      { _id: productoId },
      { $inc: { stock: -1 } }
    );

    if (resultado.modifiedCount === 1) {
      // Enviar una página HTML con la confirmación
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Stock Reducido</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                text-align: center;
              }
              .success {
                color: #28a745;
                font-size: 24px;
                margin: 20px 0;
              }
              .details {
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="success">¡Stock reducido exitosamente!</div>
            <div class="details">
              <p>Producto: ${producto.nombre}</p>
              <p>Nuevo stock disponible: ${producto.stock - 1}</p>
            </div>
          </body>
        </html>
      `);
    } else {
      res.status(500).json({ mensaje: 'Error al actualizar el stock' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});