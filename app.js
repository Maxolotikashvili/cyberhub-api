const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config();

const PcPart = require('./schemas/pcparts-schema');
const register = require('./routes/register');
const login = require('./routes/login');
const CartItem = require('./schemas/cart-items-schema');
const WishlistItem = require('./schemas/wishlist-items-schema');

function connectToMongoDb() {
    const mongoDbUrl = 'mongodb+srv://maxo:maxoo1234@cluster0.9f61g7q.mongodb.net/pcPartBase?retryWrites=true&w=majority';
    mongoose.connect(mongoDbUrl).then(() => {
        console.log('connected to database');
        main();
    }).catch((error) => {
        if (error.name === 'MongoError' && error.message.includes('failed to connect to server')) {
            console.log("Couldn't connect to database: no internet connection");
        }
        console.log(`Couldn't Connect To Database: ${error}`);
    })
}

connectToMongoDb();

function main() {
    app.listen(3000);
    app.use(express.json());
    app.use(cors());

    listenToPcPartsGetRequest();
    listenToUserRequests();
    listenToCartRequests();
    listenToWishlistRequests();
}

//
function listenToPcPartsGetRequest() {
    app.get('/parts', async (_, res) => {
        try {
            await PcPart.find().then((result) => {
                res.json(result);
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Error fetching Data' });
        }
    });
}

//
function listenToUserRequests() {
    app.use('/users', register);
    app.use('/users', login)
}

//
function listenToCartRequests() {
    app.post('/cart', async (req, res) => {
        const cartItemId = req.body.id;
        const existingCartItem = await CartItem.findOne({_id: cartItemId});
        
        try {
            if (existingCartItem) {
                existingCartItem.quantity += 1;
                await existingCartItem.save().then(() => {
                    res.status(201).json({message: 'Item added to cart'});
                });
            } else {
                const newItem = new CartItem(req.body);
                await newItem.save().then( async () => {
                    const cartItemLength = await CartItem.find().countDocuments();
                    res.status(201).json({message: 'Item added to cart', cartLength: cartItemLength});
                });
            }

        } catch (err) {
            console.log("Error adding item to cart:", err);
            res.status(500).json("Error adding item to cart:", err);
        }
    });

    app.get('/cart', async (_, res) => {
        try {
            const allCartItems = await CartItem.find();
            res.json(allCartItems);
        } catch (err) {
            console.log("Internal server error:", err);
            res.status(500).json("Internal server error:", err);
        }
    });

    app.put('/cart/:id', async (req, res) => {
        const cartItemId = req.params.id;
        const newQuantity = req.body.quantity;

        try {
            const cartItem = await CartItem.findById(cartItemId);

            if (!cartItem) {
                return res.status(404).json('Error 404: Cart item not found');
            }

            cartItem.quantity = newQuantity;
            cartItem.save();
        } catch (err) {
            console.log("Internal server error:", err);
            res.status(500).json("Error updating cart item quantity:", err);
        }
    });

    app.delete('/cart/:id', async (req, res) => {
        const cartItemId = req.params.id;
        
        try {
            if (cartItemId === 'deleteAll') {
                await CartItem.deleteMany({});
            } else {
                await CartItem.findByIdAndDelete(cartItemId);   
            }
            
            const cartItemLength = await CartItem.find().countDocuments();
            res.status(201).json(cartItemLength);
        } catch (err) {
            console.log("Error removing item from cart:", err);
            res.status(500).json("Error removing item from cart:", err);
        }
    });

    // listen to cart length request on app initializing
    app.get('/cartLength', async (_, res) => {
        try {
            const cartLength = await CartItem.find().countDocuments();
            res.json(cartLength);
        } catch(err) {
            console.log('Error fetching cart length', err);
            res.status(500).json('Erorr fetching cart length', err);
        }
    });

    app.get('/wishlistLength', async (_, res) => {
        try {
            const wishlistLength = await WishlistItem.find().countDocuments();
            res.json(wishlistLength);
        } catch(err) {
            console.log('Error fetching wishlist length', err);
            res.status(500).json('Erorr fetching wishlist length', err);
        }
    });
}

//
function listenToWishlistRequests() {
    app.get('/wishlist', async (_, res) => {
        try {
            const allWishlistItems = await WishlistItem.find();
            res.json(allWishlistItems);
        } catch(err) {
            console.log('Error fetching wishlist:', err);
            res.status(500).json('Error fetching wishlist', err);
        }
    });

    app.post('/wishlist', async (req, res) => {
        try {
            const existingWishlistItem = await WishlistItem.findById(req.body.id);

            if (existingWishlistItem) {
                res.json({message: 'Item already in wishlist'});   
            } else {
                const newWishlistItem = new WishlistItem(req.body);
                newWishlistItem.save().then( async () => {
                    const wishListItemLength = await WishlistItem.find().countDocuments();
                    res.status(201).json({message: 'Item added to wishlist', wishListLength: wishListItemLength});
                })
            }

        } catch(err) {
            console.log('Error adding items to wishlist:', err);
            res.status(500).json('Error adding items to wishlist', err);
        }
    });

    app.delete('/wishlist/:id', async (req, res) => {
        const deletedItemId = req.params.id;

        try {
            if (deletedItemId === 'deleteAll') {
                await WishlistItem.deleteMany({});
            } else {
                await WishlistItem.findByIdAndDelete(deletedItemId);                
            }

            const wishlistItemLength = await WishlistItem.find().countDocuments();
            res.status(201).json(wishlistItemLength);
        } catch(err) {
            console.log('Error deleting item from wishlist:', err);
            res.status(500).json('Error deleting item from wishlist', err);
        }
    });

    app.get('/checkout', async (_, res) => {
        try {
            await CartItem.deleteMany({ quantity: 0 }).then( async () => {
                const cartItemLength = await CartItem.find().countDocuments();
                res.json(cartItemLength);
            });
        } catch (err) {
            console.log('Error updating checkout: ', err);
            res.status(500).json('Error updating checkout:', err);
        }
    })
}