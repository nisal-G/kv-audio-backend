import Order from "../models/order.js";
import Product from "../models/product.js";

export async function createOrder (req, res) {

    const data = req.body;

    
    const orderInfo = {
        orderedItems : []
    };

    if(req.user == null){
        return res.status(401).json({ message: "Please login and try again" });
    }

    // Add user email to orderInfo
    orderInfo.email = req.user.email;
  
    // Generate unique orderId
    const lastOrder = await Order.find().sort({ orderId: -1 }).limit(1);
    if (lastOrder.length === 0) {
        orderInfo.orderId = "ORD0001";

    // If there are existing orders, increment the last orderId 
    } else {
        const lastOrderId = lastOrder[0].orderId;
        const lastOrderNumberInString = lastOrderId.replace("ORD", "");
        const lastOrderNumber = parseInt(lastOrderNumberInString);
        const newOrderNumber = lastOrderNumber + 1;
        const newOrderId = "ORD" + newOrderNumber.toString().padStart(4, "0"); 
        orderInfo.orderId = newOrderId;
    }

    
    let oneDayCost = 0;

    for (let i = 0; i < data.orderedItems.length; i++) {

        try {
            const product = await Product.findOne({ key: data.orderedItems[i].key });

            if(product == null){
                return res.status(404).json({ message: `Product with key ${data.orderedItems[i].key} not found` });
            return;
            }

            if (product.availability === false) {
                return res.status(400).json({ message: `Product ${product.name} is currently unavailable` });
            }

            // Add ordered item to orderInfo
            orderInfo.orderedItems.push({
                product: {
                    key: product.key,
                    name: product.name,
                    image: product.image[0],
                    price: product.price,
                    quantity: data.orderedItems[i].qty
                }
            });

            oneDayCost += product.price * data.orderedItems[i].qty;


        } catch (error) {
            return res.status(400).json({ message: "Invalid ordered item format" });
        }   
    }

    orderInfo.days = data.days;
    orderInfo.startingDate = data.startingDate;
    orderInfo.endingDate = data.endingDate;
    orderInfo.image = data.image;
    orderInfo.totalAmount = oneDayCost * data.days;

    try {
        const newOrder = new Order(orderInfo);
        await newOrder.save();
        return res.status(201).json({ message: "Order created successfully", orderId: orderInfo.orderId });
    } catch (error) {
        return res.status(500).json({ message: "Failed to create order", error: error.message });
    }   


}