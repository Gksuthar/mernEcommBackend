import CartProduct from "../models/cartproduct.js";
import UserModal from "../models/user.js";
const addToCartController = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId,quantity } = req.body;
    if (!productId) {
      return res.status(400).json({
        message: "provide product id",
        error: true,
        success: false,
      });
    }

    const checkItemCart = await CartProduct.findOne({
      userId: userId,
      productId: productId,
    });
    if (checkItemCart) {
      return res.status(400).json({
        message: "item already in Cart",
        error: true,
        success: false,
      });
    }

    const cart = new CartProduct({
      productId: productId,
      quantity: quantity,
      userId: userId,
    });

    const save = await cart.save();

    const updateCartUser = await UserModal.updateOne(
      { _id: userId },
      {
        $push: {
          shopping_cart: productId,
        },
      }
    );
    res.status(200).json({
      data: save,
      message: "item added successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const getCartItemController = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({
        message: "User not found. Please log in first.",
        error: true,
        success: false,
      });
    }
    const cartItem = await CartProduct.find({
      userId: userId,
    }).populate("productId");

    if (cartItem.length === 0) {
      return res.status(404).json({
        message: "No items found in the cart",
        error: true,
        success: false,
      });
    }
    return res.status(200).json({
      data: cartItem,
      message: "Cart fetched successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
const updateCartItemController = async (req, res) => {
  try {
    const userId = req.userId;
    const { _id, qty } = req.body;

    if (!_id || !qty) {
      return res.status(404).json({
        message: "id or filed Required.",
        error: true,
        success: false,
      });
    }
    const updateCartItem = await CartProduct.updateOne(
      {
        _id: _id,
        userId: userId,
      },
      {
        quantity: qty,
      }
    );
    return res.status(200).json({
      data: updateCartItem,
      message: "Cart updated successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
const deletCartItemQty = async (req, res) => {
  try {
    const userId = req.userId;
    const { _id } = req.body;
    if(!_id) {
      return res.status(404).json({
        message: "id is missing",
        error: true,
        success: false,
      });
    }
    const deleteItem = await CartProduct.findByIdAndDelete(_id);
    if (!deleteItem) {
      return res.status(404).json({
        message: "deleteItem is missing",
        error: true,
        success: false,
      });
    }
    await UserModal.findByIdAndUpdate(userId,{
      shopping_cart : []
    })
    

    res.status(200).json({
      message: "cart item deleted",
      error: false,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export {
  addToCartController,
  getCartItemController,
  updateCartItemController,
  deletCartItemQty,
};
