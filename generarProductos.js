// generarProductos.js
const { MongoClient } = require('mongodb');
const QRCode = require('qrcode');

const uri = 'mongodb+srv://vicfuentes:vhfv1010@capstone.taita.mongodb.net/?retryWrites=true&w=majority&appName=Capstone';
const client = new MongoClient(uri);

async function generarProductos() {
  try {
    await client.connect();
    const database = client.db('Capstone');
    const productosCollection = database.collection('productos');

    // Limpiar productos anteriores
    await productosCollection.deleteMany({});

    const productos = [
      {
        nombre: 'Producto 1',
        precio: 19990,
        descripcion: 'Descripción del producto 1',
        categoria: 'Categoría A',
        stock: 10
      },
      {
        nombre: 'Producto 2',
        precio: 29990,
        descripcion: 'Descripción del producto 2',
        categoria: 'Categoría B',
        stock: 15
      },
      {
        nombre: 'Producto 3',
        precio: 39990,
        descripcion: 'Descripción del producto 3',
        categoria: 'Categoría A',
        stock: 20
      },
      {
        nombre: 'Producto 4',
        precio: 49990,
        descripcion: 'Descripción del producto 4',
        categoria: 'Categoría C',
        stock: 8
      },
      {
        nombre: 'Producto 5',
        precio: 59990,
        descripcion: 'Descripción del producto 5',
        categoria: 'Categoría B',
        stock: 12
      }
    ];

    const resultado = await productosCollection.insertMany(productos);

    // Generar y almacenar los códigos QR
    for (const id of Object.values(resultado.insertedIds)) {
      // Genera la URL completa para el endpoint de reducción de stock
      const url = `http://localhost:3000/reducir-stock/${id}`;
      
      // Generamos el código QR como DataURL
      const codigoQR = await QRCode.toDataURL(url);
      
      // También generamos el código QR como archivo PNG
      const nombreArchivo = `qr_${id}.png`;
      await QRCode.toFile(`./public/qr/${nombreArchivo}`, url);

      // Actualizamos el documento con ambas versiones del código QR
      await productosCollection.updateOne(
        { _id: id },
        { 
          $set: { 
            codigoQR,
            qrImageUrl: `/qr/${nombreArchivo}`
          } 
        }
      );
    }

    console.log('Productos y códigos QR generados exitosamente.');
  } catch (error) {
    console.error('Error al generar los productos y códigos QR:', error);
  } finally {
    await client.close();
  }
}

generarProductos();