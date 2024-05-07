const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const productsFilePath = path.join(__dirname, '../data/productos.json');

const getProducts = (req, res) => {
  fs.readFile(productsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const products = JSON.parse(data);
    res.json(products);
  });
};

const getProductById = (req, res) => {
  const productId = req.params.pid;

  fs.readFile(productsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const products = JSON.parse(data);
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  });
};

const addProduct = (req, res) => {
  const newProduct = req.body;

  // Validar campos obligatorios
  if (!newProduct.title || !newProduct.description || !newProduct.code || !newProduct.price || !newProduct.stock || !newProduct.category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  fs.readFile(productsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const products = JSON.parse(data);

    // Generar un nuevo ID usando uuidv4
    newProduct.id = uuidv4();
    newProduct.status = true; // Valor por defecto
    products.push(newProduct);

    fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.status(201).json(newProduct);
    });
  });
};

const updateProduct = (req, res) => {
  const productId = req.params.pid;
  const updatedFields = req.body;

  fs.readFile(productsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    let products = JSON.parse(data);
    const index = products.findIndex((p) => p.id === productId);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // No permitir la modificación del ID
    updatedFields.id = productId;
    products[index] = { ...products[index], ...updatedFields };

    fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.json(products[index]);
    });
  });
};

const deleteProduct = (req, res) => {
  const productId = req.params.pid;

  fs.readFile(productsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    let products = JSON.parse(data);
    const updatedProducts = products.filter((p) => p.id !== productId);

    if (updatedProducts.length === products.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    fs.writeFile(productsFilePath, JSON.stringify(updatedProducts, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.json({ message: 'Product deleted successfully' });
    });
  });
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
};
