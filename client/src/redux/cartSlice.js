import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems:  JSON.parse(localStorage.getItem("cartItems")) ||[]
  },
  reducers: {

    addToCart: (state, action) => {

        const item = action.payload;

        const existItem = state.cartItems.find(
            (x) => x._id === item._id
        );

        if (existItem) {
            existItem.qty += 1;
        } else {
            state.cartItems.push({ ...item, qty: 1 });
        }

        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        },

        increaseQty: (state, action) => {
        const item = state.cartItems.find(
            (x) => x._id === action.payload
        );

        if (item) item.qty += 1;
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        },

        decreaseQty: (state, action) => {
        const item = state.cartItems.find(
            (x) => x._id === action.payload
        );

        if (item && item.qty > 1) item.qty -= 1;
          localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (x) => x._id !== action.payload
      );
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
     // ✅ ADD THIS
     clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem("cartItems");
    },

  }
});

export const { addToCart, removeFromCart , increaseQty, decreaseQty,clearCart} = cartSlice.actions;
export default cartSlice.reducer;