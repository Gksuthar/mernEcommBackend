
// app.post("/create-order", async (req, res) => {

  const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
    export const createOrder=async(req,res)=>{
    try {
      const { amount } = req.body;
  
      const options = {
        amount: amount * 100, // amount in smallest currency unit (paise)
        currency: "INR",
        receipt: `receipt_${Math.random() * 1000}`,
      };
  
      const order = await razorpayInstance.orders.create(options);
      res.status(200).json(order);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  