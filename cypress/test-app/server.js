/**
 * ============================================================================
 * CYPRESS TEST APPLICATION - Self-Contained Test Server
 * ============================================================================
 * 
 * PURPOSE:
 * This Express.js application provides a complete, self-contained environment
 * for demonstrating ALL Cypress.io testing capabilities. It eliminates 
 * dependency on third-party test websites.
 * 
 * ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                         CYPRESS TEST APPLICATION                        │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
 * │  │   Static    │  │    API      │  │   Auth      │  │   File      │    │
 * │  │   Pages     │  │  Endpoints  │  │  Handlers   │  │  Uploads    │    │
 * │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
 * │         │                │                │                │           │
 * │         └────────────────┴────────────────┴────────────────┘           │
 * │                                   │                                     │
 * │                          ┌────────▼────────┐                           │
 * │                          │  Express Server │                           │
 * │                          │   Port: 3000    │                           │
 * │                          └─────────────────┘                           │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * CAPABILITIES DEMONSTRATED:
 * - Static HTML pages for UI testing
 * - REST API endpoints for cy.intercept() and cy.request()
 * - Authentication flows for login/logout testing
 * - File upload/download endpoints
 * - Cookie and session management
 * - Form handling with validation
 * - Dialog triggers (alert, confirm, prompt)
 * - Dynamic content loading
 * - Error handling scenarios
 * 
 * SECURITY NOTES:
 * - This is a TEST application, not for production use
 * - Input validation is implemented for demonstration
 * - No real authentication - uses mock tokens
 * 
 * @author Cypress Migration Framework
 * @version 1.0.0
 */

const express = require('express');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// ============================================================================
// APPLICATION SETUP
// ============================================================================

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware configuration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Sanitize filename to prevent path traversal
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${Date.now()}-${sanitizedName}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Allow only specific file types
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

// ============================================================================
// IN-MEMORY DATA STORE (for testing purposes)
// ============================================================================

/**
 * Mock user database
 * In a real application, this would be a database
 */
const users = [
    { id: 1, email: 'test@example.com', password: 'password123', name: 'Test User', role: 'user' },
    { id: 2, email: 'admin@example.com', password: 'admin123', name: 'Admin User', role: 'admin' }
];

/**
 * Mock product database
 */
const products = [
    { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics', inStock: true },
    { id: 2, name: 'Headphones', price: 149.99, category: 'Electronics', inStock: true },
    { id: 3, name: 'Keyboard', price: 79.99, category: 'Electronics', inStock: false },
    { id: 4, name: 'Mouse', price: 29.99, category: 'Electronics', inStock: true },
    { id: 5, name: 'Monitor', price: 299.99, category: 'Electronics', inStock: true }
];

/**
 * Mock orders database
 */
let orders = [];
let orderIdCounter = 1;

/**
 * Active sessions (mock session store)
 */
const sessions = new Map();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - Raw user input
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Generate mock authentication token
 * @param {object} user - User object
 * @returns {string} Mock JWT token
 */
function generateToken(user) {
    // Mock token - in production, use proper JWT
    return Buffer.from(JSON.stringify({
        id: user.id,
        email: user.email,
        exp: Date.now() + 3600000 // 1 hour
    })).toString('base64');
}

/**
 * Verify authentication token
 * @param {string} token - Token to verify
 * @returns {object|null} User data or null
 */
function verifyToken(token) {
    try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        if (decoded.exp > Date.now()) {
            return users.find(u => u.id === decoded.id);
        }
    } catch (e) {
        return null;
    }
    return null;
}

/**
 * Simulate network delay for testing cy.wait()
 * @param {number} ms - Milliseconds to delay
 */
function delay(ms) {
    if (process.env.FAST_MODE === 'true') {
        return Promise.resolve();
    }
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start secondary listener for cross-origin testing
const PORT_SECONDARY = 3001;
const server2 = app.listen(PORT_SECONDARY, () => {
    console.log(`Secondary server running on port ${PORT_SECONDARY}`);
});

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Authentication middleware
 * Checks for valid token in Authorization header or cookie
 */
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const user = verifyToken(token);
    if (!user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
}

// ============================================================================
// API ROUTES - Authentication
// ============================================================================

/**
 * POST /api/auth/login
 * Authenticate user and return token
 * 
 * Request body:
 * - email: string (required)
 * - password: string (required)
 * 
 * Response:
 * - 200: { token, user }
 * - 400: { error } - Validation error
 * - 401: { error } - Invalid credentials
 */
app.post('/api/auth/login', async (req, res) => {
    // Simulate network delay for testing
    await delay(500);

    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // Find user
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user);

    // Set cookie for session-based auth testing
    res.cookie('authToken', token, {
        httpOnly: true,
        maxAge: 3600000 // 1 hour
    });

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
        token,
        user: userWithoutPassword,
        message: 'Login successful'
    });
});

/**
 * POST /api/auth/logout
 * Clear authentication session
 */
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('authToken');
    res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
app.get('/api/auth/me', authMiddleware, (req, res) => {
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
});

// ============================================================================
// API ROUTES - Products
// ============================================================================

/**
 * GET /api/products
 * Get all products with optional filtering
 * 
 * Query params:
 * - category: Filter by category
 * - inStock: Filter by stock status (true/false)
 * - minPrice: Minimum price filter
 * - maxPrice: Maximum price filter
 */
app.get('/api/products', async (req, res) => {
    await delay(300); // Simulate network delay

    let result = [...products];

    // Apply filters
    if (req.query.category) {
        result = result.filter(p => p.category === req.query.category);
    }

    if (req.query.inStock !== undefined) {
        const inStock = req.query.inStock === 'true';
        result = result.filter(p => p.inStock === inStock);
    }

    if (req.query.minPrice) {
        result = result.filter(p => p.price >= parseFloat(req.query.minPrice));
    }

    if (req.query.maxPrice) {
        result = result.filter(p => p.price <= parseFloat(req.query.maxPrice));
    }

    res.json({ products: result, total: result.length });
});

/**
 * GET /api/products/:id
 * Get single product by ID
 */
app.get('/api/products/:id', async (req, res) => {
    await delay(200);

    const product = products.find(p => p.id === parseInt(req.params.id));

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
});

// ============================================================================
// API ROUTES - Orders (Protected)
// ============================================================================

/**
 * GET /api/orders
 * Get user's orders (requires authentication)
 */
app.get('/api/orders', authMiddleware, async (req, res) => {
    await delay(400);

    const userOrders = orders.filter(o => o.userId === req.user.id);
    res.json({ orders: userOrders });
});

/**
 * POST /api/orders
 * Create new order (requires authentication)
 */
app.post('/api/orders', authMiddleware, async (req, res) => {
    await delay(600);

    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order items are required' });
    }

    // Calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
            return res.status(400).json({ error: `Product ${item.productId} not found` });
        }
        if (!product.inStock) {
            return res.status(400).json({ error: `Product ${product.name} is out of stock` });
        }

        orderItems.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: item.quantity || 1
        });

        total += product.price * (item.quantity || 1);
    }

    const order = {
        id: orderIdCounter++,
        userId: req.user.id,
        items: orderItems,
        total: Math.round(total * 100) / 100,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    orders.push(order);

    res.status(201).json({ order, message: 'Order created successfully' });
});

// ============================================================================
// API ROUTES - File Operations
// ============================================================================

/**
 * POST /api/upload
 * Upload a file
 */
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
        message: 'File uploaded successfully',
        file: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        }
    });
});

/**
 * GET /api/download/:filename
 * Download a file
 */
app.get('/api/download/:filename', (req, res) => {
    // Sanitize filename to prevent path traversal
    const filename = path.basename(req.params.filename);
    const filepath = path.join(__dirname, 'uploads', filename);

    if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    res.download(filepath);
});

// ============================================================================
// API ROUTES - Utility Endpoints
// ============================================================================

/**
 * GET /api/slow-response
 * Endpoint with configurable delay for testing timeouts
 */
app.get('/api/slow-response', async (req, res) => {
    const delayMs = parseInt(req.query.delay) || 3000;
    await delay(Math.min(delayMs, 10000)); // Max 10 seconds
    res.json({ message: 'Slow response complete', delay: delayMs });
});

/**
 * GET /api/error/:code
 * Generate specific error responses for testing
 */
app.get('/api/error/:code', (req, res) => {
    const code = parseInt(req.params.code);
    const errorMessages = {
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable'
    };

    res.status(code).json({ error: errorMessages[code] || 'Unknown Error', code });
});

/**
 * GET /api/time
 * Get server time for clock testing
 */
app.get('/api/time', (req, res) => {
    res.json({
        timestamp: Date.now(),
        iso: new Date().toISOString(),
        formatted: new Date().toLocaleString()
    });
});

/**
 * POST /api/echo
 * Echo back the request body for testing
 */
app.post('/api/echo', (req, res) => {
    res.json({
        body: req.body,
        headers: {
            contentType: req.headers['content-type'],
            authorization: req.headers.authorization ? 'Bearer ***' : null
        },
        method: req.method
    });
});

// ============================================================================
// GRAPHQL API ENDPOINT
// ============================================================================

/**
 * POST /api/graphql
 * GraphQL-style endpoint for testing GraphQL queries and mutations
 * 
 * This is a simplified GraphQL implementation for testing purposes.
 * It demonstrates how to test GraphQL APIs with Cypress.
 * 
 * Supported queries:
 * - products(limit, category)
 * - product(id)
 * - user
 * - orders
 * 
 * Supported mutations:
 * - createOrder(items)
 * - updateProduct(id, input)
 */
app.post('/api/graphql', async (req, res) => {
    await delay(200);

    const { query, variables = {} } = req.body;


    if (!query) {
        return res.status(400).json({
            errors: [{ message: 'Query is required' }]
        });
    }

    try {
        // Parse and execute the query
        const result = await executeGraphQL(query, variables, req);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            errors: [{ message: error.message }]
        });
    }
});

/**
 * Simple GraphQL executor for testing purposes
 */
async function executeGraphQL(query, variables, req) {
    // Debug logging
    console.log('GraphQL Query Received:', query.substring(0, 100).replace(/\n/g, ' '));
    console.log('Variables:', variables);

    let data = {};
    let errors = []; // New errors array

    // Normalize query for matching: remove all whitespace
    const compactQuery = query.replace(/\s+/g, '');
    console.log('Compact Query:', compactQuery); // DEBUG LOG

    // Check for explicit root fields in the compact query
    const isProductsListQuery = (compactQuery.includes('products{') || compactQuery.includes('products(')) && !compactQuery.includes('product(');
    const isSingleProduct = compactQuery.includes('product(');
    const isUser = compactQuery.includes('user{') || compactQuery.includes('me{');
    const isCreateOrder = compactQuery.includes('createOrder(');
    const isUpdateProduct = compactQuery.includes('updateProduct(');
    const isMutation = compactQuery.includes('mutation');

    console.log('Query Analysis:', {
        isProductsListQuery,
        isSingleProduct,
        isUser,
        isCreateOrder,
        isUpdateProduct,
        isMutation
    });

    if (isProductsListQuery) {
        const safeVariables = variables || {};
        const limit = safeVariables.limit || 10;
        const category = safeVariables.category;

        let result = [...products];
        if (category) {
            result = result.filter(p => p.category === category);
        }
        result = result.slice(0, limit);

        data.products = result.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            inStock: p.inStock,
            __typename: 'Product'
        }));
    }

    // Handle single product query
    if (isSingleProduct) {
        // IDs are passed as variables usually
        let id = variables.id;

        // Fallback: try to extract from query if strict variable not present (legacy support)
        if (!id) {
            const idMatch = query.match(/id:\s*(\d+)/);
            if (idMatch) id = parseInt(idMatch[1]);
        }

        if (!id) id = 1;

        const product = products.find(p => p.id === parseInt(id));

        if (product) {
            data.product = {
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                inStock: product.inStock,
                __typename: 'Product'
            };
        } else {
            errors.push({ message: `Product with id ${id} not found` });
        }
    }

    // Handle user query (requires auth)
    if (isUser) {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            errors.push({ message: 'Authentication required', extensions: { code: 'UNAUTHENTICATED' } });
        } else {
            const user = verifyToken(token);
            if (user) {
                data.user = {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    __typename: 'User'
                };
            } else {
                errors.push({ message: 'Invalid token', extensions: { code: 'UNAUTHENTICATED' } });
            }
        }
    }

    // Handle orders query (requires auth)
    if (compactQuery.includes('orders{') && !isCreateOrder) {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            errors.push({ message: 'Authentication required' });
        } else {
            const user = verifyToken(token);
            if (user) {
                const userOrders = orders.filter(o => o.userId === user.id);
                data.orders = userOrders.map(o => ({
                    id: o.id,
                    items: o.items,
                    total: o.total,
                    status: o.status,
                    createdAt: o.createdAt,
                    __typename: 'Order'
                }));
            }
        }
    }

    // Handle createOrder mutation
    if (isCreateOrder) {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            errors.push({ message: 'Authentication required' });
        } else {
            const user = verifyToken(token);
            if (!user) {
                errors.push({ message: 'Invalid token' });
            } else {
                const items = variables.items || [];
                if (items.length === 0) {
                    errors.push({ message: 'Order items are required' });
                } else {
                    let total = 0;
                    const orderItems = [];
                    let errorFound = false;

                    for (const item of items) {
                        const product = products.find(p => p.id === item.productId);
                        if (!product) {
                            errors.push({ message: `Product ${item.productId} not found` });
                            errorFound = true;
                            break;
                        }

                        orderItems.push({
                            productId: product.id,
                            name: product.name,
                            price: product.price,
                            quantity: item.quantity || 1
                        });
                        total += product.price * (item.quantity || 1);
                    }

                    if (!errorFound) {
                        const order = {
                            id: orderIdCounter++,
                            userId: user.id,
                            items: orderItems,
                            total: Math.round(total * 100) / 100,
                            status: 'pending',
                            createdAt: new Date().toISOString()
                        };

                        orders.push(order);

                        data.createOrder = {
                            order: {
                                id: order.id,
                                items: order.items,
                                total: order.total,
                                status: order.status,
                                createdAt: order.createdAt,
                                __typename: 'Order'
                            },
                            success: true,
                            message: 'Order created successfully'
                        };
                    }
                }
            }
        }
    }

    // Handle updateProduct mutation (admin only)
    if (isUpdateProduct) {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            errors.push({ message: 'Authentication required' });
        } else {
            const user = verifyToken(token);
            if (!user || user.role !== 'admin') {
                errors.push({ message: 'Admin access required', extensions: { code: 'FORBIDDEN' } });
            } else {
                const id = variables.id;
                const input = variables.input || {};

                const productIndex = products.findIndex(p => p.id === id);
                if (productIndex === -1) {
                    errors.push({ message: `Product ${id} not found` });
                } else {
                    if (input.name) products[productIndex].name = input.name;
                    if (input.price) products[productIndex].price = input.price;
                    if (input.inStock !== undefined) products[productIndex].inStock = input.inStock;

                    data.updateProduct = {
                        product: products[productIndex],
                        success: true
                    };
                }
            }
        }
    }

    console.log('Sending Response:', JSON.stringify({ data, errors }));

    const response = { data: Object.keys(data).length > 0 ? data : null };
    if (errors.length > 0) response.errors = errors;
    if (!response.data && !response.errors) response.data = {};

    return response;
}

// ============================================================================
// STATIC PAGE ROUTES
// ============================================================================

/**
 * Serve the main HTML pages
 * These provide UI elements for testing various Cypress capabilities
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/forms', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'forms.html'));
});

app.get('/dialogs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dialogs.html'));
});

app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
    console.error('Error:', err.message);

    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: 'File upload error: ' + err.message });
    }

    res.status(500).json({ error: 'Internal server error' });
});

/**
 * 404 handler
 */
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║           CYPRESS TEST APPLICATION                             ║
║                                                                 ║
║   Server running at: http://localhost:${PORT}                    ║
║                                                                 ║
║   Available endpoints:                                          ║
║   - GET  /                    Home page                        ║
║   - GET  /login               Login page                       ║
║   - GET  /dashboard           Dashboard (authenticated)        ║
║   - GET  /forms               Form testing page                ║
║   - GET  /dialogs             Dialog testing page              ║
║   - GET  /upload              File upload page                 ║
║                                                                 ║
║   API Endpoints:                                                ║
║   - POST /api/auth/login      Authenticate user                ║
║   - POST /api/auth/logout     Clear session                    ║
║   - GET  /api/auth/me         Get current user                 ║
║   - GET  /api/products        List products                    ║
║   - GET  /api/products/:id    Get product                      ║
║   - GET  /api/orders          List orders (auth required)      ║
║   - POST /api/orders          Create order (auth required)     ║
║   - POST /api/upload          Upload file                      ║
║   - GET  /api/download/:file  Download file                    ║
║   - GET  /api/slow-response   Slow response testing            ║
║   - GET  /api/error/:code     Error response testing           ║
║   - GET  /api/time            Server time                      ║
║   - POST /api/echo            Echo request                     ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
