import Order from "../models/order.js";
import Product from "../models/product.js";
import { isItAdmin, isItCustomer } from "./userController.js";

// Create a new order
export async function createOrder(req, res) {

    const data = req.body;

    // Initialize order information
    const orderInfo = {
        orderedItems: []
    };

    // Check if user is logged in
    if (req.user == null) {
        return res.status(401).json({
            message: "Authentication required",
            error: "Please login to create an order"
        });
    }

    // Set user email
    orderInfo.email = req.user.email;

    // Generate unique order ID
    const lastOrder = await Order.find().sort({ orderId: -1 }).limit(1);
    if (lastOrder.length === 0) {
        // First order
        orderInfo.orderId = "ORD0001";
    } else {
        // Increment last order ID
        const lastOrderId = lastOrder[0].orderId; // e.g., "ORD0005"
        const lastOrderNumberInString = lastOrderId.replace("ORD", ""); // "0005"
        const lastOrderNumber = parseInt(lastOrderNumberInString); // 5
        const newOrderNumber = lastOrderNumber + 1; // 6
        const newOrderId = "ORD" + newOrderNumber.toString().padStart(4, "0"); // "ORD0006"
        orderInfo.orderId = newOrderId; // Set new order ID
    }

    // Calculate total cost for one day
    let oneDayCost = 0;

    // Process each ordered item
    for (let i = 0; i < data.orderedItems.length; i++) {

        try {
            // Find product by key
            const product = await Product.findOne({ key: data.orderedItems[i].key });

            // Validate product exists in database
            if (product == null) {
                return res.status(404).json({
                    message: "Product not found",
                    error: `Product "${data.orderedItems[i].key}" does not exist`
                });
            }

            // Verify product is available for booking
            if (product.availability === false) {
                return res.status(400).json({
                    message: "Product unavailable",
                    error: `"${product.name}" is not available for booking at this time`
                });
            }

            // Ensure product has images for display
            if (!product.image || product.image.length === 0) {
                return res.status(400).json({
                    message: "Product images missing",
                    error: `"${product.name}" has no images. Please upload images or remove from cart`
                });
            }

            // Add item to order
            orderInfo.orderedItems.push({
                product: {
                    key: product.key,
                    name: product.name,
                    image: product.image[0],
                    price: product.price,
                    quantity: data.orderedItems[i].qty
                }
            });

            // Add to daily cost
            oneDayCost += product.price * data.orderedItems[i].qty;

        } catch (error) {
            return res.status(400).json({ message: "Invalid ordered item format" });
        }
    }

    // Set order details
    orderInfo.days = data.days;
    orderInfo.startingDate = data.startingDate;
    orderInfo.endingDate = data.endingDate;
    orderInfo.totalAmount = oneDayCost * data.days;

    // Save the order to database
    try {
        const newOrder = new Order(orderInfo);
        const result = await newOrder.save();
        return res.status(201).json({ message: "Order created successfully", order: result });
    } catch (error) {
        return res.status(500).json({ message: "Failed to create order", error: error.message });
    }

}


export async function getQuote(req, res) {

    const data = req.body;

    // Initialize order information
    const orderInfo = {
        orderedItems: []
    };

    // Calculate total cost for one day
    let oneDayCost = 0;

    // Process each ordered item
    for (let i = 0; i < data.orderedItems.length; i++) {

        try {
            // Find product by key
            const product = await Product.findOne({ key: data.orderedItems[i].key });

            // Validate product exists in database
            if (product == null) {
                return res.status(404).json({
                    message: "Product not found",
                    error: `Product "${data.orderedItems[i].key}" does not exist`
                });
            }

            // Verify product is available for booking
            if (product.availability === false) {
                return res.status(400).json({
                    message: "Product unavailable",
                    error: `"${product.name}" is not available for booking at this time`
                });
            }

            // Ensure product has images for display
            if (!product.image || product.image.length === 0) {
                return res.status(400).json({
                    message: "Product images missing",
                    error: `"${product.name}" has no images. Please upload images or remove from cart`
                });
            }

            // Add item to order
            orderInfo.orderedItems.push({
                product: {
                    key: product.key,
                    name: product.name,
                    image: product.image[0],
                    price: product.price,
                    quantity: data.orderedItems[i].qty
                }
            });

            // Add to daily cost
            oneDayCost += product.price * data.orderedItems[i].qty;

        } catch (error) {
            return res.status(400).json({ message: "Invalid ordered item format" });
        }
    }

    // Set order details
    orderInfo.days = data.days;
    orderInfo.startingDate = data.startingDate;
    orderInfo.endingDate = data.endingDate;
    orderInfo.totalAmount = oneDayCost * data.days;

    try {
        res.json({
            message: "Quote calculated successfully",
            total: orderInfo.totalAmount
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to calculate quote", error: error.message });
    }
}


export async function getOrders(req, res) {

    if (isItCustomer(req)) {
        try {
            const orders = await Order.find({ email: req.user.email });
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch orders. Please try again." });
        }
    } else if (isItAdmin(req)) {
        try {
            const orders = await Order.find();
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch orders. Please try again." });
        }
    } else {
        res.status(403).json({ message: "Access denied. Admins and customers only." });
    }

}

export async function approveOrRejectOrder(req, res) {

    const orderId = req.params.orderId;
    const status = req.body.status;

    if (isItAdmin(req)) {
        try {
            const order = await Order.findOne({ orderId: orderId });

            if (order == null) {
                return res.status(404).json({
                    message: "Order not found",
                    error: `Order with ID "${orderId}" does not exist`
                });
            }

            await Order.updateOne({ orderId: orderId }, { status: status });

            res.json({ message: `Order ${status} successfully.` });
        } catch (error) {
            res.status(500).json({ message: "Failed to update order status. Please try again." });
        }

    } else {
        res.status(403).json({ message: "Access denied. Admins only." });
    }
}

// Delete an order
export async function deleteOrder(req, res) {
    const orderId = req.params.orderId;

    // Check if user is authenticated
    if (req.user == null) {
        return res.status(401).json({
            message: "Authentication required",
            error: "Please login to delete an order"
        });
    }

    try {
        const order = await Order.findOne({ orderId: orderId });

        // Check if order exists
        if (order == null) {
            return res.status(404).json({
                message: "Order not found",
                error: `Order with ID "${orderId}" does not exist`
            });
        }

        // Check authorization: user can only delete their own orders, admins can delete any
        if (!isItAdmin(req) && order.email !== req.user.email) {
            return res.status(403).json({
                message: "Access denied",
                error: "You can only delete your own orders"
            });
        }

        // Delete the order
        await Order.deleteOne({ orderId: orderId });

        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete order",
            error: error.message
        });
    }
}   