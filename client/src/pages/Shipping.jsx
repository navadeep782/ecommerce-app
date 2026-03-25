//what is the chage from prevous code to present one 
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Shipping() {
  const navigate = useNavigate();

  // ✅ Check if shipping already saved
  const saved = JSON.parse(localStorage.getItem("shipping")) || {};
  const hasShipping = saved.address && saved.city && saved.postalCode && saved.country;

  const [address, setAddress] = useState(saved.address || "");
  const [city, setCity] = useState(saved.city || "");
  const [postalCode, setPostalCode] = useState(saved.postalCode || "");
  const [country, setCountry] = useState(saved.country || "");
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(!hasShipping); // ✅ show form only if no saved address

  const validate = () => {
    const newErrors = {};
    if (!address.trim()) newErrors.address = "Address is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!postalCode.trim()) newErrors.postalCode = "Postal code is required";
    if (!country.trim()) newErrors.country = "Country is required";
    return newErrors;
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    localStorage.setItem("shipping", JSON.stringify({ address, city, postalCode, country }));
    navigate("/payment");
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? "border-red-300 focus:ring-red-200"
        : "border-gray-200 focus:ring-gray-300"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-sm p-8 w-full max-w-md">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Shipping Address</h1>
          <p className="text-sm text-gray-400 mt-1">Where should we deliver your order?</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {["Shipping", "Payment", "Order"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-xs font-medium ${
                i === 0 ? "text-black" : "text-gray-300"
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? "bg-black text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  {i + 1}
                </div>
                {step}
              </div>
              {i < 2 && <div className="flex-1 h-px bg-gray-100 w-6" />}
            </div>
          ))}
        </div>

        {/* ✅ Saved Address View — shown if address already exists */}
        {!editing ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-green-600">✅</span>
                <p className="text-sm font-semibold text-green-700">Saved Address</p>
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <p>📍 {saved.address}</p>
                <p>{saved.city} — {saved.postalCode}</p>
                <p>{saved.country}</p>
              </div>
            </div>

            {/* Use saved address */}
            <button
              onClick={() => navigate("/payment")}
              className="w-full bg-black hover:bg-gray-800 text-white py-3.5 rounded-xl font-semibold transition-colors"
            >
              Continue with this Address →
            </button>

            {/* Change address */}
            <button
              onClick={() => setEditing(true)}
              className="w-full border border-gray-200 hover:border-gray-400 text-gray-600 py-3 rounded-xl font-medium text-sm transition-colors"
            >
              Use a Different Address
            </button>
          </div>

        ) : (
          // ✅ New Address Form
          <form onSubmit={submitHandler} className="space-y-4">

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Street Address
              </label>
              <input
                type="text"
                placeholder="e.g. 123 Main Street, Apt 4B"
                value={address}
                onChange={(e) => { setAddress(e.target.value); setErrors({...errors, address: ""}); }}
                className={inputClass("address")}
              />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setErrors({...errors, city: ""}); }}
                  className={inputClass("city")}
                />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Postal Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. 400001"
                  value={postalCode}
                  onChange={(e) => { setPostalCode(e.target.value); setErrors({...errors, postalCode: ""}); }}
                  className={inputClass("postalCode")}
                />
                {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Country
              </label>
              <input
                type="text"
                placeholder="e.g. India"
                value={country}
                onChange={(e) => { setCountry(e.target.value); setErrors({...errors, country: ""}); }}
                className={inputClass("country")}
              />
              {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white py-3.5 rounded-xl font-semibold transition-colors mt-2"
            >
              Save & Continue →
            </button>

            {/* Cancel if they had a saved address */}
            {hasShipping && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="w-full border border-gray-200 hover:border-gray-400 text-gray-600 py-3 rounded-xl font-medium text-sm transition-colors"
              >
                Cancel
              </button>
            )}

          </form>
        )}

      </div>
    </div>
  );
}

export default Shipping;