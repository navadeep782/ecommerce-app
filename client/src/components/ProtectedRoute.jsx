import { Navigate } from "react-router-dom"

const ProtectedRoute = ({ children }) => {

 const userInfo = JSON.parse(localStorage.getItem("userInfo"))

 if(!userInfo){
  return <Navigate to="/login" />
 }

 return children

}

export default ProtectedRoute