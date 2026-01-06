import Order from "../models/order.js";
import Product from "../models/product.js";

// Create a new order
export async function createOrder (req, res) {

    const data = req.body;

    // Initialize order information
    const orderInfo = {
        orderedItems : []
    };

    // Check if user is logged in
    if(req.user == null){
        return res.status(401).json({ message: "Please login and try again" });
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

            // Check if product exists
            if(product == null){
                return res.status(404).json({ message: `Product with key ${data.orderedItems[i].key} not found` });
            return;
            }

            // Check product availability
            if (product.availability === false) {
                return res.status(400).json({ message: `Product ${product.name} is currently unavailable` });
            }

            // Check if product has images
            if (!product.image || product.image.length === 0) {
                return res.status(400).json({ message: `Product ${product.name} has no images available` });
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

    // Save order to database
    try {
        const newOrder = new Order(orderInfo);
        const result = await newOrder.save();
        return res.status(201).json({ message: "Order created successfully", order : result });
    } catch (error) {
        return res.status(500).json({ message: "Failed to create order", error: error.message });
    }   

}