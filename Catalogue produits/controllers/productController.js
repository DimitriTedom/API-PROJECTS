import { promises as fs } from 'fs';
import { stringify } from 'csv/sync';
import fetch from 'node-fetch';
import { URL } from 'url';

const JSON_PATH = './database.json';
const CSV_PATH = './database.csv';

async function readProducts() {
  const data = await fs.readFile(JSON_PATH, 'utf8');
  return JSON.parse(data);
}

async function writeProducts(products) {
  await fs.writeFile(JSON_PATH, JSON.stringify(products, null, 2));
  await fs.writeFile(CSV_PATH, stringify(products, { header: true }));
}



export async function createProduct(req, res) {
  try {
    const products = await readProducts();
    const newProduct = { id: Date.now().toString(), ...req.body };
    products.push(newProduct);
    await writeProducts(products);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAllProducts(req, res) {
  try {
    const products = await readProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getProductById(req, res) {
  try {
    const products = await readProducts();
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const products = await readProducts();
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });
    
    const updatedProduct = { ...products[index], ...req.body };
    products[index] = updatedProduct;
    await writeProducts(products);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const products = await readProducts();
    const filteredProducts = products.filter(p => p.id !== req.params.id);
    
    if (products.length === filteredProducts.length) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await writeProducts(filteredProducts);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getProductsWithPromos(req, res) {
  try {
    //  Récupérer les produits
    const products = await readProducts();
    
    // Construire l'URL des promotions avec query params
    const promoUrl = new URL('https://api.promotions.com/promos');
    Object.entries(req.query).forEach(([key, value]) => {
      promoUrl.searchParams.append(key, value);
    });
    
    // l'appel externe
    const response = await fetch(promoUrl.toString());
    if (!response.ok) throw new Error('Failed to fetch promotions');
    const promos = await response.json();
    
    //  Fusionner les données
    const productsWithPromos = products.map(product => {
      const productPromo = promos.find(promo => promo.productId === product.id) || {};
      return { ...product, promo: productPromo.discount || 0 };
    });
    
    res.json(productsWithPromos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}