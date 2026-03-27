import { BASE_URL } from "../../config";
import { useState } from "react"
import axios from "axios"
import AdminSidebar from "../../components/AdminSidebar"
import { useNavigate } from "react-router-dom"

const API = BASE_URL;

 const CreateProduct = () => {

  const navigate = useNavigate()

  const [name,setName] = useState("")
  const [price,setPrice] = useState("")
  const [description,setDescription] = useState("")
  const [category,setCategory] = useState("")
  const [brand,setBrand] = useState("")
  const [countInStock,setCountInStock] = useState("")
  const [image,setImage] = useState(null)

  const submitHandler = async(e)=>{
   e.preventDefault()

   try {
     const userInfo = JSON.parse(localStorage.getItem("userInfo"));
     const config = {
       headers: {
         Authorization: `Bearer ${userInfo?.token}`
       }
     };

     const formData = new FormData();
     formData.append("name", name);
     formData.append("price", price);
     formData.append("description", description);
     formData.append("category", category);
     formData.append("brand", brand);
     formData.append("stock", countInStock);
     if (image) {
       formData.append("image", image);
     }

     await axios.post(`${API}/api/products`, formData, config)
     navigate("/admin/products")
   } catch (error) {
     alert(error.response?.data?.error || "Failed to create product");
   }
  }

  return (

   <div className="flex">

    <AdminSidebar/>

    <div className="p-6 w-full max-w-2xl">

     <h1 className="text-2xl font-bold mb-4">
      Create Product
     </h1>

     <form onSubmit={submitHandler} className="space-y-4">

      <input
       type="text"
       placeholder="Product Name"
       value={name}
       onChange={(e)=>setName(e.target.value)}
       className="border p-2 w-full"
       required
      />

      <input
       type="number"
       placeholder="Price"
       value={price}
       onChange={(e)=>setPrice(e.target.value)}
       className="border p-2 w-full"
       required
      />

      <textarea
       placeholder="Description"
       value={description}
       onChange={(e)=>setDescription(e.target.value)}
       className="border p-2 w-full"
       required
      />

      <select
        value={category}
        onChange={(e)=>setCategory(e.target.value)}
        className="border p-2 w-full"
        required
      >
        <option value="" disabled>Select Category</option>
        <option value="Electronics">Electronics</option>
        <option value="Clothing">Clothing</option>
        <option value="Food">Footwear</option>
        <option value="Books">Books</option>
        <option value="Beauty">Accessories</option>
        <option value="Sports">Sports</option>
        <option value="Other">Other</option>
      </select>

      <input
       type="text"
       placeholder="Brand"
       value={brand}
       onChange={(e)=>setBrand(e.target.value)}
       className="border p-2 w-full"
       required
      />

      <input
       type="number"
       placeholder="Stock"
       value={countInStock}
       onChange={(e)=>setCountInStock(e.target.value)}
       className="border p-2 w-full"
       required
      />

      <div className="flex flex-col">
        <label className="mb-1 text-gray-600">Product Image (Optional)</label>
        <input
         type="file"
         onChange={(e)=>setImage(e.target.files[0])}
         className="border p-2 w-full"
        />
      </div>

      <button className="bg-green-500 text-white px-4 py-2 rounded">
       Create
      </button>

     </form>

    </div>

   </div>

  )

 }

export default CreateProduct