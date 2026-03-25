import { useEffect, useState } from "react"
import axios from "axios"
import AdminSidebar from "../../components/AdminSidebar"
import { useParams, useNavigate } from "react-router-dom"

const EditProduct = () => {

 const {id} = useParams()
 const navigate = useNavigate()

 const [name,setName] = useState("")
 const [price,setPrice] = useState("")
 const [countInStock,setCountInStock] = useState("")

 useEffect(()=>{

  const fetchProduct = async()=>{

   const {data} = await axios.get(`/api/products/${id}`)

   setName(data.name)
   setPrice(data.price)
   setCountInStock(data.countInStock)

  }

  fetchProduct()

 },[id])

 const submitHandler = async(e)=>{

  e.preventDefault()

  await axios.put(`/api/products/${id}`,{
   name,
   price,
   countInStock
  })

  navigate("/admin/products")

 }

 return (

  <div className="flex">

   <AdminSidebar/>

   <div className="p-6 w-full">

    <h1 className="text-2xl font-bold mb-4">
     Edit Product
    </h1>

    <form onSubmit={submitHandler} className="space-y-4">

     <input
      type="text"
      value={name}
      onChange={(e)=>setName(e.target.value)}
      className="border p-2 w-full"
     />

     <input
      type="number"
      value={price}
      onChange={(e)=>setPrice(e.target.value)}
      className="border p-2 w-full"
     />

     <input
      type="number"
      value={countInStock}
      onChange={(e)=>setCountInStock(e.target.value)}
      className="border p-2 w-full"
     />

     <button className="bg-blue-500 text-white px-4 py-2">
      Update
     </button>

    </form>

   </div>

  </div>

 )

}

export default EditProduct