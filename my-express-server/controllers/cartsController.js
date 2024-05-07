const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const cartsFilePath = path.join(__dirname, '../data/carrito.json');

const createCart = (req, res) => {
  const newCart = {
    id: uuidv4(),
    products: []
  };

  fs.readFile(cartsFilePath, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const carts = data ? JSON.parse(data) : [];
    carts.push(newCart);

    fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.status(201).json(newCart);
    });
  });
};

const getCartById = (req, res) => {
  const cartId = req.params.cid;

  fs.readFile(cartsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const carts = JSON.parse(data);
    const cart = carts.find((c) => c.id === cartId);

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    res.json(cart);
  });
};

const addProductToCart = (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const { quantity } = req.body;

  fs.readFile(cartsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    let carts = JSON.parse(data);
    const cart = carts.find((c) => c.id === cartId);

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const existingProduct = cart.products.find((p) => p.productId === productId);
    if (existingProduct) {
      existingProduct.quantity += quantity || 1;
    } else {
      cart.products.push({ productId, quantity: quantity || 1 });
    }

    fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.status(201).json(cart);
    });
  });
};

module.exports = {
  createCart,
  getCartById,
  addProductToCart
};
