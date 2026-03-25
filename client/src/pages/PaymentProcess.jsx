import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";

const API = import.meta.env.VITE_API_URL;

const stripePromise = loadStripe("pk_test_51T5OnOPgPa6CtfoINy42BsKM0v82aEL9QCz1XJo1WeC89iyxaQA8o0rNs1UPhnjNiNwka6mgOEkGVr8M9ikV7Vcx007OqdBpB6");

function CheckoutForm({ clientSecret, orderId }) {

  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);
  const submitHandler = async (e) => {

    e.preventDefault();

    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card
      }
    });

    if (result.error) {
      alert(result.error.message);
      return;
    }

    

if (result.paymentIntent.status === "succeeded") {

  await fetch(`${API}/api/payment/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userInfo.token}`
    },
    body: JSON.stringify({
      paymentIntentId: result.paymentIntent.id,
      orderId
    })
  });

  alert("Payment Successful!");

  const shipping = JSON.parse(localStorage.getItem("shipping"));

  const order = {
    id: orderId,
    paymentMethod: "Online",
    paymentStatus: "Paid",
    shippingAddress: shipping,
    items: cartItems
  };

  navigate("/orders", { state: { order } });
  
}

  };

  return (
    <form onSubmit={submitHandler} className="p-6">

      <h1 className="text-2xl font-bold mb-4">Pay with Card</h1>

      <div className="border p-4 mb-4">
        <CardElement />
      </div>

      <button className="bg-black text-white px-6 py-2">
        Pay Now
      </button>

    </form>
  );
}

function PaymentProcess() {

  const location = useLocation();

  const { clientSecret, orderId } = location.state || {};

  if (!clientSecret) return <h2>Payment Error</h2>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm clientSecret={clientSecret} orderId={orderId} />
    </Elements>
  );
}

export default PaymentProcess;